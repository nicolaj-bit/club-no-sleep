import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

/**
 * AcceptInvite — landing page for invited family members.
 * URL: /AcceptInvite?invite=<invite_id>
 *
 * Flow:
 * 1. Not logged in → redirect to login, come back here after
 * 2. Logged in, no profile → redirect to Onboarding (with invite param preserved)
 * 3. Logged in, has profile → call acceptFamilyInvite, then go to /app
 */
export default function AcceptInvite() {
  const [status, setStatus] = useState('loading'); // loading | accepting | done | error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteId = urlParams.get('invite');

    if (!inviteId) {
      setStatus('error');
      setMessage('Ugyldigt invitationslink.');
      return;
    }

    const run = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        // Save invite id so we can pick it up after login/onboarding
        sessionStorage.setItem('pending_invite_id', inviteId);
        base44.auth.redirectToLogin(`/AcceptInvite?invite=${inviteId}`);
        return;
      }

      const user = await base44.auth.me();

      // Check if profile exists
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      if (!profiles.length) {
        // No profile yet — go through onboarding first, then come back
        sessionStorage.setItem('pending_invite_id', inviteId);
        navigate(`/Onboarding?invite=${inviteId}`, { replace: true });
        return;
      }

      // Has profile — accept the invite
      setStatus('accepting');
      try {
        await base44.functions.invoke('acceptFamilyInvite', { invite_id: inviteId });
        setStatus('done');
        setTimeout(() => navigate('/app', { replace: true }), 2000);
      } catch (e) {
        setStatus('error');
        setMessage('Noget gik galt. Prøv igen eller kontakt support.');
      }
    };

    run();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF6F1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          {status === 'done' ? '🎉' : status === 'error' ? '😔' : '🤍'}
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2rem', fontWeight: 400, color: '#2C1A0E', marginBottom: '0.75rem' }}>
          {status === 'loading' && 'Tjekker invitation…'}
          {status === 'accepting' && 'Forbinder dig…'}
          {status === 'done' && 'Du er med i familien!'}
          {status === 'error' && 'Noget gik galt'}
        </h1>
        <p style={{ color: '#6B4A2F', fontSize: '0.95rem', lineHeight: 1.7 }}>
          {status === 'loading' || status === 'accepting'
            ? 'Vent venligst et øjeblik…'
            : status === 'done'
            ? 'Du sender dig videre til appen nu…'
            : message}
        </p>
        {(status === 'loading' || status === 'accepting') && (
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #DCC1B0', borderTopColor: '#5C3317', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}