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
    const { appParams } = await import('@/lib/app-params');
    const webAppUrl = getWebAppUrl(appParams);
    const redirectBack = nextUrl || `${webAppUrl}/app`;
    const loginUrl = `${webAppUrl}/auth/login?next=${encodeURIComponent(redirectBack)}`;

    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: loginUrl, presentationStyle: 'popover' });
      return;
    } catch (e) {
      console.warn('[nativeAuth] Capacitor Browser not available, falling back:', e.message);
    }
  }

  // Web — brug Base44's indbyggede login redirect
  await base44.auth.redirectToLogin(nextUrl || '/app');
}

/**
 * Returnerer den publicerede web-URL for appen.
 * Bruger appBaseUrl hvis sat (via VITE_BASE44_APP_BASE_URL),
 * ellers konstrueres URL fra appId: https://app.base44.com/apps/{appId}
 */
function getWebAppUrl(appParams) {
  if (appParams.appBaseUrl) return appParams.appBaseUrl.replace(/\/$/, '');
  return `https://app.base44.com/apps/${appParams.appId}`;
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
 * Åbner en ekstern URL i systembrowseren på native (SFSafariViewController / Chrome Custom Tab).
 * På web: almindelig window.location.href.
 * Brug dette til Stripe checkout URLs og andre eksterne betalingssider.
 */
export async function openExternalUrl(url) {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url, presentationStyle: 'popover' });
      return;
    } catch (e) {
      console.warn('[nativeAuth] Browser not available, falling back:', e.message);
    }
  }

  window.location.href = url;
}

/**
 * Redirect til betaling — åbner Stripe checkout i systembrowseren.
 * Bruger Stripe Payment Link (absolut URL) så det altid virker,
 * også på native hvor appBaseUrl ikke er tilgængelig.
 */
export async function redirectToWebSubscription(accessToken) {
  // Stripe Payment Link — håndterer hele betalingsflowet
  const stripeCheckoutUrl = 'https://buy.stripe.com/00wdR9eRue256hG11J3cc00';
  await openExternalUrl(stripeCheckoutUrl);
}