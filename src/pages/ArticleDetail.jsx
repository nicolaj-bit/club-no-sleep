import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Share2, FileText, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useTranslation } from '@/components/hooks/useTranslation';

export default function ArticleDetail() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { lang } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');
  const articleSlug = urlParams.get('slug');

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', articleId, articleSlug],
    queryFn: async () => {
      if (articleId) {
        const articles = await base44.entities.KnowledgeArticle.filter({ id: articleId });
        return articles[0];
      }
      if (articleSlug) {
        const articles = await base44.entities.KnowledgeArticle.list();
        return articles.find(a => a.tags?.includes(articleSlug));
      }
    },
    enabled: !!(articleId || articleSlug),
  });

  // Translate article when language = English
  useEffect(() => {
    if (!article || lang !== 'en') {
      setTranslatedArticle(null);
      return;
    }

    base44.integrations.Core.InvokeLLM({
      prompt: `Translate this Danish article to English. Return ONLY valid JSON.
Article: ${JSON.stringify({ title: article.title, content: article.content, category: article.category || '' })}

Return format:
{"title": "...", "content": "...", "category": "..."}`,
      response_json_schema: {
        type: 'object',
        properties: { title: { type: 'string' }, content: { type: 'string' }, category: { type: 'string' } }
      }
    }).then(result => {
      setTranslatedArticle(result);
    });
  }, [article, lang]);

  const handleShare = async () => {
    try {
      await navigator.share({ title: article.title, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link kopieret');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-5" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Skeleton className="h-6 w-1/3 mb-8" />
        <Skeleton className="h-7 w-4/5 mb-3" />
        <Skeleton className="h-5 w-2/5 mb-8" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Artikel ikke fundet</p>
      </div>
    );
  }

  const Icon = article.is_faq ? HelpCircle : FileText;
  const isFaq = article.is_faq;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Sticky header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b px-4 py-3"
        style={{ backgroundColor: isDark ? 'rgba(17,17,17,0.85)' : 'rgba(255,255,255,0.85)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Link to={createPageUrl('Knowledge')}>
            <Button variant="ghost" size="icon" className="-ml-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Article body */}
      <article className="max-w-2xl mx-auto px-5 pt-8 pb-16">

        {/* Category badge */}
        <div className="flex items-center gap-2 mb-5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: isFaq ? (isDark ? '#1e3a5f' : '#eff6ff') : 'var(--color-bg-subtle)' }}
          >
            <Icon
              className="w-3.5 h-3.5"
              style={{ color: isFaq ? (isDark ? '#60a5fa' : '#3b82f6') : 'var(--color-text-muted)' }}
            />
          </div>
          <span
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {translatedArticle?.category || article.category}
          </span>
          </div>

          {/* Title */}
          <h1
          className="text-2xl font-bold leading-snug mb-8"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}
          >
          {translatedArticle?.title || article.title}
          </h1>

        {/* Divider */}
        <div className="w-10 h-0.5 mb-8 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />

        {/* Markdown content */}
        <div
          className="article-content"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-xl font-bold mt-8 mb-3" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-semibold mt-7 mb-3" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold mt-5 mb-2" style={{ color: 'var(--color-text-primary)' }}>{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-base leading-relaxed mb-5" style={{ color: 'var(--color-text-secondary)' }}>{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="mb-5 space-y-2 pl-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-5 space-y-2 pl-1 list-decimal list-inside">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="flex items-start gap-3 text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-accent)' }} />
                  <span>{children}</span>
                </li>
              ),
              blockquote: ({ children }) => (
                <blockquote
                  className="pl-4 py-1 my-6 rounded-r-lg border-l-4"
                  style={{ borderColor: 'var(--color-accent)', backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
                >
                  {children}
                </blockquote>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic" style={{ color: 'var(--color-text-secondary)' }}>{children}</em>
              ),
              code: ({ children }) => (
                <code
                  className="px-1.5 py-0.5 rounded text-sm font-mono"
                  style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-accent)' }}
                >
                  {children}
                </code>
              ),
              hr: () => (
                <hr className="my-8" style={{ borderColor: 'var(--color-border)' }} />
              ),
            }}
          >
            {translatedArticle?.content || article.content}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        {article.tags?.filter(t => !t.startsWith('tigerspring')).length > 0 && (
          <div className="flex flex-wrap gap-2 pt-8 mt-8 border-t" style={{ borderColor: 'var(--color-border)' }}>
            {article.tags.filter(t => !t.startsWith('tigerspring')).map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 text-xs rounded-full font-medium"
                style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}