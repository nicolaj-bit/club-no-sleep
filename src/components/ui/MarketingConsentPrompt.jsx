import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Mail } from 'lucide-react';

/**
 * One-time prompt for marketing consent, shown to existing users
 * who completed onboarding before the consent field was introduced.
 *
 * Never shows alongside other modals — coordinates via sessionStorage
 * flag 'modal_active' set by NotificationPrompt.
 */
export default function MarketingConsentPrompt() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let interval;

    const check = async () => {
      if (cancelled) return;
      // Don't show if another modal is already active
      if (sessionStorage.getItem('modal_active')) return;
      // Don't check more than once per session
      if (sessionStorage.getItem('marketing_checked')) return;

      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth || cancelled) return;

        const user = await base44.auth.me();
        if (!user?.email || cancelled) return;

        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        if (cancelled || !profiles[0]) return;

        // Already asked — mark and stop
        if (profiles[0].marketing_consent_prompted === true) {
          sessionStorage.setItem('marketing_checked', '1');
          return;
        }
        // Only for users who completed onboarding
        if (!profiles[0].onboarding_completed) return;

        // Show the modal
        sessionStorage.setItem('marketing_checked', '1');
        sessionStorage.setItem('modal_active', 'marketing');
        setOpen(true);
        clearInterval(interval);
      } catch {
        // Silently fail — never block the user
      }
    };

    // Wait 5s for other modals (trial announcement) to settle, then check every 3s
    const startTimer = setTimeout(() => {
      check();
      interval = setInterval(check, 3000);
    }, 5000);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      clearInterval(interval);
    };
  }, []);

  const handleResponse = async (consent) => {
    setOpen(false);
    sessionStorage.removeItem('modal_active');
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) return;
      const user = await base44.auth.me();
      if (!user?.email) return;
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      if (!profiles[0]) return;
      await base44.entities.UserProfile.update(profiles[0].id, {
        marketing_consent: consent,
        marketing_consent_at: new Date().toISOString(),
        marketing_consent_prompted: true,
      });
    } catch {
      // Silently fail — never block the user
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleResponse(false); }}>
      <DialogContent className="max-w-sm p-0 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)' }}>
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <Mail className="w-7 h-7" style={{ color: 'var(--color-accent)' }} />
          </div>
          <h2 className="text-xl mb-2" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Må vi sende dig gode råd og nyt om appen på mail?
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Du kan altid ændre dit valg i indstillingerne. Vi deler aldrig din mail med andre.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => handleResponse(true)}
              className="w-full py-3 rounded-xl text-sm font-semibold active:opacity-80 transition-opacity"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
            >
              Ja tak
            </button>
            <button
              onClick={() => handleResponse(false)}
              className="w-full py-2 text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Nej tak
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}