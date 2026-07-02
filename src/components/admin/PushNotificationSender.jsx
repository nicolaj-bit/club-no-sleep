import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/components/ui/LanguageContext';

export default function PushNotificationSender() {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title || !message) {
      toast.error(t.pushNotificationSenderError);
      return;
    }
    setSending(true);
    const res = await base44.functions.invoke('sendPushNotification', { title, message, url: url || undefined });
    setSending(false);

    if (res.data?.success) {
      toast.success(t.pushNotificationSenderSuccess.replace('{recipients}', res.data.recipients ?? 'alle'));
      setTitle('');
      setMessage('');
      setUrl('');
    } else {
      toast.error(t.pushNotificationSenderFailed);
    }
  };

  return (
    <div className="rounded-2xl border p-4 space-y-4"
      style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
        <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{t.pushNotificationSenderTitle}</h2>
      </div>

      <div className="space-y-1.5">
        <Label style={{ color: 'var(--color-text-secondary)' }}>{t.pushNotificationSenderTitleLabel}</Label>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="fx. Nyt produkt i shoppen 🎉"
          style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
        />
      </div>

      <div className="space-y-1.5">
        <Label style={{ color: 'var(--color-text-secondary)' }}>{t.pushNotificationSenderMessage}</Label>
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
        <Label style={{ color: 'var(--color-text-secondary)' }}>{t.pushNotificationSenderLink}</Label>
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
        {sending ? t.pushNotificationSenderSending : t.pushNotificationSenderButton}
      </Button>
    </div>
  );
}