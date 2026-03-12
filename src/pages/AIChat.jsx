import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';

export default function AIChat() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
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

      // If coming from sleep log, auto-send logs
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

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#F7F2EC' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 bg-white border-b border-stone-100">
        <Link to={createPageUrl('Home')} className="p-2 rounded-full hover:bg-stone-50">
          <ArrowLeft className="w-5 h-5 text-stone-700" />
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)' }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-stone-800 text-sm">Baby & Søvn Ekspert</p>
            <p className="text-xs text-amber-600 font-medium">🤖 AI · Erstatter ikke lægefaglig rådgivning</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 pb-20">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)' }}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">Hej! Jeg er her for dig 🤍</h2>
            {/* AI Disclosure – krav fra App Store & Google Play */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4 text-left max-w-xs">
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-semibold">🤖 Du chatter med en AI-assistent.</span> Den kan generere forkerte oplysninger og erstatter ikke professionel rådgivning fra læge eller sundhedspersonale.
              </p>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed mb-6">Jeg er ekspert i babysøvn, amning, barnets udvikling og meget mere. Spørg mig om alt!</p>
            <div className="space-y-2 w-full max-w-xs">
              {[
                "Hvordan hjælper jeg min baby til at sove bedre?",
                "Hvad er søvnregression?",
                "Mine baby sover kun 20 min ad gangen — hjælp!",
              ].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="w-full text-left text-sm px-4 py-3 rounded-2xl bg-white border border-stone-200 text-stone-600 hover:border-stone-400 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          if (msg.role === 'tool') return null;
          const isUser = msg.role === 'user';
          return (
            <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)' }}>
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser ? 'text-white' : 'bg-white border border-stone-100 text-stone-800'}`}
                style={isUser ? { background: 'linear-gradient(135deg, #A0785A, #7A5535)' } : {}}>
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

        {isLoading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)' }}>
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white border border-stone-100 rounded-2xl px-4 py-3">
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

      {/* Input */}
      <div className="px-4 pb-8 pt-3 bg-white border-t border-stone-100">
        <div className="flex items-end gap-2 bg-stone-50 rounded-2xl px-4 py-3 border border-stone-200">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Skriv dit spørgsmål..."
            rows={1}
            className="flex-1 bg-transparent text-stone-800 text-sm resize-none outline-none placeholder-stone-400 max-h-28"
            style={{ lineHeight: '1.5' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)' }}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}