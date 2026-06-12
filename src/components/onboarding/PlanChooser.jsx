import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const PREMIUM_FEATURES = [
  'Fuld søvnrådgivning med AI',
  'Tigerspring & udviklingsguide',
  'Chat med andre forældre',
  'Ekspert booking',
  'Videnscenter med 100+ artikler',
  'Kalender & notifikationer',
];

const FREE_FEATURES = [
  'Begrænset søvnrådgivning',
  'Basis kalender',
  'Fællesskab (kun læseadgang)',
];

export default function PlanChooser({ onChoose }) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      if (window.self !== window.top) {
        toast.error('Betaling virker kun fra den publicerede app – ikke i preview.');
        setLoading(false);
        return;
      }
      const res = await base44.functions.invoke('createCheckoutSession', {
        success_url: `${window.location.origin}/Onboarding?subscription=success`,
        cancel_url: `${window.location.origin}/Onboarding`,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (e) {
      toast.error('Noget gik galt. Prøv igen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="plan"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Premium card */}
      <div
        className="rounded-3xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #DCC1B0, #C8A882)', border: '2px solid #B08D72' }}
      >
        <div className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
          Anbefalet
        </div>
        <p className="text-white text-xs font-semibold uppercase tracking-widest mb-1 opacity-80">Fuld adgang</p>
        <div className="flex items-end gap-1 mb-4">
          <span className="text-4xl font-bold text-white">69 kr.</span>
          <span className="text-white opacity-70 mb-1">/ md.</span>
        </div>

        <ul className="space-y-1.5 mb-5">
          {PREMIUM_FEATURES.map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-white">
              <Check className="w-4 h-4 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
          style={{ backgroundColor: '#fff', color: '#5B3F2B' }}
        >
          {loading ? 'Åbner betaling...' : <><Sparkles className="w-4 h-4" /> Kom i gang</>}
        </button>
      </div>

      {/* Free / demo */}
      <div
        className="rounded-3xl p-5"
        style={{ backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
      >
        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text-primary)' }}>Demo — gratis</p>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>Begrænset adgang, ingen betaling</p>
        <ul className="space-y-1.5 mb-4">
          {FREE_FEATURES.map(f => (
            <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
              {f}
            </li>
          ))}
        </ul>
        <button
          onClick={() => onChoose('demo')}
          className="w-full py-3 rounded-2xl font-medium text-sm"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'transparent' }}
        >
          Fortsæt med demo →
        </button>
      </div>
    </motion.div>
  );
}