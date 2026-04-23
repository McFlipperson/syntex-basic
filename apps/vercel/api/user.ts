import type { IncomingMessage, ServerResponse } from "node:http";
import { applyCors, json } from "../lib/http.js";
import { requireUser } from "../lib/auth.js";
import { getVpsRegistration } from "../lib/db.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "GET") return json(res, 405, { error: "METHOD_NOT_ALLOWED" });

  const user = await requireUser(req, res);
  if (!user) return;

  const reg = await getVpsRegistration(user.id);

  json(res, 200, {
    email: user.email,
    credit_balance: (user.credits_cents / 100).toFixed(2),
    vps: reg
      ? {
          registered: reg.registered_at !== null,
          currentModel: reg.current_model,
        }
      : null,
  });
}
