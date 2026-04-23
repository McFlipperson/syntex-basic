import type { IncomingMessage, ServerResponse } from "node:http";
import { getVpsByInstallToken } from "../../lib/db.js";
import { redis } from "../../lib/redis.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.end("METHOD_NOT_ALLOWED");
    return;
  }
  const url = new URL(req.url ?? "/", "http://x");
  const parts = url.pathname.split("/");
  const installToken = parts[parts.length - 1] ?? "";

  const reg = await getVpsByInstallToken(installToken);
  if (!reg) {
    res.statusCode = 404;
    res.end("");
    return;
  }

  const cacheKey = `tunnel-token:${installToken}`;
  const cached = await redis.get<string>(cacheKey);
  if (cached) {
    res.setHeader("Content-Type", "text/plain");
    res.end(cached);
    return;
  }
  res.statusCode = 409;
  res.end("TUNNEL_TOKEN_NOT_STAGED");
}
