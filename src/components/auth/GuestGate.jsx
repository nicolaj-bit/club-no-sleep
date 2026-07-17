import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import GuestLockDialog from './GuestLockDialog';

/**
 * GuestGate — blokerer gæstebrugere (demo_mode / ikke-authenticated)
 * fra at tilgå låst indhold.
 *
 * Gæster må KUN se:
 *   - /app (Home — viser struktur, interaktive moduler låst)
 *   - /AboutUs
 *
 * Terms og Privacy er ikke wrapped af LayoutWrapper og er derfor altid tilgængelige.
 *
 * Authenticated brugere (med/uden abonnement) passerer ubegrænset —
 * abonnements-gating håndteres af SubscriptionGate/ContentLock.
 */

const GUEST_ALLOWED_ROUTES = ['/app', '/AboutUs'];

export default function GuestGate({ children }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const location = useLocation();

  // Mens auth tjekkes: lad indhold passere (AuthenticatedApp viser spinner mens isLoadingAuth)
  if (isLoadingAuth) return children;

  // Authenticated brugere: ingen restriktion
  if (isAuthenticated) return children;

  // Gæstebruger — tjek om ruten er tilladt
  if (GUEST_ALLOWED_ROUTES.includes(location.pathname)) {
    return children;
  }

  // Låst rute — vis lås-dialog
  return <GuestLockDialog />;
}