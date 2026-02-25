import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight, HelpCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ArticleCard({ article, variant = 'default' }) {
  const Icon = article.is_faq ? HelpCircle : FileText;
  
  if (variant === 'compact') {
    return (
      <Link 
        to={createPageUrl(`ArticleDetail?id=${article.id}`)}
        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-slate-500" />
        </div>
        <span className="flex-1 text-sm font-medium text-slate-700 line-clamp-1">
          {article.title}
        </span>
        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
      </Link>
    );
  }

  return (
    <Link 
      to={createPageUrl(`ArticleDetail?id=${article.id}`)}
      className="block bg-white rounded-2xl p-4 border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          article.is_faq ? "bg-blue-50" : "bg-slate-100"
        )}>
          <Icon className={cn(
            "w-5 h-5",
            article.is_faq ? "text-blue-500" : "text-slate-500"
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {article.category}
          </p>
        </div>
        
        <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
      </div>
    </Link>
  );
}