import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTabState } from '@/components/ui/TabStateContext';
import { base44 } from '@/api/base44Client';
import { Home, Menu, ShoppingBag, BookOpen, Baby, Users, User, BedDouble, X, CalendarDays, Lightbulb, Stethoscope, Star } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useLanguage } from '@/components/ui/LanguageContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useActiveProfile } from '@/components/ui/ActiveProfileContext';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);
  const [aiIconUrl, setAiIconUrl] = useState(null);
  const { saveTabPath, getTabPath, clearTabPath } = useTabState();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { activeProfile } = useActiveProfile();

  // Gravid: har terminsdato i fremtiden og ingen fødselsdato
  const isExpecting = activeProfile?.child_due_date
    && !activeProfile?.child_birthdate
    && new Date(activeProfile.child_due_date) > new Date();

  const menuItemsConfig = [
    { key: 'shop', icon: ShoppingBag, page: 'Shop' },
    { key: 'blog', icon: BookOpen, page: 'Blog' },
    { key: 'sleepLog', icon: BedDouble, page: 'SleepLog' },
    { key: 'tigerspring', icon: Baby, page: 'Knowledge', name: 'Tigerspring' },
    { key: 'pregnancy', icon: Lightbulb, page: 'PregnancyWeeks', name: 'Graviditet' },
    { key: 'community', icon: Users, page: 'Community', name: 'Natteensomhed' },
    { key: 'practitioners', icon: Stethoscope, page: 'Practitioners', name: 'Behandlere' },
    { key: 'cafes', icon: ShoppingBag, page: 'BabyFriendlyCafes', name: 'Babyvenlige caféer' },
    { key: 'milestones', icon: Star, page: 'Milestones', name: 'Milepæle' },
    { key: 'calendar', icon: CalendarDays, page: 'Calendar' },
    { key: 'profile', icon: User, page: 'Profile' },
  ];

  const menuItems = menuItemsConfig.map(item => ({
    ...item,
    name: item.name || t[item.key],
  }));

  useEffect(() => {
    base44.entities.AppConfig.filter({ key: 'ai_chat_icon' }).then(results => {
      if (results?.[0]?.icon_url) setAiIconUrl(results[0].icon_url);
    }).catch(() => {});
  }, []);

  const isActive = (page) => {
    const url = createPageUrl(page);
    return currentPath === url || currentPath.startsWith(url + '?');
  };

  // Save current path to tab history whenever location changes
  useEffect(() => {
    const allPages = ['Home', 'AIChat', 'SleepLog', 'PregnancyWeeks', ...menuItemsConfig.map(m => m.page)];
    allPages.forEach(page => {
      const url = createPageUrl(page);
      if (currentPath === url || currentPath.startsWith(url + '?')) {
        saveTabPath(page, currentPath + location.search);
      }
    });
  }, [currentPath, location.search]);

  const handleNavPress = (page) => {
    const rootUrl = createPageUrl(page);
    if (isActive(page)) {
      // Already on this tab — reset to root
      clearTabPath(page);
      navigate(rootUrl);
    } else {
      // Navigate to last visited path in this tab, or root
      const lastPath = getTabPath(page);
      navigate(lastPath && lastPath !== rootUrl ? lastPath : rootUrl);
    }
  };

  const handleMenuItemPress = (page) => {
    setMenuOpen(false);
    setTimeout(() => handleNavPress(page), 50);
  };

  return (
    <>
      {/* Center modal menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-x-0 z-50 rounded-t-3xl overflow-hidden"
              style={{
                bottom: 0,
                top: 'auto',
                background: isDark ? '#1F1A17' : 'linear-gradient(135deg, #FFFFFF, #F7F2EC)',
                boxShadow: isDark
                  ? '0 -4px 40px rgba(0,0,0,0.7), 0 0 0 0.5px #3A312B'
                  : '0 -4px 40px rgba(44,26,14,0.12), 0 0 0 0.5px rgba(44,26,14,0.06)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                  {t.menu}
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-opacity active:opacity-50"
                  style={{ backgroundColor: isDark ? '#3A312B' : '#F0E9E0' }}
                >
                  <X className="w-3.5 h-3.5" style={{ color: 'var(--color-text-secondary)' }} />
                </button>
              </div>

              {/* Menu items grid */}
              <div className="px-4 pb-5 grid grid-cols-2 gap-2.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.page);
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleMenuItemPress(item.page)}
                      className="flex flex-col items-start gap-3 p-4 rounded-2xl text-left active:scale-95 transition-all duration-200"
                      style={{
                        background: active
                          ? 'linear-gradient(135deg, #C29A73, #8A6B55)'
                          : isDark
                          ? '#3A2B22'
                          : 'linear-gradient(135deg, #F7F2EC, #EDE4D8)',
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        strokeWidth={2}
                        style={{
                          color: active
                            ? '#FFFFFF'
                            : isDark ? '#888888' : '#9C7E6A',
                        }}
                      />
                      <span
                        className="text-[13px] font-medium leading-tight"
                        style={{
                          color: active
                            ? '#FFFFFF'
                            : isDark ? '#CCCCCC' : '#4A2E1A',
                        }}
                      >
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-6"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <div
          className="flex items-center justify-around h-16 px-6 w-full max-w-xs rounded-full border"
          style={{
            backgroundColor: isDark ? '#2A231F' : '#FFF8F3',
            borderColor: isDark ? '#3A312B' : '#EDE4DB',
            boxShadow: isDark
              ? '0 8px 40px rgba(0,0,0,0.7)'
              : '0 8px 40px rgba(92,51,23,0.12)',
          }}
        >
          <Link
            to={createPageUrl('Home')}
            className={cn(
              'flex flex-col items-center gap-0.5 transition-all',
              isActive('Home') ? 'opacity-100' : 'opacity-50 hover:opacity-75'
            )}
          >
            <Home
              className="w-5 h-5"
              strokeWidth={isActive('Home') ? 2.5 : 2}
              style={{ color: isDark ? '#FFFFFF' : '#2C1A0E' }}
            />
            <span className="text-[10px] font-medium" style={{ color: isDark ? '#FFFFFF' : '#2C1A0E' }}>
              {t.home}
            </span>
          </Link>

          <Link to={createPageUrl('AIChat')} className="flex flex-col items-center gap-0.5">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg overflow-hidden"
              style={aiIconUrl ? {} : { background: 'linear-gradient(135deg, #C29A73, #8A6B55)' }}
            >
              {aiIconUrl ? (
                <img src={aiIconUrl} alt="AI" className="w-full h-full object-cover" />
              ) : (
                <svg viewBox="0 0 40 44" width="22" height="24" fill="#FFFFFF" aria-hidden>
                  <ellipse cx="20" cy="10" rx="7.5" ry="8" opacity="0.9" />
                  <path d="M4 38 C4 28 8 24 20 24 C32 24 36 28 36 38" opacity="0.75" />
                  <path d="M17 14 Q20 10 23 14 Q20 18 17 14Z" fill="#F3EDE4" opacity="0.9" />
                </svg>
              )}
            </div>
          </Link>

          <button
            onClick={() => setMenuOpen(true)}
            className={cn(
              'flex flex-col items-center gap-0.5 transition-all',
              menuOpen ? 'opacity-100' : 'opacity-50 hover:opacity-75'
            )}
          >
            <Menu className="w-5 h-5" strokeWidth={2} style={{ color: isDark ? '#FFFFFF' : '#2C1A0E' }} />
            <span className="text-[10px] font-medium" style={{ color: isDark ? '#FFFFFF' : '#2C1A0E' }}>
              {t.menu}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}