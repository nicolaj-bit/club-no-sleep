import { Capacitor } from '@capacitor/core';
import { ensureOneSignalInitialized } from '@/utils/requestPushPermission';

/**
 * Returns the actual OS-level notification permission status.
 * Only meaningful on native platforms. Never throws.
 * @returns {Promise<'granted' | 'denied' | 'not_determined' | 'unknown'>}
 */
export async function getPermissionStatus() {
  if (!Capacitor.isNativePlatform()) return 'unknown';
  try {
    const ok = await ensureOneSignalInitialized();
    if (!ok) return 'unknown';
    const mod = await import('@onesignal/capacitor-plugin');
    const OneSignal = mod.default ?? mod.OneSignal;
    const granted = OneSignal.Notifications.permission;
    if (granted) return 'granted';
    const canRequest = await OneSignal.Notifications.canRequestPermission();
    return canRequest ? 'not_determined' : 'denied';
  } catch {
    return 'unknown';
  }
}

/**
 * Opens the device's app settings screen (for when permission was previously denied
 * and the system no longer allows re-prompting).
 */
export async function openAppSettings() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { App } = await import('@capacitor/app');
    await App.openSettings();
  } catch {
    // non-blocking
  }
}