import { env } from "./env.js";

const BASE = "https://openrouter.ai/api/v1";

async function mgmtFetch(path: string, method: string, body?: unknown): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_MANAGEMENT_KEY}`,
      "Content-Type": "application/json",
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OR management API ${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

interface OrKeyResponse {
  data?: { key?: string; hash?: string };
  key?: string;
  hash?: string;
}

export async function createOrKey(userId: string): Promise<{ key: string; hash: string }> {
  const raw = await mgmtFetch("/keys", "POST", {
    name: `syntex-user-${userId}`,
    limit: 0, // raised to match balance when user tops up
  }) as OrKeyResponse;

  const key = raw.key ?? raw.data?.key;
  const hash = raw.hash ?? raw.data?.hash;
  if (!key || !hash) throw new Error(`OR createOrKey: unexpected response shape: ${JSON.stringify(raw)}`);
  return { key, hash };
}

export async function updateOrKeyLimit(keyHash: string, limitUsd: number): Promise<void> {
  await mgmtFetch(`/keys/${keyHash}`, "PATCH", { limit: limitUsd });
}
