import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Sparkles, Menu, ShoppingBag, BookOpen, Lightbulb, Users, User, BedDouble, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ui/ThemeProvider';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useLanguage } from '@/components/ui/LanguageContext';

const menuItems = [
  { name: 'Shop', icon: ShoppingBag, page: 'Shop' },
  { name: 'Blog', icon: BookOpen, page: 'Blog' },
  { name: 'Søvnlog', icon: BedDouble, page: 'SleepLog' },
  { name: 'Viden', icon: Lightbulb, page: 'Knowledge' },
  { name: 'Community', icon: Users, page: 'Community' },
  { name: 'Profil', icon: User, page: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark } = useTheme();

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
      {/* Native bottom sheet menu */}
      <BottomSheet open={menuOpen} onOpenChange={setMenuOpen} title="Menu">
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
                  className="w-full flex items-center gap-4 px-5 py-4 active:opacity-60 transition-opacity"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: active
                        ? isDark ? '#FFFFFF' : '#2C1A0E'
                        : isDark ? '#1A1A1A' : '#F0E9E0',
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      strokeWidth={active ? 2.5 : 2}
                      style={{
                        color: active
                          ? isDark ? '#000000' : '#FFFFFF'
                          : isDark ? '#888888' : '#9C7E6A',
                      }}
                    />
                  </div>
                  <span
                    className={cn('text-[16px] flex-1 text-left', active ? 'font-semibold' : 'font-medium')}
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
          {/* Safe area spacer */}
          <div className="h-2" />
        </div>
      </BottomSheet>

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
              Hjem
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
              Menu
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}