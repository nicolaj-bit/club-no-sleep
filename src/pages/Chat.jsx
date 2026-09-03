import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Send, MoreVertical, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import UserAvatar from '@/components/community/UserAvatar';
import ReportSheet from '@/components/community/ReportSheet';
import { format, isToday, isYesterday } from 'date-fns';
import { da } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/components/ui/LanguageContext';

export default function Chat() {
  const { t, lang } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const conversationId = urlParams.get('id');
  const queryClient = useQueryClient();

  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [reportTarget, setReportTarget] = useState(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const hasScrolledRef = useRef(false);

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

  const { data: conversation, isLoading: loadingConv } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const convs = await base44.entities.ChatConversation.filter({ id: conversationId });
      const conv = convs[0];
      if (conv && user && !conv.participants?.includes(user.email)) return null;
      return conv;
    },
    enabled: !!conversationId && !!user,
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => base44.entities.ChatMessage.filter(
      { conversation_id: conversationId },
      'created_date'
    ),
    enabled: !!conversationId,
    refetchInterval: 3000,
  });

  const otherEmail = conversation?.participants?.find(p => p !== user?.email);

  const { data: otherProfile } = useQuery({
    queryKey: ['otherProfile', otherEmail],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: otherEmail });
      return profiles?.[0] || null;
    },
    enabled: !!otherEmail,
    refetchInterval: 30000,
  });

  const isOtherOnline = otherProfile?.is_online === true;

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data?.conversation_id === conversationId) {
        queryClient.invalidateQueries(['messages', conversationId]);
      }
    });
    return unsubscribe;
  }, [conversationId, queryClient]);

  useEffect(() => {
    hasScrolledRef.current = false;
  }, [conversationId]);

  useEffect(() => {
    if (!scrollRef.current || messages.length === 0) return;
    if (!hasScrolledRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      hasScrolledRef.current = true;
    } else {
      const isNearBottom = scrollRef.current.scrollHeight - scrollRef.current.scrollTop - scrollRef.current.clientHeight < 120;
      if (isNearBottom) {
        scrollRef.current.scrollTo({ behavior: 'smooth', top: scrollRef.current.scrollHeight });
      }
    }
  }, [messages]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 96) + 'px';
  }, [message]);

  const sendMutation = useMutation({
    mutationFn: async (content) => {
      await base44.entities.ChatMessage.create({
        conversation_id: conversationId,
        sender_email: user.email,
        sender_username: userProfile?.username || user.full_name,
        sender_image: userProfile?.profile_image,
        content,
      });
      await base44.entities.ChatConversation.update(conversationId, {
        last_message: content,
        last_message_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries(['messages', conversationId]);
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate(message);
  };

  const otherIndex = conversation?.participants?.findIndex(p => p !== user?.email) || 0;
  const otherName = conversation?.participant_usernames?.[otherIndex] || 'Chat';
  const otherImage = conversation?.participant_images?.[otherIndex];

  const formatSeparator = (dateStr) => {
    const date = new Date(dateStr);
    const time = format(date, 'HH.mm');
    if (isToday(date)) return `${t.today} ${time}`;
    if (isYesterday(date)) return `${t.yesterdayPrefix} ${time}`;
    return format(date, 'd. MMM HH.mm', { locale: lang === 'da' ? da : undefined });
  };

  if (loadingConv) {
    return (
      <div className="flex items-center justify-center" style={{ height: '100dvh', backgroundColor: 'var(--color-bg)' }}>
        <Skeleton className="w-20 h-20 rounded-full" />
      </div>
    );
  }

  if (!loadingConv && conversation === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-4" style={{ height: '100dvh', backgroundColor: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>{t.noAccessToConversation}</p>
        <Link to={createPageUrl('ChatList')}>
          <Button variant="outline">{t.back}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh', backgroundColor: 'var(--color-bg)' }}>
      {/* Header — fast toppen */}
      <header
        className="flex-shrink-0 border-b px-3 py-2 flex items-center gap-2.5"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
          paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)',
        }}
      >
        <Link to={createPageUrl('ChatList')}>
          <button className="p-1.5 rounded-full active:opacity-60" style={{ color: 'var(--color-text-secondary)' }}>
            <ChevronLeft className="w-6 h-6" />
          </button>
        </Link>
        <UserAvatar src={otherImage} name={otherName} size="sm" />
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-[15px] truncate" style={{ color: 'var(--color-text-primary)' }}>{otherName}</h1>
          {isOtherOnline && (
            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{t.chatActiveNow}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-full active:opacity-60" style={{ color: 'var(--color-text-secondary)' }}>
              <MoreVertical className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-red-500 gap-2"
              onClick={() => setReportTarget({ email: conversation?.participants?.find(p => p !== user?.email) })}
            >
              <Flag className="w-4 h-4" />
              {t.reportLabel}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Beskedområde — eneste område der scroller */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3">
        {loadingMessages ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <Skeleton className="h-12 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ height: '100%' }}>
            {otherImage ? (
              <img src={otherImage} alt="" className="w-20 h-20 rounded-full object-cover mb-4" />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl mb-4"
                style={{ background: 'var(--color-accent-warm)', color: 'var(--color-primary)' }}>
                {(otherName || '?')[0].toUpperCase()}
              </div>
            )}
            <p className="font-semibold text-lg mb-1" style={{ color: 'var(--color-text-primary)' }}>{otherName}</p>
            <p className="text-sm text-center px-8" style={{ color: 'var(--color-text-muted)' }}>{t.chatEmptyStateDesc}</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isOwn = msg.sender_email === user?.email;
            const prevMsg = messages[i - 1];
            const nextMsg = messages[i + 1];
            const isFirstInGroup = !prevMsg || prevMsg.sender_email !== msg.sender_email;
            const isLastInGroup = !nextMsg || nextMsg.sender_email !== msg.sender_email;
            const showTimestamp = !prevMsg || (new Date(msg.created_date).getTime() - new Date(prevMsg.created_date).getTime()) > 20 * 60 * 1000;
            const showAvatar = !isOwn && isLastInGroup;
            const gap = isFirstInGroup ? (prevMsg ? '12px' : '0') : '2px';

            const bubbleRadius = isOwn
              ? (isLastInGroup ? '18px 18px 4px 18px' : '18px')
              : (isLastInGroup ? '18px 18px 18px 4px' : '18px');

            return (
              <div key={msg.id}>
                {showTimestamp && (
                  <div className="flex items-center justify-center" style={{ marginTop: 12, marginBottom: 12 }}>
                    <span className="text-[11px] px-3 py-1 rounded-full" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-subtle)' }}>
                      {formatSeparator(msg.created_date)}
                    </span>
                  </div>
                )}
                <div className={`flex items-end gap-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`} style={{ marginTop: gap }}>
                  {!isOwn && (
                    <div className="w-7 flex-shrink-0">
                      {showAvatar && <UserAvatar src={msg.sender_image} name={msg.sender_username} size="sm" />}
                    </div>
                  )}
                  <div className={`max-w-[75%] ${isOwn ? 'order-1' : ''}`}>
                    <div className="px-3.5 py-2 text-[14px] whitespace-pre-wrap break-words" style={{
                      backgroundColor: isOwn ? 'var(--color-primary)' : 'var(--color-bg-subtle)',
                      color: isOwn ? 'var(--color-bg)' : 'var(--color-text-primary)',
                      borderRadius: bubbleRadius,
                    }}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ReportSheet
        open={!!reportTarget}
        onClose={() => setReportTarget(null)}
        reportedEmail={reportTarget?.email || ''}
        messageId={reportTarget?.messageId}
      />

      {/* Skrivefelt — fast i bunden, følger tastatur og hjemmeindikator */}
      <div
        className="flex-shrink-0 border-t px-3 py-2 flex items-end gap-2"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
        }}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={t.writeMessagePlaceholder}
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1 resize-none rounded-2xl px-4 py-2.5 text-[15px] outline-none"
          style={{
            backgroundColor: 'var(--color-bg-subtle)',
            color: 'var(--color-text-primary)',
            maxHeight: 96,
            lineHeight: '1.4',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || sendMutation.isPending}
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-opacity"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-bg)',
            opacity: message.trim() ? 1 : 0.4,
          }}
        >
          <Send className="w-[18px] h-[18px]" />
        </button>
      </div>
    </div>
  );
}