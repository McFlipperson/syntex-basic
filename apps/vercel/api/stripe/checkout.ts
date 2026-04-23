import type { IncomingMessage, ServerResponse } from "node:http";
import Stripe from "stripe";
import { applyCors, json, readJsonBody } from "../../lib/http.js";
import { requireUser } from "../../lib/auth.js";
import { env } from "../../lib/env.js";

interface Body {
  amount?: number;
  successUrl?: string;
  cancelUrl?: string;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { error: "METHOD_NOT_ALLOWED" });

  const user = await requireUser(req, res);
  if (!user) return;

  const body = await readJsonBody<Body>(req).catch(() => ({}) as Body);
  const amount = body.amount;
  const successUrl = body.successUrl;
  const cancelUrl = body.cancelUrl;

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return json(res, 400, { error: "INVALID_AMOUNT" });
  }
  if (!successUrl || !cancelUrl) {
    return json(res, 400, { error: "MISSING_URLS" });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Syntex Credits" },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { userId: user.id, amount_cents: String(Math.round(amount * 100)) },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  json(res, 200, { url: session.url });
}
