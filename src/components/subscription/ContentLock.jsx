import React from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MEMBERSHIP_URL = 'https://www.lalatoto.dk/pages/abonnement';

/**
 * ContentLock – wraps premium content.
 * Shows a blurred preview with a membership lock overlay for non-subscribers.
 *
 * Props:
 *   locked: boolean   — whether to show the lock
 *   loading: boolean  — still checking subscription (show spinner, block interactions)
 *   children          — the content to show/blur
 *   blurHeight: string — height of the blurred preview area (default '200px')
 */
export default function ContentLock({ locked, loading: subscriptionLoading, children, blurHeight = '200px' }) {

  // While subscription is still loading, show a full-height spinner overlay so nothing is clickable
  if (subscriptionLoading) {
    return (
      <div className="relative min-h-[300px]">
        <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }}>
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(250,246,241,0.7)' }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
      </div>
    );
  }

  if (!locked) return children;

  return (
    <div className="relative">
      {/* Blurred preview */}
      <div
        style={{
          maxHeight: blurHeight,
          overflow: 'hidden',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)',
          filter: 'blur(2px)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {children}
      </div>

      {/* Lock overlay */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center px-6 pt-4 pb-6"
        style={{ marginTop: '-24px' }}
      >
        {/* Lock icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: 'linear-gradient(135deg, #3A2B22, #5B3F2B)',
            boxShadow: '0 4px 20px rgba(58,43,34,0.25)',
          }}
        >
          <Lock className="w-6 h-6 text-white" />
        </div>

        <p className="text-base font-semibold text-center mb-1" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Denne funktion kræver medlemskab
        </p>
        <p className="text-sm text-center mb-5" style={{ color: 'var(--color-text-muted)' }}>
          Bliv medlem og få adgang til alle funktioner i appen
        </p>

        <a
          href={MEMBERSHIP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)', textDecoration: 'none' }}
        >
          Læs mere
        </a>
      </motion.div>
    </div>
  );
}