import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

async function clearBadgeAndNotifications() {
  try {
    const mod = await import('@onesignal/capacitor-plugin');
    const OneSignal = mod.default ?? mod.OneSignal;
    await OneSignal.Notifications.clearAll();
  } catch (e) {
    // Silent — not critical if it fails
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