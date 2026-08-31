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
 * Sends SMS via Semaphore API or triggers realistic SMS visual preview when offline/testing.
 */
export async function sendSMS({ toMobile, message, recipientName }: SMSPayload): Promise<boolean> {
  console.log(`[TriSakay SMS] Dispatching SMS to ${recipientName} (${toMobile}): "${message}"`);

  // Dispatch custom window event so UI shows realistic "SMS Received" notification banner on mobile screen
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('trisakay_sms_sent', {
      detail: { toMobile, message, recipientName, timestamp: new Date().toLocaleTimeString() }
    }));
  }

  if (!isSMSConfigured) {
    console.info('TriSakay Info: SMS simulated. Add VITE_SEMAPHORE_API_KEY to send real cellular SMS text messages to Globe/Smart/DITO numbers.');
    return true;
  }

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
    console.log('[TriSakay SMS] Semaphore API Response:', result);
    return response.ok;
  } catch (err) {
    console.error('[TriSakay SMS] Error sending SMS:', err);
    return false;
  }
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
