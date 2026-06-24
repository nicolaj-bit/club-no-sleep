import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { base44 } from '@/api/base44Client';

const RC_API_KEY = 'appl_wnxSPgRzCNCnElnssJGLPnIPbRZ';

let _configured = false;

async function configure(userId) {
  if (_configured) return;
  await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
  await Purchases.configure({ apiKey: RC_API_KEY, appUserID: userId ?? null });
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
      // Brug Capacitor.isNativePlatform() til visning, men lad være med
      // at springe over — i nogle TestFlight builds kan den returnere false
      // selvom native bridge faktisk er tilgængelig. Vi forsøger altid at
      // konfigurere; hvis det fejler, vises fejlen i stedet.
      const native = Capacitor.isNativePlatform();
      setIsNative(native);

      try {
        let rcUserId = userId || null;
        if (!rcUserId) {
          try {
            const user = await base44.auth.me();
            rcUserId = user?.id || null;
          } catch (_) {
            // Not logged in — use anonymous RevenueCat ID
          }
        }
        await configure(rcUserId);
        const result = await Purchases.getOfferings();
        console.log('[RevenueCat] offerings raw:', JSON.stringify(result?.offerings));
        console.log('[RevenueCat] current offering:', result?.offerings?.current ? 'found' : 'NULL');
        console.log('[RevenueCat] all offering keys:', result?.offerings?.all ? Object.keys(result.offerings.all) : 'none');
        console.log('[RevenueCat] available packages:', result?.offerings?.current?.availablePackages?.length ?? 0);
        if (result?.offerings?.current?.availablePackages?.[0]) {
          console.log('[RevenueCat] first package product:', result.offerings.current.availablePackages[0].product?.identifier);
        }
        setOfferings(result.offerings);

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