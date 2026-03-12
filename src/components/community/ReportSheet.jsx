import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Flag } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const REASONS = [
  'Upassende indhold',
  'Spam eller reklame',
  'Chikane eller mobning',
  'Falsk profil',
  'Andet',
];

export default function ReportSheet({ open, onClose, reportedEmail, messageId = null }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setLoading(true);
    await base44.functions.invoke('reportUser', {
      reported_email: reportedEmail,
      type: messageId ? 'message' : 'user',
      message_id: messageId,
      reason,
    });
    toast.success('Tak for din indberetning. Vi vil gennemgå den hurtigst muligt.');
    setReason('');
    setLoading(false);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-10">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-500" />
            Indberetning
          </SheetTitle>
        </SheetHeader>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Vælg årsag til indberetning:
        </p>
        <div className="space-y-2 mb-6">
          {REASONS.map(r => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className="w-full text-left px-4 py-3 rounded-xl text-sm border transition-all"
              style={{
                borderColor: reason === r ? 'var(--color-primary)' : 'var(--color-border)',
                backgroundColor: reason === r ? 'var(--color-bg-subtle)' : 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                fontWeight: reason === r ? 600 : 400,
              }}
            >
              {r}
            </button>
          ))}
        </div>
        <Button
          className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white"
          disabled={!reason || loading}
          onClick={handleSubmit}
        >
          {loading ? 'Sender...' : 'Send indberetning'}
        </Button>
      </SheetContent>
    </Sheet>
  );
}