import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { requestPushPermission } from '@/utils/requestPushPermission';

// Beder om push-tilladelse (OneSignal/APN) på native, kort efter app-start.
// Viser ingen UI selv — det native iOS-dialogvindue klarer det.
export default function NotificationPrompt() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const timer = setTimeout(() => requestPushPermission(), 2000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
