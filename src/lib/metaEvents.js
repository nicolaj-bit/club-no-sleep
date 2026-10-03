import { registerPlugin, Capacitor } from '@capacitor/core';
import { Purchases } from '@revenuecat/purchases-capacitor';

/**
 * Broen til Metas SDK.
 *
 * Appen kører i Capacitor remote mode: hele brugerfladen hentes fra
 * base44.app, så websiden kan ikke kalde Metas SDK direkte — det ligger i den
 * native app. Native plugin, samme jsName og samme metoder på begge platforme:
 *
 *   iOS      — ios/App/App/MetaEventsPlugin.swift
 *   Android  — android/.../MetaEventsPlugin.java
 *
 * Alt herinde fejler stille. Måling må aldrig kunne stoppe appen, og i
 * app-udgaver, der er ældre end plugin'et, findes metoderne ikke.
 */
const MetaEvents = registerPlugin('MetaEvents');

// ── Hændelsesnavne ────────────────────────────────────────────────────────
//
// De fire første er Metas egne standardnavne. Dem kender Events Manager, og
// kun dem kan bruges til at optimere annoncer. Navne, der begynder med cns_,
// er vores egne og optræder som brugerdefinerede hændelser.
const EVENT = {
  firstOpen: 'cns_first_open',
  onboardingComplete: 'fb_mobile_complete_registration',
  trialStarted: 'StartTrial',
  purchase: 'fb_mobile_purchase',          // sendes gennem logPurchase
  subscribe: 'Subscribe',
};

/**
 * Skal appen selv sende køb til Meta?
 *
 * ⚠️ Køb kan komme til Meta ad to veje: fra appen (her) og fra RevenueCat,
 * som sender dem server-til-server. Er begge slået til, tæller Meta det samme
 * køb to gange, og annoncernes afkast ser dobbelt så godt ud, som det er.
 *
 * Vælg én. Står den til true, sender appen købet; vil du i stedet lade
 * RevenueCat stå for det alene, sæt den til false — resten af hændelserne
 * sendes stadig.
 */
const SEND_PURCHASES_FROM_APP = true;

const FIRST_OPEN_KEY = 'cns_meta_first_open_sent';
const LAST_PURCHASE_KEY = 'cns_meta_last_purchase_date';

function readLocal(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocal(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Privat vinduestilstand eller spærret lagring. Så sender vi hændelsen
    // igen næste gang — det er bedre end at lade den falde helt væk.
  }
}

// ── Grundlæggende kald ────────────────────────────────────────────────────

/** Sender en hændelse. Returnerer true, hvis den blev sendt. */
export async function logMetaEvent(name, params = {}) {
  if (!Capacitor.isNativePlatform()) return false;
  if (!name) return false;
  try {
    const res = await MetaEvents.logEvent({ name, params: cleanParams(params) });
    return !!res?.logged;
  } catch (e) {
    console.log('[META] hændelse ikke sendt:', name, e?.message || e);
    return false;
  }
}

/** Sender et køb med beløb og valuta. */
export async function logMetaPurchase(amount, currency, params = {}) {
  if (!Capacitor.isNativePlatform()) return false;
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) return false;
  if (!currency || currency.length !== 3) {
    console.log('[META] køb ikke sendt: valuta mangler');
    return false;
  }
  try {
    const res = await MetaEvents.logPurchase({
      amount: value,
      currency: currency.toUpperCase(),
      params: cleanParams(params),
    });
    return !!res?.logged;
  } catch (e) {
    console.log('[META] køb ikke sendt:', e?.message || e);
    return false;
  }
}

/**
 * Metas parametre må kun være tekst og tal. Alt andet — objekter, lister,
 * undefined — bliver skrevet om eller sorteret fra her, så det ikke først
 * opdages i Events Manager.
 */
function cleanParams(params) {
  const out = {};
  if (!params || typeof params !== 'object') return out;
  for (const [key, value] of Object.entries(params)) {
    if (!key) continue;
    if (value === null || value === undefined) continue;
    if (typeof value === 'number' && Number.isFinite(value)) out[key] = value;
    else if (typeof value === 'boolean') out[key] = value ? '1' : '0';
    else if (typeof value === 'string') out[key] = value;
    else out[key] = String(value);
  }
  return out;
}

// ── Sporingstilladelse (kun iOS) ──────────────────────────────────────────

