-- Run once against the Neon database before deploying.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  api_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  credits_cents INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS vps_registrations (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  tunnel_hostname TEXT NOT NULL,
  gateway_token TEXT NOT NULL,
  install_token TEXT UNIQUE NOT NULL,
  registered_at TIMESTAMPTZ,
  current_model TEXT NOT NULL DEFAULT 'anthropic/claude-sonnet-4.6'
);

CREATE INDEX IF NOT EXISTS vps_registrations_install_token_idx
  ON vps_registrations (install_token);
