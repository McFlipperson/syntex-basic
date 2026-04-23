function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  get OPENROUTER_API_KEY() {
    return req("OPENROUTER_API_KEY");
  },
  get DATABASE_URL() {
    return req("DATABASE_URL");
  },
  get CLOUDFLARE_ACCOUNT_ID() {
    return req("CLOUDFLARE_ACCOUNT_ID");
  },
  get CLOUDFLARE_API_TOKEN() {
    return req("CLOUDFLARE_API_TOKEN");
  },
  get CLOUDFLARE_TUNNEL_ROOT_DOMAIN() {
    return req("CLOUDFLARE_TUNNEL_ROOT_DOMAIN");
  },
  get SESSION_SECRET() {
    return req("SESSION_SECRET");
  },
  get PUBLIC_SITE_ORIGIN() {
    return req("PUBLIC_SITE_ORIGIN");
  },
  get PUBLIC_API_ORIGIN() {
    return req("PUBLIC_API_ORIGIN");
  },
  get STRIPE_SECRET_KEY() {
    return req("STRIPE_SECRET_KEY");
  },
};
