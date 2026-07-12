import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PullToRefresh from '@/components/ui/PullToRefresh';
import { useLanguage } from '@/components/ui/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Trash2, ShoppingBag, BookOpen, FileText, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import PageHeader from '@/components/ui/PageHeader';

export default function Favorites() {
  const { t } = useLanguage();
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
      toast.error(t.favoritesError);
    },
    onSuccess: () => toast.success(t.favoritesRemoved),
    onSettled: () => queryClient.invalidateQueries(['myFavorites', user?.email]),
  });

  const blogFavorites = favorites.filter(f => f.item_type === 'blog');
  const nonProductFavorites = favorites.filter(f => f.item_type !== 'product');

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
            {item.item_type === 'product' ? t.favoritesProduct : item.item_type === 'blog' ? t.favoritesBlog : t.favoritesArticle}
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
      <PageHeader title={t.favoritesTitle} backUrl={createPageUrl('Profile')} />

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
            <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.favoritesEmpty}</p>
            <p className="text-sm text-center max-w-xs" style={{ color: 'var(--color-text-muted)' }}>{t.favoritesEmptyDesc}</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full p-1 rounded-2xl mb-4" style={{ background: 'var(--color-bg-card)' }}>
              <TabsTrigger value="all" className="flex-1 rounded-xl text-xs">{t.favoritesAll?.replace('{count}', nonProductFavorites.length)}</TabsTrigger>
              <TabsTrigger value="blog" className="flex-1 rounded-xl text-xs">{t.favoritesBlog?.replace('{count}', blogFavorites.length)}</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2">
              {nonProductFavorites.map(item => <FavoriteItem key={item.id} item={item} />)}
            </TabsContent>
            <TabsContent value="blog" className="space-y-2">
              {blogFavorites.length === 0
                ? <p className="text-center py-10 text-sm" style={{ color: 'var(--color-text-muted)' }}>{t.favoritesNoBlog}</p>
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