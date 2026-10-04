import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const OTP_TTL_MS = 5 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;
const RESEND_DELAY_MS = 60 * 1000;
const MAX_REQUESTS_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 5;

const normalizeMobile = (value: unknown) => {
  const mobile = String(value || '').replace(/\s+/g, '');
  return /^09\d{9}$/.test(mobile) ? mobile : null;
};

const hashValue = (value: string, secret: string) =>
  createHmac('sha256', secret).update(value).digest('hex');

const safeEqual = (left: string, right: string) => {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
};

const getClientIp = (req: any) => {
  const forwarded = req.headers?.['x-forwarded-for'];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim();
};

const sendJson = (res: any, status: number, body: Record<string, unknown>) => {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(body);
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { success: false, message: 'Method not allowed.' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const semaphoreApiKey = process.env.SEMAPHORE_API_KEY;
  const resetSecret = process.env.PASSWORD_RESET_SECRET;

  if (!supabaseUrl || !serviceRoleKey || !resetSecret) {
    console.error('[TriSakay Password Reset] Missing server configuration.');
    return sendJson(res, 503, { success: false, message: 'Password reset is temporarily unavailable.' });
  }

  let body: Record<string, unknown> = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  } catch {
    return sendJson(res, 400, { success: false, message: 'Invalid request body.' });
  }
  const action = String(body.action || '');
  const mobile = normalizeMobile(body.mobile);

  if (!mobile) {
    return sendJson(res, 400, { success: false, message: 'Enter a valid 11-digit Philippine mobile number.' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  if (action === 'request') {
    if (!semaphoreApiKey) {
      console.error('[TriSakay Password Reset] SEMAPHORE_API_KEY is not configured.');
      return sendJson(res, 503, { success: false, message: 'SMS verification is temporarily unavailable.' });
    }

    const now = Date.now();
    const hourAgo = new Date(now - 60 * 60 * 1000).toISOString();
    const ipHash = hashValue(getClientIp(req), resetSecret);

    const [{ count: mobileRequests }, { count: ipRequests }, { data: latest }] = await Promise.all([
      supabase.from('password_reset_challenges').select('*', { count: 'exact', head: true }).eq('mobile', mobile).gte('created_at', hourAgo),
      supabase.from('password_reset_challenges').select('*', { count: 'exact', head: true }).eq('request_ip_hash', ipHash).gte('created_at', hourAgo),
      supabase.from('password_reset_challenges').select('created_at').eq('mobile', mobile).order('created_at', { ascending: false }).limit(1).maybeSingle()
    ]);

    const tooSoon = latest?.created_at && now - new Date(latest.created_at).getTime() < RESEND_DELAY_MS;
    if (tooSoon || (mobileRequests || 0) >= MAX_REQUESTS_PER_HOUR || (ipRequests || 0) >= MAX_REQUESTS_PER_HOUR * 3) {
      return sendJson(res, 200, {
        success: true,
        message: 'If the number can receive TriSakay messages, a verification code will arrive shortly.'
      });
    }

    const code = String(randomInt(100000, 1000000));
    const expiresAt = new Date(now + OTP_TTL_MS).toISOString();
    const { data: challenge, error: insertError } = await supabase
      .from('password_reset_challenges')
      .insert({
        mobile,
        code_hash: hashValue(`${mobile}:${code}`, resetSecret),
        request_ip_hash: ipHash,
        expires_at: expiresAt
      })
      .select('id')
      .single();

    if (insertError || !challenge) {
      console.error('[TriSakay Password Reset] Could not create challenge:', insertError);
      return sendJson(res, 503, { success: false, message: 'Password reset is temporarily unavailable.' });
    }

    const params = new URLSearchParams({
      apikey: semaphoreApiKey,
      number: mobile,
      message: '[TriSakay] Your password reset code is {otp}. It expires in 5 minutes. Do not share this code.',
      code
    });
    const smsResponse = await fetch('https://api.semaphore.co/api/v4/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    if (!smsResponse.ok) {
      console.error('[TriSakay Password Reset] Semaphore rejected OTP:', smsResponse.status, await smsResponse.text());
      await supabase.from('password_reset_challenges').update({ used_at: new Date().toISOString() }).eq('id', challenge.id);
    }

    return sendJson(res, 200, {
      success: true,
      message: 'If the number can receive TriSakay messages, a verification code will arrive shortly.'
    });
  }

  if (action === 'verify') {
    const code = String(body.code || '').trim();
    if (!/^\d{6}$/.test(code)) {
      return sendJson(res, 400, { success: false, message: 'Enter the six-digit verification code.' });
    }

    const { data: challenge } = await supabase
      .from('password_reset_challenges')
      .select('id, code_hash, expires_at, attempts, used_at')
      .eq('mobile', mobile)
      .is('verified_at', null)
      .is('used_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!challenge || new Date(challenge.expires_at).getTime() < Date.now() || challenge.attempts >= MAX_VERIFY_ATTEMPTS) {
      return sendJson(res, 400, { success: false, message: 'The code is invalid or expired. Request a new code.' });
    }

    const attempts = challenge.attempts + 1;
    await supabase.from('password_reset_challenges').update({ attempts }).eq('id', challenge.id);
    const suppliedHash = hashValue(`${mobile}:${code}`, resetSecret);
    if (!safeEqual(challenge.code_hash, suppliedHash)) {
      return sendJson(res, 400, { success: false, message: 'The code is invalid or expired. Request a new code.' });
    }

    const resetToken = randomBytes(32).toString('base64url');
    const { error: verifyError } = await supabase
      .from('password_reset_challenges')
      .update({
        verified_at: new Date().toISOString(),
        reset_token_hash: hashValue(`${mobile}:${resetToken}`, resetSecret),
        reset_token_expires_at: new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString()
      })
      .eq('id', challenge.id)
      .is('used_at', null);

    if (verifyError) {
      return sendJson(res, 503, { success: false, message: 'Verification is temporarily unavailable.' });
    }
    return sendJson(res, 200, { success: true, resetToken });
  }

  if (action === 'complete') {
    const resetToken = String(body.resetToken || '');
    if (resetToken.length < 32) {
      return sendJson(res, 400, { success: false, message: 'Your reset session is invalid. Request a new code.' });
    }

    const { data: challenge } = await supabase
      .from('password_reset_challenges')
      .select('id, reset_token_hash, reset_token_expires_at, verified_at, used_at')
      .eq('mobile', mobile)
      .not('verified_at', 'is', null)
      .is('used_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const suppliedHash = hashValue(`${mobile}:${resetToken}`, resetSecret);
    if (
      !challenge?.reset_token_hash ||
      !challenge.reset_token_expires_at ||
      new Date(challenge.reset_token_expires_at).getTime() < Date.now() ||
      !safeEqual(challenge.reset_token_hash, suppliedHash)
    ) {
      return sendJson(res, 400, { success: false, message: 'Your reset session is invalid or expired. Request a new code.' });
    }

    const { data: consumed, error: consumeError } = await supabase
      .from('password_reset_challenges')
      .update({ used_at: new Date().toISOString() })
      .eq('id', challenge.id)
      .is('used_at', null)
      .select('id')
      .single();

    if (consumeError || !consumed) {
      return sendJson(res, 400, { success: false, message: 'This reset session has already been used.' });
    }

    if (semaphoreApiKey) {
      const params = new URLSearchParams({
        apikey: semaphoreApiKey,
        number: mobile,
        message: '[TriSakay] Your Password/PIN was changed successfully. If this was not you, contact the TriSakay administrator immediately.'
      });
      fetch('https://api.semaphore.co/api/v4/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      }).catch(error => console.error('[TriSakay Password Reset] Confirmation SMS failed:', error));
    }
    return sendJson(res, 200, { success: true });
  }

  return sendJson(res, 400, { success: false, message: 'Invalid password reset action.' });
}
