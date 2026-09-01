import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sunrise, Sun, Lock, Sparkles, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { syncSleepNotification, clearSleepNotification, requestSleepNotificationPermission } from '@/lib/sleepNotifications';
import { getLightState, turnLightOn, turnLightOff } from '@/lib/sleepLight';
import SleepLightIndicator from './SleepLightIndicator';
import { useSleepSession } from './useSleepSession';
import { useLanguage } from '@/components/ui/LanguageContext';
import {
  computeSessionTotals,
  getCurrentPhaseStart,
  formatTimer,
  formatClockHm,
  formatHoursMinutes,
} from '../../../base44/shared/sleepSession';

function SleepingBabyArt() {
  return (
    <div className="flex justify-center mb-8 mt-4">
      <div
        className="w-32 h-32 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--color-bg-subtle), var(--color-accent-warm))' }}
      >
        <Moon className="w-16 h-16" style={{ color: 'var(--color-accent)', strokeWidth: 1.2 }} />
      </div>
    </div>
  );
}

function StatusDot({ color }) {
  const bg = color === 'green' ? '#22C55E' : color === 'orange' ? '#F97316' : 'var(--color-accent)';
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style={{ backgroundColor: bg }} />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: bg }} />
    </span>
  );
}

function PrimaryButton({ onClick, disabled, children, subtitle }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-5 rounded-2xl font-semibold text-base transition-all disabled:opacity-60 active:scale-[0.98]"
      style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-brown-light))', color: 'var(--theme-text-on-dark)' }}
    >
      <div className="flex flex-col items-center gap-0.5">
        <span>{children}</span>
        {subtitle && <span className="text-xs font-normal opacity-80">{subtitle}</span>}
      </div>
    </button>
  );
}

function OutlineButton({ onClick, disabled, children, subtitle }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-5 rounded-2xl font-semibold text-base transition-all disabled:opacity-60 active:scale-[0.98] border-2"
      style={{ backgroundColor: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
    >
      <div className="flex flex-col items-center gap-0.5">
        <span>{children}</span>
        {subtitle && <span className="text-xs font-normal opacity-70">{subtitle}</span>}
      </div>
    </button>
  );
}

function BgNote() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-center gap-2 mt-6 px-4">
      <Lock className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {t.sleepSafeToClose}
      </p>
    </div>
  );
}

