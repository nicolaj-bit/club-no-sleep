import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { base44 } from '@/api/base44Client';
import { getCurrentPhaseStart, formatClockHm } from '../../base44/shared/sleepSession';
import { startSleepLiveActivity, endSleepLiveActivity } from './sleepLiveActivity';
 
const NOTIF_ID = 1001;
const ACTION_TYPE = 'SLEEP_SESSION';
 
let actionTypesRegistered = false;
let actionListenerRegistered = false;
 
function isAvailable() {
  try {
    if (!Capacitor.isNativePlatform()) return false;
    if (typeof Capacitor.isPluginAvailable === 'function' && !Capacitor.isPluginAvailable('LocalNotifications')) return false;
    return true;
  } catch {
    return false;
  }
}
 
// Register action types — call at app startup (SleepNotificationManager)
//
// Kun Android. På iOS registreres kategorien i native kode
// (ios/App/App/SleepLockScreenActions.swift), fordi knaptrykket dér skal
// håndteres uden om webviewet. Kaldes registerActionTypes fra JS på iOS,
// overskriver Capacitor den native kategori, og knapperne forsvinder.
export async function ensureActionTypesRegistered() {
  if (!isAvailable() || actionTypesRegistered) return;
  if (Capacitor.getPlatform() !== 'android') {
    console.log('[SLEEPLOG-NOTIF] action types håndteres nativt på denne platform');
    actionTypesRegistered = true;
    return;
  }
  console.log('[SLEEPLOG-NOTIF] ensureActionTypesRegistered called');
 
  try {
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: ACTION_TYPE,
          actions: [
            { id: 'awake', title: 'Barnet er vågent' },
            { id: 'end', title: 'Afslut log' },
          ],
        },
      ],
    });
    actionTypesRegistered = true;
    console.log('[SLEEPLOG-NOTIF] action types registered:', ACTION_TYPE);
  } catch (e) {
    console.error('[SLEEPLOG-NOTIF] registerActionTypes failed:', e?.message || e);
  }
}
 
// Request notification permission — call on first sleep log start
export async function requestSleepNotificationPermission() {
  if (!isAvailable()) return false;
  try {
    const perm = await LocalNotifications.checkPermissions();
    console.log('[SLEEPLOG-NOTIF] permission check:', perm.display);
    if (perm.display !== 'granted') {
      const result = await LocalNotifications.requestPermissions();
      console.log('[SLEEPLOG-NOTIF] permission request result:', result.display);
      return result.display === 'granted';
    }
    return true;
  } catch (e) {
    console.error('[SLEEPLOG-NOTIF] permission failed:', e?.message || e);
    return false;
  }
}
 
// Show the notification — same minimal form as testNotification
export async function showSleepNotification(session) {
  if (!isAvailable()) return;
  console.log('[SLEEPLOG-NOTIF] showSleepNotification called', {
    sessionId: session?.id,
    status: session?.session_status,
  });
 
  // På iOS 17 og nyere vises en Live Activity i stedet: den ligger fast på
  // låseskærmen med en tæller der løber, og knappen "Barnet er vågent" er
  // altid synlig. Kører der allerede en, opdateres den.
  //
  // Kan det ikke lade sig gøre — ældre iOS, Android, eller en native build
  // uden plugin'et — returnerer kaldet false, og vi falder tilbage til den
  // almindelige notifikation herunder.
  if (await startSleepLiveActivity(session)) {
    await cancelNotification();
    return;
  }
 
  const perm = await LocalNotifications.checkPermissions();
  console.log('[SLEEPLOG-NOTIF] permission status:', perm.display);
 
  let timeStr = '';
  try {
    const startTime = session ? getCurrentPhaseStart(session) : new Date().toISOString();
    timeStr = formatClockHm(startTime);
  } catch (e) {
    console.warn('[SLEEPLOG-NOTIF] could not compute start time:', e?.message || e);
    timeStr = formatClockHm(new Date().toISOString());
  }
 
  const triggerAt = new Date(Date.now() + 3000);
  console.log('[SLEEPLOG-NOTIF] scheduling', {
    id: NOTIF_ID,
    actionTypeId: ACTION_TYPE,
    triggerAt: triggerAt.toISOString(),
  });
 
  try {
    const result = await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIF_ID,
          title: 'Søvnlog kører',
          body: `Startet kl. ${timeStr}`,
          actionTypeId: ACTION_TYPE,
          extra: { session_id: session?.id },
          schedule: { at: triggerAt },
        },
      ],
    });
    console.log('[SLEEPLOG-NOTIF] schedule() returned:', JSON.stringify(result));
  } catch (e) {
    console.error('[SLEEPLOG-NOTIF] schedule() failed:', e?.message || e);
  }
}
 
