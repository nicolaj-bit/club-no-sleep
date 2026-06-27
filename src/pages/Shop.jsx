import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '@/components/ui/PullToRefresh';
import PageHeader from '@/components/ui/PageHeader';
import { base44 } from '@/api/base44Client';
import { Search, SlidersHorizontal, X, LayoutGrid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BottomSheet } from '@/components/ui/BottomSheet';
import ProductCard from '@/components/shop/ProductCard';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useTranslation } from '@/components/hooks/useTranslation';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useScrollDirection } from '@/components/ui/useScrollDirection';

const ALL_CATEGORY = { key: 'all', label_da: 'Alle', label_en: 'All', icon: '✨' };

const SORT_OPTIONS = [
  { value: 'newest',     label_da: 'Nyeste',           label_en: 'Newest' },
  { value: 'price_asc',  label_da: 'Pris: Lav til høj', label_en: 'Price: Low to high' },
  { value: 'price_desc', label_da: 'Pris: Høj til lav', label_en: 'Price: High to low' },
];

export default function Shop() {
  const { lang, t } = useLanguage();
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const sortOptions = SORT_OPTIONS.map(o => ({
    ...o,
    label: lang === 'en' ? o.label_en : o.label_da,
  }));

  const { data: shopCategories = [] } = useQuery({
    queryKey: ['shopCategories'],
    queryFn: () => base44.entities.ShopCategory.filter({ is_active: true }, 'order'),
  });

  const categories = [
    { ...ALL_CATEGORY, label: lang === 'en' ? ALL_CATEGORY.label_en : ALL_CATEGORY.label_da },
    ...shopCategories.map(c => ({
      key: c.key,
      label: lang === 'en' && c.label_en ? c.label_en : c.label_da,
      icon: c.icon || '🏷️',
    })),
  ];

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
  });

  const translations = useTranslation(
    lang === 'en' && products.length > 0
      ? products.map(p => ({ id: p.id, title: p.title, description: p.description || '', category: p.category || '' }))
      : []
  );

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = !search ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      return 0;
    });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries(['products']);
  };

  const activeCat = categories.find(c => c.key === activeCategory);
  const visible = useScrollDirection(8);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--color-bg)' }}>
        <PageHeader title="Shop" />

        {/* Search + Category modal */}
        <div className="sticky top-16 z-30 backdrop-blur-xl border-b transition-transform duration-300" style={{ background: isDark ? 'var(--color-bg-card)' : 'linear-gradient(135deg, #F7F2EC, #EDE4D8)', borderColor: isDark ? 'var(--color-border)' : '#E8DDD2', transform: visible ? 'translateY(0)' : 'translateY(-220%)' }}>
          <div className="px-4 pt-3 pb-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              <Input
                placeholder={t.searchProducts}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 border-0 rounded-xl"
                style={{ backgroundColor: 'var(--color-bg-subtle)' }}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCategoryOpen(true)}
                className="flex-1 justify-start gap-2 rounded-xl"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-sm">{activeCat?.label || t.categoriesTitle}</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setFilterOpen(true)}
                className="gap-2 rounded-xl"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="p-4 mt-2">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/5] rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center gap-3">
              <div className="text-5xl">🛍️</div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {t.noProducts}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map(product => {
                const translated = Array.isArray(translations) ? translations.find(tr => tr.id === product.id) : translations?.[product.id];
                const displayProduct = lang === 'en' && translated ? { ...product, ...translated } : product;
                return (
                  <ProductCard key={product.id} product={displayProduct} />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Category Bottom Sheet */}
      <BottomSheet open={categoryOpen} onOpenChange={setCategoryOpen} title={t.categoriesTitle}>
        <div className="px-5 py-4 space-y-2">
          {categories.map(cat => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => { setActiveCategory(cat.key); setCategoryOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] active:opacity-60 transition-opacity"
                style={isActive
                  ? { background: 'linear-gradient(135deg, #C8A882, #A0785A)', color: '#fff' }
                  : { backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="flex-1 text-left">{cat.label}</span>
                {isActive && <span className="text-xs font-bold">✓</span>}
              </button>
            );
          })}
          <div className="h-2" />
        </div>
      </BottomSheet>

      {/* Filter & Sort Bottom Sheet */}
      <BottomSheet open={filterOpen} onOpenChange={setFilterOpen} title={t.filtersAndSorting}>
        <div className="px-5 py-4 space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--color-text-muted)' }}>
              {t.sortBy}
            </p>
            <div className="space-y-2">
              {sortOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); setFilterOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] active:opacity-60 transition-opacity"
                  style={sortBy === opt.value
                    ? { background: 'linear-gradient(135deg, #C8A882, #A0785A)', color: '#fff' }
                    : { backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.value && <span className="text-xs font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="h-2" />
        </div>
      </BottomSheet>
    </PullToRefresh>
  );
}