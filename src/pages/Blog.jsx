import React, { useState, useEffect, useRef } from 'react';
import { useScrollDirection } from '@/components/ui/useScrollDirection';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import BlogCard from '@/components/blog/BlogCard';
import PullToRefresh from '@/components/ui/PullToRefresh';
import { useLanguage } from '@/components/ui/LanguageContext';

export default function Blog() {
  const headerVisible = useScrollDirection();
  const queryClient = useQueryClient();
  const { lang, t } = useLanguage();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [translatedPosts, setTranslatedPosts] = useState({});
  const [translating, setTranslating] = useState(false);
  const translateRef = useRef(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, '-published_date'),
  });

  const { data: categoryRecords = [] } = useQuery({
    queryKey: ['blogCategories'],
    queryFn: () => base44.entities.BlogCategory.list('order'),
  });

  const allLabel = lang === 'en' ? 'All' : 'Alle';
  const activeCategories = categoryRecords.filter(c => c.is_active);
  const categories = [allLabel, ...activeCategories.map(c =>
    lang === 'en' && translatedPosts['__cat_' + c.label] ? translatedPosts['__cat_' + c.label] : c.label
  )];

  // Translate all posts + categories when language changes to English
  useEffect(() => {
    if (lang !== 'en' || posts.length === 0) {
      setTranslatedPosts({});
      return;
    }
    const key = posts.map(p => p.id).join(',');
    if (translateRef.current === key) return;
    translateRef.current = key;

    setTranslating(true);
    const items = posts.map(p => ({ id: p.id, title: p.title, category: p.category || '' }));
    const uniqueCategories = [...new Set(posts.map(p => p.category).filter(Boolean))];

    base44.integrations.Core.InvokeLLM({
      prompt: `Translate these Danish blog post titles and categories to English. Return ONLY valid JSON.
Posts: ${JSON.stringify(items)}
Unique categories: ${JSON.stringify(uniqueCategories)}

Return format:
{
  "posts": [{"id": "...", "title": "...", "category": "..."}],
  "categories": {"DanskKategori": "EnglishCategory"}
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          posts: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' }, category: { type: 'string' } } } },
          categories: { type: 'object' }
        }
      }
    }).then(result => {
      const map = {};
      (result.posts || []).forEach(p => { map[p.id] = { title: p.title, category: p.category }; });
      Object.entries(result.categories || {}).forEach(([da, en]) => { map['__cat_' + da] = en; });
      setTranslatedPosts(map);
    }).finally(() => setTranslating(false));
  }, [lang, posts]);

  const activeCategoryDa = (() => {
    if (!activeCategory || activeCategory === allLabel) return null;
    // find the original danish label for the active category
    const idx = categories.indexOf(activeCategory);
    if (idx <= 0) return activeCategory;
    return activeCategories[idx - 1]?.label || activeCategory;
  })();

  const filteredPosts = posts.filter(p => {
    const displayTitle = translatedPosts[p.id]?.title || p.title;
    const matchesSearch = !search ||
      displayTitle?.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || activeCategory === allLabel || p.category === activeCategoryDa;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredPosts[0];
  const otherPosts = filteredPosts.slice(1);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries(['blogPosts']);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Søg i blog..."
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
              <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Blog</h1>
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
        
        {/* Categories */}
        <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={activeCategory === cat
                  ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }
                  : { backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 space-y-6">
        {isLoading ? (
          <>
            <Skeleton className="aspect-[16/9] rounded-2xl" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-24 h-24 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: 'var(--color-text-muted)' }}>Ingen indlæg fundet</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <BlogCard post={featuredPost} variant="featured" />
            )}
            
            {/* Other Posts */}
            <div className="space-y-4">
              {otherPosts.map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
    </PullToRefresh>
  );
}