/**
 * Beder om lov til sporing med iOS' App Tracking Transparency.
 *
 * Må IKKE kaldes på splash-skærmen. Brugeren skal have set, hvad appen er
 * til, før hun bliver spurgt — ellers siger langt de fleste nej. Kaldet sker
 * derfor fra NotificationPrompt, efter onboarding og efter de øvrige
 * beskeder er væk. Se den fil for rækkefølgen.
 *
 * Svarer `{ status, prompted }`:
 *   status   — 'authorized' | 'denied' | 'restricted' | 'notDetermined'
 *              | 'unavailable' (Android, som ingen dialog har)
 *   prompted — om dialogen faktisk blev vist denne gang
 *
 * Siger brugeren nej, sender SDK'et ikke enheds-id, men stadig anonyme
 * hændelser. Det er styret i native kode — se MetaEventsController.swift.
 */
export async function requestMetaTracking() {
  if (!Capacitor.isNativePlatform()) return { status: 'unavailable', prompted: false };
  try {
    const res = await MetaEvents.requestTracking();
    const status = res?.status || 'notDetermined';
    console.log('[META] sporingssvar:', status, 'vist:', !!res?.prompted);
    // Svaret kan have ændret, hvad RevenueCat skal vide.
    await syncMetaAttributesToRevenueCat();
    return { status, prompted: !!res?.prompted };
  } catch (e) {
    console.log('[META] sporingsdialog ikke tilgængelig:', e?.message || e);
    return { status: 'unavailable', prompted: false };
  }
}

export async function getMetaTrackingStatus() {
  if (!Capacitor.isNativePlatform()) return 'unavailable';
  try {
    const res = await MetaEvents.getTrackingStatus();
    return res?.status || 'notDetermined';
  } catch {
    return 'unavailable';
  }
}

// ── RevenueCat ────────────────────────────────────────────────────────────

/**
 * Giver RevenueCat de to oplysninger, deres Meta Ads-integration har brug for,
 * så købene kan lægges oven i de hændelser, appen selv sender:
 *
 *   $fbAnonId        — Metas anonyme id for installationen. Sættes gennem
 *                      setFBAnonymousID, som er dén metode, der skriver til
 *                      den reserverede attribut. En egen attribut ved navn
 *                      fb_anon_id ville RevenueCat ikke kigge på.
 *   $attConsentStatus — brugerens svar på sporingsdialogen. RevenueCat sender
 *                      kun til Meta, når der er et svar at vise.
 *
 * Er svaret 'authorized', hentes også enheds-id'erne ($idfa), som er det, der
 * for alvor gør det muligt at henføre et køb til en annonce.
 *
 * Skal kaldes EFTER Purchases.configure. Kaldes to gange: når RevenueCat er
 * klar, og igen når brugeren har svaret på dialogen.
 */
export async function syncMetaAttributesToRevenueCat() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    let anonymousId = '';
    try {
      const res = await MetaEvents.getAnonymousId();
      anonymousId = res?.anonymousId || '';
    } catch (e) {
      console.log('[META] anonymt id ikke tilgængeligt:', e?.message || e);
    }

    if (anonymousId) {
      await Purchases.setFBAnonymousID({ fbAnonymousID: anonymousId });
    }

    const status = await getMetaTrackingStatus();
    if (status !== 'unavailable') {
      await Purchases.setAttributes({ $attConsentStatus: status });
    }

    if (status === 'authorized') {
      await Purchases.collectDeviceIdentifiers();
    }

    console.log('[META] RevenueCat-attributter sat:', status, anonymousId ? 'med anon-id' : 'uden anon-id');
  } catch (e) {
    // RevenueCat må aldrig blokere appen.
    console.log('[META] kunne ikke sætte RevenueCat-attributter:', e?.message || e);
  }
}

// ── De fem hændelser ─────────────────────────────────────────────────────

/** App åbnet første gang. Sendes én gang pr. installation. */
export async function logMetaFirstOpen() {
  if (!Capacitor.isNativePlatform()) return false;
  if (readLocal(FIRST_OPEN_KEY)) return false;
  // Skrives først: sendes hændelsen ikke (gammel app-udgave uden plugin),
  // skal vi ikke prøve igen ved hver opstart.
  writeLocal(FIRST_OPEN_KEY, new Date().toISOString());
  return logMetaEvent(EVENT.firstOpen, { platform: Capacitor.getPlatform() });
}

/** Onboarding gennemført. */
export async function logMetaOnboardingComplete() {
  return logMetaEvent(EVENT.onboardingComplete, { fb_registration_method: 'onboarding' });
}

/**
 * Prøveperiode startet.
 *
 * Sendes uden beløb. En prøveperiode koster ingenting, og et beløb her ville
 * lægge sig til omsætningen i Events Manager.
 */
