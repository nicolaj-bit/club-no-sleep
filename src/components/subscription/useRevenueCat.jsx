import { useState, useEffect } from 'react';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { base44 } from '@/api/base44Client';

const RC_API_KEY = 'appl_wnxSPgRzCNCnElnssJGLPnIPbRZ';

let _configured = false;

async function configure(userId) {
  if (_configured) return;
  await Purchases.setLogLevel({ level: LOG_LEVEL.ERROR });
  // appUserID is optional — pass null to let RevenueCat generate an anonymous ID
  await Purchases.configure({ apiKey: RC_API_KEY, appUserID: userId ?? null });
  _configured = true;
}

export function useRevenueCat() {
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Try to get user ID — fall back to anonymous if not logged in
        let userId = null;
        try {
          const user = await base44.auth.me();
          userId = user?.id || null;
        } catch (_) {
          // Not logged in — use anonymous RevenueCat ID
        }
        await configure(userId);
        const result = await Purchases.getOfferings();
        setOfferings(result.offerings);
      } catch (err) {
        console.error('[RevenueCat] init error:', err);
        setError(err.message || 'RevenueCat fejl');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const purchase = async (packageToPurchase) => {
    const result = await Purchases.purchasePackage({ aPackage: packageToPurchase });
    return result;
  };

  const restorePurchases = async () => {
    const result = await Purchases.restorePurchases();
    return result.customerInfo;
  };

  return { loading, offerings, error, purchase, restorePurchases };
}

export function resetRevenueCat() {
  _configured = false;
}