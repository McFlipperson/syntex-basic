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

  const zone = await resolveZoneId(root);
  await cf(`/zones/${zone}/dns_records`, {
    method: "POST",
    body: JSON.stringify({
      type: "CNAME",
      name: subdomain,
      content: `${tunnel.id}.cfargotunnel.com`,
      proxied: true,
    }),
  });

  const token = await cf<string>(`/accounts/${accountId}/cfd_tunnel/${tunnel.id}/token`);

  return {
    tunnelId: tunnel.id,
    tunnelToken: token,
    hostname,
  };
}

async function resolveZoneId(rootDomain: string): Promise<string> {
  const zones = await cf<Array<{ id: string; name: string }>>(
    `/zones?name=${encodeURIComponent(rootDomain)}`,
  );
  const zone = zones[0];
  if (!zone) throw new Error(`CF_ZONE_NOT_FOUND:${rootDomain}`);
  return zone.id;
}
