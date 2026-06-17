import { useState, useEffect } from 'react';

const RC_API_KEY = 'rcb_xEWZIvyWYtatYqkMITsSxzXyYbKp';

let _rcInstance = null;
let _rcReady = false;

/**
 * RevenueCat Web SDK hook — bruges til iOS IAP via App Store.
 * Initialiseres kun når Purchases-js er tilgængeligt og brugeren er logget ind.
 */
export function useRevenueCat(userId) {
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        const { Purchases } = await import('@revenuecat/purchases-js');

        if (!_rcReady) {
          _rcInstance = Purchases.configure(RC_API_KEY, userId);
          _rcReady = true;
        }

        const [offeringsResult, customerInfoResult] = await Promise.all([
          _rcInstance.getOfferings(),
          _rcInstance.getCustomerInfo(),
        ]);

        setOfferings(offeringsResult);
        setCustomerInfo(customerInfoResult);
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
    if (!_rcInstance) throw new Error('RevenueCat ikke initialiseret');
    const result = await _rcInstance.purchase({ rcPackage: packageToPurchase });
    setCustomerInfo(result.customerInfo);
    return result;
  };

  const restorePurchases = async () => {
    if (!_rcInstance) throw new Error('RevenueCat ikke initialiseret');
    const info = await _rcInstance.restorePurchases();
    setCustomerInfo(info);
    return info;
  };

  const isSubscribed = customerInfo?.entitlements?.active
    ? Object.keys(customerInfo.entitlements.active).length > 0
    : false;

  return { loading, offerings, customerInfo, isSubscribed, error, purchase, restorePurchases };
}

export function resetRevenueCat() {
  _rcInstance = null;
  _rcReady = false;
}