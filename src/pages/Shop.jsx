import React, { useState, useEffect, useRef } from 'react';
import { useScrollDirection } from '@/components/ui/useScrollDirection';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '@/components/ui/PullToRefresh';
import { base44 } from '@/api/base44Client';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BottomSheet } from '@/components/ui/BottomSheet';
import ProductCard from '@/components/shop/ProductCard';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useTranslation } from '@/components/hooks/useTranslation';

export default function Shop() {
  const { t, lang } = useLanguage();
  const headerVisible = useScrollDirection();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showSearch, setShowSearch] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const categories = [
    { key: 'all', label: t.catAll },
    { key: 'Pleje', label: t.catCare },
    { key: 'Tilbehør', label: t.catAccessories },
    { key: 'Udstyr', label: t.catEquipment },
    { key: 'Bøger', label: t.catBooks },
  ];

  const sortOptions = [
    { value: 'newest', label: t.newest },
    { value: 'price_asc', label: t.priceLow },
    { value: 'price_desc', label: t.priceHigh },
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                <Input
                  placeholder={t.searchProducts}
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
              <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.shopTitle}</h1>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowSearch(true)}
                >
                  <Search className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setFilterOpen(true)}>
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Categories */}
        <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={activeCategory === cat.key
                  ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }
                  : { backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <div className="p-4">
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
          <div className="text-center py-12">
            <p style={{ color: 'var(--color-text-muted)' }}>{t.noProducts}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map(product => {
              const translated = translations['product_' + product.id];
              const displayProduct = lang === 'en' && translated ? { ...product, ...translated } : product;
              return (
                <ProductCard key={product.id} product={displayProduct} />
              );
            })}
          </div>
        )}
      </div>
    </div>
      {/* Filter & Sort Bottom Sheet */}
      <BottomSheet open={filterOpen} onOpenChange={setFilterOpen} title={t.filtersTitle}>
        <div className="px-5 py-4 space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--color-text-muted)' }}>
              {t.sortBy}
            </p>
            <div className="space-y-1">
              {sortOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); setFilterOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] active:opacity-60 transition-opacity"
                  style={sortBy === opt.value
                    ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }
                    : { backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.value && <span className="text-xs">✓</span>}
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