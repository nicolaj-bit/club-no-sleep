import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Lightbulb, Users, User } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Hjem', icon: Home, page: 'Home' },
  { name: 'Shop', icon: ShoppingBag, page: 'Shop' },
  { name: 'Viden', icon: Lightbulb, page: 'Knowledge' },
  { name: 'Community', icon: Users, page: 'Community' },
  { name: 'Profil', icon: User, page: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-6">
      <div className="flex items-center justify-around h-16 px-4 w-full max-w-sm bg-white rounded-full shadow-xl border border-stone-100" style={{boxShadow: '0 8px 32px rgba(44,26,14,0.15)'}}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const url = createPageUrl(item.page);
          const isActive = currentPath === url || currentPath.startsWith(url + '?');
          
          return (
            <Link
              key={item.name}
              to={url}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all duration-200",
                isActive 
                  ? "text-slate-900" 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 transition-all duration-200",
                  isActive && "scale-110"
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn(
                "text-[10px] font-medium tracking-wide",
                isActive && "font-semibold"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}