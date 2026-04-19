import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ui/ThemeProvider';
import { Moon } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DarkModeNudge() {
  const { isDark, toggle } = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isDark) return;

    const hour = new Date().getHours();
    const isEvening = hour >= 20 || hour < 6;
    if (!isEvening) return;

    const dismissed = sessionStorage.getItem('dark-nudge-dismissed');
    if (dismissed) return;

    // Kun vis hvis brugeren har en profil (dvs. ikke er i onboarding)
    const checkProfile = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return;
        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        if (!profiles.length) return;
        const timer = setTimeout(() => setVisible(true), 3000);
        return () => clearTimeout(timer);
      } catch {}
    };
    checkProfile();
  }, [isDark]);

  const handleAccept = () => {
    toggle();
    setVisible(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('dark-nudge-dismissed', '1');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-28 left-0 right-0 z-50 flex justify-center px-5"
        >
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl max-w-sm w-full"
            style={{
              backgroundColor: '#1A1A1A',
              border: '1px solid #2A2A2A',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#2A2A2A' }}
            >
              <Moon className="w-4 h-4 text-amber-400" />
            </div>
            <button
              onClick={handleAccept}
              className="flex-1 text-left"
            >
              <p className="text-sm font-medium text-white leading-snug">
                Vi har skruet lyset ned
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Tryk her for at skifte til mørk tilstand 🌙</p>
            </button>
            <button
              onClick={handleDismiss}
              className="text-gray-500 text-lg leading-none px-1 hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}