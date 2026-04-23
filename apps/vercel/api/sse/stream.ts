import type { IncomingMessage, ServerResponse } from "node:http";

// SSE streaming is now handled directly in api/chat/send.ts
// This endpoint is kept as a stub to avoid 404s from old clients.
export default function handler(_req: IncomingMessage, res: ServerResponse) {
  res.statusCode = 410;
  res.end(JSON.stringify({ error: "GONE", message: "Use POST /api/chat/send — it streams SSE directly." }));
}
