# Syntex

Web chat interface for [OpenClaw](https://github.com/openclaw/openclaw) agents. Each user runs their own OC instance on their own VPS; Syntex provides account management, a managed model-routing proxy, and a browser modal so users don't have to live in Telegram.

## Architecture

```
Browser (modal on syntexprotocol.com)
     │  HTTPS + SSE
     ▼
Vercel backend (apps/vercel)
     │  • Auth + signup + per-user install script
     │  • WebSocket client to user's OC Gateway (one fresh conn per message)
     │  • /v1/chat/completions proxy → OpenRouter (master key hidden)
     │  • SSE endpoint ← Upstash Redis pub/sub
     ▼
User's VPS (Ubuntu 24.04, provisioned by the install script)
     • OpenClaw Gateway (loopback :18789)
     • cloudflared tunnel → wss://u-<id>.syntexprotocol.com
     • Phones home to Syntex after install with its gateway token
```

## Workspace layout

- `packages/protocol` — shared TypeScript types for the OC Gateway WebSocket protocol
- `packages/vps-installer` — bash install script the user curls onto their VPS
- `apps/vercel` — Vercel backend (auth, WS bridge, SSE, `/v1` proxy)
- `apps/widget` — vanilla-JS chat modal, single script-tag embed

## Setup (once accounts exist)

1. Copy `.env.example` → `.env` and fill in values.
2. `pnpm install`
3. `pnpm typecheck`

Per-account provisioning (OpenRouter key, Neon DB, Upstash, Vercel, Cloudflare API token) is done once in each vendor's dashboard.
