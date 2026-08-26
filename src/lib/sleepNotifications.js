import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { base44 } from '@/api/base44Client';
import { getCurrentPhaseStart, formatClockHm } from '../../base44/shared/sleepSession';

const NOTIF_ID = 1001;
const CHANNEL_ID = 'sleep_session';
const ACTION_SLEEPING = 'SLEEP_SESSION_SLEEPING';
const ACTION_AWAKE = 'SLEEP_SESSION_AWAKE';

let actionTypesRegistered = false;
let actionListenerRegistered = false;

function isNative() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

// Register action types + Android channel — call at app startup
export async function ensureActionTypesRegistered() {
  if (!isNative() || actionTypesRegistered) return;

  // Android: define a LOW-importance, no-vibration channel
  try {
    await LocalNotifications.defineChannel({
      id: CHANNEL_ID,
      name: 'Søvnsession',
      description: 'Vedvarende notifikation under aktiv søvnlogning',
      importance: 1,
      visibility: 1,
      vibration: false,
    });
  } catch {}

  try {
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: ACTION_SLEEPING,
          actions: [
            { id: 'log_wake', title: 'Opvågning' },
            { id: 'end_session', title: 'Afslut' },
          ],
        },
        {
          id: ACTION_AWAKE,
          actions: [
            { id: 'log_sleep', title: 'Sover igen' },
            { id: 'end_session', title: 'Afslut' },
          ],
        },
      ],
    });
    actionTypesRegistered = true;
  } catch (e) {
    console.warn('[sleepNotifications] registerActionTypes failed:', e?.message || e);
  }
}

// Request notification permission — call on first use of sleep log
export async function requestSleepNotificationPermission() {
  if (!isNative()) return false;
  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display === 'prompt') {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    }
    return perm.display === 'granted';
  } catch (e) {
    console.warn('[sleepNotifications] permission failed:', e?.message || e);
    return false;
  }
}

// Show or update the notification to match session state
export async function showSleepNotification(session) {
  if (!isNative() || !session) return;
  try {
    const status = session.session_status;
    const phaseStart = getCurrentPhaseStart(session);
    const timeStr = formatClockHm(phaseStart);

    let title, body, actionType;
    if (status === 'active_sleep') {
      title = 'Barnet sover 💤';
      body = `Startet kl. ${timeStr} · tryk for at registrere opvågning`;
      actionType = ACTION_SLEEPING;
    } else if (status === 'active_awake') {
      title = 'Barnet er vågent';
      body = `Vågen siden kl. ${timeStr}`;
      actionType = ACTION_AWAKE;
    } else {
      await clearSleepNotification();
      return;
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIF_ID,
          title,
          body,
          channelId: CHANNEL_ID,
          ongoing: true,
          silent: true,
          actionTypeId: actionType,
          extra: { session_id: session.id },
        },
      ],
    });
  } catch (e) {
    console.warn('[sleepNotifications] show failed:', e?.message || e);
  }
}

// Clear/remove the notification
export async function clearSleepNotification() {
  if (!isNative()) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: NOTIF_ID }] });
  } catch (e) {
    console.warn('[sleepNotifications] clear failed:', e?.message || e);
  }
}

// Sync notification with actual session state from DB
export async function syncSleepNotification(session) {
  if (!isNative()) return;
  if (!session || session.session_status === 'completed') {
    await clearSleepNotification();
    return;
  }
  await showSleepNotification(session);
}

// Handle action button press — calls same backend as in-app buttons
async function handleAction(actionId, sessionId) {
  try {
    let action;
    if (actionId === 'log_wake') action = 'mark_awake';
    else if (actionId === 'log_sleep') action = 'mark_sleeping';
    else if (actionId === 'end_session') action = 'end';
    else return;

    const res = await base44.functions.invoke('manageSleepSession', {
      action,
      session_id: sessionId,
    });
    const result = res?.data || res;
    if (result?.error) {
      await clearSleepNotification();
      return;
    }
    const session = result?.session;
    if (action === 'end' || !session || session.session_status === 'completed') {
      await clearSleepNotification();
    } else {
      await showSleepNotification(session);
    }
  } catch (e) {
    console.warn('[sleepNotifications] handleAction failed:', e?.message || e);
  }
}

// Register action listener — call once at app startup
export async function registerSleepNotificationActions() {
  if (!isNative() || actionListenerRegistered) return;
  try {
    await LocalNotifications.addListener(
      'localNotificationActionPerformed',
      async (event) => {
        try {
          const actionId = event?.actionId;
          const sessionId = event?.notification?.extra?.session_id;
          if (!actionId || !sessionId) return;
          await handleAction(actionId, sessionId);
        } catch {}
      }
    );
    actionListenerRegistered = true;
  } catch (e) {
    console.warn('[sleepNotifications] listener failed:', e?.message || e);
  }
}