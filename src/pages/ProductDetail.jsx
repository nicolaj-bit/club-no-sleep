import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Heart, Share2, Leaf, Package, Shirt, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useTranslation } from '@/components/hooks/useTranslation';
import VariantSelector from '@/components/shop/VariantSelector';

const trustPoints = [
  { icon: Leaf, label: 'Naturlige\nmaterialer' },
  { icon: Package, label: 'Nej tak til\npolyester' },
  { icon: Shirt, label: 'Håndsyet i\nVietnam' },
  { icon: Truck, label: 'Gratis fragt\nover 599 kr.' },
];

export default function ProductDetail() {
  const { lang } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id: productId });
      return products[0];
    },
    enabled: !!productId,
  });

  const translations = useTranslation(
    lang === 'en' && product
      ? [{ id: product.id, title: product.title, description: product.description || '' }]
      : []
  );

  const displayProduct = lang === 'en' && translations.length > 0 && translations[0]
    ? { ...product, ...translations[0] }
    : product;

  const handleShare = async () => {
    try {
      await navigator.share({ title: product.title, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link kopieret');
    }
  };

  const handleBuyNow = () => {
    if (product?.shopify_url) {
      window.open(product.shopify_url, '_blank');
    } else {
      toast.error('Køb link ikke tilgængeligt');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Skeleton className="aspect-square w-full" />
        <div className="p-5 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>{lang === 'en' ? 'Product not found' : 'Produkt ikke fundet'}</p>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [];
  const currentImage = images[selectedImageIndex];
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <div className="min-h-screen pb-36" style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* ── Main image ── */}
      <div className="relative bg-[#F5EFE6]">
        <div className="aspect-square">
          {currentImage ? (
            <img src={currentImage} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span style={{ color: 'var(--color-text-muted)', fontSize: 48 }}>🛍️</span>
            </div>
          )}
        </div>

        {/* Nav buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link to={createPageUrl('Shop')}>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-md"
              style={{ backgroundColor: isDark ? 'rgba(20,20,20,0.85)' : 'rgba(255,255,255,0.9)', color: isDark ? '#F5F0EB' : '#2C1A0E' }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex gap-2">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-md"
              style={{ backgroundColor: isDark ? 'rgba(20,20,20,0.85)' : 'rgba(255,255,255,0.9)', color: isFavorite ? '#f43f5e' : (isDark ? '#F5F0EB' : '#2C1A0E') }}
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`w-4.5 h-4.5 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-md"
              style={{ backgroundColor: isDark ? 'rgba(20,20,20,0.85)' : 'rgba(255,255,255,0.9)', color: isDark ? '#F5F0EB' : '#2C1A0E' }}
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-14 left-4">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-sm tracking-wide" style={{ backgroundColor: '#5C3317', color: '#FAF6F1' }}>
              TILBUD
            </span>
          </div>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {images.length > 1 && (
        <div className="flex gap-2 px-4 pt-3 pb-1 overflow-x-auto no-scrollbar">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImageIndex(i)}
              className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all"
              style={{ borderColor: i === selectedImageIndex ? 'var(--color-primary)' : 'var(--color-border)' }}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* ── Product info ── */}
      <div className="px-5 pt-5 space-y-5">

        {/* Title */}
        <div>
          <h1
            className="font-display text-3xl font-light tracking-wide leading-tight uppercase"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            {displayProduct.title}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {hasDiscount ? (
                <>
                  <span className="font-semibold">{lang === 'en' ? 'Sale price' : 'Salgspris'}</span>{' '}
                  {product.price.toLocaleString('da-DK')},00 kr
                </>
              ) : (
                <>{product.price.toLocaleString('da-DK')},00 kr</>
              )}
            </span>
            {hasDiscount && (
              <span className="text-base line-through" style={{ color: 'var(--color-text-muted)' }}>
                {product.compare_at_price.toLocaleString('da-DK')},00 kr
              </span>
            )}
          </div>
        </div>

        {/* Delivery notice */}
        <p className="text-sm italic" style={{ color: 'var(--color-accent)' }}>
          {lang === 'en' ? 'Delivery 1–2 business days.' : 'Levering 1–2 hverdage.'}
        </p>

        {/* Variants */}
        {product.variants?.length > 0 && (
          <VariantSelector
            variants={product.variants}
            selectedVariant={selectedVariant}
            onSelect={setSelectedVariant}
            lang={lang}
          />
        )}

        {/* ── 4 trust icons ── */}
        <div
          className="grid grid-cols-4 gap-2 py-4 border-t border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {trustPoints.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <Icon className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              <span className="text-center leading-tight" style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Description */}
        {displayProduct.description && (
          <div>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-text-secondary)' }}>
              {displayProduct.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {product.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-xs rounded-sm uppercase tracking-wider"
                style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stock notice */}
        {!product.in_stock && (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {lang === 'en' ? 'Out of stock' : 'Udsolgt'}
          </p>
        )}
      </div>

      {/* ── Bottom CTA ── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 py-4 border-t"
        style={{
          backgroundColor: isDark ? 'var(--color-bg-card)' : '#FFFFFF',
          borderColor: 'var(--color-border)',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        }}
      >
        <button
          onClick={handleBuyNow}
          disabled={!product.in_stock}
          className="w-full h-12 rounded text-sm font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
          style={{ backgroundColor: '#5C3317', color: '#FAF6F1' }}
        >
          {lang === 'en' ? 'Buy now in webshop' : 'Køb nu i webshop'}
        </button>
      </div>
    </div>
  );
}