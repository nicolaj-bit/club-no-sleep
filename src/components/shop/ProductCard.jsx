import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useTheme } from '@/components/ui/ThemeProvider';

export default function ProductCard({ product }) {
  const { lang } = useLanguage();
  const { isDark } = useTheme();
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  return (
    <Link
      to={createPageUrl(`ProductDetail?id=${product.id}`)}
      className="group block"
    >
      {/* Image */}
      <div
        className="relative rounded-2xl overflow-hidden aspect-[4/5]"
        style={{ backgroundColor: isDark ? '#1A1A1A' : '#F0E9E0' }}
      >
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-active:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12" style={{ color: 'var(--color-text-muted)' }} />
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            -{discountPercent}%
          </div>
        )}

        {/* Out of stock overlay */}
        {!product.in_stock && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-2xl"
            style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)' }}
          >
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'var(--color-text-primary)', color: 'var(--color-bg)' }}
            >
              {lang === 'en' ? 'Out of stock' : 'Udsolgt'}
            </span>
          </div>
        )}

        {/* Hover overlay shine */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl" />
      </div>

      {/* Info */}
      <div className="mt-2.5 px-0.5">
        <h3
          className="text-[13px] font-medium line-clamp-2 leading-snug"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {product.title}
        </h3>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {product.price} kr
          </span>
          {hasDiscount && (
            <span className="text-xs line-through" style={{ color: 'var(--color-text-muted)' }}>
              {product.compare_at_price} kr
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}