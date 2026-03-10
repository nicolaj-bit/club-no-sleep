import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Share2, FileText, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '@/components/ui/ThemeProvider';

export default function ArticleDetail() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');
  const articleSlug = urlParams.get('slug');

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', articleId, articleSlug],
    queryFn: async () => {
      if (articleId) {
        const articles = await base44.entities.KnowledgeArticle.filter({ id: articleId });
        return articles[0];
      }
      if (articleSlug) {
        const articles = await base44.entities.KnowledgeArticle.list();
        return articles.find(a => a.tags?.includes(articleSlug));
      }
    },
    enabled: !!(articleId || articleSlug),
  });

  const handleShare = async () => {
    try {
      await navigator.share({
        title: article.title,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link kopieret');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/4 mb-6" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Artikel ikke fundet</p>
      </div>
    );
  }

  const Icon = article.is_faq ? HelpCircle : FileText;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b px-4 py-3" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <Link to={createPageUrl('Knowledge')}>
            <Button variant="ghost" size="icon" className="-ml-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: article.is_faq ? (isDark ? '#1e3a5f' : '#eff6ff') : 'var(--color-bg-subtle)' }}>
            <Icon className="w-5 h-5" style={{ color: article.is_faq ? (isDark ? '#60a5fa' : '#3b82f6') : 'var(--color-text-muted)' }} />
          </div>
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{article.category}</span>
        </div>

        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{article.title}</h1>

        <div className="prose prose-sm max-w-none" style={{ color: 'var(--color-text-primary)' }}>
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>

        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            {article.tags.map((tag, i) => (
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
    </div>
  );
}