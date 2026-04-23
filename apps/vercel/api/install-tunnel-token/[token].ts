import type { IncomingMessage, ServerResponse } from "node:http";
import { getVpsByInstallToken } from "../../lib/db.js";

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
  if (!reg || !reg.tunnel_token) {
    res.statusCode = 404;
    res.end("");
    return;
  }

  res.setHeader("Content-Type", "text/plain");
  res.end(reg.tunnel_token);
}
