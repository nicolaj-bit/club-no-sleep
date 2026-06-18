import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check } from 'lucide-react';

export default function PlanChooser({ onChoose }) {
  const [selected, setSelected] = useState(null);

  const handleStripe = () => {
    if (window.self !== window.top) {
      alert('Betaling virker kun fra den publicerede app, ikke fra forhåndsvisningen.');
      return;
    }
    window.location.href = 'https://buy.stripe.com/00wdR9eRue256hG11J3cc00';
  };

  const handleAppStore = () => {
    if (window.self !== window.top) {
      alert('Betaling virker kun fra den publicerede app, ikke fra forhåndsvisningen.');
      return;
    }
    window.location.href = 'https://pay.rev.cat/sugwsgqahvhlwgat/rc-d2291fc209';
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
                In-App Purchase (App Store)
              </p>
              <p style={{ color: selected === 'appstore' ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)', fontSize: '0.78rem', margin: 0 }}>
                Betal via din Apple-konto · Bedst til iPhone
              </p>
            </div>
            {selected === 'appstore' && (
              <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#C29A73', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={13} color="#fff" />
              </div>
            )}
          </div>
        </button>

        {/* Stripe */}
        <button
          onClick={() => setSelected('stripe')}
          style={{
            width: '100%',
            background: selected === 'stripe' ? 'linear-gradient(135deg, #3A2416, #5B3F2B)' : 'var(--color-bg-card)',
            border: selected === 'stripe' ? '2px solid #3A2416' : '2px solid var(--color-border)',
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
              backgroundColor: selected === 'stripe' ? 'rgba(255,255,255,0.15)' : 'var(--color-bg-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <CreditCard size={24} color={selected === 'stripe' ? '#fff' : '#5B3F2B'} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: selected === 'stripe' ? '#fff' : 'var(--color-text-primary)', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 3px' }}>
                Kort / MobilePay (Stripe)
              </p>
              <p style={{ color: selected === 'stripe' ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)', fontSize: '0.78rem', margin: 0 }}>
                Betal med kort, MobilePay el. anden metode
              </p>
            </div>
            {selected === 'stripe' && (
              <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#C29A73', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={13} color="#fff" />
              </div>
            )}
          </div>
        </button>
      </div>

      {/* CTA */}
      <button
        onClick={selected === 'stripe' ? handleStripe : selected === 'appstore' ? handleAppStore : undefined}
        disabled={!selected}
        style={{
          width: '100%',
          backgroundColor: selected ? '#3A2416' : '#C8B8A8',
          color: '#fff',
          border: 'none',
          borderRadius: 14,
          padding: '16px',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: selected ? 'pointer' : 'default',
          transition: 'background-color 0.2s',
        }}
      >
        {!selected ? 'Vælg en betalingsmetode' : selected === 'stripe' ? 'Fortsæt til betaling →' : 'Fortsæt til App Store →'}
      </button>

      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textAlign: 'center', marginTop: '1rem' }}>
        🔒 Sikker betaling · Ingen binding · Annuller når som helst
      </p>
    </motion.div>
  );
}