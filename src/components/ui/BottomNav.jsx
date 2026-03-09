import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, Menu, X, ShoppingBag, BookOpen, Lightbulb, Users, User, BedDouble } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ui/ThemeProvider';

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
  const currentPath = location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark } = useTheme();

  const isActive = (page) => {
    const url = createPageUrl(page);
    return currentPath === url || currentPath.startsWith(url + '?');
  };

  return (
    <>
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute bottom-28 left-1/2 -translate-x-1/2 w-72 rounded-3xl shadow-2xl overflow-hidden"
            style={{
              backgroundColor: isDark ? '#111111' : '#FFFFFF',
              border: isDark ? '1px solid #2A2A2A' : '1px solid #E8DDD3',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              const url = createPageUrl(item.page);
              const active = isActive(item.page);
              return (
                <Link
                  key={item.name}
                  to={url}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-4 px-6 py-4 transition-colors"
                  style={{
                    backgroundColor: active ? (isDark ? '#1A1A1A' : '#F0E9E0') : 'transparent',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: active ? (isDark ? '#FFFFFF' : '#2C1A0E') : (isDark ? '#1A1A1A' : '#F0E9E0') }}
                  >
                    <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 2} style={{ color: active ? (isDark ? '#000000' : '#FFFFFF') : (isDark ? '#888888' : '#9C7E6A') }} />
                  </div>
                  <span className={cn("text-base", active ? "font-semibold" : "font-medium")} style={{ color: active ? (isDark ? '#FFFFFF' : '#2C1A0E') : (isDark ? '#888888' : '#9C7E6A') }}>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-6" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
        <div
          className="flex items-center justify-around h-16 px-6 w-full max-w-xs rounded-full border"
          style={{ backgroundColor: isDark ? '#111111' : '#FFFFFF', borderColor: isDark ? '#2A2A2A' : '#E8DDD3', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.8)' : '0 8px 32px rgba(44,26,14,0.15)' }}
        >
          <Link
            to={createPageUrl('Home')}
            className={cn(
              "flex flex-col items-center gap-0.5 transition-all",
              isActive('Home') ? "opacity-100" : "opacity-50 hover:opacity-75"
            )}
          >
            <Home className="w-5 h-5" strokeWidth={isActive('Home') ? 2.5 : 2} style={{ color: isDark ? '#FFFFFF' : '#2C1A0E' }} />
            <span className="text-[10px] font-medium" style={{ color: isDark ? '#FFFFFF' : '#2C1A0E' }}>Hjem</span>
          </Link>

          <Link
            to={createPageUrl('AIChat')}
            className="flex flex-col items-center gap-0.5"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)' }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              "flex flex-col items-center gap-0.5 transition-all",
              menuOpen ? "opacity-100" : "opacity-50 hover:opacity-75"
            )}
          >
            {menuOpen ? <X className="w-5 h-5" strokeWidth={2.5} style={{ color: isDark ? '#FFFFFF' : '#2C1A0E' }} /> : <Menu className="w-5 h-5" strokeWidth={2} style={{ color: isDark ? '#FFFFFF' : '#2C1A0E' }} />}
            <span className="text-[10px] font-medium" style={{ color: isDark ? '#FFFFFF' : '#2C1A0E' }}>Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
}