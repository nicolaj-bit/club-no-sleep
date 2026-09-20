import React, { useState } from 'react';
import PullToRefresh from '@/components/ui/PullToRefresh';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { PREGNANCY_WEEKS } from '@/components/knowledge/pregnancyWeekData';
import { getGestationalAge } from '../../base44/shared/getGestationalAge';
import PageHeader from '@/components/ui/PageHeader';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useActiveChild } from '@/components/ui/ActiveChildContext';
import { useActiveProfile } from '@/components/ui/ActiveProfileContext';
import { useQueryClient } from '@tanstack/react-query';
import KraeverBarn from '@/components/children/KraeverBarn';

function WeekCard({ week, data, isCurrent }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(isCurrent);

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all ${isCurrent ? 'border-2' : ''}`}
      style={{
        borderColor: isCurrent ? 'var(--color-cappuccino)' : 'var(--color-border)',
        backgroundColor: 'var(--color-bg-card)',
      }}
    >
      <button
        className="w-full px-4 py-3.5 flex items-center justify-between gap-2"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2.5">
          {isCurrent && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-cappuccino)', color: 'var(--color-primary-foreground)' }}>
              {t.pregnancyWeeksNow} ✦
            </span>
          )}
          <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {data.title || `${t.pregnancyWeeksWeekLabel} ${week}`}
          </span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
        }
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="pt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {data.mainText[0]}
          </p>

          <Link
            to={`/PregnancyWeekDetail?week=${week}`}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-medium text-sm transition-opacity active:opacity-70"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.pregnancyWeeksReadMore} {week === 41 ? '41-42' : week}</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function PregnancyWeeks() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { activeChild, refetch: refetchChild } = useActiveChild();
  const { activeProfile, refreshProfiles } = useActiveProfile();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
    refreshProfiles?.();
    refetchChild?.();
  };

  // Samme kilde-regel som på forsiden: findes et aktivt barn, læses due_date
  // udelukkende derfra — aldrig blandet med et efterladt UserProfile-felt.
  const dueDateStr = activeChild ? activeChild.due_date : activeProfile?.child_due_date;
  const currentWeek = dueDateStr ? getGestationalAge(dueDateStr)?.ordinal : null;
  const isPregnant = currentWeek !== null && currentWeek >= 4 && currentWeek <= 42;

  const weeksToShow = Object.keys(PREGNANCY_WEEKS).map(Number).sort((a, b) => a - b);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <PageHeader title={t.pregnancyWeeksTitle} />

      <KraeverBarn field="due_date" reason="kraeverBarnReasonPregnancy">
        <div className="px-4 pt-5 pb-6 space-y-5">
          {/* Week list */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
              {t.pregnancyWeeksAllWeeks}
            </p>
            <div className="space-y-2">
              {weeksToShow.map(week => (
                <WeekCard
                  key={week}
                  week={week}
                  data={PREGNANCY_WEEKS[week]}
                  isCurrent={isPregnant && (week === currentWeek || (week === 41 && currentWeek === 42))}
                />
              ))}
            </div>
          </div>
        </div>
      </KraeverBarn>
    </div>
    </PullToRefresh>
  );
}