import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Heart, Share2, ExternalLink, Check, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function ProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id: productId });
      return products[0];
    },
    enabled: !!productId,
  });

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.title,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link kopieret');
    }
  };

  const handleBuyNow = () => {
    if (product.shopify_url) {
      window.open(product.shopify_url, '_blank');
    } else {
      toast.error('Køb link ikke tilgængeligt');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Skeleton className="aspect-square w-full" />
        <div className="p-4 space-y-4">
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
        <p style={{ color: 'var(--color-text-muted)' }}>Produkt ikke fundet</p>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [];
  const currentImage = images[selectedImageIndex];
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <div className="min-h-screen bg-white">
      {/* Image Gallery */}
      <div className="relative">
        <div className="aspect-square bg-slate-100">
          {currentImage ? (
            <img 
              src={currentImage} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-slate-300" />
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Link to={createPageUrl('Shop')}>
            <Button size="icon" variant="secondary" className="rounded-full bg-white/90 backdrop-blur">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button 
              size="icon" 
              variant="secondary" 
              className="rounded-full bg-white/90 backdrop-blur"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </Button>
            <Button 
              size="icon" 
              variant="secondary" 
              className="rounded-full bg-white/90 backdrop-blur"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Image Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedImageIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === selectedImageIndex ? 'bg-slate-900 w-4' : 'bg-slate-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Title & Price */}
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{product.title}</h1>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">
              {product.price} kr
            </span>
            {hasDiscount && (
              <span className="text-lg text-slate-400 line-through">
                {product.compare_at_price} kr
              </span>
            )}
          </div>
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-2">
          {product.in_stock ? (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-emerald-600 font-medium">På lager</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-slate-300" />
              <span className="text-sm text-slate-500 font-medium">Udsolgt</span>
            </>
          )}
        </div>

        {/* Variants */}
        {product.variants?.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-2">Variant</h3>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedVariant(variant)}
                  disabled={!variant.in_stock}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    selectedVariant?.name === variant.name
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : variant.in_stock
                        ? 'border-slate-200 hover:border-slate-300'
                        : 'border-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {variant.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Beskrivelse</h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {product.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {product.tags.map((tag, i) => (
              <span 
                key={i}
                className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 safe-area-bottom">
        <Button 
          className="w-full h-12 rounded-full bg-slate-900 hover:bg-slate-800 text-base font-semibold gap-2"
          disabled={!product.in_stock}
          onClick={handleBuyNow}
        >
          <ExternalLink className="w-5 h-5" />
          Køb nu i webshop
        </Button>
      </div>
    </div>
  );
}