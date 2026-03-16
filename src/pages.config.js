/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIChat from './pages/AIChat';
import AdminEditor from './pages/AdminEditor';
import AdminWonderWeeks from './pages/AdminWonderWeeks';
import ArticleDetail from './pages/ArticleDetail';
import AskQuestion from './pages/AskQuestion';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Booking from './pages/Booking';
import Chat from './pages/Chat';
import Community from './pages/Community';
import ExpertDetail from './pages/ExpertDetail';
import Favorites from './pages/Favorites';
import Home from './pages/Home';
import Knowledge from './pages/Knowledge';
import MyData from './pages/MyData';
import MyQuestions from './pages/MyQuestions';
import Onboarding from './pages/Onboarding';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import QuestionDetail from './pages/QuestionDetail';
import Settings from './pages/Settings';
import Shop from './pages/Shop';
import SleepLog from './pages/SleepLog';
import SleepAdviceFeedback from './pages/SleepAdviceFeedback';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIChat": AIChat,
    "AdminEditor": AdminEditor,
    "AdminWonderWeeks": AdminWonderWeeks,
    "ArticleDetail": ArticleDetail,
    "AskQuestion": AskQuestion,
    "Blog": Blog,
    "BlogPost": BlogPost,
    "Booking": Booking,
    "Chat": Chat,
    "Community": Community,
    "ExpertDetail": ExpertDetail,
    "Favorites": Favorites,
    "Home": Home,
    "Knowledge": Knowledge,
    "MyData": MyData,
    "MyQuestions": MyQuestions,
    "Onboarding": Onboarding,
    "ProductDetail": ProductDetail,
    "Profile": Profile,
    "QuestionDetail": QuestionDetail,
    "Settings": Settings,
    "Shop": Shop,
    "SleepLog": SleepLog,
    "SleepAdviceFeedback": SleepAdviceFeedback,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};