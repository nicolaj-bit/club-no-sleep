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
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import AdminFooter from './pages/AdminFooter';
import AdminNavMenu from './pages/AdminNavMenu';
import LandingPagePreview from './pages/LandingPage';
import AdminLandingPage from './pages/AdminLandingPage';

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
        <Route path="/" element={<Navigate to="/landing" replace />} />
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
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/AdminFooter" element={<AdminFooter />} />
        <Route path="/AdminNavMenu" element={<AdminNavMenu />} />
        <Route path="/landing" element={<LandingPagePreview />} />
        <Route path="/AdminLandingPage" element={<LayoutWrapper currentPageName="AdminLandingPage"><AdminLandingPage /></LayoutWrapper>} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </SubscriptionGate>
  );
};

function AppRoutes() {
  const location = useLocation();
  const [showLanding, setShowLanding] = React.useState(null);

  const publicPaths = ['/landing', '/terms', '/privacy'];
  const isPublic = publicPaths.includes(location.pathname);

  React.useEffect(() => {
    if (isPublic) return;
    if (location.pathname !== '/') { setShowLanding(false); return; }

    const isStandalone =
      window.navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      !!window.Capacitor || !!window.cordova;

    const wasAuthenticated = localStorage.getItem('lalatoto_was_authenticated') === 'true';

    // Check for any auth token in localStorage/sessionStorage as fallback
    const hasToken = Object.keys(localStorage).some(k => k.includes('token') || k.includes('auth') || k.includes('base44'));

    const isLoggedIn = wasAuthenticated || hasToken;

    if (isStandalone && !isLoggedIn) {
      // PWA installed but not logged in → show subscription/onboarding page
      setShowLanding('subscription');
    } else {
      setShowLanding(!isLoggedIn);
    }
  }, [location.pathname]);

  if (isPublic) {
    if (location.pathname === '/landing') return <LandingPagePreview />;
    if (location.pathname === '/terms') return <Terms />;
    if (location.pathname === '/privacy') return <Privacy />;
  }

  if (showLanding === null) return null; // brief flash prevention
  if (showLanding === 'subscription') return <Subscription />;
  if (showLanding) return <LandingPage />;
  return <AuthenticatedApp />;
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;