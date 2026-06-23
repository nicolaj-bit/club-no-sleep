import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { openExternalUrl } from '@/lib/nativeAuth';
import { isNativeApp } from '@/lib/platform';
import { Loader2 } from 'lucide-react';

/**
 * Checkout — sender brugeren direkte til betaling.
 * Native: videresender til /Subscription som håndterer RevenueCat IAP.
 * Web: opretter Stripe checkout session og redirecter.
 */
export default function Checkout() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      // Native: brug Subscription-siden som håndterer RevenueCat IAP
      if (isNativeApp()) {
        navigate('/Subscription', { replace: true });
        return;
      }

      // Iframe-beskyttelse
      if (window.self !== window.top) {
        setError('Betaling virker kun fra den publicerede app, ikke fra forhåndsvisningen.');
        return;
      }

      // Web: opret Stripe checkout session og redirect
      try {
        const response = await base44.functions.invoke('createCheckoutSession', {});
        if (response.data?.url) {
          window.location.href = response.data.url;
        } else {
          setError('Kunne ikke starte betaling. Prøv igen.');
        }
      } catch (e) {
        console.error('Checkout error:', e);
        setError('Kunne ikke starte betaling. Prøv igen.');
      }
    };
    run();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-primary)' }}>{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
        >
          Tilbage
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Starter betaling…</p>
      </div>
    </div>
  );
}