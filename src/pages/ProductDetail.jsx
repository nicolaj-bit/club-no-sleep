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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Image Gallery */}
      <div className="relative">
        <div className="aspect-square" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
          {currentImage ? (
            <img 
              src={currentImage} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16" style={{ color: 'var(--color-text-muted)' }} />
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Link to={createPageUrl('Shop')}>
            <Button size="icon" variant="secondary" className="rounded-full backdrop-blur" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button 
              size="icon" 
              variant="secondary" 
              className="rounded-full backdrop-blur"
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </Button>
            <Button 
              size="icon" 
              variant="secondary" 
              className="rounded-full backdrop-blur"
              style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
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
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{product.title}</h1>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {product.price} kr
            </span>
            {hasDiscount && (
              <span className="text-lg line-through" style={{ color: 'var(--color-text-muted)' }}>
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
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-text-muted)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Udsolgt</span>
            </>
          )}
        </div>

        {/* Variants */}
        {product.variants?.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Variant</h3>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedVariant(variant)}
                  disabled={!variant.in_stock}
                  className="px-4 py-2 rounded-lg text-sm font-medium border transition-all"
                  style={selectedVariant?.name === variant.name
                    ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)', borderColor: 'var(--color-primary)' }
                    : variant.in_stock
                      ? { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }
                      : { backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)', cursor: 'not-allowed' }
                  }
                >
                  {variant.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Beskrivelse</h3>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-text-secondary)' }}>
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
                className="px-2.5 py-1 text-xs rounded-full"
                style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t safe-area-bottom" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <Button 
          className="w-full h-12 rounded-full text-base font-semibold gap-2"
          style={{ backgroundColor: 'var(--color-accent)', color: '#FFFFFF' }}
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