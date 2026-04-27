import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight } from 'lucide-react';
import { differenceInWeeks, differenceInDays, isAfter } from 'date-fns';
import { useLanguage } from '@/components/ui/LanguageContext';

function getAgeDisplay(profile, t) {
  if (!profile) return null;

  const today = new Date();
  const birthdate = profile.child_birthdate ? new Date(profile.child_birthdate) : null;
  const dueDate = profile.child_due_date ? new Date(profile.child_due_date) : null;

  if (birthdate && isAfter(today, birthdate)) {
    const weeks = differenceInWeeks(today, birthdate);
    const days = differenceInDays(today, birthdate) % 7;
    if (weeks < 16) {
      return {
        big: `${weeks}`,
        unit: `${weeks !== 1 ? t.weekPlural : t.weekSingular}${days > 0 ? ` + ${days}d` : ''}`,
        subtitle: t.old,
        isPregnant: false,
      };
    }
    const months = Math.floor(weeks / 4.33);
    return { big: `${months}`, unit: t.monthsShort, subtitle: t.old, isPregnant: false };
  }

  if (dueDate) {
    const daysLeft = differenceInDays(dueDate, today);
    if (daysLeft > 0) {
      const weeksLeft = Math.floor(daysLeft / 7);
      const daysRem = daysLeft % 7;
      return {
        big: weeksLeft > 0 ? `${weeksLeft}` : `${daysLeft}`,
        unit: weeksLeft > 0
          ? `${weeksLeft !== 1 ? t.weekPlural : t.weekSingular}${daysRem > 0 ? ` + ${daysRem}d` : ''}`
          : `${daysLeft !== 1 ? t.dayPlural : t.daySingular}`,
        subtitle: t.untilDue,
        isPregnant: true,
      };
    }
  }

  return null;
}

export default function ChildDevelopmentCard({ profile }) {
  const { t } = useLanguage();
  const age = getAgeDisplay(profile, t);
  if (!age) return null;

  return (
    <Link to={createPageUrl('Knowledge')} className="block mx-5 mb-4 cursor-pointer">
      <div
        className="rounded-3xl overflow-hidden relative"
        style={{ background: 'linear-gradient(145deg, #808072 0%, #DCC1B0 100%)' }}
      >


        <div className="relative p-5 flex items-center gap-4">
          <div className="text-4xl leading-none">{age.isPregnant ? '🤰' : '👶'}</div>
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-0.5">
              {age.isPregnant ? t.dueIn : t.yourChildIs}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-light text-white" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{age.big}</span>
              <span className="text-white/80 text-sm font-medium">{age.unit}</span>
            </div>
            <p className="text-white/60 text-xs mt-0.5">{age.subtitle}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/50 flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
}