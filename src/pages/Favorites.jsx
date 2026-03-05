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
    onSuccess: () => {
      toast.success('Fjernet fra favoritter');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['myFavorites', user?.email]);
    },
  });

  const productFavorites = favorites.filter(f => f.item_type === 'product');
  const blogFavorites = favorites.filter(f => f.item_type === 'blog');
  const articleFavorites = favorites.filter(f => f.item_type === 'article');

  const FavoriteItem = ({ item, icon: Icon, linkPrefix }) => (
    <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100">
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
        {item.item_image ? (
          <img 
            src={item.item_image} 
            alt={item.item_title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-6 h-6 text-slate-300" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Link to={createPageUrl(`${linkPrefix}?id=${item.item_id}`)}>
          <h3 className="font-medium text-slate-900 line-clamp-2 hover:text-slate-600">
            {item.item_title}
          </h3>
        </Link>
      </div>
      <Button 
        variant="ghost" 
        size="icon"
        className="text-slate-400 hover:text-rose-500"
        onClick={() => deleteMutation.mutate(item.id)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Profile')}>
            <Button variant="ghost" size="icon" className="-ml-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-slate-900">Mine favoritter</h1>
        </div>
      </header>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Ingen favoritter endnu</p>
            <p className="text-sm text-slate-400 mt-1">Gem produkter og artikler du kan lide</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="all" className="flex-1 rounded-lg">
                Alle ({favorites.length})
              </TabsTrigger>
              <TabsTrigger value="products" className="flex-1 rounded-lg">
                Produkter ({productFavorites.length})
              </TabsTrigger>
              <TabsTrigger value="blog" className="flex-1 rounded-lg">
                Blog ({blogFavorites.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4 space-y-3">
              {favorites.map(item => (
                <FavoriteItem 
                  key={item.id} 
                  item={item} 
                  icon={item.item_type === 'product' ? ShoppingBag : item.item_type === 'blog' ? BookOpen : FileText}
                  linkPrefix={item.item_type === 'product' ? 'ProductDetail' : item.item_type === 'blog' ? 'BlogPost' : 'ArticleDetail'}
                />
              ))}
            </TabsContent>

            <TabsContent value="products" className="mt-4 space-y-3">
              {productFavorites.length === 0 ? (
                <p className="text-center text-slate-400 py-8">Ingen produkter gemt</p>
              ) : (
                productFavorites.map(item => (
                  <FavoriteItem key={item.id} item={item} icon={ShoppingBag} linkPrefix="ProductDetail" />
                ))
              )}
            </TabsContent>

            <TabsContent value="blog" className="mt-4 space-y-3">
              {blogFavorites.length === 0 ? (
                <p className="text-center text-slate-400 py-8">Ingen blogindlæg gemt</p>
              ) : (
                blogFavorites.map(item => (
                  <FavoriteItem key={item.id} item={item} icon={BookOpen} linkPrefix="BlogPost" />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}