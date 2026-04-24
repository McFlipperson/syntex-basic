import type { IncomingMessage, ServerResponse } from "node:http";
import { applyCors, json } from "../../lib/http.js";
import { clearSessionCookie, readSession } from "../../lib/auth.js";
import { findUserById, getVpsRegistration } from "../../lib/db.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (applyCors(req, res)) return;

  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", clearSessionCookie());
    return json(res, 200, { ok: true });
  }
  if (req.method !== "GET") return json(res, 405, { error: "METHOD_NOT_ALLOWED" });

  const session = readSession(req);
  if (!session) return json(res, 200, { authenticated: false });

  const user = await findUserById(session.userId);
  if (!user) return json(res, 200, { authenticated: false });

  const vps = await getVpsRegistration(user.id);

  json(res, 200, {
    authenticated: true,
    userId: user.id,
    email: user.email,
    credits_cents: user.credits_cents,
    vps: vps
      ? {
          tunnelHostname: vps.tunnel_hostname,
          registered: vps.registered_at !== null,
          currentModel: vps.current_model,
          installUrl: vps.registered_at === null ? `/api/install/${vps.install_token}` : null,
        }
      : null,
  });
}
