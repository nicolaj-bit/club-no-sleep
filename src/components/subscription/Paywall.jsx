import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { openExternalUrl } from '@/lib/openExternalUrl';
import { isNativeApp } from '@/lib/platform';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useRevenueCat } from '@/components/subscription/useRevenueCat';
import { Check, Sparkles, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const FEATURES_DA = [
  { emoji: '🌙', text: 'AI søvnrådgivning til din baby' },
  { emoji: '💬', text: 'Ubegrænsede spørgsmål til eksperter' },
  { emoji: '🐯', text: 'Tigerspring notifikationer' },
  { emoji: '👩‍👩‍👦', text: 'Community for mødre & fædre' },
  { emoji: '📅', text: 'Kalender, søvnlog & dagbog' },
];

const FEATURES_EN = [
  { emoji: '🌙', text: 'AI sleep advice for your baby' },
  { emoji: '💬', text: 'Unlimited expert Q&A' },
  { emoji: '🐯', text: 'Wonder week notifications' },
  { emoji: '👩‍👩‍👦', text: 'Community for moms & dads' },
  { emoji: '📅', text: 'Calendar, sleep log & diary' },
];

export default function Paywall({ onSubscribed }) {
  const { lang } = useLanguage();
  const { isDark } = useTheme();
  const da = lang === 'da';
  const features = da ? FEATURES_DA : FEATURES_EN;
  const navigate = useNavigate();
  const rc = useRevenueCat();

  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState(null);
  const [restoreMessage, setRestoreMessage] = useState(null);

  const handleSubscribe = async () => {
    // Native iOS/iPadOS: redirect til /Subscription som håndterer RevenueCat IAP
    if (isNativeApp()) {
      navigate('/Subscription');
      return;
    }

    if (window.self !== window.top) {
      setError(da
        ? 'Betaling virker kun fra den publicerede app, ikke fra forhåndsvisningen.'
        : 'Checkout only works from the published app, not the preview.');
      return;
    }

    // Web: brug Stripe checkout
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {});
      if (response.data?.url) {
        await openExternalUrl(response.data.url);
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (e) {
      console.error('Checkout error:', e);
      setError(da
        ? 'Noget gik galt. Tjek din internetforbindelse og prøv igen.'
        : 'Something went wrong. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    setError(null);
    setRestoreMessage(null);
    try {
      // Native: brug RevenueCat restore
      if (isNativeApp() && rc.restorePurchases) {
        const info = await rc.restorePurchases();
        const hasActive = info?.entitlements?.active && Object.keys(info.entitlements.active).length > 0;
        if (hasActive) {
          await base44.functions.invoke('verifySubscription', {}).catch(() => {});
          setRestoreMessage(da ? '✓ Abonnement gendannet!' : '✓ Subscription restored!');
          setTimeout(() => { if (onSubscribed) onSubscribed(); }, 1200);
        } else {
          setRestoreMessage(da ? 'Intet aktivt abonnement fundet.' : 'No active subscription found.');
        }
      } else {
        // Web: tjek via Stripe backend
        const response = await base44.functions.invoke('verifySubscription', {});
        if (response.data?.active) {
          setRestoreMessage(da ? '✓ Abonnement gendannet!' : '✓ Subscription restored!');
          setTimeout(() => { if (onSubscribed) onSubscribed(); }, 1200);
        } else {
          setRestoreMessage(da
            ? 'Intet aktivt abonnement fundet på denne konto.'
            : 'No active subscription found on this account.');
        }
      }
    } catch (e) {
      setError(da
        ? 'Kunne ikke tjekke abonnement. Prøv igen.'
        : 'Could not verify subscription. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Hero gradient */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, var(--color-brown-dark) 0%, var(--color-primary) 50%, var(--color-accent) 100%)',
          paddingTop: 'max(56px, env(safe-area-inset-top))',
          paddingBottom: 48,
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10" style={{ background: 'var(--color-accent)' }} />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10" style={{ background: 'var(--color-divider)' }} />

        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
          >
            <span className="text-4xl">🌙</span>
          </motion.div>

          <motion.h1
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-3xl font-light text-white mb-2"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', letterSpacing: '-0.01em' }}
          >
            LALATOTO
          </motion.h1>

          <motion.p
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-sm text-white/75 max-w-xs"
          >
            {da
              ? 'Din digitale følgesvend som forælder'
              : 'Your digital companion as a parent'}
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-5 pt-6 pb-8">

        {/* Price badge */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <div
            className="px-5 py-2.5 rounded-2xl flex items-center gap-2"
            style={{ background: isDark ? 'var(--color-bg-card)' : 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {da ? '59 kr. / måned' : '59 DKK / month'}
            </span>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="rounded-2xl p-5 mb-6 space-y-3.5"
          style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xl flex-shrink-0">{f.emoji}</span>
              <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{f.text}</span>
              <Check className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
            </div>
          ))}
        </motion.div>

        {/* Error / restore message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-xl px-4 py-3 mb-4"
            style={{ background: 'rgba(220,60,40,0.08)', border: '1px solid rgba(220,60,40,0.2)' }}
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
            <p className="text-xs text-red-600">{error}</p>
          </motion.div>
        )}

        {restoreMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl px-4 py-3 mb-4 text-center"
            style={{ background: 'rgba(100,180,100,0.1)', border: '1px solid rgba(100,180,100,0.2)' }}
          >
            <p className="text-sm font-medium" style={{ color: '#3A7A3A' }}>{restoreMessage}</p>
          </motion.div>
        )}

        <div className="flex-1" />

        {/* Subscribe CTA */}
        <motion.button
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          onClick={handleSubscribe}
          disabled={loading || restoring}
          className="w-full py-4 rounded-2xl text-base font-semibold mb-3 flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> {da ? 'Indlæser…' : 'Loading…'}</>
            : (da ? 'Start abonnement' : 'Start subscription')}
        </motion.button>

        {/* Restore purchases */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          onClick={handleRestore}
          disabled={loading || restoring}
          className="w-full py-3 rounded-2xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {restoring
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {da ? 'Tjekker…' : 'Checking…'}</>
            : <><RefreshCw className="w-3.5 h-3.5" /> {da ? 'Gendan eksisterende køb' : 'Restore existing purchase'}</>}
        </motion.button>

        <p className="text-xs text-center mt-4" style={{ color: 'var(--color-text-muted)' }}>
          {da
            ? 'Abonnementet fornyes automatisk. Annuller når som helst.'
            : 'Subscription renews automatically. Cancel anytime.'}
        </p>
      </div>
    </div>
  );
}