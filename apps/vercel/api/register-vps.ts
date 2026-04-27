import type { IncomingMessage, ServerResponse } from "node:http";
import { applyCors, json, readJsonBody } from "../lib/http.js";
import { getVpsByInstallToken, markVpsRegistered } from "../lib/db.js";
import { ensureTunnelDns, tunnelIdFromToken } from "../lib/cloudflare.js";
import { env } from "../lib/env.js";

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

  if (reg.tunnel_token) {
    const tunnelId = tunnelIdFromToken(reg.tunnel_token);
    if (tunnelId) {
      try {
        await ensureTunnelDns({
          hostname: reg.tunnel_hostname,
          tunnelId,
          rootDomain: env.CLOUDFLARE_TUNNEL_ROOT_DOMAIN,
        });
      } catch (err) {
        console.error("ensureTunnelDns failed", { userId: reg.user_id, hostname: reg.tunnel_hostname, err: String(err) });
      }
    }
  }

  // Atomic: only marks registered if not already registered; safe against replay
  await markVpsRegistered(token);
  json(res, 200, { ok: true });
}
