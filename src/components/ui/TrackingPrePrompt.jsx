import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

const DECLINED_KEY = 'cns_tracking_declined';

/**
 * Har brugeren sagt nej til sporing i vores egen forespørgsel?
 *
 * Et nej er endeligt. Apples dialog bliver aldrig vist, og vi spørger ikke
 * igen — hverken næste gang appen åbnes eller om en uge. Det er derfor den
 * her forespørgsel findes: Apple spørger kun én gang i en apps levetid, og et
 * nej dér kan brugeren kun lave om inde i Indstillinger. Siger hun nej her i
 * stedet, har hun ikke brugt sit ene svar hos Apple.
 */
export function hasDeclinedTracking() {
  try {
    return !!localStorage.getItem(DECLINED_KEY);
  } catch {
    // Spærret lagring. Så vises forespørgslen igen — det er bedre end at
    // regne et nej, vi ikke kan huske, for et ja.
    return false;
  }
}

function rememberDecline() {
  try {
    localStorage.setItem(DECLINED_KEY, String(Date.now()));
  } catch {
    // ignoreres med vilje
  }
}

/**
 * Blød forespørgsel, der vises FØR Apples sporingsdialog.
 *
 * Apples dialog vises kun, hvis brugeren trykker «Ja, det er fint». Der er
 * med vilje intet kryds og ingen vej ud ved at trykke udenfor: de to knapper
 * er de to svar, og «Nej tak» er vejen ud. Et halvt svar ville betyde, at vi
 * skulle spørge igen ved næste opstart.
 *
 * `onClose(accepted)` kaldes med true, hvis Apples dialog skal vises.
 */
export default function TrackingPrePrompt({ open, onClose }) {
  const [answering, setAnswering] = useState(false);

  const handleAccept = () => {
    if (answering) return;
    setAnswering(true);
    onClose(true);
  };

  const handleDecline = () => {
    if (answering) return;
    setAnswering(true);
    rememberDecline();
    onClose(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="fixed left-5 right-5 z-[60] top-1/2 -translate-y-1/2 rounded-3xl overflow-hidden"
            style={{ backgroundColor: 'var(--color-bg-card)', boxShadow: '0 8px 48px rgba(44,26,14,0.18)' }}
          >
            <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--color-accent-soft)' }}>
                <BarChart3 className="w-7 h-7" style={{ color: 'var(--color-accent)' }} />
              </div>

              <h2
                className="mb-3 max-w-[280px]"
                style={{
                  color: 'var(--color-text-primary)',
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: '1.35rem',
                  lineHeight: 1.25,
                }}
              >
                Må vi se, om vores annoncer virker?
              </h2>

              <p className="text-sm leading-relaxed mb-6 max-w-[280px]" style={{ color: 'var(--color-text-secondary)' }}>
                Vi bruger det kun til at forstå, hvor nye mødre finder os. Vi sælger ikke dine data, og appen fungerer præcis som før.
              </p>

              <div className="w-full flex flex-col gap-2.5">
                <button
                  onClick={handleAccept}
                  disabled={answering}
                  className="w-full py-3.5 rounded-2xl text-[15px] font-semibold active:opacity-80 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
                >
                  Ja, det er fint
                </button>
                <button
                  onClick={handleDecline}
                  disabled={answering}
                  className="w-full py-3.5 rounded-2xl text-[15px] font-medium active:opacity-80 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
                >
                  Nej tak
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
