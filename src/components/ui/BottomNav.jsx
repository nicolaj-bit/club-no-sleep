import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Sparkles, Menu, ShoppingBag, BookOpen, Lightbulb, Users, User, BedDouble, X } from 'lucide-react';
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
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed left-1/2 top-1/2 z-50 w-72 rounded-2xl overflow-hidden"
              style={{
                transform: 'translate(-50%, -50%)',
                backgroundColor: isDark ? '#111111' : '#FFFFFF',
                boxShadow: isDark
                  ? '0 20px 60px rgba(0,0,0,0.8)'
                  : '0 20px 60px rgba(44,26,14,0.2)',
              }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <span className="font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>{t.menu}</span>
                <button onClick={() => setMenuOpen(false)} className="opacity-50 hover:opacity-100 transition-opacity">
                  <X className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
                </button>
              </div>
              <div className="py-2">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  const active = isActive(item.page);
                  return (
                    <React.Fragment key={item.name}>
                      {index > 0 && (
                        <div className="h-px mx-5" style={{ backgroundColor: 'var(--color-border)', opacity: 0.5 }} />
                      )}
                      <button
                        onClick={() => handleMenuItemPress(item.page)}
                        className="w-full flex items-center gap-4 px-5 py-3.5 active:opacity-60 transition-opacity"
                      >
                        <Icon
                          className="w-5 h-5 flex-shrink-0"
                          strokeWidth={active ? 2.5 : 2}
                          style={{
                            color: active
                              ? isDark ? '#FFFFFF' : '#2C1A0E'
                              : isDark ? '#888888' : '#9C7E6A',
                          }}
                        />
                        <span
                          className={cn('text-[15px] flex-1 text-left', active ? 'font-semibold' : 'font-medium')}
                          style={{
                            color: active
                              ? isDark ? '#FFFFFF' : '#2C1A0E'
                              : isDark ? '#CCCCCC' : '#6B4F3A',
                          }}
                        >
                          {item.name}
                        </span>
                        {active && (
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: isDark ? '#FFFFFF' : '#2C1A0E' }}
                          />
                        )}
                      </button>
                    </React.Fragment>
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