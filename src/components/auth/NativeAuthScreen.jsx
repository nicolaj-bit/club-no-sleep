import React, { useState } from 'react';
import { Moon, LogIn, UserPlus, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { base44 } from '@/api/base44Client';

export default function NativeAuthScreen() {
  const [mode, setMode] = useState('login'); // login | signup | verify
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

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

      // Alle brugere får adgang — genindlæs appen
      window.location.reload();
    } catch (e) {
      console.error('[NativeAuthScreen] Login error:', e);
      setError(e?.message || 'Login mislykkedes. Tjek email og adgangskode.');
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      setError('Udfyld email og adgangskode');
      return;
    }
    if (password.length < 8) {
      setError('Adgangskoden skal være mindst 8 tegn');
      return;
    }
    if (password !== confirmPassword) {
      setError('Adgangskoderne er ikke ens');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await base44.auth.register({ email, password });
      setInfo('Vi har sendt en kode til din email. Indtast den herunder for at bekræfte din konto.');
      setMode('verify');
    } catch (e) {
      console.error('[NativeAuthScreen] Register error:', e);
      setError(e?.message || 'Oprettelse mislykkedes. Prøv igen.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      setError('Indtast koden fra din email');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await base44.auth.verifyOtp({ email, otpCode });
      const { access_token } = await base44.auth.loginViaEmailPassword(email, password);
      if (!access_token) {
        throw new Error('Login mislykkedes efter bekræftelse');
      }
      localStorage.setItem('base44_access_token', access_token);
      window.location.reload();
    } catch (e) {
      console.error('[NativeAuthScreen] Verify OTP error:', e);
      setError(e?.message || 'Koden er forkert eller udløbet. Prøv igen.');
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      await base44.auth.resendOtp(email);
      setInfo('Vi har sendt en ny kode til din email.');
    } catch (e) {
      setError(e?.message || 'Kunne ikke sende koden igen. Prøv senere.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    localStorage.setItem('demo_mode', 'true');
    window.location.reload();
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const isNative = Capacitor.isNativePlatform();
      if (isNative) {
        // På native: brug Apples eget native Sign in with Apple-UI (ingen browser,
        // ingen "vil bruge app.base44.com"-dialog). Identity-token verificeres
        // server-side i Base44-funktionen appleNativeLogin.
        const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');

        const result = await SignInWithApple.authorize({
          clientId: 'com.base699f47a86e7e0a874d1159ed.app',
          scopes: 'email name',
        });

        const identityToken = result?.response?.identityToken;
        if (!identityToken) {
          throw new Error('Intet identity token modtaget fra Apple');
        }

        const fullName = result?.response?.givenName
          ? `${result.response.givenName} ${result.response.familyName || ''}`.trim()
          : undefined;

        const { access_token } = await base44.functions.invoke('appleNativeLogin', {
          identityToken,
          fullName,
        });

        if (!access_token) {
          throw new Error('Apple login mislykkedes — intet token modtaget');
        }

        localStorage.setItem('base44_access_token', access_token);
        window.location.reload();
      } else {
        // På web: brug SDK's loginWithProvider
        await base44.auth.loginWithProvider('apple', '/app');
      }
    } catch (e) {
      console.error('[NativeAuthScreen] Apple login error:', e);
      setError(e?.message || 'Apple login mislykkedes. Prøv igen.');
      setLoading(false);
    }
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

              {/* Continue with Apple */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAppleLogin}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl text-base font-semibold mb-3 flex items-center justify-center gap-2 transition-opacity"
                style={{
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 814 1000" fill="#fff" style={{ marginRight: 6 }}>
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-150.3-109.2c-44.3-64.7-82.6-170.4-82.6-271.1 0-169.6 110.7-259.3 219.7-259.3 75.4 0 138.4 45.5 186 45.5 45.5 0 116.9-48.1 200.9-48.1 32.5 0 116.3 3.2 171.8 73.9zm-215.6-104.3c31.2-37 52.3-88.7 52.3-140.3 0-7.1-.6-14.3-1.9-20.1-49.4 1.9-108.2 33.1-143.7 75.4-27.6 31.9-53.5 83.6-53.5 136.2 0 7.7 1.3 15.5 1.9 17.9 3.2.6 8.4 1.3 13.6 1.3 44.3 0 98.5-29.9 131.3-70.4z"/>
                </svg>
                Continue with Apple
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>eller</span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
              </div>

              {/* Email */}
              <div className="mb-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  inputMode="email"
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
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
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
                onClick={() => { setError(null); setInfo(null); setMode('signup'); }}
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
          ) : mode === 'signup' ? (
            <motion.div
              key="signup"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2
                className="text-xl font-semibold mb-1 text-center"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'var(--color-text-primary)' }}
              >
                Opret bruger
              </h2>
              <p className="text-sm text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Indtast email og adgangskode for at oprette din konto
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
                  inputMode="email"
                  className="w-full px-4 py-3.5 rounded-xl text-base outline-none"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>

              {/* Password */}
              <div className="mb-3 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Adgangskode (mindst 8 tegn)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              {/* Confirm password */}
              <div className="mb-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Bekræft adgangskode"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                  className="w-full px-4 py-3.5 rounded-xl text-base outline-none"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
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

              {/* Register button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleRegister}
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
                    <UserPlus className="w-5 h-5" /> Opret bruger
                  </>
                )}
              </motion.button>

              <button
                onClick={() => { setError(null); setInfo(null); setMode('login'); }}
                className="w-full text-center text-sm pt-2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Har du allerede en konto?{' '}
                <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Log ind</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="verify"
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
                Bekræft din email
              </h2>
              <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {info || `Vi har sendt en kode til ${email}. Indtast den herunder.`}
              </p>

              <div className="w-full mb-2">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Kode fra email"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                  className="w-full px-4 py-3.5 rounded-xl text-base text-center outline-none"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>

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

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full py-4 rounded-2xl text-base font-semibold mt-2 flex items-center justify-center gap-2 transition-opacity"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-bg)',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Bekræft'}
              </motion.button>

              <button
                onClick={handleResendOtp}
                disabled={loading}
                className="w-full text-center text-sm pt-4"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Fik du ingen kode?{' '}
                <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Send igen</span>
              </button>

              <button
                onClick={() => { setError(null); setInfo(null); setMode('login'); }}
                className="w-full text-center text-sm pt-2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Tilbage til login
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1" />
      </div>
    </div>
  );
}