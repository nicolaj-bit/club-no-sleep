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
import ArticleFloatingNav from '@/components/articles/ArticleFloatingNav';
import { markArticleVisit } from '@/hooks/useListScrollRestoration';
import { WONDER_WEEKS, localizeWonderWeek } from '@/components/wonderweeks/wonderweeksData';

// Kategorinavnene staar som fri tekst paa artiklen. Kun 'tigerspring' bruges
// i praksis, og den har et rigtigt engelsk navn ('Leap'). Alt andet vises som
// det staar, saa en ny kategori ikke forsvinder.
function categoryLabel(category, lang) {
  if (!category) return category;
  if (lang === 'en' && category.toLowerCase() === 'tigerspring') return 'Leaps';
  return category;
}

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


  useEffect(() => { markArticleVisit(); }, []);

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', articleId, articleSlug, lang],
    queryFn: async () => {
      // Hent alle artikler og find den rette
      // Der ligger to saet tigerspringsartikler i databasen med de samme tags.
      // Uden en sortering var det tilfaeldigt, hvilken af dem der blev vist.
      // Nyeste foerst, saa det er det redigerede saet — det er ogsaa dem, der
      // har en engelsk udgave.
      const articles = await base44.entities.KnowledgeArticle.list('-created_date');

      if (articleId) {
        return articles.find(a => a.id === articleId) || null;
      }

      if (articleSlug) {
        // Eksakt tag match (tigerspring-1)
        const dbArticle = articles.find(a => a.tags?.includes(articleSlug));
        if (dbArticle) return dbArticle;

        // Fallback: brug hardcoded wonderweeks-data
        const wwRaw = WONDER_WEEKS.find(ww => ww.articleSlug === articleSlug);
        if (wwRaw) {
          const wwMatch = localizeWonderWeek(wwRaw, lang);
          const h = (da, en) => (lang === 'en' ? en : da);
          return {
            title: h(
              `Tigerspring ${wwMatch.number}: ${wwMatch.name}`,
              `Leap ${wwMatch.number}: ${wwMatch.name}`
            ),
            category: h('Tigerspring', 'Leaps'),
            is_faq: false,
            content: `
              <p>${wwMatch.longDescription}</p>
              <h2>${h('Nye færdigheder', 'New skills')}</h2>
              <ul>${wwMatch.skills.map(s => `<li>${s}</li>`).join('')}</ul>
              <h2>${h('Tegn på tigerspringet', 'Signs of the leap')}</h2>
              <ul>${wwMatch.signs.map(s => `<li>${s}</li>`).join('')}</ul>
              <h2>${h('Til dig som forælder', 'For you as a parent')}</h2>
              <p><em>${wwMatch.parentMessage}</em></p>
              <h2>${h('Tips til perioden', 'Tips for this time')}</h2>
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

  // Den engelske udgave ligger paa artiklen i databasen (content_en). Foer
  // blev artiklen oversat af AI'en hver gang siden blev aabnet, og brugeren saa
  // den danske tekst i de to-tre sekunder det tog. Nu er der ingen ventetid, og
  // teksten er den samme hver gang. Mangler den engelske, vises den danske.
  const displayArticle = React.useMemo(() => {
    if (!article) return null;
    if (lang !== 'en') return article;
    return {
      ...article,
      title: article.title_en || article.title,
      excerpt: article.excerpt_en || article.excerpt,
      content: article.content_en || article.content,
    };
  }, [article, lang]);

  const handleShare = async () => {
    try {
      await navigator.share({ title: article.title, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success(lang === 'en' ? 'Link copied' : 'Link kopieret');
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

  const renderRightActions = (mode, styles) => (
    <button
      onClick={handleShare}
      className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
      style={{ backgroundColor: styles.btnBg }}
    >
      <Share2 className="w-4 h-4" style={{ color: styles.iconColor }} />
    </button>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <ArticleFloatingNav backUrl={createPageUrl('Knowledge')} hasHero={false}>
        {renderRightActions}
      </ArticleFloatingNav>

      {/* Article body */}
      <article className="max-w-2xl mx-auto px-5 pb-16" style={{ paddingTop: '64px' }}>

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
            {categoryLabel(displayArticle?.category || article.category, lang)}
          </span>
          </div>

          {/* Title */}
          <h1
          className="text-2xl font-bold leading-snug mb-8"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}
          >
          {displayArticle?.title || article.title}
          </h1>

        {/* Divider */}
        <div className="w-10 h-0.5 mb-8 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />

        {/* Article content */}
        <div
          className="article-content"
          style={{ color: 'var(--color-text-secondary)' }}
          dangerouslySetInnerHTML={{ __html: formatContent(displayArticle?.content || article.content) }}
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