function LiveTimer({ ms }) {
  return (
    <div className="text-center mb-6">
      <p
        className="text-5xl font-light"
        style={{ color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}
      >
        {formatTimer(ms)}
      </p>
    </div>
  );
}

export default function LiveSleepTracker({ user, activeChild }) {
  const { activeSession, startSession, markAwake, markSleeping, endSession, undoEnd, isPending, loading } = useSleepSession(user);
  const { t } = useLanguage();
  const [justEndedSession, setJustEndedSession] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [, setTick] = useState(0);
  const [lightConsent, setLightConsent] = useState(null); // null = loading, true/false = loaded
  const [lightOn, setLightOn] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const lastSyncKey = useRef('');
  const prevNotifSessionId = useRef(null);
  const [sleepType, setSleepType] = useState(() => {
    const h = new Date().getHours();
    return (h >= 18 || h < 6) ? 'night' : 'nap';
  });

  // Live timer — re-render hver sekund mens en session er aktiv
  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [activeSession?.id, activeSession?.session_status]);

  // Re-render når appen kommer tilbage fra baggrund
  useEffect(() => {
    const handleVisible = () => setTick(t => t + 1);
    document.addEventListener('visibilitychange', handleVisible);
    return () => document.removeEventListener('visibilitychange', handleVisible);
  }, []);

  // Synkronisér notifikation — kun ved ny session ID, annullér kun ved stop
  useEffect(() => {
    if (loading) return;
    if (activeSession?.id && activeSession.id !== prevNotifSessionId.current) {
      prevNotifSessionId.current = activeSession.id;
      syncSleepNotification(activeSession);
    } else if (!activeSession && prevNotifSessionId.current) {
      prevNotifSessionId.current = null;
      clearSleepNotification();
    }
  }, [activeSession?.id, loading]);

  // Hent lys-tilstand (consent + online + count) ved opstart
  useEffect(() => {
    if (!user?.email) return;
    getLightState().then(state => {
      if (state) {
        setLightConsent(state.auto_light_enabled);
        setLightOn(state.is_online === true);
        setOnlineCount(state.online_count || 0);
      } else {
        setLightConsent(false); // fallback ved fejl: ingen automatisk lys
      }
    });
  }, [user?.email]);

  // Synkronisér 'Et lys i mørket' med session-tilstand
  // Auto-tænd lyset når barnet er vågent, hvis brugeren har givet samtykke (auto_light_enabled === true)
  useEffect(() => {
    if (loading || lightConsent === null) return;
    const status = activeSession?.session_status;
    const sessionId = activeSession?.id || '';
    const syncKey = sessionId + ':' + status + ':' + lightConsent;

    if (lastSyncKey.current === syncKey) return;
    lastSyncKey.current = syncKey;

    if (status === 'active_awake' && lightConsent === true && activeSession?.sleep_type !== 'nap') {
      turnLightOn().then(res => {
        if (res) {
          setLightOn(true);
          setOnlineCount(res.online_count || 0);
        }
      });
    } else {
      if (lightOn) {
        setLightOn(false);
        turnLightOff();
      }
    }
  }, [activeSession?.id, activeSession?.session_status, loading, lightConsent, lightOn]);

  // Find tilstand
  let state = 1;
  if (justEndedSession) state = 4;
  else if (activeSession?.session_status === 'active_sleep') state = 2;
  else if (activeSession?.session_status === 'active_awake') state = 3;

  // Søvntype: nattesøvn som standard (baglæns kompatibel med eksisterende sessioner)
  const isNightSleep = justEndedSession
    ? justEndedSession.sleep_type !== 'nap'
    : activeSession
      ? activeSession.sleep_type !== 'nap'
      : sleepType === 'night';

  const phaseStart = activeSession ? getCurrentPhaseStart(activeSession) : null;
  const elapsedMs = phaseStart ? Date.now() - new Date(phaseStart).getTime() : 0;

  const totals = activeSession
    ? computeSessionTotals(activeSession)
    : { totalSleepMs: 0, totalAwakeMs: 0, wakeCount: 0 };
  const justEndedTotals = justEndedSession ? computeSessionTotals(justEndedSession) : null;

  const handleStart = async () => {
    try {
      await requestSleepNotificationPermission();
      await startSession(activeChild?.id || null, sleepType);
    } catch (e) {
      console.error('[SLEEPLOG-NOTIF] handleStart failed:', e?.message || e);
    }
  };
  const handleMarkAwake = async () => {
    try { await markAwake(activeSession.id); } catch {}
  };
  const handleMarkSleeping = async () => {
    try { await markSleeping(activeSession.id); } catch {}
  };
  const handleEnd = async () => {
    try {
      const result = await endSession(activeSession.id);
      setJustEndedSession(result?.session || activeSession);
    } catch {}
  };
  const handleUndo = async () => {
    try {
      await undoEnd(justEndedSession.id);
      setJustEndedSession(null);
    } catch {}
  };
  const handleFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const res = await base44.functions.invoke('analyzeSleepLogs', { session_id: justEndedSession.id });
      setFeedback(res?.data || res);
    } catch {
      setFeedback({ title: t.feedbackErrorTitle, message: t.feedbackErrorMessage });
    }
    setFeedbackLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-text-secondary)' }} />
      </div>
    );
  }

  // === TILSTAND 1 — Klar til at starte ===
  if (state === 1) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <SleepingBabyArt />
        <h1 className="text-2xl font-semibold text-center mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'var(--color-text-primary)' }}>
          {t.readyToLogSleep}
        </h1>
        <p className="text-sm text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          {t.readyToLogSleepHint}
        </p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setSleepType('night')}
            className="rounded-2xl p-4 text-center transition-all border-2"
            style={{
              borderColor: sleepType === 'night' ? 'var(--color-accent)' : 'var(--color-border)',
              background: sleepType === 'night' ? 'var(--color-accent-warm)' : 'var(--color-bg-subtle)',
            }}
          >
            <Moon className="w-6 h-6 mx-auto mb-1.5" style={{ color: 'var(--color-accent)' }} />
            <span className="text-sm font-medium block" style={{ color: 'var(--color-text-primary)' }}>{t.nightSleep}</span>
          </button>
          <button
            type="button"
            onClick={() => setSleepType('nap')}
            className="rounded-2xl p-4 text-center transition-all border-2"
            style={{
              borderColor: sleepType === 'nap' ? 'var(--color-accent)' : 'var(--color-border)',
              background: sleepType === 'nap' ? 'var(--color-accent-warm)' : 'var(--color-bg-subtle)',
            }}
          >
            <Sun className="w-6 h-6 mx-auto mb-1.5" style={{ color: 'var(--color-accent)' }} />
            <span className="text-sm font-medium block" style={{ color: 'var(--color-text-primary)' }}>{t.nap}</span>
          </button>
        </div>
        <PrimaryButton onClick={handleStart} disabled={isPending} subtitle={t.startSleepSubtitle}>
          {t.startSleep}
        </PrimaryButton>
      </div>
    );
  }

  // === TILSTAND 2 — Barnet sover ===
  if (state === 2) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <div className="flex items-center justify-center gap-2 mb-3">
          <StatusDot color="green" />
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{t.sleepLogActive}</span>
        </div>
        <h1 className="text-3xl font-semibold text-center mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'var(--color-text-primary)' }}>
          {t.babySleeping}
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          {t.startedAtPrefix} {formatClockHm(phaseStart)}
        </p>

        <LiveTimer ms={elapsedMs} />
        <p className="text-xs text-center -mt-4 mb-6" style={{ color: 'var(--color-text-muted)' }}>{t.timeAsleepLabel}</p>

        <div className="rounded-2xl p-4 mb-6 flex items-center justify-between" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t.wakeupsLabel}</span>
          <span className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{totals.wakeCount}</span>
        </div>

        <PrimaryButton onClick={handleMarkAwake} disabled={isPending} subtitle={t.registerWakeup}>
          {t.babyIsAwake}
        </PrimaryButton>
        <BgNote />
      </div>
    );
  }

  // === TILSTAND 3 — Barnet er vågent ===
  if (state === 3) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <div className="flex items-center justify-center gap-2 mb-3">
          <StatusDot color="orange" />
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{t.wakeupInProgress}</span>
        </div>
        {lightOn && <SleepLightIndicator onlineCount={onlineCount} />}
        <h1 className="text-3xl font-semibold text-center mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'var(--color-text-primary)' }}>
          {t.babyIsAwake}
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          {t.startedAtPrefix} {formatClockHm(phaseStart)}
        </p>

        <LiveTimer ms={elapsedMs} />
        <p className="text-xs text-center -mt-4 mb-6" style={{ color: 'var(--color-text-muted)' }}>{t.timeAwakeLabel}</p>

        <div className="rounded-2xl p-4 mb-6 flex items-center justify-between" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t.wakeupsTotalLabel}</span>
          <span className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{totals.wakeCount}</span>
        </div>

        <div className="space-y-3">
          <PrimaryButton onClick={handleMarkSleeping} disabled={isPending} subtitle={t.startSleepTime}>
            {t.babyAsleepAgain}
          </PrimaryButton>
          <OutlineButton onClick={handleEnd} disabled={isPending} subtitle={t.endSession}>
            {t.babyGotUp}
          </OutlineButton>
        </div>
        <BgNote />
      </div>
    );
  }

  // === TILSTAND 4 — Session afsluttet ===
  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="flex justify-center mb-4 mt-2">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--color-accent-warm), var(--color-bg-subtle))' }}
        >
          <Sunrise className="w-10 h-10" style={{ color: 'var(--color-accent)', strokeWidth: 1.5 }} />
        </div>
      </div>
      <h1 className="text-3xl font-semibold text-center mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'var(--color-text-primary)' }}>
        {isNightSleep ? t.goodMorning : t.napOver}
      </h1>
      <p className="text-sm text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        {t.sessionEnded}
      </p>

      {justEndedTotals && (
        <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>{isNightSleep ? t.nightsSleep : t.thisNap}</p>
          <div className="space-y-2.5">
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t.sleepStartedAt}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{formatClockHm(justEndedSession.session_start)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t.babyWokeUpAt}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{formatClockHm(justEndedSession.session_end)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t.totalSleepLabel}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{formatHoursMinutes(justEndedTotals.totalSleepMs)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t.wakeupCountLabel}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{justEndedTotals.wakeCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t.totalAwakeLabel}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{formatHoursMinutes(justEndedTotals.totalAwakeMs)}</span>
            </div>
          </div>
        </div>
      )}

      {feedback && (
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'linear-gradient(135deg, var(--color-accent-warm), var(--color-bg-subtle))' }}>
          <div className="flex items-start gap-2 mb-2">
            <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{feedback.title}</p>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{feedback.message}</p>
        </div>
      )}

      <div className="space-y-3">
        {!feedback && (
          <PrimaryButton onClick={handleFeedback} disabled={feedbackLoading || isPending} subtitle={isNightSleep ? t.feedbackNightSubtitle : t.feedbackNapSubtitle}>
            {feedbackLoading ? t.analyzingFeedback : t.receiveFeedback}
          </PrimaryButton>
        )}
        {feedback && (
          <button
            onClick={handleFeedback}
            disabled={feedbackLoading}
            className="w-full py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <RefreshCw className="w-3.5 h-3.5" /> {t.updateFeedback}
          </button>
        )}
        <OutlineButton onClick={handleUndo} disabled={isPending} subtitle={t.undoContinueSubtitle}>
          {t.undoContinueSession}
        </OutlineButton>
      </div>
    </div>
  );
}