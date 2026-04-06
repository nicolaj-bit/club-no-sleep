import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Sparkles, Menu, ShoppingBag, BookOpen, Lightbulb, Users, User, BedDouble, X, CalendarDays } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useLanguage } from '@/components/ui/LanguageContext';
import { AnimatePresence, motion } from 'framer-motion';

const menuItemsConfig = [
  { key: 'shop', icon: ShoppingBag, page: 'Shop' },
  { key: 'blog', icon: BookOpen, page: 'Blog' },
  { key: 'sleepLog', icon: BedDouble, page: 'SleepLog' },
  { key: 'knowledge', icon: Lightbulb, page: 'Knowledge' },
  { key: 'community', icon: Users, page: 'Community' },
  { key: 'calendar', icon: CalendarDays, page: 'Calendar' },
  { key: 'profile', icon: User, page: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const menuItems = menuItemsConfig.map(item => ({ ...item, name: t[item.key] }));

  const isActive = (page) => {
    const url = createPageUrl(page);
    return currentPath === url || currentPath.startsWith(url + '?');
  };

  const handleMenuItemPress = (page) => {
    setMenuOpen(false);
    // Small delay so sheet close animation finishes before navigation
    setTimeout(() => navigate(createPageUrl(page)), 50);
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
              className="fixed left-4 right-4 z-50 rounded-3xl overflow-hidden"
              style={{
                bottom: 'calc(max(16px, env(safe-area-inset-bottom)) + 72px)',
                backgroundColor: isDark ? '#121212' : '#FFFFFF',
                boxShadow: isDark
                  ? '0 -4px 40px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.08)'
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
                  style={{ backgroundColor: isDark ? '#2A2A2A' : '#F0E9E0' }}
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
                      className="flex flex-col items-start gap-3 p-4 rounded-2xl text-left active:scale-95 transition-transform"
                      style={{
                        backgroundColor: active
                          ? isDark ? '#FFFFFF' : '#2C1A0E'
                          : isDark ? '#1A1A1A' : '#F7F2EC',
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        strokeWidth={2}
                        style={{
                          color: active
                            ? isDark ? '#000000' : '#FFFFFF'
                            : isDark ? '#888888' : '#9C7E6A',
                        }}
                      />
                      <span
                        className="text-[14px] font-medium leading-tight"
                        style={{
                          color: active
                            ? isDark ? '#000000' : '#FFFFFF'
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
            backgroundColor: isDark ? '#111111' : '#FFFFFF',
            borderColor: isDark ? '#2A2A2A' : '#E8DDD3',
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.8)'
              : '0 8px 32px rgba(44,26,14,0.15)',
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
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)' }}
            >
              <Sparkles className="w-5 h-5 text-white" />
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