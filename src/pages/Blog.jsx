import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import BlogCard from '@/components/blog/BlogCard';
import PullToRefresh from '@/components/ui/PullToRefresh';
import PageHeader from '@/components/ui/PageHeader';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useTranslation } from '@/components/hooks/useTranslation';
import { useTheme } from '@/components/ui/ThemeProvider';

export default function Blog() {
  const queryClient = useQueryClient();
  const { lang, t } = useLanguage();
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setHidden(currentY > lastScrollY.current && currentY > 60);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, '-published_date'),
  });

  const { data: categoryRecords = [] } = useQuery({
    queryKey: ['blogCategories'],
    queryFn: () => base44.entities.BlogCategory.list('order'),
  });

  // Translate posts and categories
  const postsToTranslate = lang === 'en' && posts.length > 0
    ? posts.map(p => ({ id: p.id, title: p.title, category: p.category || '' }))
    : [];
  const categoriesToTranslate = lang === 'en' && categoryRecords.length > 0
    ? categoryRecords.map(c => ({ id: c.id, label: c.label }))
    : [];

  const postTranslations = useTranslation(postsToTranslate);
  const categoryTranslations = useTranslation(categoriesToTranslate);

  const allLabel = t.allCategories;
  const activeCategories = categoryRecords.filter(c => c.is_active);

  // Helper to get translated text
  const getTranslated = (items, itemId, field, fallback) => {
    if (!Array.isArray(items)) return fallback;
    const found = items.find(i => i.id === itemId);
    return found ? found[field] : fallback;
  };

  const categories = [
    allLabel,
    ...activeCategories.map(c =>
      getTranslated(categoryTranslations, c.id, 'label', c.label)
    )
  ];

  const activeCategoryDa = (() => {
    if (!activeCategory || activeCategory === allLabel) return null;
    const idx = categories.indexOf(activeCategory);
    if (idx <= 0) return activeCategory;
    return activeCategories[idx - 1]?.label || activeCategory;
  })();

  const filteredPosts = posts.filter(p => {
    const displayTitle = getTranslated(postTranslations, p.id, 'title', p.title);
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
      <div
        className="sticky top-0 z-40 transition-transform duration-300"
        style={{ transform: hidden ? 'translateY(-100%)' : 'translateY(0)' }}
      >
      <PageHeader title={t.blogTitle} />

      {/* Categories + Search */}
      <div className="backdrop-blur-xl border-b" style={{ background: isDark ? 'var(--color-bg-card)' : 'linear-gradient(135deg, #F7F2EC, #EDE4D8)', borderColor: isDark ? 'var(--color-border)' : '#E8DDD2' }}>
        <div className="px-4 py-3">
          {showSearch ? (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={t.searchBlog}
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
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowSearch(true)}
              className="w-full justify-start"
            >
              <Search className="w-5 h-5" />
            </Button>
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
                  ? { background: 'linear-gradient(135deg, #C8A882, #A0785A)', color: '#fff', boxShadow: '0 2px 8px rgba(160,120,90,0.35)', border: 'none' }
                  : { backgroundColor: 'transparent', color: 'var(--color-text-primary)', border: '1.5px solid #EDE4D8' }}
                className="flex-shrink-0 px-5 py-2 rounded-2xl text-sm font-medium transition-all"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
      </div>

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
            <p style={{ color: 'var(--color-text-muted)' }}>{t.noPosts}</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <BlogCard
                post={featuredPost}
                variant="featured"
                translatedTitle={getTranslated(postTranslations, featuredPost.id, 'title', null)}
                translatedCategory={getTranslated(postTranslations, featuredPost.id, 'category', null)}
                lang={lang}
              />
            )}
            
            {/* Other Posts */}
            <div className="space-y-4">
              {otherPosts.map(post => (
                <BlogCard
                  key={post.id}
                  post={post}
                  translatedTitle={getTranslated(postTranslations, post.id, 'title', null)}
                  translatedCategory={getTranslated(postTranslations, post.id, 'category', null)}
                  lang={lang}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
    </PullToRefresh>
  );
}