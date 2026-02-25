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
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Knowledge from './pages/Knowledge';
import ArticleDetail from './pages/ArticleDetail';
import Community from './pages/Community';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import ExpertDetail from './pages/ExpertDetail';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import AskQuestion from './pages/AskQuestion';
import QuestionDetail from './pages/QuestionDetail';
import Favorites from './pages/Favorites';
import Settings from './pages/Settings';
import MyQuestions from './pages/MyQuestions';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Shop": Shop,
    "ProductDetail": ProductDetail,
    "Blog": Blog,
    "BlogPost": BlogPost,
    "Knowledge": Knowledge,
    "ArticleDetail": ArticleDetail,
    "Community": Community,
    "Chat": Chat,
    "Profile": Profile,
    "ExpertDetail": ExpertDetail,
    "Booking": Booking,
    "MyBookings": MyBookings,
    "AskQuestion": AskQuestion,
    "QuestionDetail": QuestionDetail,
    "Favorites": Favorites,
    "Settings": Settings,
    "MyQuestions": MyQuestions,
}

export const pagesConfig = {
    mainPage: "Shop",
    Pages: PAGES,
    Layout: __Layout,
};