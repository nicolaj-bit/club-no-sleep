import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, ArrowLeft, Sparkles, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/ui/LanguageContext';
import { motion } from 'framer-motion';

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

export default function Subscription() {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState(null);
  const [restoreMessage, setRestoreMessage] = useState(null);
  const [profile, setProfile] = useState(null);
  const da = lang === 'da';
  const features = da ? FEATURES_DA : FEATURES_EN;

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return;
        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        if (profiles.length) setProfile(profiles[0]);
      } catch {}
    };
    load();
  }, []);

  const handleSubscribe = async () => {
    if (window.self !== window.top) {
      alert(da
        ? 'Betaling virker kun fra den publicerede app, ikke fra forhåndsvisningen.'
        : 'Checkout only works from the published app, not the preview.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {});
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (e) {
      console.error(e);
      setError(da ? 'Noget gik galt. Prøv igen.' : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    setError(null);
    setRestoreMessage(null);
    try {
      const response = await base44.functions.invoke('verifySubscription', {});
      if (response.data?.active) {
        setRestoreMessage(da ? '✓ Abonnement gendannet!' : '✓ Subscription restored!');
      } else {
        setRestoreMessage(da
          ? 'Intet aktivt abonnement fundet på denne konto.'
          : 'No active subscription found on this account.');
      }
    } catch (e) {
      setError(da ? 'Kunne ikke tjekke abonnement. Prøv igen.' : 'Could not verify subscription. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  const isActive = profile?.subscription_status === 'active';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #3A2B22 0%, #5B3F2B 55%, #C29A73 100%)',
          paddingTop: 'max(56px, env(safe-area-inset-top))',
          paddingBottom: 52,
        }}
      >
        {/* Back button */}
        <Link
          to="/"
          className="absolute top-4 left-4 z-20 flex items-center justify-center w-9 h-9 rounded-full"
          style={{ background: 'rgba(255,255,255,0.12)', marginTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </Link>

        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-10" style={{ background: '#C29A73' }} />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10" style={{ background: '#EDE4DB' }} />

        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <motion.div
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-24 h-24 rounded-3xl flex items-center justify-center mb-5"
            style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            <span className="text-5xl">🌙</span>
          </motion.div>

          <motion.h1
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-4xl font-light text-white mb-2"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', letterSpacing: '-0.01em' }}
          >
            LALATOTO
          </motion.h1>

          <motion.p
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-sm text-white/70 max-w-xs leading-relaxed"
          >
            {da
              ? 'Din digitale følgesvend som forælder'
              : 'Your digital companion as a parent'}
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-5 pt-7 pb-8">

        {/* Price badge */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex items-center justify-center mb-6"
        >
          <div
            className="px-6 py-3 rounded-2xl flex items-center gap-2"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <Sparkles className="w-4 h-4" style={{ color: '#C29A73' }} />
            <span className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              {da ? '59 kr. / måned' : '59 DKK / month'}
            </span>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="rounded-2xl p-5 mb-6 space-y-4"
          style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xl flex-shrink-0">{f.emoji}</span>
              <span className="text-sm flex-1" style={{ color: 'var(--color-text-primary)' }}>{f.text}</span>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#C29A73' }}
              >
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Error */}
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

        {/* CTA */}
        {isActive ? (
          <div
            className="w-full py-4 rounded-2xl text-center text-sm font-semibold mb-3"
            style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }}
          >
            {da ? '✓ Aktivt abonnement' : '✓ Active subscription'}
          </div>
        ) : (
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
              : (da ? 'Abonner — 59 kr./md.' : 'Subscribe — 59 DKK/mo.')}
          </motion.button>
        )}

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