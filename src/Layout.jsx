import React, { useEffect, useState } from 'react';
import BottomNav from '@/components/ui/BottomNav';
import { base44 } from '@/api/base44Client';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <style>{`
        body { background-color: var(--color-bg) !important; }
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
  );
}