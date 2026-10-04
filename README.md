# TriSakay

Municipality of Gonzaga tricycle booking application built with React, TypeScript, Vite, Supabase, and Semaphore SMS.

## Local development

1. Copy `.env.example` to `.env.local` and provide the public browser values.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.

## Secure Password/PIN reset

The reset flow uses a six-digit Semaphore OTP and stores only hashed challenges in Supabase. Codes expire after five minutes, allow five attempts, and produce a single-use reset token.

Before deploying:

1. Run `supabase/password_reset.sql` in the Supabase SQL editor to create the server-only challenge table.
2. Add these server-only environment variables in Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SEMAPHORE_API_KEY`
   - `PASSWORD_RESET_SECRET` (a long random value)
3. Never expose server credentials through variables beginning with `VITE_`.
4. Revoke any Semaphore key that was previously committed to source control and create a replacement.

The Supabase service-role key and Semaphore key are used only by Vercel serverless functions.

## Checks

- `npm run build`
- `npm run lint`
