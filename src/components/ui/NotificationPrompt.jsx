import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';

const STORAGE_KEY = 'lalatoto_notif_prompt_dismissed';

export default function NotificationPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Vent lidt så appen er loadet færdig
    const timer = setTimeout(async () => {
      // Vis ikke hvis allerede afvist
      if (localStorage.getItem(STORAGE_KEY)) return;

      // Tjek om notifikationer allerede er givet tilladelse
      if (window.Notification && Notification.permission === 'granted') return;

      // Vis kun hvis OneSignal er klar
      if (!window.OneSignalDeferred) return;

      setShow(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleAllow = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, 'true');

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.Notifications.requestPermission();
      } catch (e) {
        console.log('Push permission error:', e);
      }
    });
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, 'dismissed');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-24 left-4 right-4 z-50 rounded-2xl shadow-xl p-4"
          style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-full"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={16} />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--color-accent-warm)' }}>
              <Bell size={20} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="flex-1 pr-4">
              <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
                Få besked om tigerspring & aftaler 🐯
              </p>
              <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                Slå notifikationer til så du aldrig går glip af vigtige opdateringer.
              </p>
              <button
                onClick={handleAllow}
                className="w-full py-2 rounded-xl text-sm font-medium"
                style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
              >
                Tillad notifikationer
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}