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
    base44.entities.SleepLog.list('-date', 10).then(logs => {
      logs = logs.filter(l => l.user_email === userEmail);
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
          <span className="text-base">🌙</span>
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.sleepAdviceTitle}</h2>
        </div>
        <Link to={createPageUrl('SleepLog')} className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {t.seeSleepLog}
        </Link>
      </div>

      <Link to={createPageUrl('SleepLog')} className="block cursor-pointer">
        <div
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2D1B69 100%)' }}
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-15 bg-white" />
          <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full opacity-10 bg-white" />

          <p className="text-white font-semibold text-sm mb-2 relative z-10">{advice.title}</p>
          <p className="text-white/70 text-sm leading-relaxed relative z-10" style={{ textWrap: 'pretty' }}>
            {advice.message}
          </p>
          <div className="flex items-center gap-1 mt-3 relative z-10">
            <span className="text-white/40 text-xs">{t.basedOnLogs} {logsCount} {t.logsLabel}</span>
            <ChevronRight className="w-3 h-3 text-white/30" />
          </div>
        </div>
      </Link>
    </div>
  );
}