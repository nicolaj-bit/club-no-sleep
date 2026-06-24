import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

// Wanilla app ID — erstattes med dit rigtige ID fra Wanilla dashboard
// Tilmeld dig på https://wanilla.co og forbind din Base44 app
const WANILLA_APP_ID = 'YOUR_WANILLA_APP_ID';

// App Store Connect produkt-ID for det månedlige abonnement
const PRODUCT_ID = 'club_nosleep_monthly';

let _initialized = false;

function waitForWanilla(maxWaitMs = 5000) {
  return new Promise((resolve, reject) => {
    if (window.Wanilla) return resolve(window.Wanilla);
    const start = Date.now();
    const interval = setInterval(() => {
      if (window.Wanilla) {
        clearInterval(interval);
        resolve(window.Wanilla);
      } else if (Date.now() - start > maxWaitMs) {
        clearInterval(interval);
        reject(new Error('Wanilla SDK ikke indlæst'));
      }
    }, 200);
  });
}

export function useWanilla() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (WANILLA_APP_ID === 'YOUR_WANILLA_APP_ID') {
        setError('Wanilla app ID ikke konfigureret. Tilmeld dig på wanilla.co og tilføj dit app ID i useWanilla.jsx');
        setLoading(false);
        return;
      }
      try {
        const Wanilla = await waitForWanilla();
        Wanilla.init({ appId: WANILLA_APP_ID });
        _initialized = true;
        setReady(true);
      } catch (err) {
        setError(err.message || 'Kunne ikke initialisere Wanilla');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const purchase = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!_initialized || !window.Wanilla) {
        reject(new Error('Wanilla ikke klar'));
        return;
      }
      window.Wanilla.iap.purchase(PRODUCT_ID, {
        onSuccess: (receipt) => resolve(receipt),
        onError: (err) => reject(err),
      });
    });
  }, []);

  const restorePurchases = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!_initialized || !window.Wanilla) {
        reject(new Error('Wanilla ikke klar'));
        return;
      }
      window.Wanilla.iap.restore({
        onSuccess: (result) => resolve(result),
        onError: (err) => reject(err),
      });
    });
  }, []);

  return { loading, error, ready, purchase, restorePurchases };
}