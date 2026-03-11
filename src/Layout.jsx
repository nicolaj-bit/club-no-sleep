import React, { useEffect, useState } from 'react';

const ONESIGNAL_APP_ID = '71bec506-d231-47da-aa17-f8790b335a32';
import BottomNav from '@/components/ui/BottomNav';
import { base44 } from '@/api/base44Client';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { TabStateProvider } from '@/components/ui/TabStateContext';

// Pages that should NOT show bottom nav
const noNavPages = ['Login', 'Chat', 'ProductDetail', 'BlogPost', 'ArticleDetail', 'ExpertDetail', 'Booking', 'AIChat'];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const showNav = !noNavPages.includes(currentPageName);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const u = await base44.auth.me();
          setUser(u);
        }
      } catch (e) {
        console.log('Not authenticated');
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    // Kun aktiver OneSignal i appen (PWA standalone/installed), ikke på hjemmesiden
    const isApp = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;

    if (!isApp) return;

    // Load OneSignal SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.defer = true;
    document.head.appendChild(script);

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
      });
      // Tag brugeren med deres email så vi kan sende målrettede tigerspring-notifikationer
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const u = await base44.auth.me();
          if (u?.email) {
            OneSignal.login(u.email);
          }
        }
      } catch (_) {}
    });

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <ThemeProvider>
    <TabStateProvider>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-primary)', minHeight: '100dvh' }}>
        <style>{`
          body { background-color: var(--color-bg) !important; color: var(--color-text-primary) !important; }
          .safe-area-bottom {
            padding-bottom: max(var(--safe-area-inset-bottom, 0px), 8px);
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            -webkit-font-smoothing: antialiased;
          }
          ::-webkit-scrollbar { width: 4px; height: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
        `}</style>

        <Toaster position="top-center" />

        <AnimatePresence mode="wait">
          <motion.main
            key={currentPageName}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={showNav ? "pb-20" : ""}
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
          >
            {children}
          </motion.main>
        </AnimatePresence>

        {showNav && <BottomNav />}
      </div>
    </ThemeProvider>
  );
}