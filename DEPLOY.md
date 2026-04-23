# Deploy guide

End-to-end setup for phase 1. Follow in order.

## 0. Prerequisites

- Node 20+ and pnpm 9 installed locally.
- Accounts for: **OpenRouter**, **Neon**, **Upstash**, **Vercel**, **Cloudflare**, and a Hostinger VPS running Ubuntu 24.04.
- `syntexprotocol.com` on Cloudflare nameservers (already done).

## 1. DNS cleanup (Cloudflare dashboard)

Delete these three A records (old VPS, dies with reinstall):

- `gateway` → 213.190.4.89
- `oc10` → 213.190.4.89
- `oc7` → 172.71.124.232

Keep apex A, `www` CNAME (both Vercel), all MX/SPF/Migadu TXT, NS.

Add a new CNAME for the API:

- `api` → `cname.vercel-dns.com` (proxied OFF — Vercel issues its own certs)

Per-user CNAMEs under `u-*` will be created automatically by the backend via the Cloudflare API at signup.

## 2. Provision accounts

### Cloudflare API token

Create a token with these permissions, scoped to the `syntexprotocol.com` zone + your account:

- Account → Cloudflare Tunnel → **Edit**
- Zone → DNS → **Edit**

Copy the token. Record your Account ID from the Cloudflare dashboard sidebar.

### Neon

1. Create project `syntex`.
2. Copy the pooled connection string (ends with `?sslmode=require`).
3. Run `apps/vercel/lib/schema.sql` against it once via the Neon SQL editor.

### Upstash

1. Create a Redis database named `syntex-sse` (any region close to Vercel).
2. Copy the REST URL + REST token.

### OpenRouter

1. Rotate any old keys.
2. Create a new key named `syntex-prod`. Save it.

### Vercel

1. Create a new project. Link it to the repo (once you `git init` + push).
2. Set root directory to `apps/vercel`.
3. Set framework preset to **Other** (we're using raw functions, not Next.js).
4. Configure Node 20.

## 3. Environment variables

On the Vercel project, set all keys from `.env.example`:

```
OPENROUTER_API_KEY=...
DATABASE_URL=...                      # Neon pooled URL
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_TUNNEL_ROOT_DOMAIN=syntexprotocol.com
SESSION_SECRET=<openssl rand -hex 32>
PUBLIC_SITE_ORIGIN=https://syntexprotocol.com
PUBLIC_API_ORIGIN=https://api.syntexprotocol.com
```

Assign the Vercel project to the `api.syntexprotocol.com` custom domain.

## 4. Build + deploy the backend

```
pnpm install
pnpm -r typecheck
```

Push to GitHub → Vercel auto-deploys. Confirm:

- `GET https://api.syntexprotocol.com/api/auth/session` → `{"authenticated": false}`

## 5. Build + host the widget

Locally:

```
pnpm --filter @syntex/widget build
```

This produces `apps/widget/dist/syntex-widget.js`. Host it from Vercel (copy into the main site build) or a CDN. Embed on syntexprotocol.com:

```html
<script>
  window.SYNTEX_CONFIG = { apiOrigin: "https://api.syntexprotocol.com" };
</script>
<script src="https://syntexprotocol.com/syntex-widget.js" defer></script>
```

## 6. End-to-end test with the VPS

1. Reinstall Hostinger VPS → Ubuntu 24.04, note the IP.
2. Open the widget on syntexprotocol.com → **Create account**.
3. Copy the displayed curl command, SSH into the VPS as root, paste it.
4. Wait for the script to finish. It should print `Install complete.`
5. Refresh the widget → send a message → expect a response.

## Known phase-1 limitations / deferred work

- **Credits / billing UI** — signup seeds `credits_cents = 0`; top-up flow not built. Until implemented, manually bump credits in Neon: `UPDATE users SET credits_cents = 10000 WHERE email = '...'`.
- **Credit deduction per message** — `deductCredits()` exists in `lib/db.ts` but isn't yet called from `/v1/chat/completions`. Add metering once per-request token counting is wired up.
- **Wizard (structured first-run Q&A)** — backend endpoints for `wizard.start`/`wizard.next` are not exposed yet. First conversation will flow through as normal chat. Add `api/wizard/{start,next,status}.ts` and a wizard screen in the widget.
- **Streaming deltas** — OC's chat events surface as `state: "final" | "error"` in the handler path; `"delta"` is schema-valid but not emitted in the primary path. Widget handles both for future-proofing.
- **Install script fragility** — assumes `openclaw` is on npm as `openclaw`. Verify and pin once OC publishes officially.
- **No rate limiting** — add on `/api/auth/*` and `/api/chat/send` before public launch.
- **Classifier / prompt builder** — reserved for phase 2, slots into `apps/vercel/api/chat/send.ts` before the `chatSend` call.
