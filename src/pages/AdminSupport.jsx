import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import PageHeader from '@/components/ui/PageHeader';
import { useLanguage } from '@/components/ui/LanguageContext';

export default function AdminSupport() {
  const { t } = useLanguage();
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.role !== 'admin') window.location.href = '/';
      setUser(u);
    });
    loadThreads();
    const unsub = base44.entities.SupportMessage.subscribe(() => loadThreads());
    return () => unsub();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected]);

  const loadThreads = async () => {
    const msgs = await base44.entities.SupportMessage.list('-created_date', 200);
    // Gruppér per bruger
    const byUser = {};
    for (const m of msgs) {
      if (!byUser[m.user_email]) byUser[m.user_email] = [];
      byUser[m.user_email].push(m);
    }
    // Sorter beskeder kronologisk inden for hver tråd
    Object.values(byUser).forEach(arr => arr.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
    const threadList = Object.entries(byUser).map(([email, messages]) => ({
      email,
      name: messages[0]?.user_name || email,
      messages,
      lastMessage: messages[messages.length - 1],
      unread: messages.filter(m => !m.is_read_by_admin).length,
    }));
    threadList.sort((a, b) => new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date));
    setThreads(threadList);
  };

  const openThread = async (thread) => {
    setSelected(thread);
    setReply('');
    // Markér som læst
    const unread = thread.messages.filter(m => !m.is_read_by_admin);
    for (const m of unread) {
      await base44.entities.SupportMessage.update(m.id, { is_read_by_admin: true });
    }
    await loadThreads();
  };

  const handleReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      // Svar på den seneste besked uden svar, eller opret ny
      const unanswered = selected.messages.filter(m => !m.admin_reply);
      if (unanswered.length > 0) {
        const last = unanswered[unanswered.length - 1];
        await base44.entities.SupportMessage.update(last.id, {
          admin_reply: reply.trim(),
          replied_at: new Date().toISOString(),
          is_read_by_user: false,
        });
      } else {
        // Opret en "admin-initieret" besked
        await base44.entities.SupportMessage.create({
          user_email: selected.email,
          user_name: selected.name,
          message: '',
          admin_reply: reply.trim(),
          replied_at: new Date().toISOString(),
          is_read_by_admin: true,
          is_read_by_user: false,
        });
      }
      setReply('');
      toast.success(t.adminSupportReplyLabel);
      await loadThreads();
      // Opdater selected
      setSelected(prev => {
        const updated = threads.find(t => t.email === prev?.email);
        return updated || prev;
      });
    } catch (e) {
      toast.error(t.adminSupportError);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  const totalUnread = threads.reduce((sum, t) => sum + t.unread, 0);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <PageHeader title={`${t.adminSupportTitle}${totalUnread > 0 ? ` (${totalUnread})` : ''}`} />

      <div className="max-w-2xl mx-auto px-4 pt-4 pb-8">
        {!selected ? (
          // Tråd-liste
          <div className="space-y-2">
            {threads.length === 0 && (
              <p className="text-center py-12 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {t.adminSupportNoMessages}
              </p>
            )}
            {threads.map((thread) => (
              <button
                key={thread.email}
                onClick={() => openThread(thread)}
                className="w-full text-left rounded-xl p-4 flex items-center gap-3 transition-all"
                style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
              >
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold" style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-accent)' }}>
                  {thread.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{thread.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {format(new Date(thread.lastMessage.created_date), 'd. MMM', { locale: da })}
                    </p>
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {thread.lastMessage.admin_reply || thread.lastMessage.message}
                  </p>
                </div>
                {thread.unread > 0 && (
                  <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold text-white flex-shrink-0" style={{ background: 'var(--color-primary)' }}>
                    {thread.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          // Chat-view
          <div className="flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-2 text-sm mb-4"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <ArrowLeft className="w-4 h-4" /> Alle beskeder
            </button>
            <p className="text-xs font-semibold mb-3 px-1" style={{ color: 'var(--color-text-muted)' }}>
              {selected.email}
            </p>

            {/* Beskeder */}
            <div className="flex-1 overflow-y-auto space-y-3 px-1">
              {selected.messages.filter(m => m.message || m.admin_reply).map((msg) => (
                <div key={msg.id} className="space-y-2">
                  {msg.message && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm" style={{ background: 'var(--color-bg-subtle)' }}>
                        <p style={{ color: 'var(--color-text-primary)' }}>{msg.message}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          {format(new Date(msg.created_date), 'HH:mm', { locale: da })}
                        </p>
                      </div>
                    </div>
                  )}
                  {msg.admin_reply && (
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm" style={{ background: 'var(--color-primary)', color: '#fff' }}>
                        <p>{msg.admin_reply}</p>
                        <p className="text-xs mt-1 opacity-70 text-right">
                          {msg.replied_at ? format(new Date(msg.replied_at), 'HH:mm', { locale: da }) : ''}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Svar-input */}
            <div className="flex gap-2 pt-3 border-t mt-2" style={{ borderColor: 'var(--color-border)' }}>
              <textarea
                rows={1}
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.writeMessagePlaceholder}
                className="flex-1 resize-none rounded-xl px-3 py-2 text-sm outline-none"
                style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-primary)', border: 'none', maxHeight: '80px' }}
              />
              <button
                onClick={handleReply}
                disabled={sending || !reply.trim()}
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-40"
                style={{ background: 'var(--color-primary)', color: '#fff' }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}