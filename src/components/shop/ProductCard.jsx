import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Heart, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProductCard({ product, compact = false }) {
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.price / product.compare_at_price) * 100) 
    : 0;

  return (
    <Link 
      to={createPageUrl(`ProductDetail?id=${product.id}`)}
      className="group block"
    >
      <div className={cn(
        "relative rounded-2xl overflow-hidden",
        compact ? "aspect-square" : "aspect-[4/5]"
      )} style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
        {product.images?.[0] ? (
          <img 
            src={product.images[0]} 
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12" style={{ color: 'var(--color-text-muted)' }} />
          </div>
        )}
        
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            -{discountPercent}%
          </div>
        )}
        
        {!product.in_stock && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-card)', opacity: 0.7 }}>
            <span className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ backgroundColor: 'var(--color-text-primary)', color: 'var(--color-bg)' }}>
              Udsolgt
            </span>
          </div>
        )}
        
        <button 
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          onClick={(e) => {
            e.preventDefault();
            // TODO: Add to favorites
          }}
        >
          <Heart className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
        </button>
      </div>
      
      <div className="mt-3 px-1">
        <h3 className="text-sm font-medium line-clamp-2 leading-snug" style={{ color: 'var(--color-text-primary)' }}>
          {product.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
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