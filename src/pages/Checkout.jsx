import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { requestPushPermission } from '@/utils/requestPushPermission';
import { useRevenueCat } from '@/components/subscription/useRevenueCat';
import { useLanguage } from '@/components/ui/LanguageContext';
import { Loader2, Check, ArrowLeft, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Capacitor } from '@capacitor/core';

function AppleIcon({ className, style }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.31-3.74 4.25z"/>
    </svg>
  );
}

function GooglePlayIcon({ className, style }) {
  return (
    <svg viewBox="0 0 512 512" className={className} style={style} fill="currentColor">
      <path d="M99.6 8.1C91 14.5 86 24.9 86 37.6v436.8c0 12.7 5 23.1 13.6 29.5l229.6-251.9L99.6 8.1zm245.1 245.9l54.7-54.7-198-114.7L325.9 218 344.7 254zm0 4.1L325.9 294l-144.5 134.4 198-114.7-54.7-54.6zM426 219.4l-44.6-25.8-58.7 62.5 58.7 62.4 44.6-25.7c19.9-11.5 30-26.4 30-36.7s-10.1-25.2-30-36.7z"/>
    </svg>
  );
}

const STORE_LABELS = {
  ios: { name: 'App Store', title: 'In-App Purchase (App Store)', sub: 'Betal via din Apple-konto · Sikker og nem', footer: 'Apple' },
  android: { name: 'Google Play', title: 'In-App Purchase (Google Play)', sub: 'Betal via din Google-konto · Sikker og nem', footer: 'Google Play' },
};

export default function Checkout() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState(null);

  // KRITISK FIX — MÅ IKKE RULLES TILBAGE: 'guest' blokeres af RevenueCat (error 16)
  const rc = useRevenueCat(userId || null);
  const platform = Capacitor.getPlatform();
  const store = platform === 'android' ? STORE_LABELS.android : STORE_LABELS.ios;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const user = await base44.auth.me();
          if (user?.email) {
            setUserId(user.email);
            const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
            if (profiles.length) setProfile(profiles[0]);
          }
        }
      } catch (_) {}
    };
    loadProfile();
  }, []);

  const isActive = profile?.subscription_status === 'active';

  const handlePurchase = async () => {
    const pkg = rc.offerings?.current?.availablePackages?.[0];
    if (!pkg) {
      setError(`Abonnementet kunne ikke indlæses fra ${store.name}. Tjek din internetforbindelse og prøv igen.`);
      return;
    }

    setError(null);
    setPurchasing(true);
    try {
      await rc.purchase(pkg);
      setSuccess('✓ Abonnement aktiveret!');
      // Synkroniser profil med backend
      await base44.functions.invoke('verifySubscription', {}).catch(() => {});
      setTimeout(() => requestPushPermission(), 1500);
    } catch (e) {
      const errMsg = e?.message || (typeof e === 'string' ? e : 'Køb fejlede');
      if (!errMsg.toLowerCase().includes('cancel') && e.code !== 'PURCHASE_CANCELLED') {
        setError(errMsg);
      }
    } finally {
      setPurchasing(false);
    }
  };

  if (isActive) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="w-full max-w-sm rounded-3xl p-8 text-center" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(100,180,100,0.15)' }}>
            <Check className="w-7 h-7" style={{ color: '#3A7A3A' }} />
          </div>
          <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            {t.checkoutAlreadySubscribed}
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            {t.checkoutFullAccess}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #C8A882, #8B5E3C)', color: '#FFFDF9' }}
          >
            {t.checkoutBackToApp}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Top bar */}
      <div className="px-4 pt-4" style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
        <button onClick={() => navigate('/app')} className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-text-primary)' }}>
          <ArrowLeft className="w-4 h-4" /> {t.checkoutBack}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div
            className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <span className="text-2xl font-bold" style={{ color: 'var(--color-primary-foreground)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>C</span>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            {t.checkoutBeccomeMember}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {t.checkoutPricing}
          </p>
        </div>

        {/* Features */}
        <div className="mb-6 space-y-2.5">
          {[
            t.checkoutFeature1,
            t.checkoutFeature2,
            t.checkoutFeature3,
            t.checkoutFeature4,
            t.checkoutFeature5,
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                <Check className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{feature}</p>
            </div>
          ))}
        </div>

        {/* Payment method card — platform-specifik IAP via RevenueCat (StoreKit / Play Billing) */}
        <div className="mb-6">
          <div
            className="w-full rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #C8A882, #8B5E3C)', border: '2px solid #8B5E3C' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              {platform === 'android'
                ? <GooglePlayIcon className="w-5 h-5" style={{ color: '#fff' }} />
                : <AppleIcon className="w-5 h-5" style={{ color: '#fff' }} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: '#fff' }}>
                {store.title}
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {store.sub}
              </p>
            </div>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--color-accent-soft)' }}
            >
              <Check className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
            </div>
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div className="rounded-xl px-4 py-3 mb-4 text-sm font-medium" style={{ background: 'rgba(100,180,100,0.1)', border: '1px solid rgba(100,180,100,0.2)', color: '#3A7A3A' }}>
            {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl px-4 py-3 mb-4" style={{ background: 'rgba(200,60,60,0.1)', border: '1px solid rgba(200,60,60,0.3)' }}>
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#a04040' }} />
            <p className="text-xs" style={{ color: '#a04040' }}>{error}</p>
          </div>
        )}

        {/* Loading state */}
        {rc.loading && (
          <div className="rounded-xl px-4 py-3 mb-4 text-xs font-medium flex items-center gap-2" style={{ background: 'rgba(100,100,180,0.1)', border: '1px solid rgba(100,100,180,0.2)', color: '#5050a0' }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t.checkoutPreparing?.replace('{store}', store.name)}
          </div>
        )}

        {/* CTA button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handlePurchase}
          disabled={purchasing || rc.loading}
          className="w-full py-4 rounded-2xl text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #C8A882, #8B5E3C)', color: '#FFFDF9' }}
        >
          {purchasing || rc.loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> {t.checkoutProcessing}</>
            : <>{t.checkoutSubscribe}</>}
        </motion.button>

        {/* Footer */}
        <p className="text-center text-xs mt-4 flex items-center justify-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
          <Lock className="w-3 h-3" /> {t.checkoutSecure?.replace('{store}', store.footer)}
        </p>

        <div className="flex items-center justify-center gap-4 mt-3 text-xs">
          <Link to="/Terms" style={{ color: 'var(--color-text-secondary)' }} className="underline underline-offset-2">Vilkår</Link>
          <Link to="/Privacy" style={{ color: 'var(--color-text-secondary)' }} className="underline underline-offset-2">Privatlivspolitik</Link>
        </div>
      </div>
    </div>
  );
}