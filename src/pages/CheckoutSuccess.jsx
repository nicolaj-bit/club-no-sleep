import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CheckoutSuccess() {
  const [isAuth, setIsAuth] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      setIsAuth(auth);
      setChecking(false);
      // Hvis allerede logget ind — verificer subscription med det samme
      if (auth) {
        base44.functions.invoke('verifySubscription', {}).catch(() => {});
      }
    });
  }, []);

  const handleCreateAccount = () => {
    base44.auth.redirectToLogin('/app?subscription=success');
  };

  const handleOpenApp = () => {
    window.location.href = '/app?subscription=success';
  };

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: '#F5EDE0',
      fontFamily: "'Inter', -apple-system, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      textAlign: 'center',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap');
      `}</style>

      {/* Success icon */}
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        backgroundColor: '#C8A882',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.8rem',
        boxShadow: '0 8px 32px rgba(200,168,130,0.4)',
      }}>
        <CheckCircle size={40} color="#fff" />
      </div>

      <h1 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: '2.4rem',
        fontWeight: 400,
        color: '#1E140A',
        margin: '0 0 0.8rem',
        lineHeight: 1.2,
      }}>
        Velkommen i klubben! 🌙
      </h1>

      <p style={{ color: '#4A3525', fontSize: '0.93rem', lineHeight: 1.8, maxWidth: 380, margin: '0 0 2.5rem' }}>
        Din betaling er gennemført. For at aktivere din konto skal du <strong>oprette en bruger med den samme email du brugte ved betalingen.</strong>
      </p>

      {/* Steps */}
      <div style={{
        backgroundColor: '#FFFDF9',
        borderRadius: 20,
        border: '1px solid #E2D0BC',
        padding: '1.5rem',
        maxWidth: 380,
        width: '100%',
        marginBottom: '2rem',
        textAlign: 'left',
      }}>
        {[
          { step: '1', text: 'Klik på "Opret konto" nedenfor' },
          { step: '2', text: 'Brug den samme email som ved betalingen' },
          { step: '3', text: 'Dit abonnement aktiveres automatisk' },
        ].map(({ step, text }) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: step === '3' ? 0 : '1rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              backgroundColor: '#C8A882',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, color: '#fff', fontSize: '0.85rem', fontWeight: 700,
            }}>
              {step}
            </div>
            <p style={{ color: '#3A2416', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>{text}</p>
          </div>
        ))}
      </div>

      {/* CTAs */}
      {checking ? null : isAuth ? (
        <button
          onClick={handleOpenApp}
          style={{
            width: '100%', maxWidth: 380,
            backgroundColor: '#3A2416', color: '#fff',
            border: 'none', borderRadius: 14, padding: '16px',
            fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          Åbn appen <ArrowRight size={18} />
        </button>
      ) : (
        <>
          <button
            onClick={handleCreateAccount}
            style={{
              width: '100%', maxWidth: 380,
              backgroundColor: '#3A2416', color: '#fff',
              border: 'none', borderRadius: 14, padding: '16px',
              fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginBottom: '0.8rem',
            }}
          >
            Opret konto <ArrowRight size={18} />
          </button>
          <p style={{ color: '#9A7A6A', fontSize: '0.78rem' }}>
            Har du allerede en konto?{' '}
            <button onClick={() => base44.auth.redirectToLogin('/app?subscription=success')} style={{ background: 'none', border: 'none', color: '#C8A882', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, padding: 0 }}>
              Log ind her
            </button>
          </p>
        </>
      )}
    </div>
  );
}