import { base44 } from '@/api/base44Client';

// ============================================================================
// Frontend-hjælper til 'Et lys i mørket' — tænder/slukker brugerens lys
// baseret på søvnlog-sessionens tilstand.
// ALLE kald er pakket i try/catch — en fejl her må ALDRIG påvirke søvnloggen.
// ============================================================================

// Hent aktuel lys-tilstand (consent + online + count) uden at ændre noget
export async function getLightState() {
  try {
    const res = await base44.functions.invoke('toggleNightLight', { action: 'status' });
    return res?.data || res;
  } catch (e) {
    console.warn('[sleepLight] getState failed:', e?.message || e);
    return null;
  }
}

// Tænd lyset — kaldes når barnet er vågent
// opts.auto_light_enabled (boolean): gem samtykke samtidig
export async function turnLightOn(opts = {}) {
  try {
    const res = await base44.functions.invoke('toggleNightLight', { action: 'on', ...opts });
    return res?.data || res;
  } catch (e) {
    console.warn('[sleepLight] turnOn failed:', e?.message || e);
    return null;
  }
}

// Sluk lyset — kaldes når barnet sover igen eller session afsluttes
export async function turnLightOff() {
  try {
    const res = await base44.functions.invoke('toggleNightLight', { action: 'off' });
    return res?.data || res;
  } catch (e) {
    console.warn('[sleepLight] turnOff failed:', e?.message || e);
    return null;
  }
}

// Gem samtykke (true=ja, false=nej) uden at ændre lys-tilstand
export async function saveLightConsent(enabled) {
  try {
    const res = await base44.functions.invoke('toggleNightLight', { action: 'status', auto_light_enabled: enabled });
    return res?.data || res;
  } catch (e) {
    console.warn('[sleepLight] saveConsent failed:', e?.message || e);
    return null;
  }
}