import { Capacitor } from '@capacitor/core';

/**
 * Robust native app detection — virker på iPhone, iPad og Android.
 * Capacitor.isNativePlatform() alene kan returnere false i visse WebView-konfigurationer,
 * så vi har UA-baserede fallbacks.
 */
export function isNativeApp() {
  // A native app WebView is always the top-level browsing context — never
  // inside an iframe. The Base44 preview runs in an iframe, so treat that as
  // non-native (also avoids false positives on iOS Safari where window.safari
  // is undefined inside a cross-origin iframe).
  try {
    if (window.self !== window.top) return false;
  } catch { return false; }

  try {
    if (Capacitor.isNativePlatform()) return true;
  } catch {}

  const ua = navigator.userAgent || '';

  // Android WebView
  if (/; wv\)/.test(ua) || /; wv;/.test(ua)) return true;

  // iOS WKWebView (native app) — inkluderer iPad.
  // window.safari findes kun i rigtig Safari, ikke i WKWebView.
  // Udelad Chrome (CriOS) og Firefox (FxiOS) som også bruger WKWebView.
  if (/iPhone|iPad|iPod/.test(ua) && !/CriOS/.test(ua) && !/FxiOS/.test(ua) && typeof window.safari === 'undefined') return true;

  // iPadOS 13+ med "Request Desktop Site" rapporterer Macintosh i UA,
  // men i et Capacitor WKWebView er window.safari undefined.
  if (/Macintosh/.test(ua) && typeof window.safari === 'undefined' && 'ontouchend' in document) return true;

  // iOS PWA / Add to Home Screen
  if (window.navigator.standalone === true) return true;

  return false;
}

/**
 * Detekterer native iOS/iPadOS app (både iPhone og iPad).
 * Bruger Capacitor.getPlatform() når tilgængelig, ellers UA fallback.
 */
export function isNativeIOS() {
  if (!isNativeApp()) return false;
  try {
    const platform = Capacitor.getPlatform();
    if (platform === 'ios') return true;
  } catch {}
  const ua = navigator.userAgent || '';
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && typeof window.safari === 'undefined' && 'ontouchend' in document);
}

/**
 * Detekterer native Android app.
 */
export function isNativeAndroid() {
  if (!isNativeApp()) return false;
  try {
    const platform = Capacitor.getPlatform();
    if (platform === 'android') return true;
  } catch {}
  const ua = navigator.userAgent || '';
  return /Android/.test(ua);
}