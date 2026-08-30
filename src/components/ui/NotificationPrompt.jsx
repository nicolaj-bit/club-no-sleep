import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { base44 } from '@/api/base44Client';
import { useSubscription } from '@/components/subscription/useSubscription';
import { getPermissionStatus } from '@/utils/notificationPermission';
import NotificationPrePrompt, { shouldShowNotifPrompt } from '@/components/ui/NotificationPrePrompt';
import TrialAnnouncementModal from '@/components/subscription/TrialAnnouncementModal';

const TRIAL_SESSION_KEY = 'trial_announcement_checked';

/**
 * Orchestrator for two one-time prompts:
 *
 * DEL 2 — Notification pre-prompt: shown after onboarding completes or
 *         first sleep-log use (never at app start). Shows a gentle explanation
 *         BEFORE the OS dialog.
 *
 * DEL 3 — Trial announcement: shown once to non-subscribed, trial-eligible
 *         users on first app open after the update.
 *
 * The two are mutually exclusive — the trial announcement takes priority.
 * The notification pre-prompt waits until the trial check finishes and the
 * trial modal (if shown) is closed.
 */
export default function NotificationPrompt() {
  const { isActive: isSubscribed, loading: subLoading } = useSubscription();
  const [showTrial, setShowTrial] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [trialChecked, setTrialChecked] = useState(false);
  const [trialCheckDone, setTrialCheckDone] = useState(false);
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  // Coordinate with MarketingConsentPrompt — never show two modals at once
  useEffect(() => {
    if (showTrial || showNotif) {
      sessionStorage.setItem('modal_active', '1');
    } else {
      sessionStorage.removeItem('modal_active');
    }
  }, [showTrial, showNotif]);

  // ── DEL 3: Trial announcement (one-time, on first app open) ──────────
  useEffect(() => {
    if (subLoading || trialChecked) return;
    setTrialChecked(true);

    if (isSubscribed) {
      setTrialCheckDone(true);
      return;
    }

    if (sessionStorage.getItem(TRIAL_SESSION_KEY)) {
      setTrialCheckDone(true);
      return;
    }
    sessionStorage.setItem(TRIAL_SESSION_KEY, '1');

    let cancelled = false;
    (async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth || cancelled) { setTrialCheckDone(true); return; }
        const user = await base44.auth.me();
        if (!user?.email || cancelled) { setTrialCheckDone(true); return; }
        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        if (cancelled) { setTrialCheckDone(true); return; }
        if (profiles[0]?.trial_announcement_seen) { setTrialCheckDone(true); return; }
        setShowTrial(true);
        setTrialCheckDone(true);
      } catch {
        setTrialCheckDone(true);
      }
    })();

    return () => { cancelled = true; };
  }, [subLoading, isSubscribed, trialChecked]);

  // ── DEL 2: Notification pre-prompt (after onboarding / first sleep log) ──
  // Waits for the trial check to complete and the trial modal to close.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    if (!trialCheckDone) return;
    if (showTrial) return; // one thing at a time

    const currentPath = location.pathname;

    // Trigger 1: flag set by Onboarding.jsx when onboarding completes
    if (sessionStorage.getItem('trigger_notif_prompt')) {
      sessionStorage.removeItem('trigger_notif_prompt');
      maybeShowNotif();
      prevPath.current = currentPath;
      return;
    }

    // Trigger 2: first time navigating to SleepLog in this session
    if (currentPath === '/SleepLog' && prevPath.current !== '/SleepLog') {
      if (!sessionStorage.getItem('sleeplog_notif_checked')) {
        sessionStorage.setItem('sleeplog_notif_checked', '1');
        maybeShowNotif();
      }
    }

    prevPath.current = currentPath;
  }, [location.pathname, showTrial, trialCheckDone]);

  const maybeShowNotif = async () => {
    if (!shouldShowNotifPrompt()) return;
    // Only show the pre-prompt if we can still request permission.
    // On iOS, once denied there is no second chance — don't waste it.
    const status = await getPermissionStatus();
    if (status === 'granted' || status === 'denied') return;
    setShowNotif(true);
  };

  return (
    <>
      <TrialAnnouncementModal open={showTrial} onClose={() => setShowTrial(false)} />
      <NotificationPrePrompt open={showNotif} onClose={() => setShowNotif(false)} />
    </>
  );
}