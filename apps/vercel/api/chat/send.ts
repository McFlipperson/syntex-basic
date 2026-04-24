import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { applyCors, readJsonBody } from "../../lib/http.js";
import { requireUser } from "../../lib/auth.js";
import { getVpsRegistration, setCurrentModel } from "../../lib/db.js";
import { OcClient } from "../../lib/oc-client.js";
import { MODEL_IDS } from "@syntex/protocol";

interface Body {
  message?: string;
  model?: string;
}

function sse(res: ServerResponse, data: unknown): void {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("METHOD_NOT_ALLOWED");
    return;
  }

  const user = await requireUser(req, res);
  if (!user) return;

  const body = await readJsonBody<Body>(req).catch(() => ({}) as Body);
  const message = (body.message ?? "").trim();
  if (!message) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "EMPTY_MESSAGE" }));
    return;
  }

  const reg = await getVpsRegistration(user.id);
  if (!reg) {
    res.statusCode = 412;
    res.end(JSON.stringify({ error: "NO_VPS_REGISTERED" }));
    return;
  }
  if (!reg.registered_at) {
    res.statusCode = 412;
    res.end(JSON.stringify({ error: "VPS_NOT_ONLINE" }));
    return;
  }

  // Switch to SSE — stream events directly back to the browser, no Redis needed
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  let closed = false;
  req.on("close", () => { closed = true; });

  const heartbeat = setInterval(() => {
    if (!closed) res.write(": keepalive\n\n");
  }, 15_000);

  const nextModel = body.model && MODEL_IDS.has(body.model) ? body.model : null;
  const sessionKey = `agent:main:${user.id}`;

  const client = new OcClient({
    url: `wss://${reg.tunnel_hostname}/__openclaw__/ws`,
    token: reg.gateway_token,
    clientId: `syntex-vercel-${user.id.slice(0, 8)}`,
  });

  let runIdFilter: string | null = null;
  let finalize: () => void = () => {};
  const completion = new Promise<void>((resolve) => { finalize = resolve; });

  try {
    await client.connect({
      onEvent: (frame) => {
        if (frame.event !== "chat" && frame.event !== "chat.side_result") return;
        const payload = frame.payload as { runId: string; state: string };
        if (runIdFilter && payload.runId !== runIdFilter) return;
        if (!closed) sse(res, { event: frame.event, payload: frame.payload });
        if (payload.state === "final" || payload.state === "error" || payload.state === "aborted") {
          finalize();
        }
      },
    });

    if (nextModel && nextModel !== reg.current_model) {
      await client.sessionsPatch({ key: sessionKey, model: nextModel });
      await setCurrentModel(user.id, nextModel);
    }

    const ack = await client.chatSend({
      sessionKey,
      message,
      idempotencyKey: randomUUID(),
      deliver: false,
    });
    runIdFilter = ack.runId;

    const timeout = setTimeout(finalize, 290_000);
    await completion;
    clearTimeout(timeout);
  } catch (err) {
    if (!closed) {
      sse(res, { event: "error", payload: { state: "error", errorMessage: String(err) } });
    }
  } finally {
    clearInterval(heartbeat);
    client.close();
    if (!closed) {
      res.write("event: end\ndata: {}\n\n");
      res.end();
    }
  }
}
