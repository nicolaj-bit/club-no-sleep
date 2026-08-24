import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Moon } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useInviteAccess } from '@/components/auth/InviteAccessContext';
import { computeSessionTotals } from '../../../base44/shared/sleepSession';

export default function SleepSummaryCard({ userEmail }) {
  const { t, lang } = useLanguage();
  const { isInvited, inviterSleepLogs } = useInviteAccess();
  const [log, setLog] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isInvited) {
      if (!Array.isArray(inviterSleepLogs) || inviterSleepLogs.length === 0) {
        setLog(null);
        setActiveSession(null);
        setLoading(false);
        return;
      }
      const today = format(new Date(), 'yyyy-MM-dd');
      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      const active = inviterSleepLogs.find(l => l.session_status === 'active_sleep' || l.session_status === 'active_awake');
      const recent = inviterSleepLogs.find(l =>
        (l.date === today || l.date === yesterday) && l.session_status === 'completed'
      );
      setActiveSession(active || null);
      setLog(recent || null);
      setLoading(false);
      return;
    }

    if (!userEmail) return;
    let cancelled = false;
    import('@/api/base44Client').then(({ base44 }) => {
      base44.functions.invoke('getSleepLogs', {}).then(res => {
        if (cancelled) return;
        const data = res?.data || res;
        const today = format(new Date(), 'yyyy-MM-dd');
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
        const logs = data?.sleep_logs || [];
        const recent = logs.find(l =>
          (l.date === today || l.date === yesterday) && l.session_status === 'completed'
        );
        setLog(recent || null);
        setActiveSession(data?.active_session || null);
        setLoading(false);
      }).catch(() => {
        if (cancelled) return;
        setLog(null);
        setLoading(false);
      });
    });
    return () => { cancelled = true; };
  }, [userEmail, isInvited, inviterSleepLogs]);

  let durMs = null;
  let wakeCount = null;

  if (log && log.periods && log.periods.length > 0) {
    const totals = computeSessionTotals(log);
    durMs = totals.totalSleepMs;
    wakeCount = totals.wakeCount;
  } else if (log) {
    if (log.sleep_time && log.wake_time) {
      const [sh, sm] = (log.sleep_time || log.bedtime || '').split(':').map(Number);
      const [wh, wm] = log.wake_time.split(':').map(Number);
      let mins = (wh * 60 + wm) - (sh * 60 + sm);
      if (mins < 0) mins += 24 * 60;
      durMs = mins * 60000;
    }
    wakeCount = log.night_wakings?.length ?? null;
  }

  const showActive = !!activeSession;

  return (
    <Link to={createPageUrl('SleepLog')} className="block flex-1 cursor-pointer">
      <div
        className="rounded-3xl p-4 h-full relative overflow-hidden"
        style={{ backgroundImage: 'url(https://media.base44.com/images/public/699f47a86e7e0a874d1159ed/dc4267e5f_2.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="mb-3">
          <Moon className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.8)' }} />
        </div>
        <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {showActive
            ? (lang === 'da' ? 'Søvn i gang' : 'Sleep in progress')
            : (lang === 'da' ? 'Søvn i nat' : 'Sleep last night')}
        </p>
        {loading ? (
          <div className="h-7 w-14 rounded-lg animate-pulse bg-white/20" />
        ) : showActive ? (
          <p className="text-lg text-white font-medium">
            {lang === 'da' ? 'Se live →' : 'See live →'}
          </p>
        ) : durMs !== null ? (
          <>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-bold text-white">{Math.floor(durMs / 3600000)}</span>
              <span className="text-sm text-white/70">{t.hoursShort}</span>
              {(durMs % 3600000) > 0 && (
                <>
                  <span className="text-2xl font-bold text-white ml-1">{Math.floor((durMs % 3600000) / 60000)}</span>
                  <span className="text-sm text-white/70">{t.minutesShort}</span>
                </>
              )}
            </div>
            {wakeCount !== null && (
              <p className="text-xs mt-1 text-white/50">
                {wakeCount} {wakeCount === 1 ? t.wakingSingular : t.wakingPlural}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm mt-1 text-white/60">
            {lang === 'da' ? 'Log søvn →' : 'Log sleep →'}
          </p>
        )}
      </div>
    </Link>
  );
}