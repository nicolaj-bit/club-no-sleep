import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  ensureActionTypesRegistered,
  registerSleepNotificationActions,
  syncSleepNotification,
  clearSleepNotification,
} from '@/lib/sleepNotifications';
import { isNativeApp } from '@/lib/platform';

// Mounts once inside AuthProvider and persists across route changes.
// Handles: action type registration, action listener, and app-open/foreground sync.
export default function SleepNotificationManager() {
  useEffect(() => {
    if (!isNativeApp()) return;

    let mounted = true;

    const init = async () => {
      await ensureActionTypesRegistered();
      await registerSleepNotificationActions();
    };
    init();

    const sync = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          await clearSleepNotification();
          return;
        }
        const res = await base44.functions.invoke('getSleepLogs', {});
        const data = res?.data || res;
        if (!mounted) return;
        await syncSleepNotification(data?.active_session || null);
      } catch (e) {
        console.error('[SLEEPLOG-NOTIF] sync failed:', e?.message || e);
      }
    };
    sync();

    const handleVisible = () => {
      if (document.visibilityState === 'visible') sync();
    };
    document.addEventListener('visibilitychange', handleVisible);

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, []);

  return null;
}