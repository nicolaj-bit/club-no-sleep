import React, { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearSubscriptionCache } from './useSubscription';

/**
 * SubscriptionGate — wraps the entire app.
 * In DEMO MODE: all pages are accessible, but premium content is locked inside components.
 * Only redirects to onboarding if no profile exists.
 */
export default function SubscriptionGate({ children }) {
  const [status, setStatus] = useState('loading');
  const location = useLocation();
  const navigate = useNavigate();

  const checkAccess = useCallback(async () => {
    if (location.pathname === '/Onboarding') {
      setStatus('ok');
      return;
    }

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
        navigate('/Onboarding', { replace: true });
        setStatus('ok');
        return;
      }

      // Everyone gets access — premium content is locked inside components
      setStatus('ok');
    } catch {
      setStatus('ok');
    }
  }, [location.pathname]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-700 rounded-full animate-spin" />
      </div>
    );
  }

  return children;
}