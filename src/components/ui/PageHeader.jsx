import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useScrollDirection } from './useScrollDirection';
import { useTheme } from './ThemeProvider';

export default function PageHeader({
  title,
  backUrl = '/Home',
  onBack,
  rightAction,
  className,
  transparent = false,
  showBack = true,
  scrollHide = true,
}) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const handleBack = onBack || (backUrl ? () => navigate(backUrl) : () => window.history.back());
  const visible = useScrollDirection(8);

  return (
    <div
      className={cn('sticky top-0 z-10 border-b px-4 pb-2 flex items-center justify-between transition-transform duration-300', className)}
      style={{
        background: transparent ? 'transparent' : 'var(--color-bg)',
        borderColor: transparent ? 'transparent' : 'var(--color-border)',
        transform: scrollHide ? (visible ? 'translateY(0)' : 'translateY(-100%)') : 'translateY(0)',
        paddingTop: 'max(40px, env(safe-area-inset-top, 0px))',
      }}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {showBack && (
          <button
            onClick={handleBack}
            className="p-1.5 rounded-full flex-shrink-0 active:opacity-60"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {title && (
          <h1
            className="text-2xl font-light truncate"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif', letterSpacing: '0.06em' }}
          >
            {title}
          </h1>
        )}
      </div>
      {rightAction && (
        <div className="flex items-center gap-1.5 flex-shrink-0">{rightAction}</div>
      )}
    </div>
  );
}