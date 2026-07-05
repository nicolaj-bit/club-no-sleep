import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/components/ui/LanguageContext';

/**
 * AcceptInvite — landing page for invited family members.
 * URL: /AcceptInvite?invite=<invite_id>
 *
 * Flow:
 * 1. Not logged in → redirect to signup (not onboarding), come back here after auth
 * 2. Logged in → call acceptFamilyInvite → create a minimal UserProfile if missing → go to /app
 */
export default function AcceptInvite() {
  const { t } = useLanguage();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteId = urlParams.get('invite');

    if (!inviteId) {
      setStatus('error');
      setMessage(t.acceptInviteInvalidLink);
      return;
    }

    const run = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        // Save invite id and redirect to login/signup
        sessionStorage.setItem('pending_invite_id', inviteId);
        base44.auth.redirectToLogin(`/AcceptInvite?invite=${inviteId}`);
        return;
      }

      const user = await base44.auth.me();

      // Check if profile exists — if not, create a minimal one (skip onboarding)
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      if (!profiles.length) {
        // Create a minimal profile so the user can access the app
        const username = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') + '_' + Math.floor(Math.random() * 1000);
        await base44.entities.UserProfile.create({
          user_email: user.email,
          username,
          display_name: user.full_name || username,
          profile_label: 'far', // default — they can change in settings
          subscription_status: 'active',
        });
      }

      // Accept the invite
      setStatus('accepting');
      try {
        await base44.functions.invoke('acceptFamilyInvite', { invite_id: inviteId });
        sessionStorage.removeItem('pending_invite_id');
        setStatus('done');
        setTimeout(() => navigate('/app', { replace: true }), 2000);
      } catch (e) {
        setStatus('error');
        setMessage(t.acceptInviteErrorMsg);
      }
    };

    run();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          {status === 'done' ? '🎉' : status === 'error' ? '😔' : '🤍'}
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2rem', fontWeight: 400, color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>
          {status === 'loading' && t.acceptInviteChecking}
          {status === 'accepting' && t.acceptInviteConnecting}
          {status === 'done' && t.acceptInviteDone}
          {status === 'error' && t.acceptInviteError}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
          {status === 'loading' || status === 'accepting'
            ? t.acceptInviteWaiting
            : status === 'done'
            ? t.acceptInviteRedirecting
            : message}
        </p>
        {(status === 'loading' || status === 'accepting') && (
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--color-accent-soft)', borderTopColor: 'var(--color-primary)', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}