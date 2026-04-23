import type { SyntexConfig } from "./config.js";

export interface SessionState {
  authenticated: boolean;
  userId?: string;
  email?: string;
  credits_cents?: number;
  vps?: {
    tunnelHostname: string;
    registered: boolean;
    currentModel: string;
  } | null;
}

export class SyntexApi {
  constructor(private readonly config: SyntexConfig) {}

  private url(path: string): string {
    return `${this.config.apiOrigin}${path}`;
  }

  async session(): Promise<SessionState> {
    const res = await fetch(this.url("/api/auth/session"), { credentials: "include" });
    if (!res.ok) return { authenticated: false };
    return (await res.json()) as SessionState;
  }

  async login(email: string, password: string): Promise<void> {
    const res = await fetch(this.url("/api/auth/login"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "LOGIN_FAILED");
  }

  async signup(email: string, password: string): Promise<{ installUrl: string }> {
    const res = await fetch(this.url("/api/auth/signup"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "SIGNUP_FAILED");
    return (await res.json()) as { installUrl: string };
  }

  async logout(): Promise<void> {
    await fetch(this.url("/api/auth/session"), {
      method: "DELETE",
      credentials: "include",
    });
  }

  async streamMessage(params: { message: string; model?: string }): Promise<ReadableStream<Uint8Array>> {
    const res = await fetch(this.url("/api/chat/send"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `HTTP_${res.status}`);
    }
    if (!res.body) throw new Error("NO_STREAM");
    return res.body;
  }
}
