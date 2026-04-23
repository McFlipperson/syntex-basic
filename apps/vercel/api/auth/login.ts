import type { IncomingMessage, ServerResponse } from "node:http";
import { applyCors, json, readJsonBody } from "../../lib/http.js";
import { findUserByEmail } from "../../lib/db.js";
import { makeSessionCookie, verifyPassword } from "../../lib/auth.js";

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

  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return json(res, 401, { error: "INVALID_CREDENTIALS" });
  }

  res.setHeader("Set-Cookie", makeSessionCookie(user.id));
  json(res, 200, { userId: user.id });
}
