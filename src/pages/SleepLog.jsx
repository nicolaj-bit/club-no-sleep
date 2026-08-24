import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '@/components/ui/PullToRefresh';
import PageHeader from '@/components/ui/PageHeader';
import { BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useActiveChild } from '@/components/ui/ActiveChildContext';
import { useSubscription } from '@/components/subscription/useSubscription';
import { useInviteAccess } from '@/components/auth/InviteAccessContext';
import { useLanguage } from '@/components/ui/LanguageContext';
import ContentLock from '@/components/subscription/ContentLock';
import LiveSleepTracker from '@/components/sleep/LiveSleepTracker';
import SleepHistory from '@/components/sleep/SleepHistory';
import { da, enUS } from 'date-fns/locale';

export default function SleepLog() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('tracker');
  const { activeChild } = useActiveChild();
  const { isActive: hasSubscription, loading: subscriptionLoading } = useSubscription();
  const { isInvited, refresh: refreshInviteData } = useInviteAccess();
  const { lang } = useLanguage();
  const dateLocale = lang === 'en' ? enUS : da;
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.isAuthenticated().then(isAuth => {
      if (isAuth) return base44.auth.me();
    }).then(u => {
      if (u) setUser(u);
    }).catch(() => {});
  }, []);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries(['sleeplogs']);
    if (isInvited) await refreshInviteData();
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--color-bg)' }}>
        <PageHeader
          title="Søvn"
          rightAction={
            <button
              onClick={() => setView(v => v === 'tracker' ? 'history' : 'tracker')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{ background: 'linear-gradient(135deg, #F7F2EC, #EDE4D8)', border: '1px solid #E8DDD2', color: 'var(--color-text-secondary)' }}
            >
              <BookOpen className="w-3.5 h-3.5" />
              {view === 'tracker' ? 'Historik' : 'Log'}
            </button>
          }
        />

        {view === 'history' ? (
          <SleepHistory user={user} activeChild={activeChild} lang={lang} dateLocale={dateLocale} />
        ) : (
          <ContentLock locked={!hasSubscription} loading={subscriptionLoading} blurHeight="300px">
            <LiveSleepTracker user={user} activeChild={activeChild} />
          </ContentLock>
        )}
      </div>
    </PullToRefresh>
  );
}