async function cancelNotification() {
  try {
    await LocalNotifications.cancel({ notifications: [{ id: NOTIF_ID }] });
    console.log('[SLEEPLOG-NOTIF] cancel() done');
  } catch (e) {
    console.error('[SLEEPLOG-NOTIF] cancel() failed:', e?.message || e);
  }
}
 
// Cancel the notification — only call when sleep log stops
export async function clearSleepNotification() {
  if (!isAvailable()) return;
  console.log('[SLEEPLOG-NOTIF] clearSleepNotification — cancelling id', NOTIF_ID);
  await cancelNotification();
  // Der kan ligge en Live Activity uanset hvilken vej notifikationen gik.
  await endSleepLiveActivity();
}
 
// Sync notification with session — only shows, never clears
export async function syncSleepNotification(session) {
  if (!isAvailable()) return;
  if (!session || session.session_status === 'completed') return;
  await showSleepNotification(session);
}
 
// Handle action button press
async function handleAction(actionId, sessionId) {
  try {
    console.log('[SLEEPLOG-NOTIF] handleAction called', { actionId, sessionId });
 
    if (actionId === 'end' || actionId === 'stop') {
      const res = await base44.functions.invoke('manageSleepSession', {
        action: 'end',
        session_id: sessionId,
      });
      const result = res?.data || res;
      console.log('[SLEEPLOG-NOTIF] stop result, status:', result?.session?.session_status);
      await clearSleepNotification();
      return;
    }
 
    if (actionId === 'awake' || actionId === 'pause') {
      const logsRes = await base44.functions.invoke('getSleepLogs', {});
      const logsData = logsRes?.data || logsRes;
      const session = logsData?.active_session;
      if (!session) {
        console.warn('[SLEEPLOG-NOTIF] pause: no active session found');
        return;
      }
      const newAction = session.session_status === 'active_sleep' ? 'mark_awake' : 'mark_sleeping';
      console.log('[SLEEPLOG-NOTIF] pause: current', session.session_status, '→ action', newAction);
      await base44.functions.invoke('manageSleepSession', {
        action: newAction,
        session_id: sessionId,
      });
      return;
    }
  } catch (e) {
    console.error('[SLEEPLOG-NOTIF] handleAction failed:', e?.message || e);
  }
}
 
// Register action listener — call once at app startup (SleepNotificationManager)
export async function registerSleepNotificationActions() {
  if (!isAvailable() || actionListenerRegistered) return;
  console.log('[SLEEPLOG-NOTIF] registerSleepNotificationActions called');
  try {
    await LocalNotifications.addListener(
      'localNotificationActionPerformed',
      async (event) => {
        try {
          const actionId = event?.actionId;
          const sessionId = event?.notification?.extra?.session_id;
          console.log('[SLEEPLOG-NOTIF] action performed', { actionId, sessionId });
          if (!actionId) return;
          // På iOS håndteres awake/end i native kode. Skulle Capacitor
          // alligevel levere dem her, må vi ikke behandle dem igen — det ville
          // give to perioder i søvnloggen for ét tryk.
          if (Capacitor.getPlatform() === 'ios' && (actionId === 'awake' || actionId === 'end')) {
            console.log('[SLEEPLOG-NOTIF] springer over — håndteret nativt');
            return;
          }
          if (!sessionId) return;
          await handleAction(actionId, sessionId);
        } catch (e) {
          console.error('[SLEEPLOG-NOTIF] action listener error:', e?.message || e);
        }
      }
    );
    actionListenerRegistered = true;
    console.log('[SLEEPLOG-NOTIF] action listener registered');
  } catch (e) {
    console.error('[SLEEPLOG-NOTIF] listener registration failed:', e?.message || e);
  }
}