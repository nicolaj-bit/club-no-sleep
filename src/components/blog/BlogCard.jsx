import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { da, enUS } from 'date-fns/locale';
import { BookOpen, ChevronRight } from 'lucide-react';

export default function BlogCard({ post, variant = 'default', translatedTitle, translatedCategory, lang = 'da' }) {
  const locale = lang === 'en' ? enUS : da;
  const dateFormat = lang === 'en' ? 'MMM d, yyyy' : 'd. MMM yyyy';
  const formattedDate = post.published_date
    ? format(new Date(post.published_date), dateFormat, { locale })
    : null;
  const displayTitle = translatedTitle || post.title;
  const displayCategory = translatedCategory || post.category;

  if (variant === 'featured') {
    return (
      <Link to={createPageUrl(`BlogPost?id=${post.id}`)} className="group block">
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg-subtle)', aspectRatio: '16/9' }}
        >
          {post.featured_image ? (
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover group-active:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12" style={{ color: 'var(--color-text-muted)' }} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            {displayCategory && (
              <span className="inline-block bg-white/20 backdrop-blur text-white text-xs font-medium px-2.5 py-1 rounded-full mb-2">
                {displayCategory}
              </span>
            )}
            <h3 className="text-lg font-semibold text-white leading-snug line-clamp-2">
              {displayTitle}
            </h3>
            {formattedDate && (
              <p className="text-white/65 text-xs mt-1.5">{formattedDate}</p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Default card — matches WonderWeeksTab row style
  return (
    <Link
      to={createPageUrl(`BlogPost?id=${post.id}`)}
      className="flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.99]"
      style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
    >
      {/* Thumbnail */}
      <div
        className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg-subtle)' }}
      >
        {post.featured_image ? (
          <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <BookOpen className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {displayCategory && (
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
            {displayCategory}
          </span>
        )}
        <p className="font-medium text-sm leading-snug line-clamp-2 mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
          {displayTitle}
        </p>
        {formattedDate && (
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{formattedDate}</p>
        )}
      </div>

      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
    </Link>
  );
}