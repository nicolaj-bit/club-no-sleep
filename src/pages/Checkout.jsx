import React, { useState } from 'react';
import { CreditCard, Check, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Checkout() {
  const [selected, setSelected] = useState(null);

  const handleStripe = async () => {
    if (window.self !== window.top) {
      alert('Betaling virker kun fra den publicerede app, ikke fra forhåndsvisningen.');
      return;
    }
    window.location.href = 'https://buy.stripe.com/00wdR9eRue256hG11J3cc00';
  };

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: '#F5EDE0',
      fontFamily: "'Inter', -apple-system, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '3rem 1.5rem',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap');
      `}</style>

      {/* Back */}
      <div style={{ width: '100%', maxWidth: 480, marginBottom: '2rem' }}>
        <button
          onClick={() => window.history.back()}
          style={{ background: 'none', border: 'none', color: '#7A665A', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={16} /> Tilbage
        </button>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', maxWidth: 400 }}>
        <img
          src="https://media.base44.com/images/public/699f47a86e7e0a874d1159ed/4d581f250_Ikon.png"
          alt="Club No Sleep"
          style={{ width: 64, height: 64, borderRadius: 16, marginBottom: '1.2rem', objectFit: 'contain' }}
        />
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '2.2rem',
          fontWeight: 400,
          color: '#1E140A',
          margin: '0 0 0.6rem',
        }}>
          Vælg betalingsmetode
        </h1>
        <p style={{ color: '#7A665A', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
          59 kr. / måned · Ingen binding · Opsig når som helst
        </p>
      </div>

      {/* Options */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>

        {/* Stripe */}
        <button
          onClick={() => setSelected('stripe')}
          style={{
            width: '100%',
            background: selected === 'stripe' ? 'linear-gradient(135deg, #3A2416, #5B3F2B)' : '#FFFDF9',
            border: selected === 'stripe' ? '2px solid #3A2416' : '2px solid #E2D0BC',
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
              backgroundColor: selected === 'stripe' ? 'rgba(255,255,255,0.15)' : '#F3E9E1',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <CreditCard size={24} color={selected === 'stripe' ? '#fff' : '#5B3F2B'} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: selected === 'stripe' ? '#fff' : '#1E140A', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 3px' }}>
                Kort / MobilePay (Stripe)
              </p>
              <p style={{ color: selected === 'stripe' ? 'rgba(255,255,255,0.7)' : '#7A665A', fontSize: '0.78rem', margin: 0 }}>
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
      <div style={{ width: '100%', maxWidth: 480 }}>
        <button
          onClick={selected === 'stripe' ? handleStripe : undefined}
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
          {!selected ? 'Vælg betalingsmetode' : 'Fortsæt til betaling →'}
        </button>

        <p style={{ color: '#9A7A6A', fontSize: '0.75rem', textAlign: 'center', marginTop: '1rem' }}>
          🔒 Sikker betaling · Ingen binding · Annuller når som helst
        </p>
      </div>
    </div>
  );
}