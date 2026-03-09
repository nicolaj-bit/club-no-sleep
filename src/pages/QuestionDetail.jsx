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

export default function QuestionDetail() {
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

  if (loadingQuestion) {
    return (
      <div className="min-h-screen bg-white p-4">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-slate-500">Spørgsmål ikke fundet</p>
      </div>
    );
  }

  const isAuthor = question.created_by === user?.email;
  const canAnswer = user && !isAuthor;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Knowledge')}>
            <Button variant="ghost" size="icon" className="-ml-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <span className="text-sm font-medium text-slate-500">Spørgsmål</span>
        </div>
      </header>

      {/* Question */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <UserAvatar 
            src={question.author_image}
            name={question.author_username}
            size="md"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900">{question.author_username}</span>
              <span className="text-xs text-slate-400">
                {format(new Date(question.created_date), 'd. MMM', { locale: da })}
              </span>
            </div>
            {question.category && (
              <span className="text-xs text-slate-500">{question.category}</span>
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            question.status === 'answered' 
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {question.status === 'answered' ? 'Besvaret' : 'Åben'}
          </span>
        </div>
        
        <h1 className="text-lg font-semibold text-slate-900 mt-4">{question.title}</h1>
        <p className="text-slate-600 mt-2 whitespace-pre-line">{question.content}</p>
      </div>

      {/* Answers */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">
            {answers.length} {answers.length === 1 ? 'svar' : 'svar'}
          </h2>
          
          {loadingAnswers ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : answers.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Ingen svar endnu</p>
            </div>
          ) : (
            <div className="space-y-4">
              {answers.map(answer => (
                <div 
                  key={answer.id}
                  className={`bg-slate-50 rounded-xl p-4 ${
                    answer.is_accepted ? 'ring-2 ring-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <UserAvatar 
                      src={answer.author_image}
                      name={answer.author_username}
                      size="sm"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{answer.author_username}</span>
                        {answer.author_role === 'expert' && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                            EKSPERT
                          </span>
                        )}
                        {answer.author_role === 'admin' && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                            ADMIN
                          </span>
                        )}
                        {answer.is_accepted && (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <p className="text-slate-600 mt-1 text-sm whitespace-pre-line">
                        {answer.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-400">
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
        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 safe-area-bottom">
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