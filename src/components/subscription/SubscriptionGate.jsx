import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageContext';

// Wraps any content that requires an active subscription (or trial)
export default function SubscriptionGate({ children }) {
  const { lang } = useLanguage();
  const [status, setStatus] = useState('loading'); // loading | ok | blocked

  useEffect(() => {
    const check = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) { setStatus('ok'); return; }

        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        if (!profiles.length) { setStatus('ok'); return; }

        const profile = profiles[0];
        const subStatus = profile.subscription_status;
        const trialStart = profile.trial_started_at || profile.created_date;

        if (subStatus === 'active') {
          setStatus('ok');
          return;
        }

        if (subStatus === 'expired') {
          setStatus('blocked');
          return;
        }

        // trial — check if 30 days have passed
        const trialDate = new Date(trialStart);
        const now = new Date();
        const daysDiff = (now - trialDate) / (1000 * 60 * 60 * 24);
        setStatus(daysDiff <= 30 ? 'ok' : 'blocked');
      } catch {
        setStatus('ok');
      }
    };
    check();
  }, []);

  if (status === 'loading') return null;

  if (status === 'blocked') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))' }}>
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-serif mb-2" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
          {lang === 'da' ? 'Din prøveperiode er udløbet' : 'Your trial has ended'}
        </h2>
        <p className="text-sm mb-8 max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
          {lang === 'da'
            ? 'Opret et abonnement for at fortsætte med at bruge LALATOTO.'
            : 'Subscribe to continue using LALATOTO.'}
        </p>
        <Link
          to="/Subscription"
          className="px-8 py-4 rounded-2xl text-base font-semibold"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
        >
          {lang === 'da' ? 'Se abonnement' : 'View subscription'}
        </Link>
      </div>
    );
  }

  return children;
}