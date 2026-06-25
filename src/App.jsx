import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Landing from './pages/Landing';
import { Capacitor } from '@capacitor/core';
import SubscriptionGate from './components/subscription/SubscriptionGate';

import Onboarding from './pages/Onboarding';
import AboutUs from './pages/AboutUs';
import FamilyInvite from './pages/FamilyInvite';
import Subscription from './pages/Subscription.jsx';
import AdminNotifications from './pages/AdminNotifications';
import AdminUsers from './pages/AdminUsers';
import PregnancyWeekDetail from './pages/PregnancyWeekDetail';
import Calendar from './pages/Calendar';
import PregnancyWeeks from './pages/PregnancyWeeks';
import Practitioners from './pages/Practitioners';
import Milestones from './pages/Milestones';
import BabyFriendlyCafes from './pages/BabyFriendlyCafes';
import AdminSupport from './pages/AdminSupport';
import AdminLanding from './pages/AdminLanding';
import AcceptInvite from './pages/AcceptInvite';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import AdminTermsPrivacy from './pages/AdminTermsPrivacy';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import NativeAuthGate from './components/auth/NativeAuthGate';
import InAppBrowserLinkHandler from './components/InAppBrowserLinkHandler';


const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

// Robust native app detection — Base44's native app uses a web view wrapper,
// so Capacitor.isNativePlatform() alone may return false. We also check the
// user agent for web view indicators.
function isNativeApp() {
  // 1. Capacitor bridge (if app is built with Capacitor)
  try {
    if (Capacitor.isNativePlatform()) return true;
  } catch {}

  const ua = navigator.userAgent || '';

  // 2. Android WebView — has "wv" in user agent
  if (/; wv\)/.test(ua) || /; wv;/.test(ua)) return true;

  // 3. iOS WKWebView (native app) — window.safari object only exists in real Safari,
  //    not in WKWebView. Exclude Chrome (CriOS) and Firefox (FxiOS) which also use WKWebView.
  if (/iPhone|iPad|iPod/.test(ua) && !/CriOS/.test(ua) && !/FxiOS/.test(ua) && typeof window.safari === 'undefined') return true;

  // 4. iOS PWA / Add to Home Screen
  if (window.navigator.standalone === true) return true;

  return false;
}

function RootRoute() {
  const hostname = window.location.hostname || '';

  // clubnosleep.com → Landing page (marketing site) — altid, uanset platform
  if (hostname.includes('clubnosleep')) {
    return <Landing />;
  }

  // Native app (App Store / Google Play) → go directly to app (sign-up page shown by NativeAuthGate)
  if (isNativeApp()) {
    return <Navigate to="/app" replace />;
  }

  // lalatoto.base44.app and others → go directly to app (sign-up page shown by NativeAuthGate)
  return <Navigate to="/app" replace />;
}

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();
  const isPublicRoute = location.pathname === '/' || location.pathname === '/AcceptInvite' || location.pathname === '/Terms' || location.pathname === '/Privacy';

  if (!isPublicRoute && (isLoadingPublicSettings || isLoadingAuth)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isPublicRoute && authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    // auth_required og andre fejl: lad brugeren se appen som gæst (demo)
    // Login kræves kun når de vil købe abonnement
  }

  return (
    <NativeAuthGate>
    <SubscriptionGate>
      <Routes>
        {/* Web: /Landing er default. Native: /app er default */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/Landing" element={isNativeApp() ? <Navigate to="/app" replace /> : <Landing />} />

        {/* Onboarding — ingen bottom nav */}
        <Route path="/Onboarding" element={<Onboarding />} />

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
        <Route path="/AdminSupport" element={<LayoutWrapper currentPageName="AdminSupport"><AdminSupport /></LayoutWrapper>} />
        <Route path="/AdminUsers" element={<LayoutWrapper currentPageName="AdminUsers"><AdminUsers /></LayoutWrapper>} />
        <Route path="/AdminLanding" element={<LayoutWrapper currentPageName="AdminLanding"><AdminLanding /></LayoutWrapper>} />
        <Route path="/AcceptInvite" element={<AcceptInvite />} />
        <Route path="/Terms" element={<Terms />} />
        <Route path="/Privacy" element={<Privacy />} />
        <Route path="/AdminTermsPrivacy" element={<LayoutWrapper currentPageName="AdminTermsPrivacy"><AdminTermsPrivacy /></LayoutWrapper>} />
        <Route path="/Checkout" element={<Checkout />} />
        <Route path="/CheckoutSuccess" element={<CheckoutSuccess />} />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </SubscriptionGate>
    </NativeAuthGate>
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
        <InAppBrowserLinkHandler />
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

function PublicOrAuth() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;