import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, Menu, X, ShoppingBag, BookOpen, Lightbulb, Users, User } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';

const menuItems = [
  { name: 'Shop', icon: ShoppingBag, page: 'Shop' },
  { name: 'Blog', icon: BookOpen, page: 'Blog' },
  { name: 'Søvnlog', icon: Moon, page: 'SleepLog' },
  { name: 'Viden', icon: Lightbulb, page: 'Knowledge' },
  { name: 'Community', icon: Users, page: 'Community' },
  { name: 'Profil', icon: User, page: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (page) => {
    const url = createPageUrl(page);
    return currentPath === url || currentPath.startsWith(url + '?');
  };

  return (
    <>
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: 'rgba(44,26,14,0.4)' }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute bottom-28 left-1/2 -translate-x-1/2 w-72 rounded-3xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
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
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                  <span className={cn("text-base", active ? "font-semibold" : "font-medium")} style={{ color: 'var(--color-text-primary)' }}>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-6" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
        <div
          className="flex items-center justify-around h-16 px-6 w-full max-w-xs rounded-full border"
          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          style={{ boxShadow: '0 8px 32px rgba(44,26,14,0.15)' }}
        >
          <Link
            to={createPageUrl('Home')}
            className={cn(
              "flex flex-col items-center gap-0.5 transition-all",
              isActive('Home') ? "opacity-100" : "opacity-50 hover:opacity-75"
            )}
          >
            <Home className="w-5 h-5" strokeWidth={isActive('Home') ? 2.5 : 2} style={{ color: 'var(--color-text-primary)' }} />
            <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-primary)' }}>Hjem</span>
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
            {menuOpen ? <X className="w-5 h-5" strokeWidth={2.5} style={{ color: 'var(--color-text-primary)' }} /> : <Menu className="w-5 h-5" strokeWidth={2} style={{ color: 'var(--color-text-primary)' }} />}
            <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-primary)' }}>Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
}