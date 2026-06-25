import { Browser } from '@capacitor/browser';
import { isNativeApp } from '@/lib/platform';

// Keep a reference to the real window.open before any monkey-patch is
// installed, so openInNewTab doesn't recurse through the patched version.
const nativeWindowOpen = window.open.bind(window);

/**
 * Opens an external URL:
 *  - Native (iOS/Android): in-app browser via the Capacitor Browser plugin
 *    (SFSafariViewController / Chrome Custom Tabs) with a built-in Done
 *    button — the app session is preserved and the page loads natively
 *    (no framing restrictions, so Shopify etc. work).
 *  - Web/PWA: a new browser tab so the app stays open in its own tab.
 *
 * http:// links are upgraded to https://. mailto/tel schemes pass through.
 */
export async function openExternalUrl(url) {
  if (!url) return;

  // Enforce HTTPS — upgrade any http:// link to https://
  let safeUrl = url;
  if (/^http:\/\//i.test(safeUrl)) {
    safeUrl = 'https://' + safeUrl.slice(7);
  }

  // Non-http(s) schemes (mailto, tel, sms) — let the OS handle natively
  if (!/^https:\/\//i.test(safeUrl)) {
    window.location.href = safeUrl;
    return;
  }

  // Native: use the Capacitor Browser plugin — true in-app browser
  // (SFSafariViewController / Chrome Custom Tabs) with a Done button.
  // isNativeApp() is robust against WebView wrappers where
  // Capacitor.isNativePlatform() alone may return false.
  if (isNativeApp()) {
    try {
      await Browser.open({
        url: safeUrl,
        presentationStyle: 'fullscreen',
        toolbarColor: '#5B3F2B',
      });
      return;
    } catch (err) {
      console.warn('Capacitor Browser plugin unavailable, opening in new tab:', err);
    }
  }

  // Web / PWA (and native fallback): open in a real new browser tab so the
  // app stays open. (An in-app iframe can't load sites that block framing —
  // Shopify, App Store, etc.)
  openInNewTab(safeUrl);
}

/** Opens a URL in a real new browser tab, keeping the app open. */
export function openInNewTab(url) {
  if (!url) return;
  let safeUrl = url;
  if (/^http:\/\//i.test(safeUrl)) safeUrl = 'https://' + safeUrl.slice(7);
  nativeWindowOpen(safeUrl, '_blank');
}

/** Returns true if the given URL is an external http(s) link. */
export function isExternalUrl(url) {
  if (!url) return false;
  return /^https?:\/\//i.test(url);
}