import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Share2, Bookmark, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import UserAvatar from '@/components/community/UserAvatar';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useLanguage } from '@/components/ui/LanguageContext';
import { enUS } from 'date-fns/locale';

export default function BlogPost() {
  const { isDark } = useTheme();
  const { lang } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  const queryClient = useQueryClient();

  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState(null);
  const [translated, setTranslated] = useState(null);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(isAuth => {
      if (isAuth) base44.auth.me().then(setUser).catch(() => {});
    });
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
      item_id: postId,
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
      toast.success(isSaved
        ? (lang === 'en' ? 'Removed from favorites' : 'Fjernet fra favoritter')
        : (lang === 'en' ? 'Saved to favorites' : 'Gemt til favoritter'));
    },
  });

  // Auto-translate when language is English and post is loaded
  useEffect(() => {
    if (lang !== 'en' || !post) { setTranslated(null); return; }
    setTranslating(true);
    base44.integrations.Core.InvokeLLM({
      prompt: `Translate the following blog post title and content from Danish to English. Return JSON with keys "title" and "content" (keep markdown formatting in content).\n\nTitle: ${post.title}\n\nContent:\n${post.content}`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
        },
      },
    }).then((res) => {
      setTranslated(res);
    }).finally(() => setTranslating(false));
  }, [lang, post?.id]);

  const handleShare = async () => {
    try {
      await navigator.share({ title: post.title, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link kopieret');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Skeleton className="aspect-[16/9] w-full" />
        <div className="p-5 space-y-4">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Indlæg ikke fundet</p>
      </div>
    );
  }

  const formattedDate = post.published_date
    ? format(new Date(post.published_date), 'd. MMMM yyyy', { locale: da })
    : null;

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Hero */}
      <div className="relative">
        <div className="aspect-[16/9] w-full" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
          {post.featured_image ? (
            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16" style={{ color: 'var(--color-text-muted)' }} />
            </div>
          )}
          {/* Gradient overlay for top nav readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
        </div>

        {/* Floating nav */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pt-5">
          <Link to={createPageUrl('Blog')}>
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
              style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)' }}
            >
              <ChevronLeft className="w-5 h-5" style={{ color: isDark ? '#fff' : '#000' }} />
            </button>
          </Link>
          <div className="flex gap-2">
            {user && (
              <button
                className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
                style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)' }}
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                <Bookmark
                  className="w-4.5 h-4.5"
                  style={{ fill: isSaved ? 'currentColor' : 'none', color: isDark ? '#fff' : '#000' }}
                />
              </button>
            )}
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
              style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)' }}
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" style={{ color: isDark ? '#fff' : '#000' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Content card */}
      <div className="mx-4 -mt-5 relative z-10 rounded-2xl p-5 space-y-4"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        {/* Category */}
        {post.category && (
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }}
          >
            {post.category}
          </span>
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
          {translated?.title || post.title}
        </h1>

        {/* Author & Date */}
        <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <UserAvatar src={post.author_image} name={post.author_name} size="sm" />
          <div>
            {post.author_name && (
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{post.author_name}</p>
            )}
            {formattedDate && (
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formattedDate}</p>
            )}
          </div>
        </div>

        {/* Body */}
        <div
          className="prose prose-sm max-w-none leading-relaxed"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {translating && (
            <p className="text-xs mb-3 animate-pulse" style={{ color: 'var(--color-text-muted)' }}>Translating…</p>
          )}
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-xl font-bold mt-5 mb-2" style={{ color: 'var(--color-text-primary)' }}>{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-semibold mt-5 mb-2" style={{ color: 'var(--color-text-primary)' }}>{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-semibold mt-4 mb-1" style={{ color: 'var(--color-text-primary)' }}>{children}</h3>,
              p: ({ children }) => <p className="mb-3 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{children}</p>,
              ul: ({ children }) => <ul className="mb-3 ml-4 space-y-1 list-disc" style={{ color: 'var(--color-text-secondary)' }}>{children}</ul>,
              ol: ({ children }) => <ol className="mb-3 ml-4 space-y-1 list-decimal" style={{ color: 'var(--color-text-secondary)' }}>{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{children}</strong>,
              blockquote: ({ children }) => (
                <blockquote
                  className="border-l-4 pl-4 my-4 italic"
                  style={{ borderColor: 'var(--color-accent)', color: 'var(--color-text-muted)' }}
                >
                  {children}
                </blockquote>
              ),
            }}
          >
            {translated?.content || post.content}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            {post.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-xs rounded-full"
                style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
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