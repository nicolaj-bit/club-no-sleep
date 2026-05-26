import React, { useState } from 'react';
import { Lock, Sparkles, Loader2, RefreshCw, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { clearSubscriptionCache } from './useSubscription';

/**
 * ContentLock – wraps premium content.
 * Shows a blurred preview with a lock overlay for non-subscribers.
 * 
 * Props:
 *   locked: boolean   — whether to show the lock
 *   loading: boolean  — still checking subscription (show spinner, block interactions)
 *   children          — the content to show/blur
 *   blurHeight: string — height of the blurred preview area (default '200px')
 */
export default function ContentLock({ locked, loading: subscriptionLoading, children, blurHeight = '200px', onUnlocked }) {
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState(null);
  const [restoreMsg, setRestoreMsg] = useState(null);

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

  const handleSubscribe = async () => {
    if (window.self !== window.top) {
      setError('Betaling virker kun fra den publicerede app.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {});
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch {
      setError('Noget gik galt. Prøv igen.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    setError(null);
    setRestoreMsg(null);
    try {
      const response = await base44.functions.invoke('verifySubscription', {});
      if (response.data?.active) {
        clearSubscriptionCache();
        setRestoreMsg('✓ Abonnement gendannet!');
        setTimeout(() => onUnlocked?.(), 1200);
      } else {
        setRestoreMsg('Intet aktivt abonnement fundet.');
      }
    } catch {
      setError('Kunne ikke tjekke abonnement. Prøv igen.');
    } finally {
      setRestoring(false);
    }
  };

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
          Premium indhold
        </p>
        <p className="text-sm text-center mb-5" style={{ color: 'var(--color-text-muted)' }}>
          Abonner for at få adgang til alt indhold
        </p>

        {error && (
          <div className="w-full flex items-start gap-2 rounded-xl px-3 py-2 mb-3" style={{ background: 'rgba(220,60,40,0.08)', border: '1px solid rgba(220,60,40,0.2)' }}>
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {restoreMsg && (
          <div className="w-full rounded-xl px-3 py-2 mb-3 text-center" style={{ background: 'rgba(100,180,100,0.1)', border: '1px solid rgba(100,180,100,0.2)' }}>
            <p className="text-sm font-medium" style={{ color: '#3A7A3A' }}>{restoreMsg}</p>
          </div>
        )}

        <button
          onClick={handleSubscribe}
          disabled={loading || restoring}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 mb-2 disabled:opacity-60"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Indlæser…</>
            : <><Sparkles className="w-4 h-4" /> Abonner for 59 kr./md.</>}
        </button>

        <button
          onClick={handleRestore}
          disabled={loading || restoring}
          className="w-full py-2 rounded-2xl text-xs flex items-center justify-center gap-1.5 disabled:opacity-60"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {restoring
            ? <><Loader2 className="w-3 h-3 animate-spin" /> Tjekker…</>
            : <><RefreshCw className="w-3 h-3" /> Gendan eksisterende køb</>}
        </button>
      </motion.div>
    </div>
  );
}