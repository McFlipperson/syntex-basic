import { neon } from "@neondatabase/serverless";
import { env } from "./env.js";

const sql = neon(env.DATABASE_URL);

export { sql };

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  api_token: string;
  created_at: string;
  credits_cents: number;
}

export interface VpsRegistrationRow {
  user_id: string;
  tunnel_hostname: string;
  gateway_token: string;
  install_token: string;
  registered_at: string | null;
  current_model: string;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const rows = (await sql`
    SELECT id, email, password_hash, api_token, created_at, credits_cents
    FROM users WHERE email = ${email}
  `) as UserRow[];
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const rows = (await sql`
    SELECT id, email, password_hash, api_token, created_at, credits_cents
    FROM users WHERE id = ${id}
  `) as UserRow[];
  return rows[0] ?? null;
}

export async function getUserByToken(token: string): Promise<UserRow | null> {
  const rows = (await sql`
    SELECT id, email, password_hash, api_token, created_at, credits_cents
    FROM users WHERE api_token = ${token}
  `) as UserRow[];
  return rows[0] ?? null;
}

export async function createUser(
  email: string,
  passwordHash: string,
  apiToken: string,
): Promise<UserRow> {
  const rows = (await sql`
    INSERT INTO users (email, password_hash, api_token)
    VALUES (${email}, ${passwordHash}, ${apiToken})
    RETURNING id, email, password_hash, api_token, created_at, credits_cents
  `) as UserRow[];
  const row = rows[0];
  if (!row) throw new Error("createUser: insert returned no row");
  return row;
}

export async function getVpsRegistration(userId: string): Promise<VpsRegistrationRow | null> {
  const rows = (await sql`
    SELECT user_id, tunnel_hostname, gateway_token, install_token,
           registered_at, current_model
    FROM vps_registrations WHERE user_id = ${userId}
  `) as VpsRegistrationRow[];
  return rows[0] ?? null;
}

export async function getVpsByInstallToken(
  installToken: string,
): Promise<VpsRegistrationRow | null> {
  const rows = (await sql`
    SELECT user_id, tunnel_hostname, gateway_token, install_token,
           registered_at, current_model
    FROM vps_registrations WHERE install_token = ${installToken}
  `) as VpsRegistrationRow[];
  return rows[0] ?? null;
}

export async function upsertVpsRegistration(params: {
  userId: string;
  tunnelHostname: string;
  gatewayToken: string;
  installToken: string;
}): Promise<void> {
  await sql`
    INSERT INTO vps_registrations
      (user_id, tunnel_hostname, gateway_token, install_token)
    VALUES
      (${params.userId}, ${params.tunnelHostname}, ${params.gatewayToken}, ${params.installToken})
    ON CONFLICT (user_id) DO UPDATE SET
      tunnel_hostname = EXCLUDED.tunnel_hostname,
      gateway_token = EXCLUDED.gateway_token,
      install_token = EXCLUDED.install_token,
      registered_at = NULL
  `;
}

export async function markVpsRegistered(installToken: string): Promise<void> {
  await sql`
    UPDATE vps_registrations
    SET registered_at = NOW()
    WHERE install_token = ${installToken}
  `;
}

export async function setCurrentModel(userId: string, model: string): Promise<void> {
  await sql`
    UPDATE vps_registrations SET current_model = ${model} WHERE user_id = ${userId}
  `;
}

export async function deductCredits(userId: string, cents: number): Promise<number> {
  const rows = (await sql`
    UPDATE users SET credits_cents = credits_cents - ${cents}
    WHERE id = ${userId} AND credits_cents >= ${cents}
    RETURNING credits_cents
  `) as { credits_cents: number }[];
  const row = rows[0];
  if (!row) throw new Error("INSUFFICIENT_CREDITS");
  return row.credits_cents;
}
