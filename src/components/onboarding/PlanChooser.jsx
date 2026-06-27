import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useRevenueCat } from '@/components/subscription/useRevenueCat';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { base44 } from '@/api/base44Client';
import { openInSystemBrowser } from '@/lib/openExternalUrl';

const STORE_LABELS = {
  ios: { name: 'App Store', planKey: 'appstore', sub: 'Betal via din App Store-konto · Bedst til iPhone' },
  android: { name: 'Google Play', planKey: 'googleplay', sub: 'Betal via din Google-konto · Bedst til Android' },
};

function AppStoreGlyph({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 814 1000" fill={color}>
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-150.3-109.2c-44.3-64.7-82.6-170.4-82.6-271.1 0-169.6 110.7-259.3 219.7-259.3 75.4 0 138.4 45.5 186 45.5 45.5 0 116.9-48.1 200.9-48.1 32.5 0 116.3 3.2 171.8 73.9zm-215.6-104.3c31.2-37 52.3-88.7 52.3-140.3 0-7.1-.6-14.3-1.9-20.1-49.4 1.9-108.2 33.1-143.7 75.4-27.6 31.9-53.5 83.6-53.5 136.2 0 7.7 1.3 15.5 1.9 17.9 3.2.6 8.4 1.3 13.6 1.3 44.3 0 98.5-29.9 131.3-70.4z"/>
    </svg>
  );
}

function GooglePlayGlyph({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 512 512" fill={color}>
      <path d="M99.6 8.1C91 14.5 86 24.9 86 37.6v436.8c0 12.7 5 23.1 13.6 29.5l229.6-251.9L99.6 8.1zm245.1 245.9l54.7-54.7-198-114.7L325.9 218 344.7 254zm0 4.1L325.9 294l-144.5 134.4 198-114.7-54.7-54.6zM426 219.4l-44.6-25.8-58.7 62.5 58.7 62.4 44.6-25.7c19.9-11.5 30-26.4 30-36.7s-10.1-25.2-30-36.7z"/>
    </svg>
  );
}

