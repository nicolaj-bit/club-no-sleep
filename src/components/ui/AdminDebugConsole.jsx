import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Indlæser Eruda debug-konsol KUN hvis brugeren er admin OG localStorage 'debug_mode' === 'on'.
// Renderes i Layout — kører ved app-start og forbliver passiv for almindelige brugere.
export default function AdminDebugConsole() {
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        if (localStorage.getItem('debug_mode') !== 'on') return;
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) return;
        const user = await base44.auth.me();
        if (user?.role !== 'admin') return;
        if (cancelled) return;
        if (window.eruda) {
          window.eruda.init();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/eruda@3';
        script.onload = () => { if (window.eruda && !cancelled) window.eruda.init(); };
        document.body.appendChild(script);
      } catch {
        /* ignore — debug-konsol er valgfri */
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  return null;
}