export async function logMetaTrialStarted({ productId, currency } = {}) {
  return logMetaEvent(EVENT.trialStarted, {
    fb_content_id: productId,
    fb_currency: currency,
  });
}

/** Køb gennemført. Det er denne hændelse, Metas afkasttal bygger på. */
export async function logMetaPurchaseCompleted({ amount, currency, productId } = {}) {
  if (!SEND_PURCHASES_FROM_APP) return false;
  return logMetaPurchase(amount, currency, {
    fb_content_id: productId,
    cns_purchase_kind: 'new',
  });
}

/**
 * Abonnement fornyet.
 *
 * Kender vi beløbet, sendes det som et køb. Gør vi ikke — og det gør vi ikke
 * ved en fornyelse, appen selv opdager, for RevenueCat oplyser ikke prisen —
 * sendes Subscribe uden beløb. Så kan Meta se, at kunden blev, uden at
 * omsætningen bliver gættet.
 */
export async function logMetaSubscriptionRenewed({ amount, currency, productId } = {}) {
  if (!SEND_PURCHASES_FROM_APP) return false;

  const value = Number(amount);
  if (Number.isFinite(value) && value > 0 && currency) {
    return logMetaPurchase(value, currency, {
      fb_content_id: productId,
      cns_purchase_kind: 'renewal',
    });
  }

  return logMetaEvent(EVENT.subscribe, {
    fb_content_id: productId,
    cns_purchase_kind: 'renewal',
  });
}

/**
 * Lægger broen på window, så en side i Base44 kan kalde den uden at importere
 * noget. Begge veje virker — importér funktionerne, eller brug
 * window.MetaEvents.logEvent('cns_noget').
 */
export function exposeMetaEventsOnWindow() {
  if (typeof window === 'undefined') return;
  window.MetaEvents = {
    logEvent: logMetaEvent,
    logPurchase: logMetaPurchase,
    requestTracking: requestMetaTracking,
    getTrackingStatus: getMetaTrackingStatus,
    firstOpen: logMetaFirstOpen,
    onboardingComplete: logMetaOnboardingComplete,
    trialStarted: logMetaTrialStarted,
    purchaseCompleted: logMetaPurchaseCompleted,
    subscriptionRenewed: logMetaSubscriptionRenewed,
    syncRevenueCat: syncMetaAttributesToRevenueCat,
  };
}

/**
 * Husker, hvornår brugerens seneste køb blev gjort, og melder en fornyelse,
 * når datoen flytter sig.
 *
 * RevenueCat fortæller ikke appen, at et abonnement er fornyet — det sker, mens
 * appen er lukket. Men `latestPurchaseDate` på rettigheden flytter sig, og det
 * kan ses, næste gang appen åbnes. Første gang gemmes datoen uden at sende
 * noget: ellers ville alle nuværende abonnenter melde en fornyelse, den dag
 * opdateringen kommer ud.
 *
 * Fornyelser kommer mere præcist fra RevenueCats egen Meta-integration, som
 * ser dem med det samme. Se SEND_PURCHASES_FROM_APP ovenfor.
 */
export async function reportMetaRenewalIfAny(customerInfo) {
  if (!Capacitor.isNativePlatform()) return false;

  const active = customerInfo?.entitlements?.active;
  if (!active) return false;

  let latest = null;
  let productId = null;
  for (const entitlement of Object.values(active)) {
    const date = entitlement?.latestPurchaseDate;
    if (!date) continue;
    if (!latest || new Date(date) > new Date(latest)) {
      latest = date;
      productId = entitlement?.productIdentifier || null;
    }
  }
  if (!latest) return false;

  const previous = readLocal(LAST_PURCHASE_KEY);
  writeLocal(LAST_PURCHASE_KEY, latest);

  if (!previous) return false;
  if (new Date(latest) <= new Date(previous)) return false;

  return logMetaSubscriptionRenewed({ productId });
}

/** Skrives ned, så et køb lige nu ikke også bliver meldt som en fornyelse. */
export function rememberMetaPurchaseDate(customerInfo) {
  const active = customerInfo?.entitlements?.active;
  if (!active) return;
  let latest = null;
  for (const entitlement of Object.values(active)) {
    const date = entitlement?.latestPurchaseDate;
    if (!date) continue;
    if (!latest || new Date(date) > new Date(latest)) latest = date;
  }
  if (latest) writeLocal(LAST_PURCHASE_KEY, latest);
}
