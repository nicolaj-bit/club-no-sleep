import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { buildAppDeepLink, APP_DEEP_LINK_SCHEME } from '@/lib/nativeAuth';
import { Loader2, ArrowRight, Moon, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * AuthNative — webside der håndterer login/oprettelse og sender brugeren tilbage til appen.
 *
 * Flow:
 * 1. NativeAuthGate åbner denne side i systembrowseren (for signup eller når brugeren ikke har aktivt abonnement)
 * 2. Hvis ikke logget ind: redirect til Base44 auth login
 * 3. Efter login: tjek abonnementsstatus
 * 4. Hvis aktivt abonnement: vis "Åbn app" med deep link (token)
 * 5. Hvis ikke aktivt: redirect til /Checkout for betaling
 */
export default function AuthNative() {
  const [status, setStatus] = useState('checking'); // checking | ready | no_subscription | error
  const [token, setToken] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action') || 'login';

    const checkAndRedirect = async () => {
      // Læs token fra URL (Base44 SDK sætter det der efter login) eller localStorage
      const urlToken = urlParams.get('access_token');
      if (urlToken) {
        localStorage.setItem('base44_access_token', urlToken);
      }

      const foundToken = urlToken
        || localStorage.getItem('base44_access_token')
        || localStorage.getItem('token');

      if (!foundToken) {
        // Intet token — hvis action=signup, åbn signup på clubnosleep.com i nyt vindue
        if (action === 'signup') {
          window.open('https://clubnosleep.com', '_blank');
          setStatus('error');
          return;
        }
        // Ellers redirect til Base44 login
        base44.auth.redirectToLogin(`/AuthNative?action=login`);
        return;
      }

      setToken(foundToken);

      try {
        // Tjek om brugeren har et aktivt abonnement
        const user = await base44.auth.me();
        if (user) {
          const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
          if (profiles.length > 0 && profiles[0].subscription_status === 'active') {
            // Aktivt abonnement → vis "Åbn app" knap
            setStatus('ready');
            return;
          }
        }
        // Intet aktivt abonnement → redirect til Checkout efter kort delay
        setStatus('no_subscription');
        setTimeout(() => {
          window.location.href = `/Checkout?access_token=${encodeURIComponent(foundToken)}`;
        }, 2500);
      } catch (e) {
        console.error('[AuthNative] Subscription check error:', e);
        // Ved fejl: vis alligevel "Åbn app" knap
        setStatus('ready');
      }
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

      {status === 'no_subscription' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#5B3F2B' }} />
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '1.5rem',
              color: '#2B1F16',
              margin: 0,
            }}
          >
            Du har ikke et aktivt abonnement
          </h1>
          <p style={{ color: '#7A665A', fontSize: '0.9rem', maxWidth: 300, lineHeight: 1.6 }}>
            Du videresendes til betaling om et øjeblik...
          </p>
        </motion.div>
      )}

      {status === 'ready' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <CheckCircle2 className="w-12 h-12" style={{ color: '#5B3F2B' }} />
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
          <a
            href={token
              ? buildAppDeepLink({ access_token: token })
              : `${APP_DEEP_LINK_SCHEME}://auth`}
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
              textDecoration: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Åbn appen <ArrowRight size={18} />
          </a>
        </motion.div>
      )}

      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '1.5rem',
              color: '#2B1F16',
              margin: 0,
            }}
          >
            Opret dig på clubnosleep.com
          </h1>
          <p style={{ color: '#7A665A', fontSize: '0.9rem', maxWidth: 300, lineHeight: 1.6 }}>
            Du kan oprette dig og betale på vores website. Vinduet skulle åbne nu.
          </p>
          <button
            onClick={() => window.open('https://clubnosleep.com', '_blank')}
            style={{
              backgroundColor: '#3A2416',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Gå til clubnosleep.com
          </button>
        </motion.div>
      )}
    </div>
  );
}