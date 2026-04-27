import type { IncomingMessage, ServerResponse } from "node:http";
import { applyCors, json } from "../../lib/http.js";
import { requireUser } from "../../lib/auth.js";
import { getVpsRegistration } from "../../lib/db.js";

async function probeTunnel(hostname: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    await fetch(`https://${hostname}/__openclaw__/ws`, { signal: controller.signal });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "GET") return json(res, 405, { error: "METHOD_NOT_ALLOWED" });

  const user = await requireUser(req, res);
  if (!user) return;

  const reg = await getVpsRegistration(user.id);
  if (!reg || reg.registered_at === null) {
    return json(res, 404, { online: false, reason: "not_registered" });
  }

  const reachable = await probeTunnel(reg.tunnel_hostname);
  if (!reachable) {
    return json(res, 200, { online: false, reason: "tunnel_unreachable" });
  }

  json(res, 200, { online: true });
}
