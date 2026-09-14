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
      // Invited users on /Onboarding → redirect to /app (they skip onboarding)
      if (location.pathname === '/Onboarding') {
        base44.functions.invoke('checkInviteStatus', {})
          .then(async (result) => {
            const invited = result?.data?.is_invited || result?.is_invited;
            if (invited) {
              await base44.functions.invoke('provisionInvitedUser', {});
              profileCache[user.email] = true;
              navigate('/app', { replace: true });
            } else {
              setReady(true);
            }
          })
          .catch(() => setReady(true));
        return;
      }
      setReady(true);
      return;
    }

    const email = user.email;

    if (profileCache[email] !== undefined) {
      setReady(true);
      return;
    }

    (async () => {
      // Invited users: skip onboarding entirely — provision profile via backend
      try {
        const inviteResult = await base44.functions.invoke('checkInviteStatus', {});
        if (inviteResult?.data?.is_invited || inviteResult?.is_invited) {
          await base44.functions.invoke('provisionInvitedUser', {});
          profileCache[email] = true;
          setReady(true);
          return;
        }
      } catch (e) {
        console.error('Invite check failed, proceeding with normal flow:', e);
      }

      // Normal flow: ensure a minimal profile exists. Onboarding vises ikke
      // længere — manglende oplysninger (fx fødselsdato) indsamles dér hvor de
      // bruges, via KraeverBarn. Adgang til appen styres af AccessGate.
      try {
        const profiles = await base44.entities.UserProfile.filter({ user_email: email });
        let profile = profiles && profiles[0];

        if (!profile) {
          const username = (email.split('@')[0] || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
          try {
            profile = await base44.entities.UserProfile.create({
              username: username || email,
              display_name: username || '',
              user_email: email,
              profile_label: 'mor',
              gender: 'female',
              onboarding_completed: false,
              subscription_status: 'trial',
              trial_started_at: new Date().toISOString(),
              is_visible: false,
              location_enabled: false,
            });
          } catch (e) {
            // Race condition — fortsæt alligevel
          }
        }

        profileCache[email] = true;
        setReady(true);
      } catch {
        setReady(true);
      }
    })();
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