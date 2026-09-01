import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Flag } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '@/components/ui/LanguageContext';

const REASON_KEYS = [
  'reportReasonInappropriate',
  'reportReasonSpam',
  'reportReasonHarassment',
  'reportReasonFakeProfile',
  'reportReasonOther',
];

export default function ReportSheet({ open, onClose, reportedEmail, messageId = null }) {
  const { t } = useLanguage();
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
    toast.success(t.reportThanks);
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
            {t.reportTitle}
          </SheetTitle>
        </SheetHeader>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {t.selectReportReason}
        </p>
        <div className="space-y-2 mb-6">
          {REASON_KEYS.map(k => (
            <button
              key={k}
              onClick={() => setReason(t[k])}
              className="w-full text-left px-4 py-3 rounded-xl text-sm border transition-all"
              style={{
                borderColor: reason === t[k] ? 'var(--color-primary)' : 'var(--color-border)',
                backgroundColor: reason === t[k] ? 'var(--color-bg-subtle)' : 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                fontWeight: reason === t[k] ? 600 : 400,
              }}
            >
              {t[k]}
            </button>
          ))}
        </div>
        <Button
          className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white"
          disabled={!reason || loading}
          onClick={handleSubmit}
        >
          {loading ? t.sending : t.sendReport}
        </Button>
      </SheetContent>
    </Sheet>
  );
}