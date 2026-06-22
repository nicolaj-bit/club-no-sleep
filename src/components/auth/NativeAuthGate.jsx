import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import NativeAuthScreen from './NativeAuthScreen';

/**
 * NativeAuthGate — vises kun på native (iOS/Android).
 * Hvis brugeren ikke er logget ind, vises en login/opret-skærm.
 * Lytter efter deep links (token fra web auth) og app-tilstand (foreground re-check).
 *
 * På web: lader alt passere igennem.
 */
export default function NativeAuthGate({ children }) {
  const [status, setStatus] = useState('loading'); // loading | authed | unauthed
  const isNative = Capacitor.isNativePlatform();
  const location = useLocation();

  // Offentlige routes der ikke kræver auth
  const isPublicRoute = location.pathname === '/' || location.pathname === '/AcceptInvite' || location.pathname === '/Landing';

  const processDeepLink = async (url) => {
    try {
      const urlObj = new URL(url);
      const token = urlObj.searchParams.get('access_token');
      if (token) {
        localStorage.setItem('base44_access_token', token);
        // Reload for at lade SDK geninitialisere med den nye token
        window.location.reload();
        return true;
      }
    } catch (e) {
      console.error('[NativeAuthGate] Deep link parse error:', e);
    }
    return false;
  };

  const checkAuth = async () => {
    // Demo mode — lad brugeren se appen uden login
    if (localStorage.getItem('demo_mode') === 'true') {
      setStatus('authed');
      return;
    }
    try {
      const user = await base44.auth.me();
      if (!user) {
        setStatus('unauthed');
        return;
      }
      // Tjek abonnementsstatus — kun active/trial får adgang
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      const sub = profiles[0]?.subscription_status;
      if (sub === 'active' || sub === 'trial') {
        setStatus('authed');
      } else {
        setStatus('unauthed');
      }
    } catch {
      setStatus('unauthed');
    }
  };

  useEffect(() => {
    // Kør auth-tjek på alle platforme
    if (isPublicRoute) {
      setStatus('authed');
      return;
    }

    // På native: tjek deep links og app-tilstand
    if (isNative) {
      App.getLaunchUrl().then(({ url }) => {
        if (url && url.includes('access_token')) {
          processDeepLink(url);
        } else {
          checkAuth();
        }
      }).catch(() => {
        checkAuth();
      });

      let listeners = [];
      App.addListener('appUrlOpen', ({ url }) => {
        processDeepLink(url);
      }).then((l) => listeners.push(l));
      App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) checkAuth();
      }).then((l) => listeners.push(l));

      return () => {
        listeners.forEach((l) => l.remove());
      };
    }

    // På web: tjek auth direkte
    checkAuth();
  }, [isNative, isPublicRoute]);

  // Offentlig route: lad alt passere
  if (isPublicRoute) {
    return children;
  }

  if (status === 'loading') {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'authed') {
    return children;
  }

  return <NativeAuthScreen />;
}