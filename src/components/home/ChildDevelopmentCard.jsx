import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Baby, CalendarDays } from 'lucide-react';
import { differenceInWeeks, differenceInDays, format, isAfter } from 'date-fns';
import { da } from 'date-fns/locale';

function getAgeDisplay(profile) {
  if (!profile) return null;

  const today = new Date();
  const birthdate = profile.child_birthdate ? new Date(profile.child_birthdate) : null;
  const dueDate = profile.child_due_date ? new Date(profile.child_due_date) : null;

  if (birthdate && isAfter(today, birthdate)) {
    const weeks = differenceInWeeks(today, birthdate);
    const days = differenceInDays(today, birthdate) % 7;
    if (weeks < 16) {
      return { label: `${weeks} uger${days > 0 ? ` og ${days} dag${days !== 1 ? 'e' : ''}` : ''}`, subtitle: 'gammel' };
    }
    const months = Math.floor(weeks / 4.33);
    return { label: `${months} måneder`, subtitle: 'gammel' };
  }

  if (dueDate) {
    const daysLeft = differenceInDays(dueDate, today);
    if (daysLeft > 0) {
      const weeksLeft = Math.floor(daysLeft / 7);
      const daysRem = daysLeft % 7;
      return {
        label: weeksLeft > 0 ? `${weeksLeft} uge${weeksLeft !== 1 ? 'r' : ''}${daysRem > 0 ? ` og ${daysRem} dag${daysRem !== 1 ? 'e' : ''}` : ''}` : `${daysLeft} dag${daysLeft !== 1 ? 'e' : ''}`,
        subtitle: 'til termin'
      };
    }
  }

  return null;
}

export default function ChildDevelopmentCard({ profile }) {
  const age = getAgeDisplay(profile);
  if (!age) return null;

  const isPregnant = profile?.child_due_date && !profile?.child_birthdate
    ? differenceInDays(new Date(profile.child_due_date), new Date()) > 0
    : false;

  return (
    <Link to={createPageUrl('Knowledge')} className="block mx-5 mb-4">
      <div
        className="rounded-2xl p-4 flex items-center gap-4"
        style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
          style={{ background: 'linear-gradient(135deg, #C8A882 0%, #A0785A 100%)' }}
        >
          {isPregnant ? '🤰' : '👶'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {isPregnant ? 'Termin om' : 'Dit barn er'}
          </p>
          <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{age.label}</p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{age.subtitle}</p>
        </div>
        <Baby className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
      </div>
    </Link>
  );
}