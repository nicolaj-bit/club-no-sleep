import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Send, Pencil, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '@/components/ui/LanguageContext';
import ContentLock from '@/components/subscription/ContentLock';
import { useSubscription } from '@/components/subscription/useSubscription';

// Branded LALATOTO AI avatar
function AIAvatar({ size = 'sm', iconUrl = null }) {
  if (iconUrl) {
    const dim = size === 'lg' ? 80 : 28;
    const radius = size === 'lg' ? 20 : 10;
    return (
      <img
        src={iconUrl}
        alt="AI"
        style={{ width: dim, height: dim, borderRadius: radius, objectFit: 'cover', flexShrink: 0, border: '1.5px solid #C8A882' }}
      />
    );
  }
  const dim = size === 'lg' ? 80 : 28;
  const r1 = size === 'lg' ? 37 : 12.5;
  const r2 = size === 'lg' ? 28 : 9.5;
  const headRx = size === 'lg' ? 13 : 4.5;
  const headRy = size === 'lg' ? 14 : 4.8;
  const headCy = size === 'lg' ? 26 : 9;
  const bodyD = size === 'lg'
    ? 'M14 70 C14 52 22 45 40 45 C58 45 66 52 66 70'
    : 'M5 26 C5 20 8 17 14 17 C20 17 23 20 23 26';
  const leafD = size === 'lg'
    ? 'M34 32 Q40 24 46 32 Q40 40 34 32Z'
    : 'M12 11.5 Q14 9 16 11.5 Q14 14 12 11.5Z';
  return (
    <div
      style={{
        width: dim, height: dim, flexShrink: 0,
        background: 'linear-gradient(145deg, var(--color-bg-subtle) 0%, var(--color-accent-warm) 100%)',
        borderRadius: size === 'lg' ? 20 : 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1.5px solid var(--color-accent)',
        boxShadow: size === 'lg' ? '0 4px 16px rgba(160,120,90,0.18)' : '0 1px 4px rgba(160,120,90,0.15)',
      }}
    >
      <svg viewBox={`0 0 ${dim} ${dim}`} width={dim} height={dim} aria-hidden>
        <circle cx={dim/2} cy={dim/2} r={r1} fill="none" stroke="#C8A882" strokeWidth="0.8" strokeDasharray="3 2.5" opacity="0.5" />
        <circle cx={dim/2} cy={dim/2} r={r2} fill="none" stroke="#C8A882" strokeWidth="0.5" opacity="0.3" />
        <ellipse cx={dim/2} cy={headCy} rx={headRx} ry={headRy} fill="#A0785A" opacity="0.88" />
        <path d={bodyD} fill="#A0785A" opacity="0.72" />
        <path d={leafD} fill="#C8A882" opacity="0.95" />
        <circle cx={dim*0.72} cy={dim*0.28} r={size === 'lg' ? 2.5 : 1} fill="#C8A882" opacity="0.7" />
        <circle cx={dim*0.78} cy={dim*0.38} r={size === 'lg' ? 1.5 : 0.7} fill="#C8A882" opacity="0.5" />
      </svg>
    </div>
  );
}



