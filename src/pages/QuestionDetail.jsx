import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import UserAvatar from '@/components/community/UserAvatar';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useTranslation } from '@/components/hooks/useTranslation';

export default function QuestionDetail() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { lang } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const questionId = urlParams.get('id');
  const queryClient = useQueryClient();
  
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [answerText, setAnswerText] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
        if (profiles.length > 0) setUserProfile(profiles[0]);
      } catch {}
    };
    loadUser();
  }, []);

  const { data: question, isLoading: loadingQuestion } = useQuery({
    queryKey: ['question', questionId],
    queryFn: async () => {
      const questions = await base44.entities.Question.filter({ id: questionId });
      return questions[0];
    },
    enabled: !!questionId,
  });

  const { data: answers = [], isLoading: loadingAnswers } = useQuery({
    queryKey: ['answers', questionId],
    queryFn: () => base44.entities.Answer.filter(
      { question_id: questionId },
      'created_date'
    ),
    enabled: !!questionId,
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Answer.create({
        question_id: questionId,
        content: answerText,
        author_username: userProfile?.username || user?.full_name || user?.email?.split('@')[0],
        author_image: userProfile?.profile_image,
        author_role: userProfile?.role || 'user',
      });
      
      // Update question answer count
      await base44.entities.Question.update(questionId, {
        answer_count: (question?.answer_count || 0) + 1,
        status: 'answered',
      });
    },
    onSuccess: () => {
      setAnswerText('');
      queryClient.invalidateQueries(['answers', questionId]);
      queryClient.invalidateQueries(['question', questionId]);
      toast.success('Svar sendt');
    },
  });

  const acceptAnswerMutation = useMutation({
    mutationFn: async (answerId) => {
      await base44.entities.Answer.update(answerId, { is_accepted: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['answers', questionId]);
      toast.success('Svar accepteret');
    },
  });

  // Translate question and answers when language = English
  useEffect(() => {
    if (!question || lang !== 'en') {
      setTranslatedQuestion(null);
      setTranslatedAnswers({});
      return;
    }

    const itemsToTranslate = [
      { id: 'q', title: question.title, content: question.content }
    ];
    answers.forEach((a, i) => {
      itemsToTranslate.push({ id: 'a' + i, content: a.content });
    });

    base44.integrations.Core.InvokeLLM({
      prompt: `Translate these Danish Q&A texts to English. Return ONLY valid JSON.
${JSON.stringify(itemsToTranslate)}

Return format:
{"q": {"title": "...", "content": "..."}, "answers": [{"id": "a0", "content": "..."}, ...]}`,
      response_json_schema: {
        type: 'object',
        properties: { 
          q: { type: 'object' },
          answers: { type: 'array', items: { type: 'object' } }
        }
      }
    }).then(result => {
      setTranslatedQuestion(result.q);
      const answerMap = {};
      (result.answers || []).forEach((a) => {
        answerMap[a.id] = a;
      });
      setTranslatedAnswers(answerMap);
    });
  }, [question, answers, lang]);

  if (loadingQuestion) {
    return (
      <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Spørgsmål ikke fundet</p>
      </div>
    );
  }

  const isAuthor = question.created_by === user?.email;
  const canAnswer = user && !isAuthor;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b px-4 py-3" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Knowledge')}>
            <Button variant="ghost" size="icon" className="-ml-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Spørgsmål</span>
        </div>
      </header>

      {/* Question */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-start gap-3">
          <UserAvatar 
            src={question.author_image}
            name={question.author_username}
            size="md"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{question.author_username}</span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {format(new Date(question.created_date), 'd. MMM', { locale: da })}
              </span>
            </div>
            {question.category && (
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{question.category}</span>
            )}
          </div>
          <span className="text-xs px-2 py-1 rounded-full" style={{
            backgroundColor: question.status === 'answered' ? (isDark ? '#052e16' : '#d1fae5') : (isDark ? '#451a03' : '#fef3c7'),
            color: question.status === 'answered' ? (isDark ? '#4ade80' : '#065f46') : (isDark ? '#fbbf24' : '#92400e'),
          }}>
            {question.status === 'answered' ? (lang === 'en' ? 'Answered' : 'Besvaret') : (lang === 'en' ? 'Open' : 'Åben')}
          </span>
          </div>

          <h1 className="text-lg font-semibold mt-4" style={{ color: 'var(--color-text-primary)' }}>{translatedQuestion?.title || question.title}</h1>
          <p className="mt-2 whitespace-pre-line" style={{ color: 'var(--color-text-secondary)' }}>{translatedQuestion?.content || question.content}</p>
      </div>

      {/* Answers */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
             {answers.length} {answers.length === 1 ? (lang === 'en' ? 'answer' : 'svar') : (lang === 'en' ? 'answers' : 'svar')}
           </h2>
          
          {loadingAnswers ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : answers.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p style={{ color: 'var(--color-text-muted)' }}>Ingen svar endnu</p>
            </div>
          ) : (
            <div className="space-y-4">
              {answers.map(answer => (
                <div 
                  key={answer.id}
                  className={`rounded-xl p-4 ${answer.is_accepted ? 'ring-2 ring-emerald-500' : ''}`}
                  style={{ backgroundColor: 'var(--color-bg-subtle)' }}
                >
                  <div className="flex items-start gap-3">
                    <UserAvatar 
                      src={answer.author_image}
                      name={answer.author_username}
                      size="sm"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{answer.author_username}</span>
                        {answer.author_role === 'expert' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: isDark ? '#451a03' : '#fef3c7', color: isDark ? '#fbbf24' : '#92400e' }}>
                            EKSPERT
                          </span>
                        )}
                        {answer.author_role === 'admin' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', color: isDark ? '#60a5fa' : '#1d4ed8' }}>
                            ADMIN
                          </span>
                        )}
                        {answer.is_accepted && (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <p className="mt-1 text-sm whitespace-pre-line" style={{ color: 'var(--color-text-secondary)' }}>
                        {answer.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {format(new Date(answer.created_date), 'd. MMM HH:mm', { locale: da })}
                        </span>
                        {isAuthor && !answer.is_accepted && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-emerald-600 hover:text-emerald-700"
                            onClick={() => acceptAnswerMutation.mutate(answer.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accepter svar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Answer Input */}
      {canAnswer && (
        <div className="sticky bottom-0 border-t p-4 safe-area-bottom" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex gap-2">
            <Textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Skriv dit svar..."
              className="flex-1 min-h-[60px] resize-none"
              rows={2}
            />
            <Button 
              size="icon"
              className="h-auto rounded-xl"
              onClick={() => submitAnswerMutation.mutate()}
              disabled={!answerText.trim() || submitAnswerMutation.isPending}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}