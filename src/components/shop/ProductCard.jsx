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
            <ShoppingBag className="w-12 h-12 text-slate-300" />
          </div>
        )}
        
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            -{discountPercent}%
          </div>
        )}
        
        {!product.in_stock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-full">
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
          <Heart className="w-4 h-4 text-slate-700" />
        </button>
      </div>
      
      <div className="mt-3 px-1">
        <h3 className="text-sm font-medium text-slate-900 line-clamp-2 leading-snug">
          {product.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">
            {product.price} kr
          </span>
          {hasDiscount && (
            <span className="text-xs text-slate-400 line-through">
              {product.compare_at_price} kr
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}