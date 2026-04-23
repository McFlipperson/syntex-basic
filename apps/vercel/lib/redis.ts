import { Redis } from "@upstash/redis";
import { env } from "./env.js";

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

export function chatStreamKey(userId: string, runId: string): string {
  return `chat:${userId}:${runId}`;
}

export function chatIndexKey(userId: string): string {
  return `chat-active:${userId}`;
}

export async function pushChatEvent(
  userId: string,
  runId: string,
  payload: unknown,
): Promise<void> {
  const key = chatStreamKey(userId, runId);
  await redis.rpush(key, JSON.stringify(payload));
  await redis.expire(key, 300);
}

export async function popChatEvents(
  userId: string,
  runId: string,
  cursor: number,
): Promise<{ events: unknown[]; nextCursor: number }> {
  const key = chatStreamKey(userId, runId);
  const raw = await redis.lrange<string>(key, cursor, -1);
  const events = raw.map((s) => JSON.parse(s));
  return { events, nextCursor: cursor + events.length };
}
