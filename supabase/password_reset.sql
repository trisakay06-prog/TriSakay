-- Run this migration once in the Supabase SQL editor.
-- OTP reset data remains inaccessible to anon/authenticated browser clients.

CREATE TABLE IF NOT EXISTS public.password_reset_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  request_ip_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT NOT NULL DEFAULT 0 CHECK (attempts >= 0 AND attempts <= 5),
  verified_at TIMESTAMPTZ,
  reset_token_hash TEXT,
  reset_token_expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_mobile_created
  ON public.password_reset_challenges(mobile, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_password_reset_ip_created
  ON public.password_reset_challenges(request_ip_hash, created_at DESC);

ALTER TABLE public.password_reset_challenges ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.password_reset_challenges FROM anon, authenticated;
