import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PullToRefresh from '@/components/ui/PullToRefresh';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, ChevronRight, MessageCircle, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyQuestions() {
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

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['myQuestions', user?.email],
    queryFn: () => base44.entities.Question.filter({ created_by: user.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const statusLabel = { open: 'Åben', answered: 'Besvaret', closed: 'Lukket' };
  const statusStyle = {
    answered: { background: '#d1fae5', color: '#065f46' },
    open: { background: '#fef3c7', color: '#92400e' },
    closed: { background: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' },
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries(['myQuestions', user?.email]);
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
          Mine spørgsmål
        </h1>
        <Link to={createPageUrl('AskQuestion')} className="absolute right-4">
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'var(--color-bg-card)' }}
            aria-label="Stil et nyt spørgsmål"
          >
            <Plus className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </Link>
      </div>

      <div className="px-4 mt-2">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--color-bg-card)' }}>
              <MessageCircle className="w-7 h-7" style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>Ingen spørgsmål endnu</p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Stil dit første spørgsmål til fællesskabet</p>
            <Link to={createPageUrl('AskQuestion')}>
              <button
                className="mt-1 px-6 py-2.5 rounded-full text-sm font-medium cursor-pointer"
                style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
              >
                Stil et spørgsmål
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {questions.map(q => (
              <Link
                key={q.id}
                to={createPageUrl(`QuestionDetail?id=${q.id}`)}
                className="flex items-start gap-4 rounded-2xl p-4 cursor-pointer active:opacity-70 transition-opacity"
                style={{ background: 'var(--color-bg-card)' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-sm font-medium line-clamp-2 flex-1" style={{ color: 'var(--color-text-primary)' }}>
                      {q.title}
                    </h3>
                    <span
                      className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium"
                      style={statusStyle[q.status] || statusStyle.open}
                    >
                      {statusLabel[q.status] || 'Åben'}
                    </span>
                  </div>
                  <p className="text-xs line-clamp-1 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{q.content}</p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {q.answer_count || 0} {q.answer_count === 1 ? 'svar' : 'svar'}
                    </span>
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
    </PullToRefresh>
  );
}