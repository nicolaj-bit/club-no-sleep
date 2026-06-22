import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { buildAppDeepLink } from '@/lib/nativeAuth';
import { Loader2, ArrowRight, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * AuthNative — webside der håndterer login/oprettelse og sender brugeren tilbage til appen.
 *
 * Flow:
 * 1. NativeAuthGate åbner denne side i systembrowseren
 * 2. Hvis ikke logget ind: redirect til Base44 auth login
 * 3. Efter login: læs token fra localStorage og redirect til deep link (clubnosleep://auth?access_token=TOKEN)
 * 4. Appen fanger deep linket, gemmer token og genindlæser
 */
export default function AuthNative() {
  const [status, setStatus] = useState('checking'); // checking | redirecting | fallback

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action') || 'login';

    const checkAndRedirect = async () => {
      // Læs token fra URL (Base44 SDK sætter det der efter login) eller localStorage
      const urlToken = new URLSearchParams(window.location.search).get('access_token');
      if (urlToken) {
        localStorage.setItem('base44_access_token', urlToken);
      }

      const token = urlToken
        || localStorage.getItem('base44_access_token')
        || localStorage.getItem('token');

      if (token) {
        // Vi har et token — bekræft at brugeren faktisk er logget ind
        try {
          await base44.auth.me();
        } catch {
          // Token er ugyldig — redirect til login
          base44.auth.redirectToLogin(`/AuthNative?action=${action}`);
          return;
        }
        setStatus('redirecting');
        const deepLink = buildAppDeepLink({ access_token: token });
        window.location.href = deepLink;
        setTimeout(() => setStatus('fallback'), 2500);
        return;
      }

      // Intet token — redirect til login
      base44.auth.redirectToLogin(`/AuthNative?action=${action}`);
    };

    checkAndRedirect();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#F5EDE0', fontFamily: "'Inter', -apple-system, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap');
      `}</style>

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'linear-gradient(135deg, #5B3F2B, #C29A73)' }}
      >
        <Moon className="w-8 h-8 text-white" />
      </motion.div>

      {status === 'checking' && (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#5B3F2B' }} />
          <p style={{ color: '#7A665A', fontSize: '0.9rem' }}>Tjekker...</p>
        </div>
      )}

      {status === 'redirecting' && (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#5B3F2B' }} />
          <p style={{ color: '#7A665A', fontSize: '0.9rem' }}>Åbner appen...</p>
        </div>
      )}

      {status === 'fallback' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '1.8rem',
              color: '#2B1F16',
              margin: 0,
            }}
          >
            Du er logget ind!
          </h1>
          <p style={{ color: '#7A665A', fontSize: '0.9rem', maxWidth: 300, lineHeight: 1.6 }}>
            Klik herunder for at vende tilbage til appen.
          </p>
          <button
            onClick={() => {
              const token = localStorage.getItem('base44_access_token')
                || localStorage.getItem('token');
              if (token) {
                window.location.href = buildAppDeepLink({ access_token: token });
              }
            }}
            style={{
              backgroundColor: '#3A2416',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            Åbn appen <ArrowRight size={18} />
          </button>
        </motion.div>
      )}
    </div>
  );
}