export default function PlanChooser({ onChoose, finishing }) {
  const [selected, setSelected] = useState(null);
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  const [testerCheckoutLoading, setTesterCheckoutLoading] = useState(false);
  const { offerings, purchase } = useRevenueCat();

  const platform = Capacitor.getPlatform();
  const store = platform === 'android' ? STORE_LABELS.android : STORE_LABELS.ios;

  const handlePurchase = async () => {
    if (window.self !== window.top) {
      alert('Betaling virker kun fra den publicerede app, ikke fra forhåndsvisningen.');
      return;
    }
    // Must run in native Capacitor environment (iOS or Android app)
    const isNative = Capacitor.isNativePlatform();
    console.log('[IAP] isNativePlatform:', isNative, '| platform:', platform);
    if (!isNative) {
      toast.error(`${store.name}-køb virker kun i appen. Platform: ${platform}`);
      return;
    }
    // Try 'current' (default offering) first, then fall back to any available offering
    const offering = offerings?.current || Object.values(offerings?.all || {})[0];
    const pkg = offering?.availablePackages?.[0];
    if (!pkg) {
      toast.error('Ingen tilgængelige pakker fundet. Prøv igen.');
      return;
    }
    setLoadingPurchase(true);
    try {
      await purchase(pkg);
      if (onChoose) onChoose(store.planKey);
    } catch (err) {
      if (!err.message?.includes('cancelled') && !err.message?.includes('userCancelled')) {
        toast.error('Købet mislykkedes. Prøv igen.');
      }
    } finally {
      setLoadingPurchase(false);
    }
  };

  // TEMPORÆR workaround mens IAP afventer App Store/Play Console-opsætning:
  // sender beta-testere til Stripe checkout i systembrowseren, hvor de kan
  // indtaste en rabatkode (fx 6 måneders gratis abonnement). Fjern når IAP virker.
  const handleTesterCheckout = async () => {
    setTesterCheckoutLoading(true);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {});
      if (response.data?.url) {
        openInSystemBrowser(response.data.url);
      } else {
        console.error('[PlanChooser] createCheckoutSession returned no url:', response.data);
        toast.error('Kunne ikke starte betaling. Prøv igen.');
      }
    } catch (e) {
      console.error('[PlanChooser] Tester checkout error:', e);
      toast.error(e?.message || 'Kunne ikke starte betaling. Prøv igen.');
    } finally {
      setTesterCheckoutLoading(false);
    }
  };

  return (
    <motion.div
      key="plan"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '1.8rem',
          fontWeight: 400,
          color: 'var(--color-text-primary)',
          margin: '0 0 0.5rem',
        }}>
          Vælg betalingsmetode
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
          59 kr. / måned · Ingen binding · Opsig når som helst
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>

        {/* App Store / Google Play — kun den relevante platform vises */}
        <button
          onClick={() => setSelected(store.planKey)}
          style={{
            width: '100%',
            background: selected === store.planKey ? 'linear-gradient(135deg, #3A2416, #5B3F2B)' : 'var(--color-bg-card)',
            border: selected === store.planKey ? '2px solid #3A2416' : '2px solid var(--color-border)',
            borderRadius: 18,
            padding: '1.4rem 1.5rem',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48,
              borderRadius: 12,
              backgroundColor: selected === store.planKey ? 'rgba(255,255,255,0.15)' : 'var(--color-bg-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {platform === 'android'
                ? <GooglePlayGlyph color={selected === store.planKey ? '#fff' : '#5B3F2B'} />
                : <AppStoreGlyph color={selected === store.planKey ? '#fff' : '#5B3F2B'} />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: selected === store.planKey ? '#fff' : 'var(--color-text-primary)', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 3px' }}>
                Abonnement via {store.name}
              </p>
              <p style={{ color: selected === store.planKey ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)', fontSize: '0.78rem', margin: 0 }}>
                {store.sub}
              </p>
            </div>
            {selected === store.planKey && (
              <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#C29A73', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={13} color="#fff" />
              </div>
            )}
          </div>
        </button>

      </div>

      {/* CTA */}
      <button
        onClick={selected === store.planKey ? handlePurchase : undefined}
        disabled={!selected || loadingPurchase}
        style={{
          width: '100%',
          backgroundColor: selected && !loadingPurchase ? '#3A2416' : '#C8B8A8',
          color: '#fff',
          border: 'none',
          borderRadius: 14,
          padding: '16px',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: selected && !loadingPurchase ? 'pointer' : 'default',
          transition: 'background-color 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {loadingPurchase
          ? <><Loader2 size={18} className="animate-spin" /> Behandler køb…</>
          : !selected ? 'Vælg en betalingsmetode'
          : `Køb via ${store.name} →`}
      </button>

      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textAlign: 'center', marginTop: '1rem' }}>
        🔒 Sikker betaling · Ingen binding · Annuller når som helst
      </p>

      {/* Skip-knap — giver kun adgang til demo */}
      <button
        onClick={() => onChoose && onChoose('demo')}
        disabled={finishing || loadingPurchase}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          color: 'var(--color-text-muted)',
          fontSize: '0.82rem',
          marginTop: '1.2rem',
          padding: '8px',
          cursor: finishing || loadingPurchase ? 'default' : 'pointer',
          opacity: finishing ? 0.6 : 1,
          textDecoration: 'underline',
          textDecorationColor: 'var(--color-border)',
          textUnderlineOffset: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        {finishing
          ? <><Loader2 size={14} className="animate-spin" /> Et øjeblik…</>
          : 'Spring over — fortsæt med begrænset adgang'}
      </button>

      {/* TEMPORÆR: beta-tester / rabatkode-vej via Stripe, mens IAP afventer App Store/Play Console-opsætning */}
      <button
        onClick={handleTesterCheckout}
        disabled={testerCheckoutLoading || finishing}
        style={{
          width: '100%',
          background: 'none',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
          color: 'var(--color-text-secondary)',
          fontSize: '0.82rem',
          marginTop: '0.75rem',
          padding: '10px',
          cursor: testerCheckoutLoading || finishing ? 'default' : 'pointer',
          opacity: testerCheckoutLoading ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        {testerCheckoutLoading
          ? <><Loader2 size={14} className="animate-spin" /> Åbner betaling…</>
          : 'Har du en rabatkode? (beta-test)'}
      </button>
    </motion.div>
  );
}