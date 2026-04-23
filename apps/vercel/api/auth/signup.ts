import type { IncomingMessage, ServerResponse } from "node:http";
import { randomBytes } from "node:crypto";
import { applyCors, json, readJsonBody } from "../../lib/http.js";
import { createUser, findUserByEmail, upsertVpsRegistration } from "../../lib/db.js";
import { generateApiToken, hashPassword, makeSessionCookie } from "../../lib/auth.js";
import { createTunnelForUser } from "../../lib/cloudflare.js";

interface Body {
  email?: string;
  password?: string;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { error: "METHOD_NOT_ALLOWED" });

  const body = await readJsonBody<Body>(req).catch(() => ({}) as Body);
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { error: "INVALID_EMAIL" });
  }
  if (password.length < 8) {
    return json(res, 400, { error: "WEAK_PASSWORD" });
  }

  const existing = await findUserByEmail(email);
  if (existing) return json(res, 409, { error: "EMAIL_TAKEN" });

  const user = await createUser(email, hashPassword(password), generateApiToken());

  const tunnel = await createTunnelForUser({ userId: user.id });
  const gatewayToken = randomBytes(32).toString("hex");
  const installToken = randomBytes(24).toString("hex");

  await upsertVpsRegistration({
    userId: user.id,
    tunnelHostname: tunnel.hostname,
    gatewayToken,
    installToken,
    tunnelToken: tunnel.tunnelToken,
  });

  res.setHeader("Set-Cookie", makeSessionCookie(user.id));
  json(res, 200, {
    userId: user.id,
    syntexToken: user.api_token,
    installToken,
    tunnelHostname: tunnel.hostname,
    installUrl: `/api/install/${installToken}`,
  });
}
