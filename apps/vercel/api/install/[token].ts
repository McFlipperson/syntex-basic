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

# --- OpenClaw (official installer, not npm — npm lacks systemd scaffolding) ---
if ! command -v openclaw >/dev/null 2>&1; then
  curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- --no-onboard
fi

# The official installer may place the binary in a user bin dir not on PATH
for candidate in /root/.local/bin /root/.openclaw/bin /usr/local/bin; do
  if [[ -x "\$candidate/openclaw" && ":\$PATH:" != *":\$candidate:"* ]]; then
    export PATH="\$candidate:\$PATH"
  fi
done
command -v openclaw >/dev/null 2>&1 || { echo "openclaw not found after install" >&2; exit 1; }

# --- Run OC's onboard — writes the config only. We install a system-level
# systemd unit ourselves because onboard wants a user session (unavailable
# under curl-pipe-sudo-bash), and its --install-daemon path silently no-ops.
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
  --skip-skills \\
  --skip-health

OC_BIN=$(command -v openclaw)

# --- Patch CORS allowlist into onboard-generated config ---
# onboard doesn't have flags for controlUi.allowedOrigins or
# dangerouslyDisableDeviceAuth, so we add them with jq after it runs.
CFG=/root/.openclaw/openclaw.json
tmp=$(mktemp)
jq --arg origin "\${SYNTEX_ALLOWED_ORIGIN}" '
  .gateway.controlUi = (.gateway.controlUi // {})
  | .gateway.controlUi.dangerouslyDisableDeviceAuth = true
  | .gateway.controlUi.allowedOrigins = [$origin]
' "\$CFG" > "\$tmp" && mv "\$tmp" "\$CFG"

# --- Write our own system-level systemd unit for the OC gateway.
# Distinct name ("syntex-oc") so OC's internal "am I the daemon?" probe
# doesn't see a matching unit and loop.
cat > /etc/systemd/system/syntex-oc.service <<UNIT
[Unit]
Description=Syntex OpenClaw Gateway
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
Environment=HOME=/root
Environment=SYNTEX_CREDIT_TOKEN=\${SYNTEX_CREDIT_TOKEN}
ExecStart=\${OC_BIN} gateway run
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable --now syntex-oc.service

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
