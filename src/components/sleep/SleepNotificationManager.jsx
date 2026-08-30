import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Preferences } from '@capacitor/preferences';
import {
  ensureActionTypesRegistered,
  registerSleepNotificationActions,
  syncSleepNotification,
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

    // Hent og gem native action token efter login (kun native)
    const ensureToken = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) return;
        const res = await base44.functions.invoke('ensureNativeActionToken', {});
        const data = res?.data || res;
        if (data?.token) {
          await Preferences.set({ key: 'cns_native_token', value: data.token });
          console.log('[SLEEPLOG-NOTIF] native action token stored');
        }
      } catch (e) {
        console.error('[SLEEPLOG-NOTIF] could not store native action token:', e?.message || e);
      }
    };
    ensureToken();

    const sync = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) return;
        const res = await base44.functions.invoke('getSleepLogs', {});
        const data = res?.data || res;
        if (!mounted) return;
        const activeSession = data?.active_session;
        if (activeSession && activeSession.session_status !== 'completed') {
          await syncSleepNotification(activeSession);
        }
      } catch (e) {
        console.error('[SLEEPLOG-NOTIF] sync failed:', e?.message || e);
      }
    };
    sync();

    // Forgrunds-håndtering (data + Live Activity) er samlet i SleepForegroundSync
    // via appStateChange — her sættes kun Live Activity op ved app-start.

    return () => {
      mounted = false;
    };
  }, []);

  return null;
}