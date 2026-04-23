import type { IncomingMessage, ServerResponse } from "node:http";
import { requireUser } from "../../lib/auth.js";
import { popChatEvents } from "../../lib/redis.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.end("METHOD_NOT_ALLOWED");
    return;
  }

  const user = await requireUser(req, res);
  if (!user) return;

  const url = new URL(req.url ?? "/", "http://x");
  const runId = url.searchParams.get("runId");
  if (!runId) {
    res.statusCode = 400;
    res.end("MISSING_RUN_ID");
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  let cursor = 0;
  let closed = false;
  req.on("close", () => {
    closed = true;
  });

  const deadline = Date.now() + 290_000;
  const heartbeat = setInterval(() => {
    if (!closed) res.write(": keepalive\n\n");
  }, 15_000);

  try {
    while (!closed && Date.now() < deadline) {
      const { events, nextCursor } = await popChatEvents(user.id, runId, cursor);
      if (events.length > 0) {
        for (const ev of events) {
          res.write(`data: ${JSON.stringify(ev)}\n\n`);
        }
        cursor = nextCursor;
        const last = events[events.length - 1] as {
          payload?: { state?: string };
        };
        const state = last?.payload?.state;
        if (state === "final" || state === "error" || state === "aborted") {
          break;
        }
      } else {
        await new Promise((r) => setTimeout(r, 250));
      }
    }
  } finally {
    clearInterval(heartbeat);
    if (!closed) {
      res.write("event: end\ndata: {}\n\n");
      res.end();
    }
  }
}
