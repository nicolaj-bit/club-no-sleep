import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { base44 } from '@/api/base44Client';
import { useRevenueCat } from '@/components/subscription/useRevenueCat';
import { useLanguage } from '@/components/ui/LanguageContext';

async function markTrialAnnouncementSeen() {
  try {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) return;
    const user = await base44.auth.me();
    if (!user?.email) return;
    const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
    if (profiles[0]) {
      await base44.entities.UserProfile.update(profiles[0].id, { trial_announcement_seen: true });
    }
  } catch {}
}

/**
 * One-time announcement for existing non-subscribed users:
 * "Nu kan du prøve gratis i 7 dage".
 * Only shows to users without active subscription AND trial-eligible
 * (RevenueCat 'eligible' or 'unknown' — NOT 'ineligible').
 */
export default function TrialAnnouncementModal({ open, onClose }) {
  if (!open) return null;
  return <TrialAnnouncementInner onClose={onClose} />;
}

function TrialAnnouncementInner({ onClose }) {
  const navigate = useNavigate();
  const { trialEligibility, loading: rcLoading } = useRevenueCat();
  const { t } = useLanguage();
  const isNative = Capacitor.isNativePlatform();
  const ready = !isNative || !rcLoading;
  const ineligible = ready && trialEligibility === 'ineligible';

  // If ineligible, silently mark as seen and close
  useEffect(() => {
    if (!ineligible) return;
    markTrialAnnouncementSeen().finally(() => onClose());
  }, [ineligible]);

  // Cleanup: mark as seen when the modal closes (covers both "Ikke nu" and backdrop)
  const handleClose = () => {
    markTrialAnnouncementSeen();
    onClose();
  };

  const handleStartTrial = () => {
    markTrialAnnouncementSeen();
    onClose();
    navigate('/Checkout');
  };

  if (!ready || ineligible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[60]"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
        onClick={handleClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className="fixed left-5 right-5 z-[60] top-1/2 -translate-y-1/2 rounded-3xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-card)', boxShadow: '0 8px 48px rgba(44,26,14,0.18)' }}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center active:opacity-50 z-10" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
          <X className="w-3.5 h-3.5" style={{ color: 'var(--color-text-secondary)' }} />
        </button>

        <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--color-accent-soft)' }}>
            <Gift className="w-7 h-7" style={{ color: 'var(--color-accent)' }} />
          </div>

          <h2 className="text-xl font-semibold mb-2.5" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            {t.trialAnnouncementTitle}
          </h2>

          <p className="text-sm leading-relaxed mb-6 max-w-[270px]" style={{ color: 'var(--color-text-secondary)' }}>
            {t.trialAnnouncementBody}
          </p>

          <div className="w-full flex flex-col gap-2.5">
            <button
              onClick={handleStartTrial}
              className="w-full py-3.5 rounded-2xl text-[15px] font-semibold active:opacity-80 transition-opacity"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
            >
              {t.paywallStart7DaysFree}
            </button>
            <button
              onClick={handleClose}
              className="w-full py-3.5 rounded-2xl text-[15px] font-medium active:opacity-80 transition-opacity"
              style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
            >
              {t.trialAnnouncementNotNow}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}