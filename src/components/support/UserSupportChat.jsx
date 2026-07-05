import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';

export default function UserSupportChat({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  const loadMessages = async () => {
    try {
      const msgs = await base44.entities.SupportMessage.filter(
        { user_email: user.email },
        '-created_date',
        50
      );
      setMessages(msgs.reverse());

      // Markér ulæste admin-svar som læst
      const unread = msgs.filter(m => m.admin_reply && !m.is_read_by_user);
      for (const m of unread) {
        await base44.entities.SupportMessage.update(m.id, { is_read_by_user: true });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // Real-time subscription
    const unsub = base44.entities.SupportMessage.subscribe((event) => {
      if (event.data?.user_email === user.email) {
        loadMessages();
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await base44.entities.SupportMessage.create({
        user_email: user.email,
        user_name: user.full_name || user.email,
        message: newMessage.trim(),
        is_read_by_admin: false,
        is_read_by_user: true,
      });
      // Send in-app notifikation til admin via AppNotification
      await base44.asServiceRole?.entities?.AppNotification?.create?.({
        title: '💬 Ny supportbesked',
        message: `${user.full_name || user.email}: ${newMessage.trim().slice(0, 80)}`,
        link: '/AdminSupport',
        emoji: '💬',
        target_emails: [],
      }).catch(() => {});
      setNewMessage('');
      toast.success('Besked sendt!');
    } catch (e) {
      toast.error('Kunne ikke sende besked');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) return (
    <div className="flex justify-center py-8">
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-accent)' }} />
    </div>
  );

  return (
    <div className="flex flex-col" style={{ height: '420px' }}>
      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto space-y-3 px-1 py-2">
        {messages.length === 0 && (
          <p className="text-center text-sm py-8" style={{ color: 'var(--color-text-muted)' }}>
            Ingen beskeder endnu. Send os en besked — vi svarer hurtigt! 🌙
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-2">
            {/* Brugerens besked */}
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm" style={{ background: 'var(--color-primary)', color: '#fff' }}>
                <p>{msg.message}</p>
                <p className="text-xs mt-1 opacity-70 text-right">
                  {format(new Date(msg.created_date), 'HH:mm', { locale: da })}
                </p>
              </div>
            </div>
            {/* Admin svar */}
            {msg.admin_reply && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[80%]">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-1" style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-accent)' }}>
                    L
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm" style={{ background: 'var(--color-bg-subtle)' }}>
                    <p style={{ color: 'var(--color-text-primary)' }}>{msg.admin_reply}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {msg.replied_at ? format(new Date(msg.replied_at), 'HH:mm', { locale: da }) : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <textarea
          rows={1}
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Skriv en besked..."
          className="flex-1 resize-none rounded-xl px-3 py-2 text-sm outline-none"
          style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-primary)', border: 'none', maxHeight: '80px' }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !newMessage.trim()}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-40"
          style={{ background: 'var(--color-primary)', color: '#fff' }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}