import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { env } from "./env.js";
import { findUserById, getUserByToken, type UserRow } from "./db.js";

const COOKIE_NAME = "syntex_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function generateApiToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, derivedHex] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !derivedHex) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(derivedHex, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

function sign(value: string): string {
  return createHmac("sha256", env.SESSION_SECRET).update(value).digest("hex");
}

export function makeSessionCookie(userId: string): string {
  const ts = Date.now().toString();
  const payload = `${userId}.${ts}`;
  const sig = sign(payload);
  const value = `${payload}.${sig}`;
  const attrs = [
    `${COOKIE_NAME}=${value}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${MAX_AGE_SECONDS}`,
  ];
  return attrs.join("; ");
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function readSession(req: IncomingMessage): { userId: string } | null {
  const header = req.headers.cookie;
  if (!header) return null;
  const cookies = Object.fromEntries(
    header.split(";").map((p) => {
      const idx = p.indexOf("=");
      if (idx === -1) return [p.trim(), ""];
      return [p.slice(0, idx).trim(), p.slice(idx + 1).trim()];
    }),
  );
  const raw = cookies[COOKIE_NAME];
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [userId, ts, sig] = parts as [string, string, string];
  const expected = sign(`${userId}.${ts}`);
  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const age = Date.now() - Number(ts);
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_SECONDS * 1000) return null;
  return { userId };
}

export async function requireUser(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<UserRow | null> {
  // Try cookie session first
  const session = readSession(req);
  if (session) {
    const user = await findUserById(session.userId);
    if (user) return user;
  }

  // Fall back to Bearer token
  const auth = req.headers.authorization ?? "";
  if (auth.startsWith("Bearer ")) {
    const token = auth.slice(7).trim();
    if (token) {
      const user = await getUserByToken(token);
      if (user) return user;
    }
  }

  res.statusCode = 401;
  res.end(JSON.stringify({ error: "UNAUTHORIZED" }));
  return null;
}
