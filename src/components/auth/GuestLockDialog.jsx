import React from 'react';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { showInAppLogin } from '@/lib/showInAppLogin';

/**
 * GuestLockDialog — vises når en gæstebruger (demo_mode / ikke-authenticated)
 * forsøger at tilgå låst indhold.
 *
 * To knapper:
 *   "Opret bruger" → kalder showInAppLogin (indbygget login-skærm, ALDRIG web-login)
 *   "Om os"       → navigerer til /AboutUs
 */
export default function GuestLockDialog() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-10 text-center"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: 'linear-gradient(135deg, #3A2B22, #5B3F2B)',
          boxShadow: '0 4px 20px rgba(58,43,34,0.25)',
        }}
      >
        <Lock className="w-7 h-7 text-white" />
      </div>

      <h2
        className="text-xl font-semibold mb-2"
        style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}
      >
        Opret en gratis bruger for at fortsætte
      </h2>
      <p className="text-sm mb-8 max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
        Du bruger appen som gæst. Opret en gratis bruger for at få adgang til søvnlog, kalender, community og meget mere.
      </p>

      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={() => showInAppLogin('/app')}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold active:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
        >
          Opret bruger
        </button>
        <button
          onClick={() => navigate('/AboutUs')}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold border active:opacity-80 transition-opacity"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
            backgroundColor: 'transparent',
          }}
        >
          Om os
        </button>
      </div>
    </motion.div>
  );
}