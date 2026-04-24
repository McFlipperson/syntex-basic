import { env } from "./env.js";

interface CfResponse<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  result: T;
}

async function cf<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = (await res.json()) as CfResponse<T>;
  if (!body.success) {
    throw new Error(
      `CF_API_ERROR:${path}:${body.errors.map((e) => `${e.code}:${e.message}`).join(",")}`,
    );
  }
  return body.result;
}

export interface CreatedTunnel {
  tunnelId: string;
  tunnelToken: string;
  hostname: string;
}

export async function createTunnelForUser(params: {
  userId: string;
}): Promise<CreatedTunnel> {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const root = env.CLOUDFLARE_TUNNEL_ROOT_DOMAIN;
  const subdomain = `u-${params.userId.replace(/-/g, "").slice(0, 12)}`;
  const hostname = `${subdomain}.${root}`;

  const tunnelSecret = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString(
    "base64",
  );

  const tunnel = await cf<{ id: string }>(`/accounts/${accountId}/cfd_tunnel`, {
    method: "POST",
    body: JSON.stringify({
      name: `syntex-${subdomain}`,
      tunnel_secret: tunnelSecret,
      config_src: "cloudflare",
    }),
  });

  await cf(`/accounts/${accountId}/cfd_tunnel/${tunnel.id}/configurations`, {
    method: "PUT",
    body: JSON.stringify({
      config: {
        ingress: [
          {
            hostname,
            service: "http://127.0.0.1:18789",
          },
          { service: "http_status:404" },
        ],
      },
    }),
  });

  await ensureTunnelDns({ hostname, tunnelId: tunnel.id, rootDomain: root });

  const token = await cf<string>(`/accounts/${accountId}/cfd_tunnel/${tunnel.id}/token`);

  return {
    tunnelId: tunnel.id,
    tunnelToken: token,
    hostname,
  };
}

// Idempotent CNAME upsert. Creates the record if missing, updates it if the
// target drifted, leaves it alone if already correct. Safe to call on every
// register-vps so users whose signup DNS write failed self-heal.
export async function ensureTunnelDns(params: {
  hostname: string;
  tunnelId: string;
  rootDomain: string;
}): Promise<void> {
  const zone = await resolveZoneId(params.rootDomain);
  const target = `${params.tunnelId}.cfargotunnel.com`;

  const existing = await cf<Array<{ id: string; type: string; content: string }>>(
    `/zones/${zone}/dns_records?type=CNAME&name=${encodeURIComponent(params.hostname)}`,
  );

  if (existing.length === 0) {
    await cf(`/zones/${zone}/dns_records`, {
      method: "POST",
      body: JSON.stringify({
        type: "CNAME",
        name: params.hostname,
        content: target,
        proxied: true,
      }),
    });
    return;
  }

  const record = existing[0]!;
  if (record.content !== target) {
    await cf(`/zones/${zone}/dns_records/${record.id}`, {
      method: "PATCH",
      body: JSON.stringify({ content: target, proxied: true }),
    });
  }
}

// Decodes a cloudflared tunnel token (base64 JSON with { a, t, s }) to
// recover the tunnel id. We don't store tunnel_id separately in the db,
// but it's embedded in tunnel_token.
export function tunnelIdFromToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded) as { t?: string };
    return parsed.t ?? null;
  } catch {
    return null;
  }
}

async function resolveZoneId(rootDomain: string): Promise<string> {
  const zones = await cf<Array<{ id: string; name: string }>>(
    `/zones?name=${encodeURIComponent(rootDomain)}`,
  );
  const zone = zones[0];
  if (!zone) throw new Error(`CF_ZONE_NOT_FOUND:${rootDomain}`);
  return zone.id;
}
