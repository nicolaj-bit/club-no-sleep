import React from 'react';
import { Moon, LogIn, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { redirectToWebAuth } from '@/lib/nativeAuth';

export default function NativeAuthScreen() {
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
            LALATOTO
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
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-center mb-8"
        >
          <h2
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'var(--color-text-primary)' }}
          >
            Velkommen
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Log ind eller opret en konto for at komme i gang
          </p>
        </motion.div>

        <div className="flex-1" />

        {/* Login button */}
        <motion.button
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          onClick={() => redirectToWebAuth('login')}
          className="w-full py-4 rounded-2xl text-base font-semibold mb-3 flex items-center justify-center gap-2 active:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
        >
          <LogIn className="w-5 h-5" /> Log ind
        </motion.button>

        {/* Signup button */}
        <motion.button
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          onClick={() => redirectToWebAuth('signup')}
          className="w-full py-4 rounded-2xl text-base font-semibold flex items-center justify-center gap-2 active:opacity-80 transition-opacity"
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        >
          <UserPlus className="w-5 h-5" /> Opret bruger
        </motion.button>

        <p className="text-xs text-center mt-6" style={{ color: 'var(--color-text-muted)' }}>
          Du vil blive ført til vores hjemmeside for at oprette din konto og evt. abonnere.
        </p>
      </div>
    </div>
  );
}