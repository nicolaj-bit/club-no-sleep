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
}) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const handleBack = onBack || (backUrl ? () => navigate(backUrl) : () => window.history.back());
  const visible = useScrollDirection(8);

  return (
    <header
      className={cn('sticky top-0 z-40 backdrop-blur-xl border-b transition-transform duration-300 shadow-sm', className)}
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(-110%)',
        ...(transparent
          ? {}
          : {
              background: isDark ? 'var(--color-bg-card)' : 'linear-gradient(135deg, #F7F2EC, #EDE4D8)',
              borderColor: isDark ? 'var(--color-border)' : '#E8DDD2',
              paddingTop: 'env(safe-area-inset-top, 0px)',
            }),
      }}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-1.5">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          onClick={handleBack}
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 active:opacity-60"
          style={isDark
            ? { background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }
            : { background: 'linear-gradient(135deg, #F7F2EC, #EDE4D8)', border: '1px solid #E8DDD2' }}
        >
          <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
        </button>
        {title && (
          <h1
            className="text-sm font-semibold truncate"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {title}
          </h1>
        )}
        </div>

        {rightAction && (
          <div className="flex items-center gap-1 flex-shrink-0">{rightAction}</div>
        )}
      </div>
    </header>
  );
}