import { Capacitor } from '@capacitor/core';
import { base44 } from '@/api/base44Client';

/**
 * Åbner login-siden korrekt i begge miljøer:
 * - Native iOS/Android: bruger @capacitor/browser (SFSafariViewController)
 *   så "Sign in with Apple" virker korrekt.
 * - Web: bruger normal redirect via base44.auth.redirectToLogin()
 */
export async function redirectToLogin(nextUrl) {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    try {
      const { Browser } = await import('@capacitor/browser');
      // Byg login-URL manuelt — samme som base44 SDK ville bruge
      const { appParams } = await import('@/lib/app-params');
      const appBaseUrl = appParams.appBaseUrl || '';
      const redirectBack = nextUrl || window.location.href;
      const loginUrl = `${appBaseUrl}/auth/login?next=${encodeURIComponent(redirectBack)}`;
      await Browser.open({ url: loginUrl, presentationStyle: 'popover' });
      return;
    } catch (e) {
      console.warn('[nativeAuth] Capacitor Browser not available, falling back:', e.message);
    }
  }

  // Web fallback
  base44.auth.redirectToLogin(nextUrl || '/app');
}

/**
 * Deep link scheme — skal konfigureres i Capacitor (iOS Info.plist + Android intent-filter)
 */
export const APP_DEEP_LINK_SCHEME = 'clubnosleep';

/**
 * Bygger en deep link URL til at sende brugeren tilbage til appen med token
 */
export function buildAppDeepLink(params = {}) {
  const searchParams = new URLSearchParams(params);
  return `${APP_DEEP_LINK_SCHEME}://auth?${searchParams.toString()}`;
}

/**
 * Åbner web-appen i systembrowseren for login/oprettelse.
 * På native: bruger @capacitor/browser (SFSafariViewController / Chrome Custom Tab)
 * På web: almindelig redirect
 */
export async function redirectToWebAuth(action = 'login') {
  const isNative = Capacitor.isNativePlatform();

  const { appParams } = await import('@/lib/app-params');
  const appBaseUrl = appParams.appBaseUrl || '';
  const url = `${appBaseUrl}/AuthNative?action=${action}`;

  if (isNative) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url, presentationStyle: 'popover' });
      return;
    } catch (e) {
      console.warn('[nativeAuth] Browser not available, falling back:', e.message);
    }
  }

  // Web fallback
  window.location.href = url;
}