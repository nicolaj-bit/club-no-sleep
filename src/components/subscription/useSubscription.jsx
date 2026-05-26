import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

let _cache = null;
let _cacheTime = 0;
const CACHE_MS = 30000;

export function useSubscription() {
  const [state, setState] = useState({ loading: true, isActive: false, isTrial: false });

  useEffect(() => {
    const check = async () => {
      // Use cache to avoid repeated calls
      if (_cache && Date.now() - _cacheTime < CACHE_MS) {
        setState({ loading: false, ..._cache });
        return;
      }

      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          setState({ loading: false, isActive: false, isTrial: false });
          return;
        }
        const user = await base44.auth.me();
        if (!user) {
          setState({ loading: false, isActive: false, isTrial: false });
          return;
        }

        // Check demo mode — if enabled, admin sees the app as a locked user to test the paywall
        const configs = await base44.entities.AppConfig.filter({ key: 'main' });
        const isDemoMode = configs.length > 0 && configs[0].demo_mode === true;

        if (isDemoMode) {
          // In demo mode: regular users get full access, admins see locked view to verify paywall
          if (user.role !== 'admin') {
            const result = { isActive: true, isTrial: false, demoMode: true };
            _cache = result;
            _cacheTime = Date.now();
            setState({ loading: false, ...result });
            return;
          }
          // Admin in demo mode → fall through to profile check (sees paywall like a real user)
        }

        // Admin always gets full access (when NOT in demo mode)
        if (!isDemoMode && user.role === 'admin') {
          const result = { isActive: true, isTrial: false };
          _cache = result;
          _cacheTime = Date.now();
          setState({ loading: false, ...result });
          return;
        }

        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        if (!profiles.length) {
          setState({ loading: false, isActive: false, isTrial: false });
          return;
        }

        const profile = profiles[0];
        const sub = profile.subscription_status;

        if (sub === 'active') {
          const result = { isActive: true, isTrial: false };
          _cache = result;
          _cacheTime = Date.now();
          setState({ loading: false, ...result });
          return;
        }

        if (sub === 'trial') {
          const trialStart = new Date(profile.trial_started_at || profile.created_date);
          const daysDiff = (Date.now() - trialStart.getTime()) / (1000 * 60 * 60 * 24);
          if (daysDiff <= 30) {
            const result = { isActive: true, isTrial: true };
            _cache = result;
            _cacheTime = Date.now();
            setState({ loading: false, ...result });
            return;
          }
        }

        const result = { isActive: false, isTrial: false };
        _cache = result;
        _cacheTime = Date.now();
        setState({ loading: false, ...result });
      } catch {
        setState({ loading: false, isActive: false, isTrial: false });
      }
    };

    check();
  }, []);

  return state;
}

// Clear cache (call after subscription change)
export function clearSubscriptionCache() {
  _cache = null;
  _cacheTime = 0;
}