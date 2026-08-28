import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sunrise, Lock, Sparkles, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { syncSleepNotification, clearSleepNotification, requestSleepNotificationPermission } from '@/lib/sleepNotifications';
import { getLightState, turnLightOn, turnLightOff, saveLightConsent } from '@/lib/sleepLight';
import SleepLightIndicator from './SleepLightIndicator';
import AutoLightConsentDialog from './AutoLightConsentDialog';
import { useSleepSession } from './useSleepSession';
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
  return (
    <div className="flex items-center justify-center gap-2 mt-6 px-4">
      <Lock className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Du kan trygt lukke appen. Vi fortsætter i baggrunden.
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
  const [justEndedSession, setJustEndedSession] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [, setTick] = useState(0);
  const [lightConsent, setLightConsent] = useState(null); // null = loading, true/false/undefined = loaded
  const [lightOn, setLightOn] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [showConsent, setShowConsent] = useState(false);
  const consentShownRef = useRef('');
  const lastSyncKey = useRef('');

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

  // Synkronisér vedvarende notifikation med session-tilstand
  useEffect(() => {
    if (loading) return;
    if (activeSession) {
      syncSleepNotification(activeSession);
    } else {
      clearSleepNotification();
    }
  }, [activeSession?.id, activeSession?.session_status, loading]);

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
  useEffect(() => {
    if (loading || lightConsent === null) return;
    const status = activeSession?.session_status;
    const sessionId = activeSession?.id || '';
    const syncKey = sessionId + ':' + status + ':' + lightConsent;

    if (lastSyncKey.current === syncKey) return;
    lastSyncKey.current = syncKey;

    if (status === 'active_awake') {
      if (lightConsent === true) {
        turnLightOn().then(res => {
          if (res) {
            setLightOn(true);
            setOnlineCount(res.online_count || 0);
          }
        });
      } else if (lightConsent !== false && consentShownRef.current !== sessionId) {
        consentShownRef.current = sessionId;
        setShowConsent(true);
      }
    } else {
      if (lightOn) {
        setLightOn(false);
        turnLightOff();
      }
    }
  }, [activeSession?.id, activeSession?.session_status, loading, lightConsent, lightOn]);

  // Luk consent-dialog hvis session forlader active_awake
  useEffect(() => {
    if (activeSession?.session_status !== 'active_awake') {
      setShowConsent(false);
    }
  }, [activeSession?.session_status]);

  const handleConsent = async (accepted) => {
    setShowConsent(false);
    setLightConsent(accepted);
    // Forhindr sync-effect i at køre dobbelt
    const sessionId = activeSession?.id || '';
    lastSyncKey.current = sessionId + ':active_awake:' + accepted;
    if (accepted) {
      const res = await turnLightOn({ auto_light_enabled: true });
      if (res) {
        setLightOn(true);
        setOnlineCount(res.online_count || 0);
      }
    } else {
      await saveLightConsent(false);
    }
  };

  // Find tilstand
  let state = 1;
  if (justEndedSession) state = 4;
  else if (activeSession?.session_status === 'active_sleep') state = 2;
  else if (activeSession?.session_status === 'active_awake') state = 3;

  const phaseStart = activeSession ? getCurrentPhaseStart(activeSession) : null;
  const elapsedMs = phaseStart ? Date.now() - new Date(phaseStart).getTime() : 0;

  const totals = activeSession
    ? computeSessionTotals(activeSession)
    : { totalSleepMs: 0, totalAwakeMs: 0, wakeCount: 0 };
  const justEndedTotals = justEndedSession ? computeSessionTotals(justEndedSession) : null;

  const handleStart = async () => {
    try {
      await requestSleepNotificationPermission();
      await startSession(activeChild?.id || null);
    } catch {}
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
      setFeedback({ title: 'Hov', message: 'Kunne ikke hente feedback lige nu. Prøv igen senere.' });
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
          Klar til at logge søvn?
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          Tryk på knappen, når dit barn falder i søvn. Vi klarer resten.
        </p>
        <PrimaryButton onClick={handleStart} disabled={isPending} subtitle="Barnet sover">
          Start søvn
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
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Søvnlog i gang</span>
        </div>
        <h1 className="text-3xl font-semibold text-center mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'var(--color-text-primary)' }}>
          Barnet sover
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          Startet kl. {formatClockHm(phaseStart)}
        </p>

        <LiveTimer ms={elapsedMs} />
        <p className="text-xs text-center -mt-4 mb-6" style={{ color: 'var(--color-text-muted)' }}>Sovetid</p>

        <div className="rounded-2xl p-4 mb-6 flex items-center justify-between" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Opvågninger</span>
          <span className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{totals.wakeCount}</span>
        </div>

        <PrimaryButton onClick={handleMarkAwake} disabled={isPending} subtitle="Registrér opvågning">
          Barnet er vågent
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
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Opvågning i gang</span>
        </div>
        {lightOn && <SleepLightIndicator onlineCount={onlineCount} />}
        <h1 className="text-3xl font-semibold text-center mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'var(--color-text-primary)' }}>
          Barnet er vågent
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          Startet kl. {formatClockHm(phaseStart)}
        </p>

        <LiveTimer ms={elapsedMs} />
        <p className="text-xs text-center -mt-4 mb-6" style={{ color: 'var(--color-text-muted)' }}>Vågentid</p>

        <div className="rounded-2xl p-4 mb-6 flex items-center justify-between" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Opvågninger i alt</span>
          <span className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{totals.wakeCount}</span>
        </div>

        <div className="space-y-3">
          <PrimaryButton onClick={handleMarkSleeping} disabled={isPending} subtitle="Start sovetid">
            Barnet sover igen
          </PrimaryButton>
          <OutlineButton onClick={handleEnd} disabled={isPending} subtitle="Afslut session">
            Barnet står op
          </OutlineButton>
        </div>
        <BgNote />
        <AutoLightConsentDialog
          open={showConsent}
          onAccept={() => handleConsent(true)}
          onDecline={() => handleConsent(false)}
          onClose={() => setShowConsent(false)}
        />
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
        Godmorgen
      </h1>
      <p className="text-sm text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        Session afsluttet
      </p>

      {justEndedTotals && (
        <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Nattens søvn</p>
          <div className="space-y-2.5">
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Søvnen startede</span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{formatClockHm(justEndedSession.session_start)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Barnet stod op</span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{formatClockHm(justEndedSession.session_end)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Samlet søvn</span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{formatHoursMinutes(justEndedTotals.totalSleepMs)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Antal opvågninger</span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{justEndedTotals.wakeCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Samlet vågen i alt</span>
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
          <PrimaryButton onClick={handleFeedback} disabled={feedbackLoading || isPending} subtitle="Få personlig feedback på nattens søvn">
            {feedbackLoading ? 'Analyserer…' : 'Modtag feedback'}
          </PrimaryButton>
        )}
        {feedback && (
          <button
            onClick={handleFeedback}
            disabled={feedbackLoading}
            className="w-full py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Opdatér feedback
          </button>
        )}
        <OutlineButton onClick={handleUndo} disabled={isPending} subtitle="Åbn sessionen igen og tilføj mere.">
          Fortryd! Fortsæt session
        </OutlineButton>
      </div>
    </div>
  );
}