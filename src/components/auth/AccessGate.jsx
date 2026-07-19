import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/components/subscription/useSubscription';
import { showInAppLogin } from '@/lib/showInAppLogin';

/**
 * AccessGate — centraliseret adgangskontrol på rute-niveau.
 *
 * Gæster (demo_mode / ikke logget ind):
 *   Sløret indhold + boks med "Bliv medlem" / "Opret bruger" → showInAppLogin
 *
 * Indloggede UDEN aktivt abonnement:
 *   Sløret indhold + boks med "Bliv medlem" / "Bliv medlem" → /Checkout
 *
 * Indloggede MED aktivt abonnement eller trial:
 *   Fuld adgang — røres ikke.
 *
 * Tilladte ruter (altid åbne, ingen sløring):
 *   /AboutUs, /Onboarding, /Subscription
 *   (Terms, Privacy, Checkout, CheckoutSuccess, AcceptInvite er ikke wrapped
 *   af LayoutWrapper → altid åbne udenom AccessGate.)
 */

const ALLOWED_ROUTES = ['/app', '/Profile', '/AboutUs', '/Onboarding', '/Subscription'];

export default function AccessGate({ children }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const { isActive, isTrial, loading: subLoading } = useSubscription();
  const location = useLocation();
  const navigate = useNavigate();

  // Tilladte ruter: altid åbne
  if (ALLOWED_ROUTES.includes(location.pathname)) return children;

  // Mens auth tjekkes: lad indhold passere (AuthenticatedApp viser spinner)
  if (isLoadingAuth) return children;

  // Gæstebruger (ikke logget ind): sløret + "Opret bruger"
  if (!isAuthenticated) {
    return (
      <BlurredOverlay onAction={() => showInAppLogin('/app')} buttonText="Opret bruger">
        {children}
      </BlurredOverlay>
    );
  }

  // Authenticated — vent på subscription-tjek
  if (subLoading) return children;

  // Aktivt abonnement eller trial: fuld adgang
  if (isActive || isTrial) return children;

  // Indlogget uden abonnement: sløret + "Bliv medlem" → /Checkout
  return (
    <BlurredOverlay onAction={() => navigate('/Checkout')} buttonText="Bliv medlem ✨">
      {children}
    </BlurredOverlay>
  );
}

/**
 * BlurredOverlay — viser children sløret med en centreret boks ovenpå.
 * Genbruger ContentLock's visuelle mønster (masked blur preview + overlay).
 */
function BlurredOverlay({ children, onAction, buttonText }) {
  return (
    <div className="relative">
      {/* Sløret preview af sidens indhold */}
      <div
        style={{
          maxHeight: '45vh',
          overflow: 'hidden',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
          filter: 'blur(6px)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {children}
      </div>

      {/* Centreret boks */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center px-6 pt-4 pb-10 text-center"
        style={{ marginTop: '-40px' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{
            background: 'linear-gradient(135deg, var(--color-brown-dark), var(--color-primary))',
            boxShadow: '0 4px 20px rgba(58,43,34,0.25)',
          }}
        >
          <Lock className="w-7 h-7 text-white" />
        </div>

        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}
        >
          Bliv medlem
        </h2>
        <p className="text-sm mb-8 max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
          Få adgang til søvnlog, kalender, community, AI-rådgivning og meget mere.
        </p>

        <button
          onClick={onAction}
          className="w-full max-w-xs py-3.5 rounded-2xl text-sm font-semibold active:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
        >
          {buttonText}
        </button>
      </motion.div>
    </div>
  );
}