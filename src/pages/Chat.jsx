import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, MoreVertical, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ReportSheet from '@/components/community/ReportSheet';
import UserAvatar from '@/components/community/UserAvatar';
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
  const [message, setMessage] = useState('');
  const [reportTarget, setReportTarget] = useState(null);
  const [sendError, setSendError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const scrollRef = useRef(null);
  const hasScrolledRef = useRef(false);
  const sinceRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch {}
    };
    loadUser();
  }, []);

  const { data: convData, isLoading: loadingConv, isError: convError } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const res = await base44.functions.invoke('chatApi', {
        action: 'get_conversation',
        conversation_id: conversationId,
      });
      return res.data;
    },
    enabled: !!conversationId && !!user,
    retry: false,
  });

  const conversation = convData?.conversation || null;
  const otherIsOnline = convData?.other_is_online === true;

  // Hent beskeder (alle, eller kun nye siden et tidsstempel).
  const fetchMessages = useCallback(async (since) => {
    const res = await base44.functions.invoke('chatApi', {
      action: 'list_messages',
      conversation_id: conversationId,
      since: since || undefined,
    });
    return res.data?.messages || [];
  }, [conversationId]);

  // Indlæs hele tråden ved åbning / conversation-skift.
  useEffect(() => {
    if (!conversationId || !user || !conversation) return;
    let cancelled = false;
    setLoadingMessages(true);
    setMessages([]);
    sinceRef.current = null;
    hasScrolledRef.current = false;
    (async () => {
      try {
        const initial = await fetchMessages(null);
        if (cancelled) return;
        setMessages(initial);
        if (initial.length > 0) sinceRef.current = initial[initial.length - 1].created_date;
      } catch {}
      if (!cancelled) setLoadingMessages(false);
    })();
    return () => { cancelled = true; };
  }, [conversationId, user, conversation, fetchMessages]);

  // Afstemning hvert 3. sekund — kun nye beskeder.
  useEffect(() => {
    if (!conversationId || !user || !conversation) return;
    const poll = setInterval(async () => {
      try {
        const newer = await fetchMessages(sinceRef.current);
        if (newer.length === 0) return;
        setMessages((prev) => {
          const map = new Map(prev.map((m) => [m.id, m]));
          newer.forEach((m) => map.set(m.id, m));
          return Array.from(map.values()).sort((a, b) => (a.created_date < b.created_date ? -1 : 1));
        });
        sinceRef.current = newer[newer.length - 1].created_date;
      } catch {}
    }, 3000);
    return () => clearInterval(poll);
  }, [conversationId, user, conversation, fetchMessages]);

  // Marker som læst ved åbning.
  useEffect(() => {
    if (!conversationId || !user || !conversation) return;
    base44.functions.invoke('chatApi', { action: 'mark_read', conversation_id: conversationId })
      .then(() => queryClient.invalidateQueries(['chatUnread', user.email]))
      .catch(() => {});
  }, [conversationId, user, conversation, queryClient]);

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

  const sendMutation = useMutation({
    mutationFn: async (content) => {
      const res = await base44.functions.invoke('chatApi', {
        action: 'send_message',
        conversation_id: conversationId,
        content,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setMessage('');
      setSendError(null);
      if (data?.message) {
        setMessages((prev) => {
          const map = new Map(prev.map((m) => [m.id, m]));
          map.set(data.message.id, data.message);
          return Array.from(map.values()).sort((a, b) => (a.created_date < b.created_date ? -1 : 1));
        });
        sinceRef.current = data.message.created_date;
      }
      queryClient.invalidateQueries(['chatUnread', user.email]);
    },
    onError: (err) => {
      const code = err?.response?.data?.error;
      if (code === 'blocked') setSendError(t.chatBlocked);
      else setSendError(code || t.chatSendError);
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

  if (!loadingConv && (convError || !conversation)) {
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
        className="flex-shrink-0 flex items-center px-3 py-2 border-b"
        style={{
          gap: 11,
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", fontWeight: 600, fontSize: '14.5px', color: 'var(--color-text-primary)', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {otherName}
          </div>
          {otherIsOnline && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 1 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#5FAE7E' }} />
              Vågen nu
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
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '0 40px', textAlign: 'center' }}>
            <div style={{ width: 76, height: 76 }}>
              <UserAvatar src={otherImage} name={otherName} size={76} />
            </div>
            <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", fontWeight: 600, fontSize: '16px', color: 'var(--color-text-primary)' }}>
              {otherName}
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
              {t.chatEmptyLine1}<br />{t.chatEmptyLine2}
            </p>
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

      {sendError && (
        <div style={{ padding: '6px 12px 0', fontSize: '12px', textAlign: 'center', color: '#c0392b' }}>
          {sendError}
        </div>
      )}

      {/* Skrivefelt — fast i bunden */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 9, padding: '10px 12px', paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))', backgroundColor: 'var(--color-bg-card)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ flex: 1, backgroundColor: 'var(--color-bg-subtle)', borderRadius: 999, padding: '2px 16px', display: 'flex', alignItems: 'center' }}>
          <textarea
            rows={1}
            value={message}
            placeholder={t.chatInputPlaceholder}
            onChange={(e) => {
              setMessage(e.target.value.slice(0, 1000));
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
            }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: '16px', lineHeight: 1.4, padding: '9px 0', maxHeight: 96, color: 'var(--color-text-primary)', fontFamily: 'inherit' }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!message.trim() || sendMutation.isPending}
          style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', padding: 0, backgroundColor: message.trim() ? 'var(--color-primary)' : 'var(--color-bg-subtle)', color: message.trim() ? 'var(--color-bg)' : 'var(--color-text-muted)' }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l16-8-6 16-2.5-6.5L4 12z" /></svg>
        </button>
      </div>
    </div>
  );
}