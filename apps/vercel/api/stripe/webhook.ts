import type { IncomingMessage, ServerResponse } from "node:http";
import Stripe from "stripe";
import { env } from "../../lib/env.js";
import { addCredits } from "../../lib/db.js";
import { updateOrKeyLimit } from "../../lib/openrouter-mgmt.js";

async function readRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("METHOD_NOT_ALLOWED");
    return;
  }

  const sig = req.headers["stripe-signature"];
  if (!sig || typeof sig !== "string") {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "MISSING_SIGNATURE" }));
    return;
  }

  const rawBody = await readRawBody(req);
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "INVALID_SIGNATURE" }));
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const amountCents = Number(session.metadata?.amount_cents ?? 0);

    if (!userId || !amountCents) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "MISSING_METADATA" }));
      return;
    }

    const user = await addCredits(userId, amountCents);

    // Raise the user's OR key spending limit to match their new Syntex balance
    if (user.or_key_hash) {
      const newLimitUsd = user.credits_cents / 100;
      await updateOrKeyLimit(user.or_key_hash, newLimitUsd).catch((err) => {
        console.error("[webhook] updateOrKeyLimit failed for user", userId, String(err));
      });
    }
  }

  res.statusCode = 200;
  res.end(JSON.stringify({ received: true }));
}
