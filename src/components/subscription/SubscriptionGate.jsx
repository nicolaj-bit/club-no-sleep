import React, { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import Paywall from './Paywall';

/**
 * SubscriptionGate — wraps the entire app.
 * Shows Paywall for logged-in users without an active subscription.
 * Passes through for unauthenticated users (login flow handles them).
 */
export default function SubscriptionGate({ children }) {
  const [status, setStatus] = useState('loading'); // loading | ok | paywall

  const checkSubscription = useCallback(async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        setStatus('ok');
        return;
      }

      const user = await base44.auth.me();
      if (!user) {
        setStatus('ok');
        return;
      }

      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });

      if (!profiles.length) {
        setStatus('paywall');
        return;
      }

      // Admin users always get access
      if (user.role === 'admin') {
        setStatus('ok');
        return;
      }

      const profile = profiles[0];
      const subStatus = profile.subscription_status;

      if (subStatus === 'active') {
        setStatus('ok');
        return;
      }

      if (subStatus === 'trial') {
        const trialStart = new Date(profile.trial_started_at || profile.created_date);
        const daysDiff = (Date.now() - trialStart.getTime()) / (1000 * 60 * 60 * 24);
        setStatus(daysDiff <= 30 ? 'ok' : 'paywall');
        return;
      }

      setStatus('paywall');
    } catch {
      setStatus('ok');
    }
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && status === 'paywall') {
        checkSubscription();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkSubscription, status]);

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'paywall') {
    return <Paywall onSubscribed={() => setStatus('ok')} />;
  }

  return children;
}