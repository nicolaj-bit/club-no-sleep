import React from 'react';
import { ChevronLeft, Search, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function PageHeader({ 
  title, 
  backUrl, 
  onSearch, 
  rightAction,
  className,
  transparent = false 
}) {
  return (
    <header className={cn(
      "sticky top-0 z-40 px-4 py-3",
      transparent 
        ? "bg-transparent" 
        : "bg-white/80 backdrop-blur-xl border-b border-slate-100",
      className
    )}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {backUrl && (
            <Link to={backUrl}>
              <Button variant="ghost" size="icon" className="h-9 w-9 -ml-2">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <h1 className="text-lg font-semibold text-slate-900 truncate">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center gap-1">
          {onSearch && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9"
              onClick={onSearch}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          {rightAction}
        </div>
      </div>
    </header>
  );
}