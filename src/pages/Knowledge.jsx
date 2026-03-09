import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, X, HelpCircle, FileText, MessageCircle, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ArticleCard from '@/components/knowledge/ArticleCard';

export default function Knowledge() {
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { data: articles = [], isLoading: loadingArticles } = useQuery({
    queryKey: ['articles'],
    queryFn: () => base44.entities.KnowledgeArticle.list('order'),
  });

  const { data: questions = [], isLoading: loadingQuestions } = useQuery({
    queryKey: ['questions'],
    queryFn: () => base44.entities.Question.list('-created_date', 20),
  });

  // Group articles by category
  const articlesByCategory = articles.reduce((acc, article) => {
    const cat = article.category || 'Andet';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(article);
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
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="px-4 py-3">
          {showSearch ? (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Søg i viden..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-slate-50 border-0"
                  autoFocus
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setShowSearch(false);
                  setSearch('');
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Viden & Svar</h1>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowSearch(true)}
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Search Results */}
      {searchResults ? (
        <div className="p-4 space-y-6">
          {searchResults.articles.length === 0 && searchResults.questions.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: 'var(--color-text-muted)' }}>Ingen resultater for "{search}"</p>
            </div>
          ) : (
            <>
              {searchResults.articles.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-muted)' }}>Artikler</h2>
                  <div className="space-y-2">
                    {searchResults.articles.map(article => (
                      <ArticleCard key={article.id} article={article} variant="compact" />
                    ))}
                  </div>
                </div>
              )}
              
              {searchResults.questions.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-muted)' }}>Spørgsmål</h2>
                  <div className="space-y-2">
                    {searchResults.questions.map(q => (
                      <Link 
                        key={q.id}
                        to={createPageUrl(`QuestionDetail?id=${q.id}`)}
                        className="flex items-center gap-3 p-3 rounded-xl border"
                      style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                      >
                        <MessageCircle className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                        <span className="flex-1 text-sm line-clamp-1" style={{ color: 'var(--color-text-primary)' }}>{q.title}</span>
                        <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* Main Content */
        <div className="p-4">
          <Tabs defaultValue="articles" className="w-full">
            <TabsList className="w-full p-1 rounded-xl" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
              <TabsTrigger value="articles" className="flex-1 rounded-lg">Artikler</TabsTrigger>
              <TabsTrigger value="faq" className="flex-1 rounded-lg">FAQ</TabsTrigger>
              <TabsTrigger value="questions" className="flex-1 rounded-lg">Spørgsmål</TabsTrigger>
            </TabsList>

            <TabsContent value="articles" className="mt-4 space-y-6">
              {loadingArticles ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-20 rounded-2xl" />
                  ))}
                </div>
              ) : Object.entries(articlesByCategory).map(([category, categoryArticles]) => (
                <div key={category}>
                  <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>{category}</h2>
                  <div className="space-y-2">
                    {categoryArticles.map(article => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="faq" className="mt-4 space-y-2">
              {loadingArticles ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-12 rounded-xl" />
                  ))}
                </div>
              ) : faqs.length === 0 ? (
                <div className="text-center py-12">
                  <p style={{ color: 'var(--color-text-muted)' }}>Ingen FAQ endnu</p>
                </div>
              ) : (
                faqs.map(article => (
                  <ArticleCard key={article.id} article={article} variant="compact" />
                ))
              )}
            </TabsContent>

            <TabsContent value="questions" className="mt-4 space-y-4">
              <Link 
                to={createPageUrl('AskQuestion')}
                className="flex items-center justify-center gap-2 p-4 rounded-xl font-medium"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
              >
                <HelpCircle className="w-5 h-5" />
                Stil et spørgsmål
              </Link>
              
              {loadingQuestions ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-8">
                  <p style={{ color: 'var(--color-text-muted)' }}>Ingen spørgsmål endnu</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.map(q => (
                    <Link 
                      key={q.id}
                      to={createPageUrl(`QuestionDetail?id=${q.id}`)}
                      className="block rounded-xl p-4 border"
                      style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>{q.title}</h3>
                        <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${
                          q.status === 'answered' 
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {q.status === 'answered' ? 'Besvaret' : 'Åben'}
                        </span>
                      </div>
                      <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{q.content}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        <span>af {q.author_username}</span>
                        {q.answer_count > 0 && (
                          <>
                            <span>•</span>
                            <span>{q.answer_count} svar</span>
                          </>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}