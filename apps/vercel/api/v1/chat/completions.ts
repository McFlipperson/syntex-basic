import type { IncomingMessage, ServerResponse } from "node:http";
import { env } from "../../../lib/env.js";
import { readJsonBody } from "../../../lib/http.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("METHOD_NOT_ALLOWED");
    return;
  }

  // OC on a user's VPS calls this endpoint as its model provider.
  // We trust the bearer token here only as a shared secret (NOT per-user auth yet);
  // future work: classifier + credit gating reads the user identity from the token.
  const auth = req.headers.authorization ?? "";
  if (!auth.startsWith("Bearer ")) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: "MISSING_BEARER" }));
    return;
  }

  const body = await readJsonBody<Record<string, unknown>>(req).catch(() => ({} as Record<string, unknown>));
  if (!body.model || typeof body.model !== "string") {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "MODEL_REQUIRED" }));
    return;
  }

  const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.PUBLIC_SITE_ORIGIN,
      "X-Title": "Syntex",
    },
    body: JSON.stringify(body),
  });

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
