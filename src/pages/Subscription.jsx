import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Check, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/ui/LanguageContext';

const FEATURES_DA = [
  'Adgang til alle eksperter',
  'Ubegrænsede spørgsmål & svar',
  'Personlige søvnråd fra AI',
  'Community for mødre',
  'Tigerspring notifikationer',
];

const FEATURES_EN = [
  'Access to all experts',
  'Unlimited questions & answers',
  'Personalized AI sleep advice',
  'Community for moms',
  'Wonder week notifications',
];

export default function Subscription() {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const da = lang === 'da';

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
    // Block inside iframes (preview environment)
    if (window.self !== window.top) {
      alert(da
        ? 'Betaling virker kun fra den publicerede app, ikke fra forhåndsvisningen.'
        : 'Checkout only works from the published app, not the preview.');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {});
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (e) {
      console.error(e);
      alert(da ? 'Noget gik galt. Prøv igen.' : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isActive = profile?.subscription_status === 'active';
  const features = da ? FEATURES_DA : FEATURES_EN;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="flex items-center px-5 pt-6 pb-2">
        <Link to="/" className="p-2 -ml-2 rounded-xl" style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))' }}>
          <Sparkles className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-serif text-center mb-2" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
          {da ? 'LALATOTO Premium' : 'LALATOTO Premium'}
        </h1>
        <p className="text-sm text-center mb-8 max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
          {da
            ? '30 dages gratis prøveperiode, derefter 59 kr./md.'
            : '30-day free trial, then 59 DKK/month.'}
        </p>

        {/* Features */}
        <div className="w-full max-w-sm rounded-2xl p-5 mb-8 space-y-3"
          style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--color-primary)' }}>
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        {isActive ? (
          <div className="w-full max-w-sm py-4 rounded-2xl text-center text-sm font-semibold"
            style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }}>
            {da ? '✓ Aktivt abonnement' : '✓ Active subscription'}
          </div>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full max-w-sm py-4 rounded-2xl text-base font-semibold disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
          >
            {loading
              ? (da ? 'Indlæser…' : 'Loading…')
              : (da ? 'Start gratis prøveperiode' : 'Start free trial')}
          </button>
        )}

        <p className="text-xs text-center mt-4" style={{ color: 'var(--color-text-muted)' }}>
          {da
            ? 'Annuller når som helst. Ingen binding.'
            : 'Cancel anytime. No commitment.'}
        </p>
      </div>
    </div>
  );
}