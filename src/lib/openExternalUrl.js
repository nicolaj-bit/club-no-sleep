import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

/**
 * Opens an external URL in an in-app browser on native platforms
 * (SFSafariViewController on iOS, Chrome Custom Tabs on Android) or in a
 * new browser tab on web/PWA. The app session and login are preserved —
 * the in-app browser has a native close/Done button that returns the user
 * to the app.
 *
 * @param {string} url - The URL to open (http/https; mailto/tel pass through).
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

  try {
    if (Capacitor.isNativePlatform()) {
      // Native: SFSafariViewController (iOS) / Chrome Custom Tabs (Android)
      // — has a built-in close/Done button, preserves the app session.
      await Browser.open({
        url: safeUrl,
        presentationStyle: 'fullscreen',
        toolbarColor: '#5B3F2B',
      });
      return;
    }
  } catch (err) {
    console.warn('In-app browser unavailable, falling back to new tab:', err);
  }

  // Web / PWA — open in a new tab (normal web behaviour; close tab to return)
  window.open(safeUrl, '_blank', 'noopener,noreferrer');
}

/** Returns true if the given URL is an external http(s) link. */
export function isExternalUrl(url) {
  if (!url) return false;
  return /^https?:\/\//i.test(url);
}