import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { base44 } from '@/api/base44Client';
import { syncOneSignalTags } from '@/lib/syncOneSignalTags';

const RC_API_KEY_IOS = 'appl_wnxSPgRzCNCnElnssJGLPnIPbRZ';
const RC_API_KEY_ANDROID = 'goog_UDgCHKbxGVPzooBzJOglqUUAtnS';

function getApiKeyForPlatform() {
  return Capacitor.getPlatform() === 'android' ? RC_API_KEY_ANDROID : RC_API_KEY_IOS;
}

let _configured = false;
let _configuring = false;

async function configure(userId) {
  if (_configured) return true;
  if (_configuring) return false;
  _configuring = true;
  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    await Purchases.configure({ apiKey: getApiKeyForPlatform(), appUserID: userId ?? null });
    _configured = true;
    return true;
  } catch (err) {
    // RevenueCat må ALDRIG crashe eller blokere appen — log stille og fortsæt
    console.error('[RevenueCat] configure failed (non-blocking):', err?.message || err);
    return false;
  } finally {
    _configuring = false;
  }
}

export function useRevenueCat(userId) {
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState(null);
  const [error, setError] = useState(null);
  const [isNative, setIsNative] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [trialEligibility, setTrialEligibility] = useState('unknown');

  const refreshCustomerInfo = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      const active = info?.entitlements?.active && Object.keys(info.entitlements.active).length > 0;
      setIsSubscribed(active);
      return active;
    } catch (err) {
      console.error('[RevenueCat] getCustomerInfo error (non-blocking):', err?.message || err);
      return false;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const native = Capacitor.isNativePlatform();
      setIsNative(native);

      // RevenueCat Capacitor plugin virker kun med en native bridge.
      // Spring over på web/WebView for at undgå fejlen.
      if (!native) {
        setLoading(false);
        return;
      }

      // Kør init asynkront og lad resten af appen rendre uafhængigt.
      // Enhver fejl logges stille og appen fortsætter uden købsmulighed.
      try {
        let rcUserId = userId || null;
        if (!rcUserId) {
          try {
            const user = await base44.auth.me();
            rcUserId = user?.email || null;
          } catch (_) {
            // Not logged in — use anonymous RevenueCat ID
          }
        }

        const ok = await configure(rcUserId);
        if (!ok) {
          // RevenueCat kunne ikke konfigureres — lad appen fortsætte normalt
          setLoading(false);
          return;
        }

        // KRITISK FIX — MÅ IKKE RULLES TILBAGE: getOfferings() returnerer { all, current } direkte
        try {
          const result = await Purchases.getOfferings();
          console.log('[RevenueCat] offerings raw:', JSON.stringify(result));
          console.log('[RevenueCat] current offering:', result?.current ? 'found' : 'NULL');
          console.log('[RevenueCat] all offering keys:', result?.all ? Object.keys(result.all) : 'none');
          console.log('[RevenueCat] available packages:', result?.current?.availablePackages?.length ?? 0);
          if (result?.current?.availablePackages?.[0]) {
            console.log('[RevenueCat] first package product:', result.current.availablePackages[0].product?.identifier);
          }
          setOfferings(result);

          // Tjek trial/intro-eligibility for første package
          try {
            const productId = result?.current?.availablePackages?.[0]?.product?.identifier;
            if (productId) {
              const elig = await Purchases.checkTrialOrIntroductoryPriceEligibility({
                productIdentifiers: [productId]
              });
              const status = elig?.[productId];
              setTrialEligibility(
                status === 'eligible' ? 'eligible' :
                status === 'ineligible' ? 'ineligible' : 'unknown'
              );
            }
          } catch (eligErr) {
            console.error('[RevenueCat] trial eligibility check failed (non-blocking):', eligErr?.message || eligErr);
          }
        } catch (offErr) {
          console.error('[RevenueCat] getOfferings failed (non-blocking):', offErr?.message || offErr);
        }

        // Tjek om brugeren allerede har et aktivt abonnement
        try {
          await refreshCustomerInfo();
        } catch (ciErr) {
          console.error('[RevenueCat] refreshCustomerInfo failed (non-blocking):', ciErr?.message || ciErr);
        }
      } catch (err) {
        console.error('[RevenueCat] init error (non-blocking):', err?.message || err);
        const errMsg = err?.message || err?.error?.message || err?.underlyingErrorMessage || err?.code || (typeof err === 'string' ? err : JSON.stringify(err));
        setError(errMsg && errMsg !== '{}' ? errMsg : 'RevenueCat fejl');
      } finally {
        setLoading(false);
      }
    };
    // Fire-and-forget — blokerer aldrig UI/opstart
    init();
  }, [userId]);

  // Sync OneSignal subscription tags whenever RC entitlement or trial eligibility changes
  useEffect(() => {
    if (!isNative) return;
    const trialUsed = trialEligibility === 'ineligible';
    syncOneSignalTags(isSubscribed, trialUsed);
  }, [isSubscribed, trialEligibility, isNative]);

  const purchase = async (packageToPurchase) => {
    try {
      const result = await Purchases.purchasePackage({ aPackage: packageToPurchase });
      await refreshCustomerInfo();
      return result;
    } catch (err) {
      console.error('[RevenueCat] purchase failed (non-blocking):', err?.message || err);
      throw err;
    }
  };

  const restorePurchases = async () => {
    try {
      const result = await Purchases.restorePurchases();
      await refreshCustomerInfo();
      return result.customerInfo;
    } catch (err) {
      console.error('[RevenueCat] restorePurchases failed (non-blocking):', err?.message || err);
      throw err;
    }
  };

  return { loading, offerings, error, purchase, restorePurchases, isNative, isSubscribed, customerInfo, refreshCustomerInfo, trialEligibility };
}

export function resetRevenueCat() {
  _configured = false;
  _configuring = false;
}