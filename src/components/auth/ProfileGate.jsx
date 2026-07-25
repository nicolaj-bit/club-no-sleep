import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

/**
 * ProfileGate — sender indloggede brugere uden en UserProfile til /Onboarding.
 *
 * Kører én gang pr. email (caches i module-scope). Kald invalidateProfileCache()
 * efter onboarding for at tillade gen-check.
 */
const SKIP_ROUTES = ['/Onboarding', '/', '/Landing', '/AcceptInvite', '/Terms', '/Privacy', '/Checkout', '/CheckoutSuccess'];

const profileCache = {};

export function invalidateProfileCache(email) {
  if (email) delete profileCache[email];
  else Object.keys(profileCache).forEach(k => delete profileCache[k]);
}

export default function ProfileGate({ children }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      setReady(true);
      return;
    }

    if (SKIP_ROUTES.includes(location.pathname)) {
      setReady(true);
      return;
    }

    const email = user.email;

    if (profileCache[email] !== undefined) {
      if (!profileCache[email]) {
        navigate('/Onboarding', { replace: true });
      } else {
        setReady(true);
      }
      return;
    }

    base44.entities.UserProfile.filter({ user_email: email })
      .then(profiles => {
        const profile = profiles && profiles[0];
        const completed = profile?.onboarding_completed === true;
        profileCache[email] = completed;
        if (!completed) {
          navigate('/Onboarding', { replace: true });
        } else {
          setReady(true);
        }
      })
      .catch(() => setReady(true));
  }, [isAuthenticated, user?.email, location.pathname, navigate]);

  if (!ready) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--color-bg-subtle)', borderTopColor: 'var(--color-primary)' }} />
      </div>
    );
  }

  return children;
}