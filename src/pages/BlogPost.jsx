import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Heart, Share2, Bookmark, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import UserAvatar from '@/components/community/UserAvatar';
import { useTheme } from '@/components/ui/ThemeProvider';

export default function BlogPost() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  const queryClient = useQueryClient();
  
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch {}
    };
    loadUser();
  }, []);

  const { data: post, isLoading } = useQuery({
    queryKey: ['blogPost', postId],
    queryFn: async () => {
      const posts = await base44.entities.BlogPost.filter({ id: postId });
      return posts[0];
    },
    enabled: !!postId,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ 
      user_email: user.email, 
      item_type: 'blog',
      item_id: postId 
    }),
    enabled: !!user?.email && !!postId,
  });

  useEffect(() => {
    setIsSaved(favorites.length > 0);
  }, [favorites]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        const fav = favorites[0];
        if (fav) await base44.entities.Favorite.delete(fav.id);
      } else {
        await base44.entities.Favorite.create({
          user_email: user.email,
          item_type: 'blog',
          item_id: postId,
          item_title: post.title,
          item_image: post.featured_image,
        });
      }
    },
    onSuccess: () => {
      setIsSaved(!isSaved);
      queryClient.invalidateQueries(['favorites']);
      toast.success(isSaved ? 'Fjernet fra favoritter' : 'Gemt til favoritter');
    },
  });

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post.title,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link kopieret');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Skeleton className="aspect-video w-full" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-slate-500">Indlæg ikke fundet</p>
      </div>
    );
  }

  const formattedDate = post.published_date 
    ? format(new Date(post.published_date), 'd. MMMM yyyy', { locale: da })
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="relative">
        {post.featured_image ? (
          <div className="aspect-video bg-slate-100">
            <img 
              src={post.featured_image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video bg-slate-100 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-slate-300" />
          </div>
        )}
        
        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Link to={createPageUrl('Blog')}>
            <Button size="icon" variant="secondary" className="rounded-full bg-white/90 backdrop-blur">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex gap-2">
            {user && (
              <Button 
                size="icon" 
                variant="secondary" 
                className="rounded-full bg-white/90 backdrop-blur"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-slate-900' : ''}`} />
              </Button>
            )}
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
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Category */}
        {post.category && (
          <span className="inline-block bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">
            {post.category}
          </span>
        )}
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">
          {post.title}
        </h1>
        
        {/* Author & Date */}
        <div className="flex items-center gap-3 py-2">
          <UserAvatar 
            src={post.author_image} 
            name={post.author_name}
            size="sm"
          />
          <div>
            {post.author_name && (
              <p className="text-sm font-medium text-slate-900">{post.author_name}</p>
            )}
            {formattedDate && (
              <p className="text-xs text-slate-500">{formattedDate}</p>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="prose prose-slate prose-sm max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
        
        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
            {post.tags.map((tag, i) => (
              <span 
                key={i}
                className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}