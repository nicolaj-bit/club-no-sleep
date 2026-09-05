import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Send, MoreVertical, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ReportSheet from '@/components/community/ReportSheet';
import { format, isToday, isYesterday } from 'date-fns';
import { da } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/components/ui/LanguageContext';

// Rundt profilbillede i en fast pixelstørrelse — bruger appens farvevariabler.
function RoundAvatar({ src, name, size }) {
  const { t } = useLanguage();
  const initial = (name || '?')[0]?.toUpperCase() || '?';
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        overflow: 'hidden',
        flexShrink: 0,
        backgroundColor: 'var(--color-accent-warm)',
        color: 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: size * 0.4,
      }}
    >
      {src ? (
        <img src={src} alt={name || t.altUser} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initial
      )}
    </div>
  );
}

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

  const hasText = !!message.trim();

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
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Toppen — fast */}
      <header
        className="flex-shrink-0 flex items-center px-3 py-2 border-b" style={{ gap: 11 }}
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <Link to={createPageUrl('ChatList')}>
          <button className="p-1.5 rounded-full active:opacity-60" style={{ color: 'var(--color-text-secondary)' }}>
            <ChevronLeft className="w-6 h-6" />
          </button>
        </Link>
        <RoundAvatar src={otherImage} name={otherName} size={36} />
        <div className="flex-1 min-w-0" style={{ marginLeft: 11 }}>
          <div className="truncate" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14.5px', color: 'var(--color-text-primary)' }}>
            {otherName}
          </div>
          {isOtherOnline && (
            <div className="flex items-center gap-1.5" style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              <span className="bg-emerald-500 rounded-full" style={{ width: 7, height: 7 }} />
              {t.chatAwakeNow}
            </div>
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
          <div className="flex flex-col items-center justify-center text-center" style={{ height: '100%', gap: 10 }}>
            <RoundAvatar src={otherImage} name={otherName} size={76} />
            <p style={{ fontWeight: 600, fontSize: '16px', color: 'var(--color-text-primary)' }}>{otherName}</p>
            <p style={{ fontSize: '12.5px', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>{t.chatEmptyLine1}</p>
            <p style={{ fontSize: '12.5px', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>{t.chatEmptyLine2}</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isOwn = msg.sender_email === user?.email;
            const prevMsg = messages[i - 1];
            const nextMsg = messages[i + 1];
            const isFirstInGroup = !prevMsg || prevMsg.sender_email !== msg.sender_email;
            const isLastInGroup = !nextMsg || nextMsg.sender_email !== msg.sender_email;
            const showSeparator = !prevMsg || (new Date(msg.created_date).getTime() - new Date(prevMsg.created_date).getTime()) > 20 * 60 * 1000;
            const marginTop = isFirstInGroup ? (prevMsg ? 12 : 0) : 2;

            const borderRadius = isOwn
              ? (isLastInGroup ? '18px 18px 4px 18px' : '18px')
              : (isLastInGroup ? '18px 18px 18px 4px' : '18px');

            return (
              <div key={msg.id}>
                {showSeparator && (
                  <div className="flex items-center justify-center" style={{ marginTop: 14, marginBottom: 14 }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--color-text-muted)' }}>
                      {formatSeparator(msg.created_date)}
                    </span>
                  </div>
                )}
                <div className={`flex items-end ${isOwn ? 'justify-end' : 'justify-start'}`} style={{ marginTop }}>
                  {!isOwn && (
                    <div style={{ width: 24, flexShrink: 0 }}>
                      {isLastInGroup && <RoundAvatar src={msg.sender_image} name={msg.sender_username} size={24} />}
                    </div>
                  )}
                  <div style={{ maxWidth: '74%' }}>
                    <div
                      className="whitespace-pre-wrap break-words"
                      style={{
                        backgroundColor: isOwn ? 'var(--color-primary)' : 'var(--color-bg-subtle)',
                        color: isOwn ? 'var(--color-bg)' : 'var(--color-text-primary)',
                        borderRadius,
                        padding: '9px 13px',
                        fontSize: '13.5px',
                        lineHeight: 1.45,
                      }}
                    >
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

      {/* Skrivefelt — fast i bunden */}
      <div
        className="flex-shrink-0 flex items-end px-3 py-2"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
          gap: 9,
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
          className="flex-1 resize-none outline-none"
          style={{
            backgroundColor: 'var(--color-bg-subtle)',
            color: 'var(--color-text-primary)',
            borderRadius: 999,
            padding: '11px 16px',
            fontSize: '16px',
            lineHeight: '1.4',
            maxHeight: 96,
          }}
        />
        <button
          onClick={handleSend}
          disabled={!hasText || sendMutation.isPending}
          className="flex-shrink-0 flex items-center justify-center transition-colors"
          style={{
            width: 38,
            height: 38,
            borderRadius: 999,
            backgroundColor: hasText ? 'var(--color-primary)' : 'var(--color-bg-subtle)',
            color: hasText ? 'var(--color-bg)' : 'var(--color-text-muted)',
          }}
        >
          <Send className="w-[17px] h-[17px]" />
        </button>
      </div>
    </div>
  );
}