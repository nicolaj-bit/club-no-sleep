import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { requestPushPermission } from '@/utils/requestPushPermission';
import { useWanilla } from '@/components/subscription/useWanilla';
import { Loader2, Check, ArrowLeft, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

function AppleIcon({ className, style }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.31-3.74 4.25z"/>
    </svg>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  const wanilla = useWanilla();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const user = await base44.auth.me();
          if (user?.email) {
            const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
            if (profiles.length) setProfile(profiles[0]);
          }
        }
      } catch (_) {}
    };
    loadProfile();
  }, []);

  const isActive = profile?.subscription_status === 'active';

  const handlePurchase = async () => {
    setError(null);
    setPurchasing(true);
    try {
      await wanilla.purchase();
      setSuccess('✓ Abonnement aktiveret!');
      // Synkroniser profil med backend
      await base44.functions.invoke('verifySubscription', {}).catch(() => {});
      setTimeout(() => requestPushPermission(), 1500);
    } catch (e) {
      const errMsg = e?.message || (typeof e === 'string' ? e : 'Køb fejlede');
      if (!errMsg.toLowerCase().includes('cancel')) {
        setError(errMsg);
      }
    } finally {
      setPurchasing(false);
    }
  };

  if (isActive) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: '#f3efe9' }}>
        <div className="w-full max-w-sm rounded-3xl p-8 text-center" style={{ backgroundColor: '#fff', border: '1px solid #EDE4DB' }}>
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(100,180,100,0.15)' }}>
            <Check className="w-7 h-7" style={{ color: '#3A7A3A' }} />
          </div>
          <h2 className="text-xl font-semibold mb-1" style={{ color: '#5d3a2c', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Du har allerede abonnement
          </h2>
          <p className="text-sm mb-6" style={{ color: '#7A665A' }}>
            Du har fuld adgang til alle funktioner.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold"
            style={{ backgroundColor: '#5d3a2c', color: '#fff' }}
          >
            Tilbage til appen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f3efe9' }}>
      {/* Top bar */}
      <div className="px-4 pt-4" style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm" style={{ color: '#5d3a2c' }}>
          <ArrowLeft className="w-4 h-4" /> Tilbage
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div
            className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center"
            style={{ backgroundColor: '#5d3a2c' }}
          >
            <span className="text-2xl font-bold" style={{ color: '#fff', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>C</span>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#5d3a2c', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Bliv medlem
          </h1>
          <p className="text-sm" style={{ color: '#5d3a2c' }}>
            59 kr. / måned · Ingen binding · Opsig når som helst
          </p>
        </div>

        {/* Features */}
        <div className="mb-6 space-y-2.5">
          {[
            'Fuld adgang til alle tigerspring og milepæle',
            'Personlig AI-søvnrådgiver',
            'Kalender med påmindelser',
            'Mødregruppe og fællesskab',
            'Babyvenlige caféer i dit område',
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(91,63,43,0.1)' }}>
                <Check className="w-3 h-3" style={{ color: '#5d3a2c' }} />
              </div>
              <p className="text-sm" style={{ color: '#5d3a2c' }}>{feature}</p>
            </div>
          ))}
        </div>

        {/* Payment method card — Apple IAP via Wanilla */}
        <div className="mb-6">
          <div
            className="w-full rounded-2xl p-4 flex items-center gap-3"
            style={{ backgroundColor: '#5d3a2c', border: '2px solid #5d3a2c' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <AppleIcon className="w-5 h-5" style={{ color: '#fff' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: '#fff' }}>
                In-App Purchase (App Store)
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Betal via din Apple-konto · Sikker og nem
              </p>
            </div>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#C9AA8F' }}
            >
              <Check className="w-3.5 h-3.5" style={{ color: '#5d3a2c' }} />
            </div>
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div className="rounded-xl px-4 py-3 mb-4 text-sm font-medium" style={{ background: 'rgba(100,180,100,0.1)', border: '1px solid rgba(100,180,100,0.2)', color: '#3A7A3A' }}>
            {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl px-4 py-3 mb-4" style={{ background: 'rgba(200,60,60,0.1)', border: '1px solid rgba(200,60,60,0.3)' }}>
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#a04040' }} />
            <p className="text-xs" style={{ color: '#a04040' }}>{error}</p>
          </div>
        )}

        {/* Loading state */}
        {wanilla.loading && (
          <div className="rounded-xl px-4 py-3 mb-4 text-xs font-medium flex items-center gap-2" style={{ background: 'rgba(100,100,180,0.1)', border: '1px solid rgba(100,100,180,0.2)', color: '#5050a0' }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Forbereder App Store…
          </div>
        )}

        {/* CTA button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handlePurchase}
          disabled={purchasing || wanilla.loading || !wanilla.ready}
          className="w-full py-4 rounded-2xl text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ backgroundColor: '#3e2a22', color: '#fff' }}
        >
          {purchasing || wanilla.loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Behandler…</>
            : <>Abonner — 59 kr./md. →</>}
        </motion.button>

        {/* Footer */}
        <p className="text-center text-xs mt-4 flex items-center justify-center gap-1" style={{ color: '#7A665A' }}>
          <Lock className="w-3 h-3" /> Sikker betaling via Apple · Ingen binding · Annuller når som helst
        </p>
      </div>
    </div>
  );
}