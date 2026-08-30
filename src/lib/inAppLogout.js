import { base44 } from '@/api/base44Client';
import { isNativeAndroid, isNativeApp } from '@/lib/platform';
import { Preferences } from '@capacitor/preferences';

/**
 * Platform-bevidst log ud.
 *
 * ANDROID (inkl. test-app hvor Capacitor-broen ikke detekteres):
 *   Logger ud UDEN at kalde base44.auth.logout(), som ellers sætter
 *   window.location.href til en ekstern auth-URL og udløser Androids
 *   "open external link?"-prompt. I stedet ryddes den lokale session/token,
 *   og den nuværende side genindlæses (same-origin — ingen ekstern navigation).
 *   NativeAuthGate ser ingen token og viser appens indbyggede login-skærm.
 *
 * iOS & WEB (urørt — 100 % som før):
 *   Kalder base44.auth.logout(redirectUrl) præcis som den eksisterende kode.
 *
 * Detektering bruger isNativeAndroid() (Capacitor + UA-fallback), så også
 * Android-WebView'er hvor broen ikke er injiceret (fx test-app) fanges.
 */
export async function inAppLogout(redirectUrl) {
  // Fjern native action token fra Preferences (kun native)
  if (isNativeApp()) {
    try {
      await Preferences.remove({ key: 'cns_native_token' });
    } catch (e) {
      console.warn('[inAppLogout] Could not remove native token:', e);
    }
  }

  if (isNativeAndroid()) {
    try {
      localStorage.removeItem('base44_access_token');
      localStorage.removeItem('token');
      localStorage.removeItem('demo_mode');
    } catch (e) {
      console.warn('[inAppLogout] Kunne ikke rydde token:', e);
    }
    // Same-origin genindlæsning — ingen ekstern URL, ingen prompt.
    window.location.reload();
    return;
  }

  // iOS / web — uændret eksisterende adfærd
  base44.auth.logout(redirectUrl);
}