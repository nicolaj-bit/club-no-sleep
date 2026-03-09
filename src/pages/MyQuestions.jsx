import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, ChevronRight, HelpCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyQuestions() {
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
          Mine spørgsmål
        </h1>
        <Link to={createPageUrl('AskQuestion')} className="absolute right-4 top-7">
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
          >
            <Plus className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </Link>
      </div>

      <div className="px-4 mt-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-5xl opacity-20" style={{ color: 'var(--color-text-muted)' }}>?</span>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Du har ikke stillet nogen spørgsmål</p>
            <Link to={createPageUrl('AskQuestion')}>
              <button
                className="mt-2 px-5 py-2.5 rounded-full text-sm font-medium"
                style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                Stil et spørgsmål
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map(q => (
              <Link
                key={q.id}
                to={createPageUrl(`QuestionDetail?id=${q.id}`)}
                className="block rounded-2xl p-4 active:scale-[0.98] transition-transform"
                style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>
                    {q.title}
                  </h3>
                  <span
                    className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: q.status === 'answered' ? '#d1fae5' : '#fef3c7',
                      color: q.status === 'answered' ? '#065f46' : '#92400e',
                    }}
                  >
                    {q.status === 'answered' ? 'Besvaret' : 'Åben'}
                  </span>
                </div>
                <p className="text-xs mt-1.5 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{q.content}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{q.answer_count || 0} svar</span>
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}