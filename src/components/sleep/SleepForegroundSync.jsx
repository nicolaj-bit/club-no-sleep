import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { useQueryClient } from '@tanstack/react-query';
import { useInviteAccess } from '@/components/auth/InviteAccessContext';
import { syncSleepNotification } from '@/lib/sleepNotifications';
import { isNativeApp } from '@/lib/platform';

const REFRESH_COOLDOWN_MS = 2500;

// Ét centralt sted (renderet i Layout) der lytter på appStateChange (native).
// Når appen kommer frem fra baggrunden opdateres søvnlog-data overalt
// (søvnlog-siden, forsidekortet, historikken) via React Query-invalidering,
// og Live Activity synkroniseres med den aktive session.
// Henter kun hvis der er en igangværende session i cachen, og beskytter mod
// dobbelt-kald hvis hændelsen fyrer to gange.
export default function SleepForegroundSync() {
  const queryClient = useQueryClient();
  const { isInvited, refresh: refreshInviteData } = useInviteAccess();
  const lastRunRef = useRef(0);

  useEffect(() => {
    if (!isNativeApp()) return;
    let listenerHandle;

    const handleActive = async () => {
      const now = Date.now();
      if (now - lastRunRef.current < REFRESH_COOLDOWN_MS) return;
      lastRunRef.current = now;

      // Find sleeplogs-queries i cachen — hent kun hvis der er en aktiv session
      const cached = queryClient.getQueriesData({ queryKey: ['sleeplogs'] });
      const hasActive = cached.some(([, data]) => {
        const s = data?.active_session;
        return s && s.session_status !== 'completed';
      });
      if (!hasActive) return;

      // Refetch alle sleeplogs-queries → opdaterer alle komponenter
      await queryClient.invalidateQueries({ queryKey: ['sleeplogs'] });

      // Læs frisk cache og synkronisér Live Activity så låseskærm og app matcher
      const fresh = queryClient.getQueriesData({ queryKey: ['sleeplogs'] });
      let activeSession = null;
      for (const [, data] of fresh) {
        const s = data?.active_session;
        if (s && s.session_status !== 'completed') {
          activeSession = s;
          break;
        }
      }
      if (activeSession) {
        try {
          await syncSleepNotification(activeSession);
        } catch (e) {
          console.warn('[SLEEPLOG-FOREGROUND] syncSleepNotification failed:', e?.message || e);
        }
      }

      if (isInvited) {
        try { await refreshInviteData(); } catch {}
      }
    };

    (async () => {
      try {
        listenerHandle = await App.addListener('appStateChange', ({ isActive }) => {
          if (isActive) handleActive();
        });
      } catch (e) {
        console.warn('[SLEEPLOG-FOREGROUND] appStateChange listener failed:', e?.message || e);
      }
    })();

    return () => {
      try { listenerHandle?.remove(); } catch {}
    };
  }, [queryClient, isInvited, refreshInviteData]);

  return null;
}