import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PullToRefresh from '@/components/ui/PullToRefresh';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Trash2, ShoppingBag, BookOpen, FileText, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function Favorites() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['myFavorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Favorite.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries(['myFavorites', user?.email]);
      const previous = queryClient.getQueryData(['myFavorites', user?.email]);
      queryClient.setQueryData(['myFavorites', user?.email], (old) => old?.filter(f => f.id !== id) || []);
      return { previous };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(['myFavorites', user?.email], context.previous);
      toast.error('Noget gik galt');
    },
    onSuccess: () => toast.success('Fjernet fra favoritter'),
    onSettled: () => queryClient.invalidateQueries(['myFavorites', user?.email]),
  });

  const productFavorites = favorites.filter(f => f.item_type === 'product');
  const blogFavorites = favorites.filter(f => f.item_type === 'blog');

  const typeIcon = { product: ShoppingBag, blog: BookOpen, article: FileText };
  const typeLink = { product: 'ProductDetail', blog: 'BlogPost', article: 'ArticleDetail' };

  const FavoriteItem = ({ item }) => {
    const Icon = typeIcon[item.item_type] || FileText;
    const linkPage = typeLink[item.item_type] || 'ArticleDetail';
    return (
      <div
        className="flex items-center gap-3 rounded-2xl p-3"
        style={{ background: 'var(--color-bg-card)' }}
      >
        <Link to={createPageUrl(`${linkPage}?id=${item.item_id}`)} className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 block" style={{ background: 'var(--color-bg-subtle)' }}>
          {item.item_image ? (
            <img src={item.item_image} alt={item.item_title} className="w-full h-full object-cover" width={56} height={56} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={createPageUrl(`${linkPage}?id=${item.item_id}`)}>
            <h3 className="text-sm font-medium line-clamp-2 leading-snug" style={{ color: 'var(--color-text-primary)' }}>
              {item.item_title}
            </h3>
          </Link>
          <p className="text-xs mt-1 capitalize" style={{ color: 'var(--color-text-muted)' }}>
            {item.item_type === 'product' ? 'Produkt' : item.item_type === 'blog' ? 'Blogindlæg' : 'Artikel'}
          </p>
        </div>
        <button
          aria-label="Fjern favorit"
          className="p-2.5 rounded-xl cursor-pointer active:opacity-70 transition-opacity"
          style={{ color: 'var(--color-text-muted)' }}
          onClick={() => deleteMutation.mutate(item.id)}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries(['myFavorites', user?.email]);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="min-h-screen pb-10" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="pt-8 pb-4 px-6 text-center relative flex items-center justify-center">
        <Link to={createPageUrl('Profile')} className="absolute left-4">
          <button className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer" style={{ background: 'var(--color-bg-card)' }}>
            <ChevronLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </Link>
        <h1 className="text-2xl" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
          Favoritter
        </h1>
      </div>

      <div className="px-4 mt-2">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--color-bg-card)' }}>
              <Heart className="w-7 h-7" style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>Ingen favoritter endnu</p>
            <p className="text-sm text-center max-w-xs" style={{ color: 'var(--color-text-muted)' }}>Gem produkter og artikler du kan lide ved at trykke på hjerte-ikonet</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full p-1 rounded-2xl mb-4" style={{ background: 'var(--color-bg-card)' }}>
              <TabsTrigger value="all" className="flex-1 rounded-xl text-xs">Alle ({favorites.length})</TabsTrigger>
              <TabsTrigger value="products" className="flex-1 rounded-xl text-xs">Produkter ({productFavorites.length})</TabsTrigger>
              <TabsTrigger value="blog" className="flex-1 rounded-xl text-xs">Blog ({blogFavorites.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2">
              {favorites.map(item => <FavoriteItem key={item.id} item={item} />)}
            </TabsContent>
            <TabsContent value="products" className="space-y-2">
              {productFavorites.length === 0
                ? <p className="text-center py-10 text-sm" style={{ color: 'var(--color-text-muted)' }}>Ingen produkter gemt</p>
                : productFavorites.map(item => <FavoriteItem key={item.id} item={item} />)
              }
            </TabsContent>
            <TabsContent value="blog" className="space-y-2">
              {blogFavorites.length === 0
                ? <p className="text-center py-10 text-sm" style={{ color: 'var(--color-text-muted)' }}>Ingen blogindlæg gemt</p>
                : blogFavorites.map(item => <FavoriteItem key={item.id} item={item} />)
              }
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
    </PullToRefresh>
  );
}