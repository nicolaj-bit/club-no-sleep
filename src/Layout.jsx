import React, { useEffect, useState } from 'react';
import BottomNav from '@/components/ui/BottomNav';
import { base44 } from '@/api/base44Client';
import { Toaster } from 'sonner';

// Pages that should NOT show bottom nav
const noNavPages = ['Login', 'Chat', 'ProductDetail', 'BlogPost', 'ArticleDetail', 'ExpertDetail', 'Booking'];

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
    <div className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --color-primary: #0f172a;
          --color-primary-light: #1e293b;
          --color-accent: #3b82f6;
          --color-success: #10b981;
          --color-warning: #f59e0b;
          --color-error: #ef4444;
          --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
        }
        
        .safe-area-bottom {
          padding-bottom: max(var(--safe-area-inset-bottom), 8px);
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
      `}</style>
      
      <Toaster position="top-center" />
      
      <main className={showNav ? "pb-20" : ""}>
        {children}
      </main>
      
      {showNav && <BottomNav />}
    </div>
  );
}