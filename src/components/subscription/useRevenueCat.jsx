import { useState, useEffect, useCallback } from 'react';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { base44 } from '@/api/base44Client';
import { isNativeApp } from '@/lib/platform';

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
    if (!isNativeApp()) return;
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
      const native = isNativeApp();
      setIsNative(native);

      // RevenueCat virker kun på native (iOS/Android) — spring over på web
      if (!native) {
        setLoading(false);
        return;
      }

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
        setOfferings(result.offerings);

        // Tjek om brugeren allerede har et aktivt abonnement
        await refreshCustomerInfo();
      } catch (err) {
        console.error('[RevenueCat] init error:', err);
        setError(err.message || 'RevenueCat fejl');
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