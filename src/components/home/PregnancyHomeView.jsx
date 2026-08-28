import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/ui/LanguageContext';
import { Baby } from 'lucide-react';
import AIRelevantPosts from '@/components/home/AIRelevantPosts';
import SleepSummaryCard from '@/components/home/SleepSummaryCard';
import UpcomingEventCard from '@/components/home/UpcomingEventCard';
import ActiveMomsCard from '@/components/home/ActiveMomsCard';
import { getGestationalAge } from '../../../base44/shared/getGestationalAge';

export default function PregnancyHomeView({ profile, user, posts = [], activeChild }) {
  const { lang } = useLanguage();

  // Brug aktivt barn's terminsdato, ellers fald tilbage til profil
  const dueDate = activeChild?.due_date || profile?.child_due_date;
  const childName = activeChild?.name;
  const ga = dueDate ? getGestationalAge(dueDate) : null;
  const pregnancy = ga && ga.daysUntilDue >= 0 ? ga : null;

  return (
    <>
      {/* Pregnancy Hero Card */}
      {pregnancy && (
        <Link to={`/PregnancyWeekDetail?week=${pregnancy.ordinal}`} className="block mx-5 mb-4">
          <div
            className="rounded-3xl overflow-hidden relative flex"
            style={{ background: 'linear-gradient(135deg, var(--color-bg-card), var(--color-bg-subtle))', minHeight: 190 }}
          >
            {/* Left: text */}
            <div className="flex-1 p-5 flex flex-col justify-between z-10">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  {childName && activeChild?.birthdate ? childName.toUpperCase() + ' · ' : ''}{lang === 'da' ? 'TERMIN OM' : 'DUE IN'}
                </p>
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <span className="text-[72px] font-light leading-none" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'var(--color-text-primary)', lineHeight: 1 }}>
                    {Math.floor(pregnancy.daysUntilDue / 7)}
                  </span>
                  <span className="text-2xl font-light" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                    {lang === 'da' ? 'uger' : 'weeks'}
                  </span>
                </div>
              </div>

              {/* Week pill — bottom */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mt-4 self-start"
                style={{ backgroundColor: 'rgba(255,255,255,0.75)' }}
              >
                <Baby className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                  {lang === 'da'
                    ? `Du er i uge ${pregnancy.ordinal} (${pregnancy.completedWeeks}+${pregnancy.days})`
                    : `Week ${pregnancy.ordinal}`}
                </span>
              </div>
            </div>

            {/* Right: photo */}
            <div className="relative w-[48%] flex-shrink-0 overflow-hidden rounded-r-3xl">
              <img
                src="https://media.base44.com/images/public/699f47a86e7e0a874d1159ed/b0c96886b_generated_image.png"
                alt="gravid"
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center top' }}
              />
              {/* Fade to left */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to right, var(--color-bg-card) 0%, transparent 40%)' }}
              />
            </div>
          </div>
        </Link>
      )}

      {/* Sleep + Next appointment row */}
      {user && (
        <div className="mx-5 mb-4 flex gap-3">
          <SleepSummaryCard userEmail={user.email} />
          <UpcomingEventCard userEmail={user.email} />
        </div>
      )}

      {/* Active moms card */}
      <div className="mx-5 mb-4">
        <ActiveMomsCard />
      </div>

      {/* Relevant posts */}
      <div className="mb-2">
        <AIRelevantPosts profile={profile} allPosts={posts} />
      </div>
    </>
  );
}