import React from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageContext';

export default function UserAvatar({
  src,
  name,
  size = 'md',
  isOnline = false,
  showStatus = false,
  className
}) {
  const { t } = useLanguage();
  const isNumeric = typeof size === 'number';
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  const statusSizeClasses = {
    xs: 'w-1.5 h-1.5 border',
    sm: 'w-2 h-2 border',
    md: 'w-2.5 h-2.5 border-2',
    lg: 'w-3 h-3 border-2',
    xl: 'w-3.5 h-3.5 border-2',
    '2xl': 'w-4 h-4 border-2'
  };

  const iconSizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10'
  };

  return (
    <div className={cn("relative inline-flex", className)}>
      <div
        className={cn(
          "rounded-full overflow-hidden bg-slate-100 flex items-center justify-center",
          !isNumeric && sizeClasses[size]
        )}
        style={isNumeric ? { width: size, height: size } : undefined}
      >
        {src ? (
          <img
            src={src}
            alt={name || t.altUser}
            className="w-full h-full object-cover"
          />
        ) : (
          <User
            className={cn("text-slate-400", !isNumeric && iconSizeClasses[size])}
            style={isNumeric ? { width: size * 0.4, height: size * 0.4 } : undefined}
          />
        )}
      </div>
      
      {showStatus && (
        <span className={cn(
          "absolute bottom-0 right-0 rounded-full border-white",
          statusSizeClasses[size],
          isOnline ? "bg-emerald-500" : "bg-slate-300"
        )} />
      )}
    </div>
  );
}