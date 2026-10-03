import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageContext';

export default function SleepAdviceCard({ userEmail }) {
  const { t } = useLanguage();
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logsCount, setLogsCount] = useState(0);

  useEffect(() => {
    if (!userEmail) return;

    // First check how many logs exist — only call AI if 5+
    base44.entities.SleepLog.filter({ user_email: userEmail }, '-date', 10).then(logs => {
      if (!Array.isArray(logs)) {
        setLoading(false);
        return;
      }
      setLogsCount(logs.length);
      if (logs.length < 5) {
        setLoading(false);
        return;
      }

      // Fetch AI advice
      base44.functions.invoke('analyzeSleepLogs', {}).then(res => {
        setAdvice(res.data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }).catch(() => setLoading(false));
  }, [userEmail]);

  // Don't show anything until we know if there are enough logs
  if (loading) return null;
  if (logsCount < 5) return null;
  if (!advice) return null;

  return (
    <div className="mx-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.sleepAdviceTitle}</h2>
        </div>
        <Link to={createPageUrl('SleepLog')} className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {t.seeSleepLog}
        </Link>
      </div>

      <Link to={createPageUrl('SleepLog')} className="block cursor-pointer">
        <div
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
        >
          <p className="font-semibold text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>{advice.title}</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)', textWrap: 'pretty' }}>
            {advice.message}
          </p>
          <div className="flex items-center gap-1 mt-3">
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.basedOnLogs} {logsCount} {t.logsLabel}</span>
            <ChevronRight className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
          </div>
        </div>
      </Link>
    </div>
  );
}