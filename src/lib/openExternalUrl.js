import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

// Keep a reference to the real window.open before any monkey-patch is
// installed, so openInNewTab doesn't recurse through the patched version.
const nativeWindowOpen = window.open.bind(window);

/**
 * Opens an external URL in an in-app browser:
 *  - Native (iOS/Android): SFSafariViewController / Chrome Custom Tabs via
 *    the Capacitor Browser plugin (built-in close/Done button, app session
 *    preserved, login kept).
 *  - Web/PWA: an in-app browser overlay (iframe) with a close button, so the
 *    user stays inside the app and can return. A fallback "open in browser"
 *    button is shown for sites that block being framed.
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

  // Native: use the Capacitor Browser plugin (best experience)
  if (Capacitor.isNativePlatform()) {
    try {
      await Browser.open({
        url: safeUrl,
        presentationStyle: 'fullscreen',
        toolbarColor: '#5B3F2B',
      });
      return;
    } catch (err) {
      console.warn('Capacitor Browser plugin unavailable, using overlay:', err);
    }
  }

  // Web / PWA (and native fallback): open in a real new browser tab.
  // (An in-app iframe overlay can't load sites that block framing —
  // Shopify, App Store, etc. — so a new tab is the reliable option.)
  openInNewTab(safeUrl);
}

/** Opens a URL in a real new browser tab, bypassing the in-app overlay. */
export function openInNewTab(url) {
  if (!url) return;
  let safeUrl = url;
  if (/^http:\/\//i.test(safeUrl)) safeUrl = 'https://' + safeUrl.slice(7);
  nativeWindowOpen(safeUrl, '_blank', 'noopener,noreferrer');
}

/** Returns true if the given URL is an external http(s) link. */
export function isExternalUrl(url) {
  if (!url) return false;
  return /^https?:\/\//i.test(url);
}