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
    queryFn: () => base44.entities.Question.filter(
      { created_by: user.email },
      '-created_date'
    ),
    enabled: !!user?.email,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Profile')}>
              <Button variant="ghost" size="icon" className="-ml-2">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-slate-900">Mine spørgsmål</h1>
          </div>
          <Link to={createPageUrl('AskQuestion')}>
            <Button size="sm" className="rounded-full gap-1">
              <Plus className="w-4 h-4" />
              Nyt
            </Button>
          </Link>
        </div>
      </header>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Du har ikke stillet nogen spørgsmål</p>
            <Link to={createPageUrl('AskQuestion')}>
              <Button className="mt-4">Stil et spørgsmål</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map(q => (
              <Link 
                key={q.id}
                to={createPageUrl(`QuestionDetail?id=${q.id}`)}
                className="block bg-white rounded-xl p-4 border border-slate-100"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-slate-900 line-clamp-2">{q.title}</h3>
                  <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${
                    q.status === 'answered' 
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {q.status === 'answered' ? 'Besvaret' : 'Åben'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{q.content}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-400">
                    {q.answer_count || 0} svar
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}