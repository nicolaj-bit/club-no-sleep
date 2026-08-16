import { Capacitor } from '@capacitor/core';
import { base44 } from '@/api/base44Client';
import { showInAppLogin } from '@/lib/showInAppLogin';

/**
 * Platform-bevidst log ud.
 *
 * ANDROID (KUN her er adfærden ændret):
 *   Logger ud UDEN at lave en fuld-side-redirect til en ekstern URL — det åbner
 *   ellers systembrowseren på Android. I stedet ryddes den lokale session/token,
 *   og der navigeres internt (same-origin) til appens egen in-app login-skærm,
 *   så man bliver i appen.
 *
 * iOS & WEB (urørt — 100 % som før):
 *   Kalder base44.auth.logout(redirectUrl) præcis som den eksisterende kode,
 *   så iOS- og web-log ud-stien er uændret.
 *
 * Bemærk: kaldes asynkront forsymmetrisk med OneSignal.logout() i kaldersiden.
 */
export async function inAppLogout(redirectUrl) {
  if (Capacitor.getPlatform() === 'android') {
    // Ryd lokal session/token — spejler base44 SDK's logout(), men UDEN den
    // eksterne window.location.href-redirect der åbner systembrowseren.
    try {
      localStorage.removeItem('base44_access_token');
      localStorage.removeItem('token');
    } catch (e) {
      console.warn('[inAppLogout] Kunne ikke rydde token:', e);
    }
    // Intern, same-origin navigation → bliver i WebView. Genindlæser appen,
    // NativeAuthGate ser ingen token og viser den indbyggede login-skærm.
    showInAppLogin();
    return;
  }

  // iOS / web — uændret eksisterende adfærd
  base44.auth.logout(redirectUrl);
}