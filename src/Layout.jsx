import React, { useEffect, useState } from 'react';
import BottomNav from '@/components/ui/BottomNav';
import { base44 } from '@/api/base44Client';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { TabStateProvider } from '@/components/ui/TabStateContext';
import { LanguageProvider } from '@/components/ui/LanguageContext';
import DarkModeNudge from '@/components/ui/DarkModeNudge';
import NotificationPrompt from '@/components/ui/NotificationPrompt';
import { ActiveProfileProvider } from '@/components/ui/ActiveProfileContext';
import { ActiveChildProvider } from '@/components/ui/ActiveChildContext';

const ONESIGNAL_APP_ID = '71bec506-d231-47da-aa17-f8790b335a32';

// Pages that should NOT show bottom nav
// AIChat is a full-screen immersive UI — suppress the nav, but it remains accessible via the bottom tab AI button
const noNavPages = ['Login', 'Chat', 'ProductDetail', 'BlogPost', 'ArticleDetail', 'ExpertDetail', 'Booking', 'AIChat', 'Onboarding', 'Milestones', 'Subscription'];


// Root-level tab pages — use crossfade (no slide) to feel like native tab switch
const rootTabPages = ['Home', 'Shop', 'Blog', 'SleepLog', 'Knowledge', 'Community', 'Profile', 'AIChat'];

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
    // OneSignal setup — virker i web, PWA, iOS (Capacitor) og Android (Capacitor)
    const isCapacitor = !!window.Capacitor;
    
    if (isCapacitor) {
      // Native iOS/Android via Capacitor
      import('https://cdn.onesignal.com/sdks/OneSignalSDK.js').then(() => {
        window.OneSignal = window.OneSignal || [];
        window.OneSignal.push(async function(OneSignal) {
          await OneSignal.init({
            appId: ONESIGNAL_APP_ID,
          });
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
      }).catch(e => console.error('OneSignal import failed:', e));
    } else {
      // Web / PWA
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
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, []);

  return (
    <ThemeProvider>
    <LanguageProvider>
    <ActiveProfileProvider>
    <ActiveChildProvider>
    <TabStateProvider>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-primary)', minHeight: '100dvh' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');
          body { background-color: var(--color-bg) !important; color: var(--color-text-primary) !important; }
          .safe-area-bottom {
            padding-bottom: max(var(--safe-area-inset-bottom, 0px), 8px);
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          h1, h2, h3, .font-display {
            font-family: 'Cormorant Garamond', Georgia, serif;
          }
          ::-webkit-scrollbar { width: 3px; height: 3px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #C8A882; border-radius: 2px; }
        `}</style>

        <Toaster position="top-center" />

        <AnimatePresence mode="wait">
          <motion.main
            key={currentPageName}
            initial={rootTabPages.includes(currentPageName)
              ? { opacity: 0 }
              : { opacity: 0, x: 20 }}
            animate={rootTabPages.includes(currentPageName)
              ? { opacity: 1 }
              : { opacity: 1, x: 0 }}
            exit={rootTabPages.includes(currentPageName)
              ? { opacity: 0 }
              : { opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={showNav ? "pb-20" : ""}
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
          >
            {children}
          </motion.main>
        </AnimatePresence>

        {showNav && <BottomNav />}
        <DarkModeNudge />
        <NotificationPrompt />
      </div>
    </TabStateProvider>
    </ActiveChildProvider>
    </ActiveProfileProvider>
    </LanguageProvider>
    </ThemeProvider>
  );
}