import { Capacitor } from '@capacitor/core';
import { base44 } from '@/api/base44Client';

const ONESIGNAL_APP_ID = '71bec506-d231-47da-aa17-f8790b335a32';

let _initialized = false;
let _initializing = false;

// OneSignal kræver en native Capacitor-bridge. Spring over på web/WebView.
// Fejlsikker: hvis initialize fejler, logges det stille og appen fortsætter
// uden push — den kaster ALDRIG.
export async function ensureOneSignalInitialized() {
  if (!Capacitor.isNativePlatform()) return false;
  if (_initialized) return true;
  if (_initializing) return false;
  _initializing = true;
  try {
    const mod = await import('@onesignal/capacitor-plugin');
    const OneSignal = mod.default ?? mod.OneSignal;
    await OneSignal.initialize(ONESIGNAL_APP_ID);
    _initialized = true;
    return true;
  } catch (err) {
    // Initialiseringsfejl må ALDRIG crashe appen — fortsæt uden push
    console.error('[OneSignal] initialize failed (non-blocking):', err?.message || err);
    return false;
  } finally {
    _initializing = false;
  }
}

export function isOneSignalInitialized() {
  return _initialized;
}

export async function requestPushPermission() {
  if (!Capacitor.isNativePlatform()) return;

  const ok = await ensureOneSignalInitialized();
  if (!ok) return;

  try {
    const mod = await import('@onesignal/capacitor-plugin');
    const OneSignal = mod.default ?? mod.OneSignal;
    await OneSignal.Notifications.requestPermission(true);

    try {
      const user = await base44.auth.me();
      if (user?.email) {
        // Backend functions target pushes via external_id = email, so the
        // client must log in with the same identifier for them to match.
        OneSignal.login(user.email);
      }
    } catch (_) {
      // Ikke logget ind — fortsæt som anonym subscriber
    }
  } catch (err) {
    console.error('[OneSignal] requestPushPermission error:', err);
  }
}