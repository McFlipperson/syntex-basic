import type { IncomingMessage, ServerResponse } from "node:http";
import { env } from "../../../lib/env.js";
import { readJsonBody } from "../../../lib/http.js";
import { getUserByToken, deductCredits } from "../../../lib/db.js";
import { classifyTask, injectOutputSpec } from "../../../lib/rise.js";

const COST_PER_REQUEST_CENTS = 1; // placeholder until real token-cost metering

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("METHOD_NOT_ALLOWED");
    return;
  }

  const auth = req.headers.authorization ?? "";
  if (!auth.startsWith("Bearer ")) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: "MISSING_BEARER" }));
    return;
  }

  const user = await getUserByToken(auth.slice(7));
  if (!user) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: "UNKNOWN_TOKEN" }));
    return;
  }

  if (user.credits_cents < COST_PER_REQUEST_CENTS) {
    res.statusCode = 402;
    res.end(JSON.stringify({ error: "INSUFFICIENT_CREDITS" }));
    return;
  }

  const body = await readJsonBody<Record<string, unknown>>(req).catch(() => ({} as Record<string, unknown>));
  if (!body.model || typeof body.model !== "string") {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "MODEL_REQUIRED" }));
    return;
  }

  // ─── RISE classification ───────────────────────────────────────────────────
  const messages = Array.isArray(body.messages)
    ? (body.messages as { role: string; content: unknown }[])
    : [];
  const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
  const taskText = typeof lastUserMsg?.content === "string"
    ? lastUserMsg.content
    : JSON.stringify(lastUserMsg?.content ?? "");

  const classification = await classifyTask(taskText);
  const enrichedMessages = injectOutputSpec(messages, classification.outputSpec);

  const enrichedBody = {
    ...body,
    messages: enrichedMessages,
  };

  // Use the user's personal OR key if provisioned; fall back to master key for legacy accounts
  const orApiKey = user.or_api_key ?? env.OPENROUTER_API_KEY;

  const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${orApiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.PUBLIC_SITE_ORIGIN,
      "X-Title": "Syntex",
    },
    body: JSON.stringify(enrichedBody),
  });

  if (orRes.ok) {
    await deductCredits(user.id, COST_PER_REQUEST_CENTS).catch(() => {
      console.error("[completions] deductCredits failed for user", user.id);
    });
  }

  res.statusCode = orRes.status;
  res.setHeader("Content-Type", orRes.headers.get("content-type") ?? "application/json");

  if (orRes.body) {
    const reader = orRes.body.getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) res.write(Buffer.from(value));
    }
  }
  res.end();
}
