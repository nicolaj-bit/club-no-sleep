import React, { useState } from 'react';
import { Moon, LogIn, UserPlus, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { base44 } from '@/api/base44Client';
import { redirectToWebSubscription, openExternalUrl, redirectToLogin } from '@/lib/nativeAuth';

export default function NativeAuthScreen() {
  const [mode, setMode] = useState('login'); // login | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Udfyld email og adgangskode');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Login med email/password
      const { access_token, user } = await base44.auth.loginViaEmailPassword(email, password);

      if (!access_token) {
        throw new Error('Login mislykkedes — intet token modtaget');
      }

      // Gem token i localStorage så SDK + NativeAuthGate kan bruge det efter reload
      localStorage.setItem('base44_access_token', access_token);

      // Tjek abonnementsstatus
      const profiles = await base44.entities.UserProfile.filter({ user_email: email });

      if (profiles.length > 0) {
        const sub = profiles[0].subscription_status;

        if (sub === 'active') {
          // Aktivt abonnement → genindlæs appen (NativeAuthGate vil nu lade brugeren igennem)
          window.location.reload();
          return;
        }
      }

      // Intet aktivt abonnement → redirect til web for betaling
      // Send token med så web-siden er logget ind
      redirectToWebSubscription(access_token);
    } catch (e) {
      console.error('[NativeAuthScreen] Login error:', e);
      setError(e?.message || 'Login mislykkedes. Tjek email og adgangskode.');
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    await redirectToLogin('/app');
  };

  const handleDemo = () => {
    localStorage.setItem('demo_mode', 'true');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Hero gradient */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #3A2B22 0%, #5B3F2B 50%, #C29A73 100%)',
          paddingTop: 'max(80px, env(safe-area-inset-top))',
          paddingBottom: 48,
        }}
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10" style={{ background: '#C29A73' }} />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10" style={{ background: '#EDE4DB' }} />

        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
          >
            <Moon className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-3xl font-light text-white mb-2"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', letterSpacing: '-0.01em' }}
          >
            Club No Sleep
          </motion.h1>

          <motion.p
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-sm text-white/75 max-w-xs"
          >
            Din digitale følgesvend som forælder
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-5 pt-8 pb-8">
        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.div
              key="login"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2
                className="text-xl font-semibold mb-1 text-center"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'var(--color-text-primary)' }}
              >
                Log ind
              </h2>
              <p className="text-sm text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Indtast dine oplysninger for at fortsætte
              </p>

              {/* Email */}
              <div className="mb-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  keyboardType="email-address"
                  className="w-full px-4 py-3.5 rounded-xl text-base outline-none"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>

              {/* Password */}
              <div className="mb-2 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Adgangskode"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onSubmitEditing={handleLogin}
                  className="w-full px-4 py-3.5 pr-12 rounded-xl text-base outline-none"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 mb-3 px-1"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#dc2626' }} />
                  <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
                </motion.div>
              )}

              {/* Login button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-4 rounded-2xl text-base font-semibold mb-3 flex items-center justify-center gap-2 transition-opacity"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-bg)',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" /> Log ind
                  </>
                )}
              </motion.button>

              {/* Switch to signup */}
              <button
                onClick={handleSignup}
                className="w-full text-center text-sm pt-2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Har du ikke en konto?{' '}
                <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Opret bruger</span>
              </button>

              {/* Demo mode */}
              <button
                onClick={handleDemo}
                className="w-full py-3.5 rounded-2xl text-sm font-medium mt-5 border transition-colors"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'transparent',
                }}
              >
                Jeg vil kigge
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              <UserPlus className="w-10 h-10 mb-4" style={{ color: 'var(--color-accent)' }} />
              <h2
                className="text-xl font-semibold mb-2"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'var(--color-text-primary)' }}
              >
                Opret bruger
              </h2>
              <p className="text-sm mb-8 max-w-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Oprettelse og betaling sker på vores hjemmeside. Du vil blive omdirigeret nu.
              </p>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSignup}
                className="w-full py-4 rounded-2xl text-base font-semibold flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-bg)',
                }}
              >
                <UserPlus className="w-5 h-5" /> Gå til oprettelse
              </motion.button>
              <button
                onClick={() => setMode('login')}
                className="w-full text-center text-sm pt-4"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Har du allerede en konto?{' '}
                <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Log ind</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1" />
      </div>
    </div>
  );
}