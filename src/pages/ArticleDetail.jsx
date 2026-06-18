import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Share2, FileText, HelpCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useTranslation } from '@/components/hooks/useTranslation';
import PageHeader from '@/components/ui/PageHeader';
import { WONDER_WEEKS } from '@/components/wonderweeks/wonderweeksData';

// Konverterer plain text (linjeskift) til HTML <p>-tags hvis der ikke er HTML i forvejen
function formatContent(content) {
  if (!content) return '';
  // Hvis indholdet allerede indeholder HTML-tags, brug det direkte
  if (/<[a-z][\s\S]*>/i.test(content)) return content;
  // Ellers: split på dobbelt-linjeskift → afsnit, enkelt linjeskift → <br>
  return content
    .split(/\n{2,}/)
    .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

export default function ArticleDetail() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { lang } = useLanguage();
  const location = useLocation();
  // Brug både location.search (React Router) og window.location.search som fallback
  const searchStr = location.search || window.location.search;
  const urlParams = new URLSearchParams(searchStr);
  const articleId = urlParams.get('id');
  const articleSlug = urlParams.get('slug');

  // Debug: log hvad vi ser
  console.log('[ArticleDetail] location.search:', location.search, '| window.search:', window.location.search, '| slug:', articleSlug, '| id:', articleId);

  const [translatedArticle, setTranslatedArticle] = useState(null);

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', articleId, articleSlug],
    queryFn: async () => {
      // Hent alle artikler og find den rette
      const articles = await base44.entities.KnowledgeArticle.list();

      if (articleId) {
        return articles.find(a => a.id === articleId) || null;
      }

      if (articleSlug) {
        // Eksakt tag match (tigerspring-1)
        const dbArticle = articles.find(a => a.tags?.includes(articleSlug));
        if (dbArticle) return dbArticle;

        // Fallback: brug hardcoded wonderweeks-data
        const wwMatch = WONDER_WEEKS.find(ww => ww.articleSlug === articleSlug);
        if (wwMatch) {
          return {
            title: `Tigerspring ${wwMatch.number}: ${wwMatch.name}`,
            category: 'Tigerspring',
            is_faq: false,
            content: `
              <p>${wwMatch.longDescription}</p>
              <h2>Nye færdigheder</h2>
              <ul>${wwMatch.skills.map(s => `<li>${s}</li>`).join('')}</ul>
              <h2>Tegn på tigerspringet</h2>
              <ul>${wwMatch.signs.map(s => `<li>${s}</li>`).join('')}</ul>
              <h2>Til dig som forælder</h2>
              <p><em>${wwMatch.parentMessage}</em></p>
              <h2>Tips til perioden</h2>
              <ul>${wwMatch.tips.map(t => `<li>${t}</li>`).join('')}</ul>
            `,
            tags: [],
          };
        }
      }
      return null;
    },
    enabled: !!(articleId || articleSlug),
    staleTime: 0,
  });

  // Debug
  console.log('[ArticleDetail] isLoading:', isLoading, '| article:', article?.title, '| enabled:', !!(articleId || articleSlug));

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
      <PageHeader
        backUrl={createPageUrl('Knowledge')}
        rightAction={
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full flex items-center justify-center active:opacity-60"
            style={{ backgroundColor: 'var(--color-bg-subtle)' }}
          >
            <Share2 className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        }
      />

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

        {/* Article content */}
        <div
          className="article-content"
          style={{ color: 'var(--color-text-secondary)' }}
          dangerouslySetInnerHTML={{ __html: formatContent(translatedArticle?.content || article.content) }}
        />

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