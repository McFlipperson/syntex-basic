import type { IncomingMessage, ServerResponse } from "node:http";
import { getVpsByInstallToken } from "../../lib/db.js";
import { env } from "../../lib/env.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.end("METHOD_NOT_ALLOWED");
    return;
  }

  const url = new URL(req.url ?? "/", "http://x");
  const parts = url.pathname.split("/");
  const token = parts[parts.length - 1] ?? "";

  const reg = await getVpsByInstallToken(token);
  if (!reg) {
    res.statusCode = 404;
    res.end("# Unknown install token.\nexit 1\n");
    return;
  }

  // Fetch the user's api_token to use as the model provider key
  const { sql } = await import("../../lib/db.js");
  const rows = await sql`SELECT api_token FROM users WHERE id = ${reg.user_id}` as { api_token: string }[];
  const apiToken = rows[0]?.api_token ?? "";

  const vars: Record<string, string> = {
    SYNTEX_API_ORIGIN: env.PUBLIC_API_ORIGIN,
    SYNTEX_INSTALL_TOKEN: reg.install_token,
    SYNTEX_GATEWAY_TOKEN: reg.gateway_token,
    SYNTEX_CREDIT_TOKEN: apiToken,
    SYNTEX_V1_BASE_URL: `${env.PUBLIC_API_ORIGIN}/v1`,
    SYNTEX_ALLOWED_ORIGIN: env.PUBLIC_SITE_ORIGIN,
    SYNTEX_TUNNEL_HOSTNAME: reg.tunnel_hostname,
  };

  const prelude = [
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    "",
    "# Syntex VPS install script — generated for a single user.",
    "# Do not share this URL; it embeds secrets.",
    "",
  ];
  for (const [k, v] of Object.entries(vars)) {
    prelude.push(`export ${k}=${shellQuote(v)}`);
  }
  prelude.push("");

  const main = INSTALL_SCRIPT_BODY;

  res.setHeader("Content-Type", "text/x-shellscript; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.statusCode = 200;
  res.end(prelude.join("\n") + main);
}

function shellQuote(s: string): string {
  return `'${s.replace(/'/g, `'\\''`)}'`;
}

const INSTALL_SCRIPT_BODY = `
: "\${SYNTEX_API_ORIGIN:?missing}"
: "\${SYNTEX_INSTALL_TOKEN:?missing}"
: "\${SYNTEX_GATEWAY_TOKEN:?missing}"
: "\${SYNTEX_V1_BASE_URL:?missing}"
: "\${SYNTEX_ALLOWED_ORIGIN:?missing}"
: "\${SYNTEX_TUNNEL_HOSTNAME:?missing}"

# Must be root (we install packages + systemd units)
if [[ $EUID -ne 0 ]]; then
  echo "This installer must run as root. Try: sudo bash install.sh" >&2
  exit 1
fi

echo ">>> Syntex installer starting..."
echo ">>> Tunnel: \${SYNTEX_TUNNEL_HOSTNAME}"

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl ca-certificates jq

# --- cloudflared ---
if ! command -v cloudflared >/dev/null 2>&1; then
  ARCH=$(dpkg --print-architecture)
  curl -fsSL -o /tmp/cloudflared.deb \\
    "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-\${ARCH}.deb"
  apt-get install -y /tmp/cloudflared.deb
  rm -f /tmp/cloudflared.deb
fi

# --- Node (for OpenClaw) ---
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

# --- OpenClaw ---
npm install -g openclaw >/dev/null

# Write the minimal gateway config — controlUi origin allowlist, token-only auth.
mkdir -p /root/.openclaw
cat > /root/.openclaw/openclaw.json <<EOF
{
  "gateway": {
    "auth": {
      "mode": "token",
      "token": "\${SYNTEX_GATEWAY_TOKEN}"
    },
    "controlUi": {
      "dangerouslyDisableDeviceAuth": true,
      "allowedOrigins": ["\${SYNTEX_ALLOWED_ORIGIN}"]
    },
    "bind": "loopback",
    "port": 18789
  },
  "models": {
    "providers": {
      "syntex": {
        "baseUrl": "\${SYNTEX_V1_BASE_URL}",
        "api": "openai-completions",
        "auth": "api-key",
        "apiKey": { "source": "env", "provider": "default", "id": "SYNTEX_CREDIT_TOKEN" },
        "models": [
          {
            "id": "anthropic/claude-sonnet-4-6",
            "name": "Claude Sonnet 4.6",
            "api": "openai-completions",
            "reasoning": false,
            "input": ["text"],
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 },
            "contextWindow": 200000,
            "maxTokens": 8192
          }
        ]
      }
    }
  }
}
EOF

# --- Write env file for OC to use as model provider key ---
mkdir -p /root/.openclaw
cat > /root/.openclaw/.env <<EOF
SYNTEX_CREDIT_TOKEN=\${SYNTEX_CREDIT_TOKEN}
EOF

# --- Non-interactive onboard ---
openclaw onboard --non-interactive --accept-risk \\
  --mode local \\
  --auth-choice custom-api-key \\
  --custom-base-url "\${SYNTEX_V1_BASE_URL}" \\
  --custom-model-id "anthropic/claude-sonnet-4-6" \\
  --custom-api-key "\${SYNTEX_CREDIT_TOKEN}" \\
  --custom-provider-id "syntex" \\
  --custom-compatibility openai \\
  --gateway-port 18789 \\
  --gateway-bind loopback \\
  --gateway-auth token \\
  --gateway-token "\${SYNTEX_GATEWAY_TOKEN}" \\
  --skip-health

# --- systemd unit for OpenClaw gateway ---
cat > /etc/systemd/system/openclaw-gateway.service <<'UNIT'
[Unit]
Description=OpenClaw Gateway
After=network-online.target

[Service]
Type=simple
User=root
Environment=OPENCLAW_GATEWAY_TOKEN=__TOKEN__
Environment=SYNTEX_CREDIT_TOKEN=__CREDIT_TOKEN__
ExecStart=/usr/bin/openclaw gateway run
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
UNIT
sed -i "s|__TOKEN__|\${SYNTEX_GATEWAY_TOKEN}|g" /etc/systemd/system/openclaw-gateway.service
sed -i "s|__CREDIT_TOKEN__|\${SYNTEX_CREDIT_TOKEN}|g" /etc/systemd/system/openclaw-gateway.service

systemctl daemon-reload
systemctl enable --now openclaw-gateway.service

# --- cloudflared tunnel (token baked in at signup) ---
TUNNEL_TOKEN_URL="\${SYNTEX_API_ORIGIN}/api/install-tunnel-token/\${SYNTEX_INSTALL_TOKEN}"
TUNNEL_TOKEN=$(curl -fsSL "\${TUNNEL_TOKEN_URL}")
if [[ -z "\${TUNNEL_TOKEN}" ]]; then
  echo "Failed to fetch tunnel token." >&2
  exit 1
fi

cloudflared service install "\${TUNNEL_TOKEN}"
systemctl enable --now cloudflared.service

# --- Phone home so Syntex knows the install is live ---
curl -fsSL -X POST \\
  -H "Content-Type: application/json" \\
  -d "{\\"installToken\\":\\"\${SYNTEX_INSTALL_TOKEN}\\"}" \\
  "\${SYNTEX_API_ORIGIN}/api/register-vps"

echo ">>> Install complete."
echo ">>> Your agent is reachable at wss://\${SYNTEX_TUNNEL_HOSTNAME}"
echo ">>> Next: log in at \${SYNTEX_ALLOWED_ORIGIN} and buy credits."
`;
