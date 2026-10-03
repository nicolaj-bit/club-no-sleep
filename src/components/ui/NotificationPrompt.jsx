import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { base44 } from '@/api/base44Client';
import { useSubscription } from '@/components/subscription/useSubscription';
import { getPermissionStatus } from '@/utils/notificationPermission';
import NotificationPrePrompt, { shouldShowNotifPrompt } from '@/components/ui/NotificationPrePrompt';
import TrialAnnouncementModal from '@/components/subscription/TrialAnnouncementModal';
import TrackingPrePrompt, { hasDeclinedTracking } from '@/components/ui/TrackingPrePrompt';
import { requestMetaTracking, getMetaTrackingStatus } from '@/lib/metaEvents';

const TRIAL_SESSION_KEY = 'trial_announcement_checked';
const ATT_ASKED_KEY = 'cns_att_asked';

/**
 * Skriver ned, at Apple har fået et rigtigt svar.
 *
 * Blev dialogen ikke vist — f.eks. fordi appen ikke var aktiv i det øjeblik —
 * svarer plugin'et stadig 'notDetermined'. Så skal der ikke skrives noget ned,
 * for brugerens ene svar hos Apple er ikke brugt endnu.
 */
function rememberAttStatus(status) {
  if (!status || status === 'notDetermined') return;
  try {
    localStorage.setItem(ATT_ASKED_KEY, status);
  } catch {
    // ignoreres med vilje
  }
}

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
 * DEL 4 — Sporingstilladelse (App Tracking Transparency, kun iOS): vises
 *         sidst af alle, når både prøveperiode-beskeden og notifikations-
 *         beskeden er afklaret. Aldrig på splash- eller onboarding-skærmen:
 *         brugeren skal have set, hvad appen er til, før hun bliver spurgt,
 *         om vi må måle, hvilken annonce hun kom fra.
 *
 *         Først vises vores egen bløde forespørgsel (TrackingPrePrompt), og
 *         kun hvis hun siger ja dér, vises Apples dialog. Siger hun nej, bliver
 *         Apples dialog aldrig vist, og valget huskes.
 *
 * The two first are mutually exclusive — the trial announcement takes
 * priority. The notification pre-prompt waits until the trial check finishes
 * and the trial modal (if shown) is closed. ATT venter på dem begge, for iOS
 * viser kun én systemdialog ad gangen.
 */
export default function NotificationPrompt() {
  const { isActive: isSubscribed, loading: subLoading } = useSubscription();
  const [showTrial, setShowTrial] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [trialChecked, setTrialChecked] = useState(false);
  const [trialCheckDone, setTrialCheckDone] = useState(false);
  const [notifDecided, setNotifDecided] = useState(false);
  const [attHandled, setAttHandled] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  // Coordinate with MarketingConsentPrompt — never show two modals at once
  useEffect(() => {
    if (showTrial || showNotif || showTracking) {
      sessionStorage.setItem('modal_active', '1');
    } else {
      sessionStorage.removeItem('modal_active');
    }
  }, [showTrial, showNotif, showTracking]);

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
        prevPath.current = currentPath;
        return;
      }
    }

    // Ingen af de to udløsere ramte, så der kommer ingen notifikations-
    // besked lige nu. Det skal ATT-delen vide — ellers venter den for evigt.
    setNotifDecided(true);
    prevPath.current = currentPath;
  }, [location.pathname, showTrial, trialCheckDone]);

  const maybeShowNotif = async () => {
    try {
      if (!shouldShowNotifPrompt()) return;
      // Only show the pre-prompt if we can still request permission.
      // On iOS, once denied there is no second chance — don't waste it.
      const status = await getPermissionStatus();
      if (status === 'granted' || status === 'denied') return;
      setShowNotif(true);
    } finally {
      // Afgørelsen er truffet — uanset om beskeden blev vist.
      setNotifDecided(true);
    }
  };

  // ── DEL 4: Sporingstilladelse (kun iOS) ─────────────────────────────────
  //
  // Her ligger ATT-dialogen. Det er det eneste sted i appen, den vises.
  //
  // Betingelserne er med vilje strenge. iOS spørger kun én gang i en apps
  // levetid, og bliver dialogen vist på et dårligt tidspunkt — eller mens en
  // anden dialog er på skærmen — er chancen brugt.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    if (attHandled) return;
    if (!trialCheckDone || !notifDecided) return;
    if (showTrial || showNotif) return; // kun én besked ad gangen

    // Aldrig på splash, marketingside eller midt i onboarding.
    const path = location.pathname;
    if (path === '/' || path === '/Landing' || path === '/Onboarding') return;

    // Har hun sagt nej i vores egen forespørgsel, er sagen afgjort for altid.
    if (hasDeclinedTracking()) {
      setAttHandled(true);
      return;
    }

    let asked = null;
    try {
      asked = window.localStorage.getItem(ATT_ASKED_KEY);
    } catch {
      // Spærret lagring. Så spørger vi igen næste gang — iOS viser alligevel
      // ikke dialogen to gange.
    }
    if (asked) {
      setAttHandled(true);
      return;
    }

    setAttHandled(true);

    (async () => {
      // Vis ikke en forespørgsel, der ikke fører nogen steder. Er svaret
      // allerede givet — eller er vi på Android, hvor der ingen dialog er —
      // skal brugeren ikke spørges om noget.
      const status = await getMetaTrackingStatus();
      if (status !== 'notDetermined') {
        rememberAttStatus(status);
        return;
      }
      setShowTracking(true);
    })();
  }, [trialCheckDone, notifDecided, showTrial, showNotif, location.pathname, attHandled]);

  /** Svaret på vores egen forespørgsel. Kun et ja fører til Apples dialog. */
  const handleTrackingChoice = async (accepted) => {
    setShowTracking(false);
    if (!accepted) {
      // TrackingPrePrompt har allerede husket nejet. Apples dialog vises
      // aldrig, og brugerens ene svar hos Apple er dermed ikke brugt.
      console.log('[META] bruger sagde nej i den bløde forespørgsel');
      return;
    }
    const { status } = await requestMetaTracking();
    rememberAttStatus(status);
  };

  return (
    <>
      <TrialAnnouncementModal open={showTrial} onClose={() => setShowTrial(false)} />
      <NotificationPrePrompt open={showNotif} onClose={() => setShowNotif(false)} />
      <TrackingPrePrompt open={showTracking} onClose={handleTrackingChoice} />
    </>
  );
}