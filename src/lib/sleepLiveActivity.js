import { registerPlugin, Capacitor } from '@capacitor/core';
import { getCurrentPhase, getCurrentPhaseStart } from '../../base44/shared/sleepSession';
 
// Native plugin — ios/App/App/SleepLiveActivityPlugin.swift
const SleepLiveActivity = registerPlugin('SleepLiveActivity');
 
// Svaret ændrer sig ikke undervejs i en app-session, så det hentes kun én gang.
let supportedCache = null;
 
/**
 * Kan enheden vise en Live Activity med en knap, der virker fra låseskærmen?
 *
 * Native siden svarer kun ja fra iOS 17, hvor knapper i en Live Activity kan
 * køre via App Intents. På 16.x ville boksen komme uden knap, og der er den
 * almindelige notifikation bedre — dér ligger knapperne under et langt tryk.
 */
export async function isLiveActivitySupported() {
  if (Capacitor.getPlatform() !== 'ios') return false;
  if (supportedCache !== null) return supportedCache;
  try {
    const res = await SleepLiveActivity.isSupported();
    supportedCache = !!(res?.supported);
    console.log('[SLEEPLOG-LIVE] understøttet:', supportedCache);
  } catch (e) {
    // Plugin'et findes ikke i den installerede native build endnu.
    console.log('[SLEEPLOG-LIVE] plugin ikke tilgængeligt:', e?.message || e);
    supportedCache = false;
  }
  return supportedCache;
}
 
function phaseInfo(session) {
  const phase = getCurrentPhase(session);
  const phaseStart = getCurrentPhaseStart(session) || session?.session_start || new Date().toISOString();
  // Perioden er kilden til sandhed; session_status bruges kun, hvis der ikke
  // er nogen åben periode.
  const isAwake = phase ? phase.type === 'awake' : session?.session_status === 'active_awake';
  return { phaseStart, isAwake };
}
 
/** Starter aktiviteten, eller opdaterer den hvis der allerede kører en. */
export async function startSleepLiveActivity(session) {
  if (!(await isLiveActivitySupported())) return false;
  const { phaseStart, isAwake } = phaseInfo(session);
  try {
    const res = await SleepLiveActivity.start({
      sessionId: session?.id || '',
      sessionStart: session?.session_start || phaseStart,
      phaseStart,
      isAwake,
    });
    console.log('[SLEEPLOG-LIVE] start:', res?.started);
    return !!(res?.started);
  } catch (e) {
    console.error('[SLEEPLOG-LIVE] start fejlede:', e?.message || e);
    return false;
  }
}
 
export async function updateSleepLiveActivity(session) {
  if (!(await isLiveActivitySupported())) return;
  const { phaseStart, isAwake } = phaseInfo(session);
  try {
    await SleepLiveActivity.update({ phaseStart, isAwake });
  } catch (e) {
    console.error('[SLEEPLOG-LIVE] opdatering fejlede:', e?.message || e);
  }
}
 
export async function endSleepLiveActivity() {
  if (Capacitor.getPlatform() !== 'ios') return;
  try {
    // Ikke gennem isLiveActivitySupported: kører der en aktivitet fra før, skal
    // den lukkes, også hvis understøttelsen i mellemtiden er slået fra.
    await SleepLiveActivity.end();
    console.log('[SLEEPLOG-LIVE] afsluttet');
  } catch (e) {
    console.log('[SLEEPLOG-LIVE] afslutning sprunget over:', e?.message || e);
  }
}