export default function AIChat() {
  const { t } = useLanguage();
  const { isActive: hasSubscription, loading: subscriptionLoading } = useSubscription();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [iconUrl, setIconUrl] = useState(null);
  const [iconConfig, setIconConfig] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState(null); // null | 'encouragement' | 'question'
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const urlParams = new URLSearchParams(window.location.search);
  const withLogs = urlParams.get('with_logs') === '1';
  const withDiary = urlParams.get('with_diary') === '1';

  useEffect(() => {
    // Load AI icon from AppConfig
    base44.entities.AppConfig.filter({ key: 'ai_chat_icon' }).then(results => {
      if (results?.[0]?.icon_url) {
        setIconUrl(results[0].icon_url);
        setIconConfig(results[0]);
      } else if (results?.[0]) {
        setIconConfig(results[0]);
      }
    }).catch(() => {});
    // Check admin
    base44.auth.me().then(u => { if (u?.role === 'admin') setIsAdmin(true); }).catch(() => {});
  }, []);

  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    if (iconConfig?.id) {
      await base44.entities.AppConfig.update(iconConfig.id, { icon_url: file_url });
    } else {
      const created = await base44.entities.AppConfig.create({ key: 'ai_chat_icon', icon_url: file_url });
      setIconConfig(created);
    }
    setIconUrl(file_url);
    setUploading(false);
  };

  const unsubRef = useRef(null);

  const startChat = async (agentName, initialMessage) => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) return;

    const conv = await base44.agents.createConversation({
      agent_name: agentName,
      metadata: { name: agentName === 'encouragement' ? 'Opmuntring Chat' : 'Baby & Søvn Chat' }
    });
    setConversation(conv);
    setMessages(conv.messages || []);

    const unsubscribe = base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages(data.messages || []);
      setIsLoading(false);
    });
    unsubRef.current = unsubscribe;

    if (agentName === 'baby_expert') {
      if (withLogs) {
        try {
          const user = await base44.auth.me();
          const logs = await base44.entities.SleepLog.filter({ user_email: user.email }, '-date', 14);
          if (logs?.length > 0) {
            setIsLoading(true);
            const logsText = JSON.stringify(logs, null, 2);
            const prompt = `Analyser venligst mine søvnlogs fra de seneste dage og giv mig konkrete observationer og råd:\n\n\`\`\`json\n${logsText}\n\`\`\``;
            await base44.agents.addMessage(conv, { role: 'user', content: prompt });
          }
        } catch (e) {
          console.log('Could not load sleep logs');
        }
      }

      if (withDiary) {
        try {
          const user = await base44.auth.me();
          const [profiles, diaryEntries] = await Promise.all([
            base44.entities.UserProfile.filter({ user_email: user.email }),
            base44.entities.PregnancyDiary.filter({ user_email: user.email }, '-week', 20),
          ]);
          const profile = profiles[0];
          if (diaryEntries?.length > 0 || profile) {
            setIsLoading(true);
            const MOOD_LABELS = { strålende: 'Strålende 🌟', god: 'God 😊', okay: 'Okay 😐', træt: 'Træt 😴', hård: 'Hård dag 😢' };
            const diaryText = diaryEntries.map(e =>
              `Uge ${e.week}: Humør: ${MOOD_LABELS[e.mood] || '–'} | Note: ${e.note || '–'} | Symptomer: ${e.symptoms || '–'} | Spark: ${e.baby_kicks_count ?? '–'}`
            ).join('\n');
            const contextParts = [];
            if (profile?.child_due_date) {
              const daysLeft = Math.round((new Date(profile.child_due_date) - new Date()) / 86400000);
              const weeksLeft = Math.round(daysLeft / 7);
              const currentWeek = Math.max(1, Math.min(42, 40 - weeksLeft));
              contextParts.push(`Jeg er i graviditetsuge ${currentWeek} (termin om ca. ${weeksLeft} uger).`);
            }
            if (diaryText) contextParts.push(`Her er mine dagbogsnotater fra graviditeten:\n${diaryText}`);
            const prompt = `${contextParts.join('\n\n')}\n\nBrug denne kontekst til at give mig personlige og relevante svar fremover. Du behøver ikke at kommentere det nu — bare svar med en kort bekræftelse på at du har set mine oplysninger og er klar til at hjælpe.`;
            await base44.agents.addMessage(conv, { role: 'user', content: prompt });
          }
        } catch (e) {
          console.log('Could not load diary data');
        }
      }
    }

    if (initialMessage) {
      setIsLoading(true);
      await base44.agents.addMessage(conv, { role: 'user', content: initialMessage });
    }
  };

  useEffect(() => {
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const sendMessage = async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || !conversation || isLoading) return;
    if (!overrideText) setInput('');
    setIsLoading(true);
    await base44.agents.addMessage(conversation, { role: 'user', content: text });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const visibleMessages = messages.filter(m => m.role !== 'tool');

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{
          paddingTop: 'max(40px, env(safe-area-inset-top, 40px))',
          background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
        }}
      >
        <Link
          to={createPageUrl('Home')}
          className="p-1.5 rounded-full cursor-pointer"
          style={{ color: 'rgba(255,255,255,0.9)' }}
          aria-label={t.backLabel}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex items-center gap-2 flex-1">
          <div className="relative">
            <AIAvatar size="sm" iconUrl={iconUrl} />
            {isAdmin && (
              <label className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white/90 flex items-center justify-center cursor-pointer shadow">
                <Pencil className="w-2.5 h-2.5" style={{ color: '#8B5E3C' }} />
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleIconUpload} />
              </label>
            )}
          </div>
          <div>
            <p className="text-base text-white font-light" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', letterSpacing: '0.04em' }}>{t.aiChatTitle}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block" />
              <p className="text-xs text-white/70">{t.aiOnline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
      <ContentLock locked={!hasSubscription} loading={subscriptionLoading} blurHeight="100%">

        {/* Empty state */}
        {visibleMessages.length === 0 && !isLoading && mode === null && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 pb-16 gap-4">
            <div className="relative">
              <AIAvatar size="lg" iconUrl={iconUrl} />
              {isAdmin && (
                <label
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #C8A882, #8B5E3C)' }}
                >
                  {uploading ? (
                    <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-white" />
                  )}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleIconUpload} />
                </label>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-light mb-1" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                {t.aiGreeting}
              </h2>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
                {t.aiSubtitle}
              </p>
            </div>

            {/* Entry-point buttons */}
            <div className="w-full max-w-sm space-y-3 mt-4">
              <button
                onClick={() => { setMode('encouragement'); startChat('encouragement', 'Jeg har brug for opmuntring'); }}
                className="w-full text-sm font-medium px-5 py-4 rounded-2xl border-2 transition-all cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderColor: 'var(--color-accent)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Jeg har brug for opmuntring
              </button>
              <button
                onClick={() => { setMode('question'); startChat('baby_expert'); }}
                className="w-full text-sm font-medium px-5 py-4 rounded-2xl border-2 transition-all cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderColor: 'var(--color-accent)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Jeg har spørgsmål
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        {visibleMessages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div key={i} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && <AIAvatar size="sm" iconUrl={iconUrl} />}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${
                  isUser
                    ? 'rounded-br-md text-white'
                    : 'rounded-bl-md border'
                }`}
                style={isUser
                  ? { background: 'linear-gradient(135deg, #A0785A, #6B3F20)' }
                  : {
                      backgroundColor: 'var(--color-bg-card)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }
                }
              >
                {isUser ? (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                ) : (
                  <ReactMarkdown className="text-sm prose prose-sm prose-stone max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading dots */}
        {isLoading && (
          <div className="flex items-end gap-2 justify-start">
            <AIAvatar size="sm" iconUrl={iconUrl} />
            <div
              className="rounded-2xl rounded-bl-md border px-4 py-3 shadow-sm"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </ContentLock>
      </div>

      {/* Input bar */}
      {hasSubscription && (mode !== null || visibleMessages.length > 0) && (
      <div
        className="px-4 pt-3 pb-6 border-t"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
        }}
      >
        <div
          className="flex items-end gap-2 rounded-2xl px-4 py-3 border transition-colors"
          style={{
            backgroundColor: 'var(--color-bg-subtle)',
            borderColor: 'var(--color-border)',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.aiPlaceholder}
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none outline-none"
            style={{
              color: 'var(--color-text-primary)',
              lineHeight: '1.6',
              maxHeight: '120px',
              caretColor: 'var(--color-accent)',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity cursor-pointer disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #C8A882, #8B5E3C)' }}
            aria-label={t.sendLabel}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-center text-xs mt-2 px-4" style={{ color: 'var(--color-text-muted)' }}>
          {t.aiDisclaimer}
        </p>
      </div>
      )}
    </div>
  );
}