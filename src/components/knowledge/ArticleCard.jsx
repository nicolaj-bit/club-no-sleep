import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight, HelpCircle, FileText } from 'lucide-react';
import { useTheme } from '@/components/ui/ThemeProvider';

export default function ArticleCard({ article, variant = 'default' }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const Icon = article.is_faq ? HelpCircle : FileText;
  
  if (variant === 'compact') {
    return (
      <Link 
        to={createPageUrl(`ArticleDetail?id=${article.id}`)}
        className="flex items-center gap-3 p-3 rounded-xl border transition-colors"
        style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
          <Icon className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
        </div>
        <span className="flex-1 text-sm font-medium line-clamp-1" style={{ color: 'var(--color-text-primary)' }}>
          {article.title}
        </span>
        <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
      </Link>
    );
  }

  return (
    <Link 
      to={createPageUrl(`ArticleDetail?id=${article.id}`)}
      className="block rounded-2xl p-4 border transition-all"
      style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: article.is_faq ? (isDark ? '#1e3a5f' : '#eff6ff') : 'var(--color-bg-subtle)' }}>
          <Icon className="w-5 h-5" style={{ color: article.is_faq ? (isDark ? '#60a5fa' : '#3b82f6') : 'var(--color-text-muted)' }} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>
            {article.title}
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {article.category}
          </p>
        </div>
        
        <ChevronRight className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-text-muted)' }} />
      </div>
    </Link>
  );
}