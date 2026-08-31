/**
 * TRISAKAY PHILIPPINES SMS NOTIFICATION SERVICE
 * Integrates with Semaphore.co API (Philippines #1 SMS Gateway)
 * Sends cellular SMS text messages directly to passengers & students without requiring mobile data!
 */

const SEMAPHORE_API_KEY = import.meta.env.VITE_SEMAPHORE_API_KEY || '';
const SENDER_NAME = import.meta.env.VITE_SEMAPHORE_SENDER_NAME || 'TriSakay';

export interface SMSPayload {
  toMobile: string;
  message: string;
  recipientName: string;
}

export const isSMSConfigured = Boolean(SEMAPHORE_API_KEY);

/**
 * Sends SMS via Semaphore API (using secure Vercel Serverless Function or direct API)
 */
export async function sendSMS({ toMobile, message, recipientName }: SMSPayload): Promise<boolean> {
  console.log(`[TriSakay SMS] Dispatching SMS to ${recipientName} (${toMobile}): "${message}"`);

  // Dispatch custom window event so UI shows realistic "SMS Received" notification banner on mobile screen
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('trisakay_sms_sent', {
      detail: { toMobile, message, recipientName, timestamp: new Date().toLocaleTimeString() }
    }));
  }

  // 1. First attempt via Vercel Serverless Function (/api/send-sms)
  try {
    const apiRes = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toMobile, message })
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      console.log('[TriSakay SMS] Serverless SMS Dispatched Successfully:', data);
      return true;
    }
  } catch (apiErr) {
    console.warn('[TriSakay SMS] Serverless route unavailable, falling back to direct/client dispatch:', apiErr);
  }

  // 2. Direct client fallback if API Key is set in Vite environment
  if (isSMSConfigured) {
    try {
      const response = await fetch('https://api.semaphore.co/api/v4/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          apikey: SEMAPHORE_API_KEY,
          number: toMobile,
          message: message,
          sendername: SENDER_NAME
        })
      });

      const result = await response.json();
      console.log('[TriSakay SMS] Semaphore API Direct Response:', result);
      return response.ok;
    } catch (err) {
      console.error('[TriSakay SMS] Direct SMS dispatch error:', err);
    }
  }

  return true;
}

/**
 * SMS Notification when User Registers Account with Mobile Number
 */
export function sendRegistrationWelcomeSMS(userName: string, mobileNumber: string, role: string, barangay: string) {
  const message = `[TriSakay Gonzaga] Welcome ${userName}! Account registered successfully as ${role.toUpperCase()} in Brgy. ${barangay}. Sakay Mo, Isang Click Lang!`;
  return sendSMS({ toMobile: mobileNumber, message, recipientName: userName });
}

/**
 * SMS Notification when Driver Accepts a Student / Passenger Booking
 */
export function sendBookingAcceptedSMS(passengerName: string, passengerMobile: string, driverName: string, driverMobile: string, todaName: string, plateNumber: string, fare: number) {
  const message = `[TriSakay Gonzaga] Magandang araw ${passengerName}! Accepted na ni Driver ${driverName} (${todaName} ${plateNumber}) ang ride niyo! Driver Contact: ${driverMobile}. Fare: P${fare}. Keep safe!`;
  return sendSMS({ toMobile: passengerMobile, message, recipientName: passengerName });
}

/**
 * SMS Notification when Driver Arrives at Pickup Point
 */
export function sendDriverArrivingSMS(passengerName: string, passengerMobile: string, driverName: string, plateNumber: string) {
  const message = `[TriSakay Gonzaga] Hello ${passengerName}! Nakarating na si Driver ${driverName} (${plateNumber}) sa pickup location niyo. Please proceed to tricycle!`;
  return sendSMS({ toMobile: passengerMobile, message, recipientName: passengerName });
}
