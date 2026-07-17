import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Smartphone } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { showInAppLogin } from '@/lib/showInAppLogin';
import { buildAppDeepLink } from '@/lib/nativeAuth';
import { useLanguage } from '@/components/ui/LanguageContext';
import { Capacitor } from '@capacitor/core';

export default function CheckoutSuccess() {
  const { t } = useLanguage();
  const [isAuth, setIsAuth] = useState(false);
  const [checking, setChecking] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get('access_token');
    if (urlToken) {
      localStorage.setItem('base44_access_token', urlToken);
      setToken(urlToken);
    } else {
      const stored = localStorage.getItem('base44_access_token') || localStorage.getItem('token');
      if (stored) setToken(stored);
    }

    base44.auth.isAuthenticated().then(auth => {
      setIsAuth(auth);
      setChecking(false);
      if (auth) {
        base44.functions.invoke('verifySubscription', {}).catch(() => {});
      }
    });
  }, []);

  const handleCreateAccount = () => {
    showInAppLogin('/CheckoutSuccess');
  };

  const handleOpenApp = () => {
    window.location.href = '/app?subscription=success';
  };

  const handleOpenNativeApp = () => {
    const dl = token ? buildAppDeepLink({ access_token: token }) : 'clubnosleep://auth';
    window.location.href = dl;
  };

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-text-primary)',
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
        backgroundColor: 'var(--color-accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.8rem',
        boxShadow: '0 8px 32px rgba(200,168,130,0.3)',
      }}>
        <CheckCircle size={40} color="#fff" />
      </div>

      <h1 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: '2.4rem',
        fontWeight: 400,
        color: 'var(--color-text-primary)',
        margin: '0 0 0.8rem',
        lineHeight: 1.2,
      }}>
        {t.checkoutSuccessTitle}
      </h1>

      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.93rem', lineHeight: 1.8, maxWidth: 380, margin: '0 0 2.5rem' }}>
        {t.checkoutSuccessMessage}
      </p>

      {/* Steps */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 20,
        border: '1px solid var(--color-border)',
        padding: '1.5rem',
        maxWidth: 380,
        width: '100%',
        marginBottom: '2rem',
        textAlign: 'left',
      }}>
        {[
          { step: '1', text: t.checkoutSuccessStep1 },
          { step: '2', text: t.checkoutSuccessStep2 },
          { step: '3', text: t.checkoutSuccessStep3 },
        ].map(({ step, text }) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: step === '3' ? 0 : '1rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, color: '#fff', fontSize: '0.85rem', fontWeight: 700,
            }}>
              {step}
            </div>
            <p style={{ color: 'var(--color-text-primary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>{text}</p>
          </div>
        ))}
      </div>

      {/* CTAs */}
      {checking ? null : isAuth ? (
        <>
          <button
            onClick={handleOpenApp}
            style={{
              width: '100%', maxWidth: 380,
              backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)',
              border: 'none', borderRadius: 14, padding: '16px',
              fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {t.checkoutSuccessOpenApp} <ArrowRight size={18} />
          </button>
          {token && !Capacitor.isNativePlatform() && (
            <button
              onClick={handleOpenNativeApp}
              style={{
                width: '100%', maxWidth: 380,
                backgroundColor: 'transparent', color: 'var(--color-text-primary)',
                border: '2px solid var(--color-accent)', borderRadius: 14, padding: '14px',
                fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: '0.8rem',
              }}
            >
              <Smartphone size={18} /> {t.checkoutSuccessBackToApp}
            </button>
          )}
        </>
      ) : (
        <>
          <button
            onClick={handleCreateAccount}
            style={{
              width: '100%', maxWidth: 380,
              backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)',
              border: 'none', borderRadius: 14, padding: '16px',
              fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginBottom: '0.8rem',
            }}
          >
            {t.checkoutSuccessCreateAccount} <ArrowRight size={18} />
          </button>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
            {t.checkoutSuccessAlreadyHaveAccount}{' '}
            <button onClick={() => showInAppLogin('/CheckoutSuccess')} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, padding: 0 }}>
              {t.checkoutSuccessLoginHere}
            </button>
          </p>
          {token && (
            <button
              onClick={handleOpenNativeApp}
              style={{
                width: '100%', maxWidth: 380,
                backgroundColor: 'transparent', color: 'var(--color-text-primary)',
                border: '2px solid var(--color-accent)', borderRadius: 14, padding: '14px',
                fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: '1.2rem',
              }}
            >
              <Smartphone size={18} /> {t.checkoutSuccessBackToApp}
            </button>
          )}
        </>
      )}
    </div>
  );
}