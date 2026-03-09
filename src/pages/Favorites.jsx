import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Trash2, ShoppingBag, BookOpen, FileText, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const FavoriteItem = ({ item, icon: Icon, linkPrefix }) => (
    <div
      className="flex items-center gap-3 rounded-2xl p-3"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'var(--color-bg-subtle)' }}>
        {item.item_image ? (
          <img src={item.item_image} alt={item.item_title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Link to={createPageUrl(`${linkPrefix}?id=${item.item_id}`)}>
          <h3 className="text-sm font-medium line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>
            {item.item_title}
          </h3>
        </Link>
      </div>
      <button
        className="p-2 rounded-xl transition-colors"
        style={{ color: 'var(--color-text-muted)' }}
        onClick={() => deleteMutation.mutate(item.id)}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen pb-10" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="pt-6 pb-2 px-6 text-center relative">
        <Link to={createPageUrl('Profile')} className="absolute left-4 top-6">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-serif" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
          Favoritter
        </h1>
      </div>

      <div className="px-4 mt-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-5xl opacity-20">♡</span>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Ingen favoritter endnu</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Gem produkter og artikler du kan lide</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full p-1 rounded-2xl mb-4" style={{ background: 'var(--color-bg-card)' }}>
              <TabsTrigger value="all" className="flex-1 rounded-xl text-sm">Alle ({favorites.length})</TabsTrigger>
              <TabsTrigger value="products" className="flex-1 rounded-xl text-sm">Produkter ({productFavorites.length})</TabsTrigger>
              <TabsTrigger value="blog" className="flex-1 rounded-xl text-sm">Blog ({blogFavorites.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {favorites.map(item => (
                <FavoriteItem
                  key={item.id}
                  item={item}
                  icon={item.item_type === 'product' ? ShoppingBag : item.item_type === 'blog' ? BookOpen : FileText}
                  linkPrefix={item.item_type === 'product' ? 'ProductDetail' : item.item_type === 'blog' ? 'BlogPost' : 'ArticleDetail'}
                />
              ))}
            </TabsContent>

            <TabsContent value="products" className="space-y-3">
              {productFavorites.length === 0
                ? <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>Ingen produkter gemt</p>
                : productFavorites.map(item => <FavoriteItem key={item.id} item={item} icon={ShoppingBag} linkPrefix="ProductDetail" />)
              }
            </TabsContent>

            <TabsContent value="blog" className="space-y-3">
              {blogFavorites.length === 0
                ? <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>Ingen blogindlæg gemt</p>
                : blogFavorites.map(item => <FavoriteItem key={item.id} item={item} icon={BookOpen} linkPrefix="BlogPost" />)
              }
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}