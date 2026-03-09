import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BlogCard({ post, variant = 'default' }) {
  const formattedDate = post.published_date 
    ? format(new Date(post.published_date), 'd. MMM yyyy', { locale: da })
    : null;

  if (variant === 'featured') {
    return (
      <Link 
        to={createPageUrl(`BlogPost?id=${post.id}`)}
        className="group block"
      >
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100">
          {post.featured_image ? (
            <img 
              src={post.featured_image} 
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-slate-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            {post.category && (
              <span className="inline-block bg-white/20 backdrop-blur text-white text-xs font-medium px-2.5 py-1 rounded-full mb-2">
                {post.category}
              </span>
            )}
            <h3 className="text-lg font-semibold text-white line-clamp-2">
              {post.title}
            </h3>
            {formattedDate && (
              <p className="text-white/70 text-sm mt-1">{formattedDate}</p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={createPageUrl(`BlogPost?id=${post.id}`)}
      className="group flex gap-4"
    >
      <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
        {post.featured_image ? (
          <img 
            src={post.featured_image} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-slate-300" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        {post.category && (
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {post.category}
          </span>
        )}
        <h3 className="text-sm font-medium text-slate-900 line-clamp-2 mt-0.5 leading-snug">
          {post.title}
        </h3>
        {formattedDate && (
          <p className="text-xs text-slate-400 mt-1.5">{formattedDate}</p>
        )}
      </div>
    </Link>
  );
}