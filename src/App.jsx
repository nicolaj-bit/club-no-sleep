import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AboutUs from './pages/AboutUs';
import FamilyInvite from './pages/FamilyInvite';
import Subscription from './pages/Subscription.jsx';
import AdminNotifications from './pages/AdminNotifications';
import PregnancyWeekDetail from './pages/PregnancyWeekDetail';
import Calendar from './pages/Calendar';
import PregnancyDiary from './pages/PregnancyDiary';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/AboutUs" element={<LayoutWrapper currentPageName="AboutUs"><AboutUs /></LayoutWrapper>} />
      <Route path="/Calendar" element={<LayoutWrapper currentPageName="Calendar"><Calendar /></LayoutWrapper>} />
      <Route path="/PregnancyWeekDetail" element={<LayoutWrapper currentPageName="PregnancyWeekDetail"><PregnancyWeekDetail /></LayoutWrapper>} />
      <Route path="/PregnancyWeekDetail" element={<LayoutWrapper currentPageName="PregnancyWeekDetail"><PregnancyWeekDetail /></LayoutWrapper>} />
      <Route path="/AdminNotifications" element={<LayoutWrapper currentPageName="AdminNotifications"><AdminNotifications /></LayoutWrapper>} />
      <Route path="/Subscription" element={<LayoutWrapper currentPageName="Subscription"><Subscription /></LayoutWrapper>} />
      <Route path="/FamilyInvite" element={<LayoutWrapper currentPageName="FamilyInvite"><FamilyInvite /></LayoutWrapper>} />
      <Route path="/PregnancyDiary" element={<LayoutWrapper currentPageName="PregnancyDiary"><PregnancyDiary /></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App