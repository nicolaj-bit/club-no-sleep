import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight } from 'lucide-react';
import { differenceInWeeks, differenceInDays, isAfter } from 'date-fns';

function getAgeDisplay(profile) {
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
        unit: `uge${weeks !== 1 ? 'r' : ''}${days > 0 ? ` + ${days}d` : ''}`,
        subtitle: 'gammel',
        isPregnant: false,
      };
    }
    const months = Math.floor(weeks / 4.33);
    return { big: `${months}`, unit: `mdr`, subtitle: 'gammel', isPregnant: false };
  }

  if (dueDate) {
    const daysLeft = differenceInDays(dueDate, today);
    if (daysLeft > 0) {
      const weeksLeft = Math.floor(daysLeft / 7);
      const daysRem = daysLeft % 7;
      return {
        big: weeksLeft > 0 ? `${weeksLeft}` : `${daysLeft}`,
        unit: weeksLeft > 0 ? `uge${weeksLeft !== 1 ? 'r' : ''}${daysRem > 0 ? ` + ${daysRem}d` : ''}` : `dag${daysLeft !== 1 ? 'e' : ''}`,
        subtitle: 'til termin',
        isPregnant: true,
      };
    }
  }

  return null;
}

export default function ChildDevelopmentCard({ profile }) {
  const age = getAgeDisplay(profile);
  if (!age) return null;

  return (
    <Link to={createPageUrl('Knowledge')} className="block mx-5 mb-4 cursor-pointer">
      <div
        className="rounded-3xl overflow-hidden relative"
        style={{ background: 'linear-gradient(145deg, #5C3317 0%, #A0785A 100%)' }}
      >
        {/* decorative blobs */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20 bg-white" />
        <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full opacity-10 bg-white" />

        <div className="relative p-5 flex items-center gap-4">
          <div className="text-4xl leading-none">{age.isPregnant ? '🤰' : '👶'}</div>
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-0.5">
              {age.isPregnant ? 'Termin om' : 'Dit barn er'}
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