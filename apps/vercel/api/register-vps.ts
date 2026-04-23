import type { IncomingMessage, ServerResponse } from "node:http";
import { applyCors, json, readJsonBody } from "../lib/http.js";
import { getVpsByInstallToken, markVpsRegistered } from "../lib/db.js";

interface Body {
  installToken?: string;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { error: "METHOD_NOT_ALLOWED" });

  const body = await readJsonBody<Body>(req).catch(() => ({}) as Body);
  const token = body.installToken ?? "";
  const reg = await getVpsByInstallToken(token);
  if (!reg) return json(res, 404, { error: "UNKNOWN_INSTALL_TOKEN" });

  await markVpsRegistered(token);
  json(res, 200, { ok: true });
}
