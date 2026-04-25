import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function PageHeader({
  title,
  backUrl,
  onBack,
  rightAction,
  className,
  transparent = false,
}) {
  const handleBack = onBack || (backUrl ? undefined : () => window.history.back());

  const BackWrapper = backUrl
    ? ({ children }) => <Link to={backUrl}>{children}</Link>
    : ({ children }) => <button onClick={handleBack}>{children}</button>;

  return (
    <header
      className={cn('sticky top-0 z-40 backdrop-blur-xl border-b', className)}
      style={
        transparent
          ? {}
          : {
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)',
              paddingTop: 'env(safe-area-inset-top, 0px)',
            }
      }
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <BackWrapper>
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 active:opacity-60"
              style={{ backgroundColor: 'var(--color-bg-subtle)' }}
            >
              <ChevronLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
            </span>
          </BackWrapper>
          {title && (
            <h1
              className="text-base font-semibold truncate"
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