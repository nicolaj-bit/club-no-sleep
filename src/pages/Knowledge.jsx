import React, { useState, useEffect } from 'react';
import { useScrollDirection } from '@/components/ui/useScrollDirection';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, X, HelpCircle, MessageCircle, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ArticleCard from '@/components/knowledge/ArticleCard';
import PregnancyTab from '@/components/knowledge/PregnancyTab';
import WonderWeeksTab from '@/components/wonderweeks/WonderWeeksTab';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useTranslation } from '@/components/hooks/useTranslation';

export default function Knowledge() {
  const headerVisible = useScrollDirection();
  const [search, setSearch] = useState('');
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') || null;
  const [showSearch, setShowSearch] = useState(false);
  const { lang, t } = useLanguage();
  const [autoTab, setAutoTab] = useState(null);

  // Hent profil og bestem automatisk tab baseret på terminsdato
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const u = await base44.auth.me();
        const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
        const profile = profiles[0];
        if (!profile) return;

        const dueDate = profile.child_due_date;
        if (!dueDate) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);

        if (today > due) {
          // Terminsdatoen er overskredet → barnet er født → tigerspring
          setAutoTab('tigerspring');
        } else {
          // Stadig gravid → graviditet
          setAutoTab('graviditet');
        }
      } catch {
        // Ignorer fejl
      }
    };
    loadProfile();
  }, []);

  const { data: articles = [], isLoading: loadingArticles } = useQuery({
    queryKey: ['articles'],
    queryFn: () => base44.entities.KnowledgeArticle.list('order'),
  });

  const { data: questions = [], isLoading: loadingQuestions } = useQuery({
    queryKey: ['questions'],
    queryFn: () => base44.entities.Question.list('-created_date', 20),
  });

  const { data: tabs = [] } = useQuery({
    queryKey: ['knowledge-tabs'],
    queryFn: () => base44.entities.KnowledgeTab.list('order'),
  });

  // Translate articles, questions and tabs
  const articlesToTranslate = lang === 'en' && articles.length > 0
    ? articles.map(a => ({ id: a.id, title: a.title, category: a.category || '' }))
    : [];
  const questionsToTranslate = lang === 'en' && questions.length > 0
    ? questions.map(q => ({ id: q.id, title: q.title }))
    : [];
  const tabsToTranslate = lang === 'en' && tabs.length > 0
    ? tabs.map(tab => ({ id: tab.id, label: tab.label }))
    : [];

  const articleTranslations = useTranslation(articlesToTranslate);
  const questionTranslations = useTranslation(questionsToTranslate);
  const tabTranslations = useTranslation(tabsToTranslate);

  const activeTabs = tabs.filter(t => t.is_active);

  // Helper to get translated text
  const getTranslated = (items, itemId, field, fallback) => {
    if (!Array.isArray(items)) return fallback;
    const found = items.find(i => i.id === itemId);
    return found ? found[field] : fallback;
  };

  // Group articles by category
  const articlesByCategory = articles.reduce((acc, article) => {
    const cat = getTranslated(articleTranslations, article.id, 'category', article.category || 'Andet');
    if (!acc[cat]) acc[cat] = [];
    const displayTitle = getTranslated(articleTranslations, article.id, 'title', article.title);
    acc[cat].push({ ...article, _displayTitle: displayTitle });
    return acc;
  }, {});

  const faqs = articles.filter(a => a.is_faq);

  // Search results
  const searchResults = search.trim() ? {
    articles: articles.filter(a => 
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.content?.toLowerCase().includes(search.toLowerCase())
    ),
    questions: questions.filter(q =>
      q.title?.toLowerCase().includes(search.toLowerCase()) ||
      q.content?.toLowerCase().includes(search.toLowerCase())
    )
  } : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Sticky header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b transition-transform duration-300"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
          transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <div className="px-4 py-3">
          {showSearch ? (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                <Input
                  placeholder={t.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 border-0"
                  style={{ backgroundColor: 'var(--color-bg-subtle)' }}
                  autoFocus
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setShowSearch(false); setSearch(''); }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <h1
                className="text-2xl font-light"
                style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif', letterSpacing: '0.06em' }}
              >
                {t.knowledgeTitle}
              </h1>
              <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
                <Search className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Search Results */}
      {searchResults ? (
        <div className="px-4 pt-4 pb-6 space-y-6">
          {searchResults.articles.length === 0 && searchResults.questions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                <Search className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.noResults}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>"{search}"</p>
            </div>
          ) : (
            <>
              {searchResults.articles.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>{t.articles}</p>
                  <div className="space-y-2">
                    {searchResults.articles.map(article => {
                      const displayTitle = getTranslated(articleTranslations, article.id, 'title', article.title);
                      return <ArticleCard key={article.id} article={{ ...article, title: displayTitle }} variant="compact" />;
                    })}
                  </div>
                </div>
              )}
              {searchResults.questions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>{t.questions}</p>
                  <div className="space-y-2">
                    {searchResults.questions.map(q => {
                      const displayTitle = getTranslated(questionTranslations, q.id, 'title', q.title);
                      return (
                        <Link
                          key={q.id}
                          to={createPageUrl(`QuestionDetail?id=${q.id}`)}
                          className="flex items-center gap-3 p-3 rounded-2xl border"
                          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                        >
                          <MessageCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                          <span className="flex-1 text-sm line-clamp-1" style={{ color: 'var(--color-text-primary)' }}>{displayTitle}</span>
                          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* Main Content */
        <div>
          {/* Hero intro */}
          <div className="px-4 pt-5 pb-4">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {lang === 'en'
                ? 'Find expert-written articles, browse frequently asked questions and get answers from our community.'
                : 'Find faglige artikler, browse ofte stillede spørgsmål og få svar fra vores fællesskab.'}
            </p>
          </div>

          <div className="px-4 pb-6">
            <Tabs defaultValue={initialTab || autoTab || activeTabs[0]?.key || 'articles'} className="w-full">
              {/* Tab bar */}
              <TabsList
                className="w-full p-1 rounded-2xl mb-5"
                style={{ backgroundColor: 'var(--color-bg-subtle)' }}
              >
                {activeTabs.map(tab => {
                  const displayLabel = getTranslated(tabTranslations, tab.id, 'label', tab.label);
                  return (
                    <TabsTrigger key={tab.key} value={tab.key} className="flex-1 rounded-xl text-xs">
                      {tab.emoji ? `${tab.emoji} ` : ''}{displayLabel}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Articles tab */}
              <TabsContent value="articles" className="space-y-6">
                {loadingArticles ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
                  </div>
                ) : (
                  Object.entries(articlesByCategory)
                    .filter(([category]) => category !== 'Tigerspring')
                    .map(([category, categoryArticles]) => (
                      <div key={category}>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
                          {category}
                        </p>
                        <div
                          className="rounded-2xl border overflow-hidden divide-y"
                          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', '--tw-divide-opacity': 1 }}
                        >
                          {categoryArticles.map((article, idx) => (
                            <Link
                              key={article.id}
                              to={createPageUrl(`ArticleDetail?id=${article.id}`)}
                              className="flex items-center gap-3 px-4 py-3.5 active:opacity-60 transition-opacity"
                              style={{ borderColor: 'var(--color-border)' }}
                            >
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                                <span className="text-base">{article.emoji || '📄'}</span>
                              </div>
                              <span className="flex-1 text-sm font-medium leading-snug line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>
                                {article._displayTitle || article.title}
                              </span>
                              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))
                )}
              </TabsContent>

              {/* Tigerspring tab */}
              <TabsContent value="tigerspring">
                <WonderWeeksTab />
              </TabsContent>

              {/* Graviditet tab */}
              <TabsContent value="graviditet">
                <PregnancyTab />
              </TabsContent>

              {/* FAQ tab */}
              <TabsContent value="faq" className="space-y-3">
                {loadingArticles ? (
                  <div className="space-y-2">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 rounded-2xl" />)}</div>
                ) : faqs.length === 0 ? (
                  <div className="text-center py-16">
                    <p style={{ color: 'var(--color-text-muted)' }}>{t.noFaq}</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border overflow-hidden divide-y" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                    {faqs.map(article => {
                      const displayTitle = getTranslated(articleTranslations, article.id, 'title', article.title);
                      return (
                        <Link
                          key={article.id}
                          to={createPageUrl(`ArticleDetail?id=${article.id}`)}
                          className="flex items-center gap-3 px-4 py-3.5 active:opacity-60 transition-opacity"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                            <HelpCircle className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                          </div>
                          <span className="flex-1 text-sm font-medium leading-snug" style={{ color: 'var(--color-text-primary)' }}>{displayTitle}</span>
                          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Questions tab */}
              <TabsContent value="questions" className="space-y-4">
                {/* Ask CTA card */}
                <Link
                  to={createPageUrl('AskQuestion')}
                  className="flex items-center gap-4 p-4 rounded-2xl border"
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                >
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-primary)' }}>
                    <HelpCircle className="w-5 h-5" style={{ color: 'var(--color-bg)' }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{t.askQuestion}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {lang === 'en' ? 'Get answers from our community' : 'Få svar fra vores fællesskab'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                </Link>

                {loadingQuestions ? (
                  <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-8">
                    <p style={{ color: 'var(--color-text-muted)' }}>{t.noQuestions}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {questions.map(q => {
                      const displayTitle = getTranslated(questionTranslations, q.id, 'title', q.title);
                      return (
                        <Link
                          key={q.id}
                          to={createPageUrl(`QuestionDetail?id=${q.id}`)}
                          className="block rounded-2xl p-4 border active:opacity-60 transition-opacity"
                          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h3 className="font-medium text-sm leading-snug line-clamp-2 flex-1" style={{ color: 'var(--color-text-primary)' }}>
                              {displayTitle}
                            </h3>
                            <span
                              className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
                              style={q.status === 'answered'
                                ? { backgroundColor: 'rgba(16,185,129,0.12)', color: '#059669' }
                                : { backgroundColor: 'rgba(245,158,11,0.12)', color: '#d97706' }}
                            >
                              {q.status === 'answered' ? t.answered : t.open}
                            </span>
                          </div>
                          <p className="text-xs line-clamp-2 mb-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{q.content}</p>
                          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            {q.author_username && <span>{t.by} {q.author_username}</span>}
                            {q.answer_count > 0 && (
                              <>
                                <span>·</span>
                                <span>{q.answer_count} {t.answers}</span>
                              </>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}