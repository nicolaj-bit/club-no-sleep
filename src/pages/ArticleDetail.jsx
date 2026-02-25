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

export default function ArticleDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', articleId],
    queryFn: async () => {
      const articles = await base44.entities.KnowledgeArticle.filter({ id: articleId });
      return articles[0];
    },
    enabled: !!articleId,
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
      <div className="min-h-screen bg-white p-4">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/4 mb-6" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-slate-500">Artikel ikke fundet</p>
      </div>
    );
  }

  const Icon = article.is_faq ? HelpCircle : FileText;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-3">
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
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            article.is_faq ? 'bg-blue-50' : 'bg-slate-100'
          }`}>
            <Icon className={`w-5 h-5 ${
              article.is_faq ? 'text-blue-500' : 'text-slate-500'
            }`} />
          </div>
          <span className="text-sm text-slate-500">{article.category}</span>
        </div>

        <h1 className="text-xl font-bold text-slate-900">{article.title}</h1>

        <div className="prose prose-slate prose-sm max-w-none">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>

        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
            {article.tags.map((tag, i) => (
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
    </div>
  );
}