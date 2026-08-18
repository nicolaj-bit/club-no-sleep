import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { ensureOneSignalInitialized, isOneSignalInitialized } from '@/utils/requestPushPermission';

async function clearBadgeAndNotifications() {
  try {
    // OneSignal SKAL være initialiseret før clearAll kaldes — ellers kaster
    // 'Must call initWithContext before use' på Android og crasher appen.
    const ok = await ensureOneSignalInitialized();
    if (!ok || !isOneSignalInitialized()) return;

    const mod = await import('@onesignal/capacitor-plugin');
    const OneSignal = mod.default ?? mod.OneSignal;
    await OneSignal.Notifications.clearAll();
  } catch (e) {
    // Silent — ikke kritisk hvis det fejler. Må ALDRIG crashe appen.
    console.error('[OneSignal] clearAll failed (non-blocking):', e?.message || e);
  }
}

export default function BadgeClearer() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Clear on launch
    clearBadgeAndNotifications();

    // Clear when app comes to foreground
    let appStateListener;
    (async () => {
      const { App } = await import('@capacitor/app');
      appStateListener = await App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) clearBadgeAndNotifications();
      });
    })();

    return () => {
      appStateListener?.remove();
    };
  }, []);

  return null;
}