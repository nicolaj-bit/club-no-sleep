import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function PushNotificationSender() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title || !message) {
      toast.error('Udfyld titel og besked');
      return;
    }
    setSending(true);
    const res = await base44.functions.invoke('sendPushNotification', { title, message, url: url || undefined });
    setSending(false);

    if (res.data?.success) {
      toast.success(`Notifikation sendt til ${res.data.recipients ?? 'alle'} brugere!`);
      setTitle('');
      setMessage('');
      setUrl('');
    } else {
      toast.error('Noget gik galt – prøv igen');
    }
  };

  return (
    <div className="rounded-2xl border p-4 space-y-4"
      style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
        <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Send push-notifikation</h2>
      </div>

      <div className="space-y-1.5">
        <Label style={{ color: 'var(--color-text-secondary)' }}>Titel</Label>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="fx. Nyt produkt i shoppen 🎉"
          style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
        />
      </div>

      <div className="space-y-1.5">
        <Label style={{ color: 'var(--color-text-secondary)' }}>Besked</Label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="fx. Vi har netop tilføjet en ny babypleje-pakke med 20% rabat..."
          rows={3}
          className="w-full rounded-md border px-3 py-2 text-sm resize-none"
          style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
        />
      </div>

      <div className="space-y-1.5">
        <Label style={{ color: 'var(--color-text-secondary)' }}>Link (valgfrit)</Label>
        <Input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="fx. /Shop"
          style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
        />
      </div>

      <Button
        onClick={handleSend}
        disabled={sending}
        className="w-full flex items-center gap-2"
        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
      >
        <Send className="w-4 h-4" />
        {sending ? 'Sender...' : 'Send til alle brugere'}
      </Button>
    </div>
  );
}