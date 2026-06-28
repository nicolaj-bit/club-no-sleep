import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useRevenueCat } from '@/components/subscription/useRevenueCat';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { useLanguage } from '@/components/ui/LanguageContext';

export default function PlanChooser({ onChoose }) {
  const [selected, setSelected] = useState(null);
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  const { offerings, purchase } = useRevenueCat();
  const { t } = useLanguage();

  const handleAppStore = async () => {
    if (window.self !== window.top) {
      alert(t.landingPreviewAlert);
      return;
    }
    // Must run in native Capacitor environment (iOS app)
    const isNative = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform();
    console.log('[IAP] isNativePlatform:', isNative, '| platform:', platform);
    if (!isNative) {
      toast.error(`App Store ${t.purchaseOnlyInApp} ${platform}`);
      return;
    }
    // Try 'current' (default offering) first, then fall back to any available offering
    const offering = offerings?.current || Object.values(offerings?.all || {})[0];
    const pkg = offering?.availablePackages?.[0];
    if (!pkg) {
      toast.error(t.noPackagesFound);
      return;
    }
    setLoadingPurchase(true);
    try {
      await purchase(pkg);
      if (onChoose) onChoose('appstore');
    } catch (err) {
      if (!err.message?.includes('cancelled') && !err.message?.includes('userCancelled')) {
        toast.error(t.purchaseFailed);
      }
    } finally {
      setLoadingPurchase(false);
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
          {t.choosePaymentMethod}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
          {t.pricingSubtitle}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>

        {/* App Store */}
        <button
          onClick={() => setSelected('appstore')}
          style={{
            width: '100%',
            background: selected === 'appstore' ? 'linear-gradient(135deg, #3A2416, #5B3F2B)' : 'var(--color-bg-card)',
            border: selected === 'appstore' ? '2px solid #3A2416' : '2px solid var(--color-border)',
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
              backgroundColor: selected === 'appstore' ? 'rgba(255,255,255,0.15)' : 'var(--color-bg-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="24" height="24" viewBox="0 0 814 1000" fill={selected === 'appstore' ? '#fff' : '#5B3F2B'}>
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-150.3-109.2c-44.3-64.7-82.6-170.4-82.6-271.1 0-169.6 110.7-259.3 219.7-259.3 75.4 0 138.4 45.5 186 45.5 45.5 0 116.9-48.1 200.9-48.1 32.5 0 116.3 3.2 171.8 73.9zm-215.6-104.3c31.2-37 52.3-88.7 52.3-140.3 0-7.1-.6-14.3-1.9-20.1-49.4 1.9-108.2 33.1-143.7 75.4-27.6 31.9-53.5 83.6-53.5 136.2 0 7.7 1.3 15.5 1.9 17.9 3.2.6 8.4 1.3 13.6 1.3 44.3 0 98.5-29.9 131.3-70.4z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: selected === 'appstore' ? '#fff' : 'var(--color-text-primary)', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 3px' }}>
                {t.subscriptionViaStore} App Store
              </p>
              <p style={{ color: selected === 'appstore' ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)', fontSize: '0.78rem', margin: 0 }}>
                {t.storeSubApple}
              </p>
            </div>
            {selected === 'appstore' && (
              <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#C29A73', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={13} color="#fff" />
              </div>
            )}
          </div>
        </button>

      </div>

      {/* CTA */}
      <button
        onClick={selected === 'appstore' ? handleAppStore : undefined}
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
          ? <><Loader2 size={18} className="animate-spin" /> {t.processingPurchase}</>
          : !selected ? t.selectPaymentMethod
          : `${t.buyVia} App Store →`}
      </button>

      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textAlign: 'center', marginTop: '1rem' }}>
        {t.securePaymentNote}
      </p>

      {/* Skip-knap — giver kun adgang til demo */}
      <button
        onClick={() => onChoose && onChoose('demo')}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          color: 'var(--color-text-muted)',
          fontSize: '0.82rem',
          marginTop: '1.2rem',
          padding: '8px',
          cursor: 'pointer',
          textDecoration: 'underline',
          textDecorationColor: 'var(--color-border)',
          textUnderlineOffset: 3,
        }}
      >
        {t.skipLimitedAccess}
      </button>
    </motion.div>
  );
}