import React, { useState, useRef } from 'react';
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
  const [showSearch, setShowSearch] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef(null);

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

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--color-bg)' }}>
        <PageHeader title="Shop" />

        {/* Category pills + Search */}
        <div className="sticky top-16 z-30 backdrop-blur-xl border-b transition-transform duration-300" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <div className="px-4 pt-3 pb-2">
            {showSearch ? (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  <Input
                    placeholder={t.searchProducts}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 border-0 rounded-xl"
                    style={{ backgroundColor: 'var(--color-bg-subtle)' }}
                    autoFocus
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setShowSearch(false); setSearch(''); }}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
                    <Search className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setCategoryOpen(true)}>
                    <LayoutGrid className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setFilterOpen(true)}>
                    <SlidersHorizontal className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Category pills */}
          <div ref={categoryRef} className="px-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-2 w-max">
              {categories.map(cat => {
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
                    style={isActive
                      ? {
                          background: 'linear-gradient(135deg, #C8A882, #A0785A)',
                          color: '#fff',
                          boxShadow: '0 2px 12px rgba(160,120,90,0.35)',
                        }
                      : {
                          backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                          color: 'var(--color-text-secondary)',
                          border: '1px solid var(--color-border)',
                        }}
                  >
                    <span className="text-base leading-none">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hero banner for active category */}
        {activeCategory !== 'all' && (
          <div
            className="mx-4 mt-4 rounded-2xl px-6 py-5 flex items-center gap-4 overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #C8A882 0%, #A0785A 100%)' }}
          >
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-20 select-none">
              {activeCat?.icon}
            </div>
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-0.5">
                {t.categoryLabel}
              </p>
              <h2 className="text-white text-2xl font-semibold">{activeCat?.label}</h2>
              <p className="text-white/80 text-sm mt-0.5">
                {filteredProducts.length} {t.productsLabel}
              </p>
            </div>
          </div>
        )}

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