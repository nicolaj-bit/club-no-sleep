import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { base44 } from '@/api/base44Client';
import { useRevenueCat } from '@/components/subscription/useRevenueCat';
import { useLanguage } from '@/components/ui/LanguageContext';
import { requestPushPermission } from '@/utils/requestPushPermission';
import { Loader2, Check, RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Checkout() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const da = lang === 'da';
  const rc = useRevenueCat('guest');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const user = await base44.auth.me();
          if (user?.email) {
            const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
            if (profiles.length) setProfile(profiles[0]);
          }
        }
      } catch (_) {}
    };
    loadProfile();
  }, []);

  const isActive = profile?.subscription_status === 'active' || rc.isSubscribed;

  const handlePurchase = async () => {
    setError(null);
    setSuccess(null);

    if (!Capacitor.isNativePlatform()) {
      // Web: Stripe checkout
      setLoading(true);
      try {
        const response = await base44.functions.invoke('createCheckoutSession', {});
        if (response.data?.url) {
          window.location.href = response.data.url;
        } else {
          setError(da ? 'Kunne ikke starte betaling. Prøv igen.' : 'Could not start checkout.');
        }
      } catch (_) {
        setError(da ? 'Kunne ikke starte betaling. Prøv igen.' : 'Could not start checkout.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Native: RevenueCat IAP
    const pkg = rc.offerings?.current?.availablePackages?.[0];
    if (!pkg) {
      setError(da
        ? 'Abonnementet kunne ikke indlæses fra App Store. Tjek din internetforbindelse og prøv igen.'
        : 'Could not load subscription from App Store. Check your connection and try again.');
      return;
    }

    setLoading(true);
    try {
      await rc.purchase(pkg);
      setSuccess(da ? '✓ Abonnement aktiveret!' : '✓ Subscription activated!');
      await base44.functions.invoke('verifySubscription', {}).catch(() => {});
      setTimeout(() => requestPushPermission(), 1500);
    } catch (e) {
      if (!e.message?.includes('cancel') && e.code !== 'PURCHASE_CANCELLED') {
        setError(e.message || (da ? 'Køb fejlede. Prøv igen.' : 'Purchase failed. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    setError(null);
    try {
      if (rc.isNative && rc.restorePurchases) {
        const info = await rc.restorePurchases();
        const hasActive = info?.entitlements?.active && Object.keys(info.entitlements.active).length > 0;
        if (hasActive) {
          await base44.functions.invoke('verifySubscription', {}).catch(() => {});
          setSuccess(da ? '✓ Abonnement gendannet!' : '✓ Subscription restored!');
        } else {
          setError(da ? 'Intet aktivt abonnement fundet.' : 'No active subscription found.');
        }
      } else {
        const response = await base44.functions.invoke('verifySubscription', {});
        if (response.data?.active) {
          setSuccess(da ? '✓ Abonnement gendannet!' : '✓ Subscription restored!');
        } else {
          setError(da ? 'Intet aktivt abonnement fundet.' : 'No active subscription found.');
        }
      }
    } catch (_) {
      setError(da ? 'Kunne ikke gendanne køb.' : 'Could not restore purchases.');
    } finally {
      setRestoring(false);
    }
  };

  const iosPkg = rc.offerings?.current?.availablePackages?.[0];
  const priceLabel = iosPkg?.product?.priceString
    ? `${iosPkg.product.priceString} / ${da ? 'måned' : 'month'}`
    : '59 kr. / måned';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-4 border-b"
        style={{ borderColor: 'var(--color-border)', paddingTop: 'max(16px, env(safe-area-inset-top))' }}
      >
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
        </button>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {da ? 'Abonnement' : 'Subscription'}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm rounded-3xl p-8 text-center"
          style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          {/* Logo / icon */}
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center text-2xl"
            style={{ background: 'linear-gradient(160deg, #5B3F2B, #C29A73)' }}
          >
            🌙
          </div>

          <h2 className="text-2xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            LALATOTO
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            {da ? 'Fuld adgang til alle funktioner' : 'Full access to all features'}
          </p>

          {/* Price */}
          <div className="mb-6">
            <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{priceLabel}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {da ? 'Fornyes automatisk. Annuller når som helst.' : 'Renews automatically. Cancel anytime.'}
            </p>
          </div>

          {/* Success message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl px-4 py-3 mb-4"
              style={{ background: 'rgba(100,180,100,0.1)', border: '1px solid rgba(100,180,100,0.2)' }}
            >
              <p className="text-sm font-medium" style={{ color: '#3A7A3A' }}>{success}</p>
            </motion.div>
          )}

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 rounded-xl px-4 py-3 mb-4 text-left"
              style={{ background: 'rgba(200,80,80,0.08)', border: '1px solid rgba(200,80,80,0.2)' }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#C85050' }} />
              <p className="text-xs" style={{ color: '#C85050' }}>{error}</p>
            </motion.div>
          )}

          {/* CTA */}
          {isActive ? (
            <div
              className="w-full py-4 rounded-2xl text-center text-sm font-semibold mb-3 flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }}
            >
              <Check className="w-4 h-4" /> {da ? 'Aktivt abonnement' : 'Active subscription'}
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handlePurchase}
              disabled={loading || restoring || rc.loading}
              className="w-full py-4 rounded-2xl text-base font-semibold mb-3 flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
            >
              {loading || rc.loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {da ? 'Behandler…' : 'Processing…'}</>
                : da ? 'Abonner — 59 kr./md.' : 'Subscribe — 59 DKK/mo.'}
            </motion.button>
          )}

          <button
            onClick={handleRestore}
            disabled={loading || restoring}
            className="w-full py-3 rounded-2xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {restoring
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {da ? 'Tjekker…' : 'Checking…'}</>
              : <><RefreshCw className="w-3.5 h-3.5" /> {da ? 'Gendan eksisterende køb' : 'Restore existing purchase'}</>}
          </button>
        </motion.div>
      </div>
    </div>
  );
}