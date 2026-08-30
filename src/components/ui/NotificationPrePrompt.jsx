import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { requestPushPermission } from '@/utils/requestPushPermission';

const DISMISS_KEY = 'notif_prompt_dismissed_at';
const REASK_DAYS = 7;

/** Whether enough time has passed since the user last dismissed the pre-prompt. */
export function shouldShowNotifPrompt() {
  try {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (!dismissed) return true;
    const daysSince = (Date.now() - parseInt(dismissed, 10)) / (1000 * 60 * 60 * 24);
    return daysSince >= REASK_DAYS;
  } catch {
    return true;
  }
}

export function dismissNotifPrompt() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {}
}

/**
 * Gentle pre-prompt shown BEFORE the OS permission dialog.
 * "Må vi give dig besked, når dit barn går ind i et nyt tigerspring…?"
 * The system dialog is only shown when the user taps "Ja tak".
 */
export default function NotificationPrePrompt({ open, onClose }) {
  const [requesting, setRequesting] = useState(false);

  const handleAccept = async () => {
    setRequesting(true);
    try {
      await requestPushPermission();
    } catch {}
    setRequesting(false);
    onClose();
  };

  const handleDismiss = () => {
    dismissNotifPrompt();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={handleDismiss}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="fixed left-5 right-5 z-[60] top-1/2 -translate-y-1/2 rounded-3xl overflow-hidden"
            style={{ backgroundColor: 'var(--color-bg-card)', boxShadow: '0 8px 48px rgba(44,26,14,0.18)' }}
          >
            <button onClick={handleDismiss} className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center active:opacity-50 z-10" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
              <X className="w-3.5 h-3.5" style={{ color: 'var(--color-text-secondary)' }} />
            </button>

            <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--color-accent-soft)' }}>
                <Bell className="w-7 h-7" style={{ color: 'var(--color-accent)' }} />
              </div>

              <p className="text-base leading-relaxed mb-6 max-w-[260px]" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.15rem' }}>
                Må vi give dig besked, når dit barn går ind i et nyt tigerspring, og når der er nyt i appen?
              </p>

              <div className="w-full flex flex-col gap-2.5">
                <button
                  onClick={handleAccept}
                  disabled={requesting}
                  className="w-full py-3.5 rounded-2xl text-[15px] font-semibold active:opacity-80 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
                >
                  {requesting ? '…' : 'Ja tak'}
                </button>
                <button
                  onClick={handleDismiss}
                  disabled={requesting}
                  className="w-full py-3.5 rounded-2xl text-[15px] font-medium active:opacity-80 transition-opacity"
                  style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
                >
                  Ikke nu
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}