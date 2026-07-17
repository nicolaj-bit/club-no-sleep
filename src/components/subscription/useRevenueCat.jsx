import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { base44 } from '@/api/base44Client';

const RC_API_KEY_IOS = 'appl_wnxSPgRzCNCnElnssJGLPnIPbRZ';
// TODO: indsæt den rigtige Android-nøgle fra RevenueCat, når Play Console-appen
// og abonnementsproduktet er sat op (se RevenueCat dashboard > Project settings > API keys).
const RC_API_KEY_ANDROID = 'goog_REPLACE_WITH_ANDROID_KEY';

function getApiKeyForPlatform() {
  return Capacitor.getPlatform() === 'android' ? RC_API_KEY_ANDROID : RC_API_KEY_IOS;
}

let _configured = false;

async function configure(userId) {
  if (_configured) return;
  await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
  await Purchases.configure({ apiKey: getApiKeyForPlatform(), appUserID: userId ?? null });
  _configured = true;
}

export function useRevenueCat(userId) {
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState(null);
  const [error, setError] = useState(null);
  const [isNative, setIsNative] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);

  const refreshCustomerInfo = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      const active = info?.entitlements?.active && Object.keys(info.entitlements.active).length > 0;
      setIsSubscribed(active);
      return active;
    } catch (err) {
      console.error('[RevenueCat] getCustomerInfo error:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const native = Capacitor.isNativePlatform();
      setIsNative(native);

      // RevenueCat Capacitor plugin virker kun med en native bridge.
      // Base44 native apps kører i en WebView uden Capacitor bridge,
      // så plugin'et kaster "Web not supported in this plugin".
      // Spring over på web/WebView for at undgå fejlen.
      if (!native) {
        setLoading(false);
        return;
      }

      try {
        // RevenueCat-webhooket matcher altid på UserProfile.user_email, så
        // appUserID skal være emailen — ikke user.id — ellers fejler matchet.
        let rcUserId = userId || null;
        if (!rcUserId) {
          try {
            const user = await base44.auth.me();
            rcUserId = user?.email || null;
          } catch (_) {
            // Not logged in — use anonymous RevenueCat ID
          }
        }
        await configure(rcUserId);
        // KRITISK FIX — MÅ IKKE RULLES TILBAGE: getOfferings() returnerer { all, current } direkte
        const result = await Purchases.getOfferings();
        console.log('[RevenueCat] offerings raw:', JSON.stringify(result));
        console.log('[RevenueCat] current offering:', result?.current ? 'found' : 'NULL');
        console.log('[RevenueCat] all offering keys:', result?.all ? Object.keys(result.all) : 'none');
        console.log('[RevenueCat] available packages:', result?.current?.availablePackages?.length ?? 0);
        if (result?.current?.availablePackages?.[0]) {
          console.log('[RevenueCat] first package product:', result.current.availablePackages[0].product?.identifier);
        }
        setOfferings(result);

        // Tjek om brugeren allerede har et aktivt abonnement
        await refreshCustomerInfo();
      } catch (err) {
        console.error('[RevenueCat] init error:', err);
        // RevenueCat errors kan have forskellige strukturer —fang så mange detaljer som muligt
        const errMsg = err?.message || err?.error?.message || err?.underlyingErrorMessage || err?.code || (typeof err === 'string' ? err : JSON.stringify(err));
        setError(errMsg && errMsg !== '{}' ? errMsg : 'RevenueCat fejl');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [userId]);

  const purchase = async (packageToPurchase) => {
    const result = await Purchases.purchasePackage({ aPackage: packageToPurchase });
    await refreshCustomerInfo();
    return result;
  };

  const restorePurchases = async () => {
    const result = await Purchases.restorePurchases();
    await refreshCustomerInfo();
    return result.customerInfo;
  };

  return { loading, offerings, error, purchase, restorePurchases, isNative, isSubscribed, customerInfo, refreshCustomerInfo };
}

export function resetRevenueCat() {
  _configured = false;
}