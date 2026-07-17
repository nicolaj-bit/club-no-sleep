import { Capacitor } from '@capacitor/core';
import { base44 } from '@/api/base44Client';

const ONESIGNAL_APP_ID = '71bec506-d231-47da-aa17-f8790b335a32';

let _initialized = false;

// OneSignal kræver en native Capacitor-bridge (APN-registrering sker via
// OneSignal's iOS SDK). Spring over på web/WebView uden bridge.
async function ensureInitialized() {
  if (_initialized || !Capacitor.isNativePlatform()) return;
  // KRITISK FIX — MÅ IKKE RULLES TILBAGE: plugin bruger DEFAULT export
const mod = await import('@onesignal/capacitor-plugin'); const OneSignal = mod.default ?? mod.OneSignal;
  OneSignal.initialize(ONESIGNAL_APP_ID);
  _initialized = true;
}

export async function requestPushPermission() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await ensureInitialized();
    // KRITISK FIX — MÅ IKKE RULLES TILBAGE: plugin bruger DEFAULT export
const mod = await import('@onesignal/capacitor-plugin'); const OneSignal = mod.default ?? mod.OneSignal;
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