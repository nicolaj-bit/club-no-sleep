import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import { Navigate } from 'react-router-dom';
import SubscriptionGate from './components/subscription/SubscriptionGate';
import LandingPage from './pages/LandingPage';
import Onboarding from './pages/Onboarding';
import AboutUs from './pages/AboutUs';
import FamilyInvite from './pages/FamilyInvite';
import Subscription from './pages/Subscription.jsx';
import AdminNotifications from './pages/AdminNotifications';
import PregnancyWeekDetail from './pages/PregnancyWeekDetail';
import Calendar from './pages/Calendar';
import PregnancyWeeks from './pages/PregnancyWeeks';
import Practitioners from './pages/Practitioners';
import Milestones from './pages/Milestones';
import BabyFriendlyCafes from './pages/BabyFriendlyCafes';


const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <SubscriptionGate>
      <Routes>
        {/* Onboarding — ingen subscription gate, ingen bottom nav */}
        <Route path="/Onboarding" element={<Onboarding />} />

        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="/app" element={<LayoutWrapper currentPageName={mainPageKey}><MainPage /></LayoutWrapper>} />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={<LayoutWrapper currentPageName={path}><Page /></LayoutWrapper>}
          />
        ))}
        <Route path="/AboutUs" element={<LayoutWrapper currentPageName="AboutUs"><AboutUs /></LayoutWrapper>} />
        <Route path="/Calendar" element={<LayoutWrapper currentPageName="Calendar"><Calendar /></LayoutWrapper>} />
        <Route path="/PregnancyWeekDetail" element={<LayoutWrapper currentPageName="PregnancyWeekDetail"><PregnancyWeekDetail /></LayoutWrapper>} />
        <Route path="/AdminNotifications" element={<LayoutWrapper currentPageName="AdminNotifications"><AdminNotifications /></LayoutWrapper>} />
        <Route path="/Subscription" element={<LayoutWrapper currentPageName="Subscription"><Subscription /></LayoutWrapper>} />
        <Route path="/FamilyInvite" element={<LayoutWrapper currentPageName="FamilyInvite"><FamilyInvite /></LayoutWrapper>} />
        <Route path="/PregnancyWeeks" element={<LayoutWrapper currentPageName="PregnancyWeeks"><PregnancyWeeks /></LayoutWrapper>} />
        <Route path="/Practitioners" element={<LayoutWrapper currentPageName="Practitioners"><Practitioners /></LayoutWrapper>} />
        <Route path="/Milestones" element={<LayoutWrapper currentPageName="Milestones"><Milestones /></LayoutWrapper>} />
        <Route path="/BabyFriendlyCafes" element={<LayoutWrapper currentPageName="BabyFriendlyCafes"><BabyFriendlyCafes /></LayoutWrapper>} />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </SubscriptionGate>
  );
};

function AppRoutes() {
  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <PublicOrAuth />
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

function PublicOrAuth() {
  const location = useLocation();

  // Public pages — render completely outside AuthProvider (no auth check)
  if (location.pathname === '/') {
    const isCapacitor = typeof window.Capacitor !== 'undefined';
    const isPWA =
      window.navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches;
    // TestFlight / Capacitor iOS wraps in a WKWebView — detect via user agent
    const isWKWebView = /iPhone|iPad/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent);

    if (!isCapacitor && !isPWA && !isWKWebView) {
      return <LandingPage />;
    }
  }

  // Everything else needs auth
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;