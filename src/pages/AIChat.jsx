import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';

const SUGGESTIONS = [
  "Hvordan hjælper jeg min baby til at sove bedre?",
  "Hvad er søvnregression?",
  "Min baby sover kun 20 min ad gangen — hjælp!",
];

export default function AIChat() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const urlParams = new URLSearchParams(window.location.search);
  const withLogs = urlParams.get('with_logs') === '1';

  useEffect(() => {
    const init = async () => {
      const conv = await base44.agents.createConversation({
        agent_name: 'baby_expert',
        metadata: { name: 'Baby & Søvn Chat' }
      });
      setConversation(conv);
      setMessages(conv.messages || []);

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

      const unsubscribe = base44.agents.subscribeToConversation(conv.id, (data) => {
        setMessages(data.messages || []);
        setIsLoading(false);
      });
      return unsubscribe;
    };

    let unsub;
    init().then(fn => { unsub = fn; });
    return () => { if (unsub) unsub(); };
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

  const sendMessage = async () => {
    if (!input.trim() || !conversation || isLoading) return;
    const text = input.trim();
    setInput('');
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
          background: 'linear-gradient(135deg, #C8A882, #8B5E3C)',
        }}
      >
        <Link
          to={createPageUrl('Home')}
          className="p-1.5 rounded-full cursor-pointer"
          style={{ color: 'rgba(255,255,255,0.9)' }}
          aria-label="Gå tilbage"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-white">Baby & Søvn Ekspert</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block" />
              <p className="text-xs text-white/70">AI-assistent · Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">

        {/* Empty state */}
        {visibleMessages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 pb-16 gap-4">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #C8A882, #8B5E3C)' }}
            >
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Hej! Jeg er her for dig 🤍
              </h2>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
                Ekspert i babysøvn, amning og barnets udvikling. Spørg mig om alt!
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="w-full max-w-sm space-y-2 mt-2">
              {SUGGESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="w-full text-left text-sm px-4 py-3 rounded-2xl border transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {visibleMessages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div key={i} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #C8A882, #8B5E3C)' }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
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
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #C8A882, #8B5E3C)' }}
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
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
      </div>

      {/* Input bar */}
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
            placeholder="Skriv dit spørgsmål…"
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
            aria-label="Send besked"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-center text-xs mt-2 px-4" style={{ color: 'var(--color-text-muted)' }}>
          AI-assistenten kan lave fejl og erstatter ikke lægefaglig rådgivning.
        </p>
      </div>
    </div>
  );
}