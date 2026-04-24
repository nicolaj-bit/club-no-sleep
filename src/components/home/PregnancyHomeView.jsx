import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { differenceInWeeks, differenceInDays } from 'date-fns';
import { useLanguage } from '@/components/ui/LanguageContext';
import { ChevronRight, Heart, BookOpen, Calendar } from 'lucide-react';
import NotificationBell from '@/components/ui/NotificationBell';
import AIRelevantPosts from '@/components/home/AIRelevantPosts';
import UpcomingEventCard from '@/components/home/UpcomingEventCard';
import { format } from 'date-fns';
import { da, enUS } from 'date-fns/locale';

function getPregnancyWeek(dueDate) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const today = new Date();
  const daysLeft = differenceInDays(due, today);
  if (daysLeft < 0) return null;
  // Pregnancy is 40 weeks, so current week = 40 - weeksLeft
  const weeksLeft = Math.ceil(daysLeft / 7);
  const currentWeek = 40 - weeksLeft;
  return { currentWeek: Math.max(1, Math.min(40, currentWeek)), weeksLeft, daysLeft };
}

function ProgressRing({ week }) {
  const pct = (week / 40);
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  return (
    <svg width="100" height="100" className="transform -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke="white" strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

function getGreeting(lang, name) {
  const hour = new Date().getHours();
  let greeting;
  if (hour >= 5 && hour < 12) greeting = lang === 'da' ? 'Godmorgen' : 'Good morning';
  else if (hour >= 12 && hour < 17) greeting = lang === 'da' ? 'Godeftermiddag' : 'Good afternoon';
  else if (hour >= 17 && hour < 21) greeting = lang === 'da' ? 'Godaften' : 'Good evening';
  else greeting = lang === 'da' ? 'Godnat' : 'Good night';
  return `${greeting}, ${name} 🤍`;
}

const PREGNANCY_FACTS = {
  da: [
    'Din baby kan nu høre din stemme og genkende den efter fødslen.',
    'Fosteret bevæger sig aktivt og øver vejrtrækning inde i livmoderen.',
    'Dit hjerte pumper op til 50% mere blod end normalt for at forsyne jer begge.',
    'Babyen kan smage det, du spiser, via fostervandet.',
    'Dit barn udvikler sit eget fingeraftryk i denne periode.',
    'Babyen sover og vågner i cyklusser — ligesom du gør.',
    'Hjernen vokser hurtigt og danner millioner af neuroner om dagen.',
    'Babyen kan blinke og har nu øjenvipper og øjenbryn.',
    'Fostertræk og spark styrker musklerne — øvelse til livet udenfor.',
    'Din krop producerer relaxin for at forberede bækkenet til fødslen.',
  ],
  en: [
    'Your baby can now hear your voice and recognize it after birth.',
    'The fetus moves actively and practices breathing inside the womb.',
    'Your heart pumps up to 50% more blood to supply both of you.',
    'Your baby can taste what you eat through the amniotic fluid.',
    'Your child is developing their own fingerprints during this period.',
    'Your baby sleeps and wakes in cycles — just like you do.',
    'The brain grows rapidly, forming millions of neurons per day.',
    'Baby can blink and now has eyelashes and eyebrows.',
    'Kicks and stretches strengthen muscles — practice for life outside.',
    'Your body produces relaxin to prepare the pelvis for birth.',
  ],
};

export default function PregnancyHomeView({ profile, user, posts = [] }) {
  const { t, lang } = useLanguage();
  const todayStr = format(new Date(), "EEEE 'd.' d. MMMM", { locale: lang === 'en' ? enUS : da });
  const displayName = profile?.display_name || user?.full_name || (lang === 'da' ? 'kommende mor' : 'mom-to-be');
  const greeting = getGreeting(lang, displayName);

  const pregnancy = profile?.child_due_date ? getPregnancyWeek(profile.child_due_date) : null;
  const dueDate = profile?.child_due_date ? new Date(profile.child_due_date) : null;
  const dueDateStr = dueDate ? format(dueDate, 'd. MMMM yyyy', { locale: lang === 'en' ? enUS : da }) : null;

  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const facts = PREGNANCY_FACTS[lang] || PREGNANCY_FACTS.da;
  const todayFact = facts[dayOfYear % facts.length];

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] capitalize mb-1.5" style={{ color: 'var(--color-text-muted)' }}>{todayStr}</p>
            <h1 className="text-4xl font-light leading-tight" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{greeting}</h1>
          </div>
          {user && <NotificationBell userEmail={user.email} />}
        </div>
      </div>

      {/* Pregnancy week hero card */}
      {pregnancy && (
        <div className="mx-5 mb-5">
          <div className="rounded-3xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #5C3317 0%, #A0785A 100%)' }}>
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 100, height: 100 }}>
                <ProgressRing week={pregnancy.currentWeek} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-light text-white leading-none" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{pregnancy.currentWeek}</span>
                  <span className="text-white/60 text-[10px] uppercase tracking-widest">{lang === 'da' ? 'uge' : 'week'}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-1">
                  {lang === 'da' ? 'Din graviditet' : 'Your pregnancy'}
                </p>
                <p className="text-white text-lg font-light leading-snug" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                  {lang === 'da' ? `Uge ${pregnancy.currentWeek} af 40` : `Week ${pregnancy.currentWeek} of 40`}
                </p>
                {pregnancy.weeksLeft > 0 ? (
                  <p className="text-white/70 text-sm mt-1">
                    {pregnancy.weeksLeft === 1
                      ? (lang === 'da' ? '1 uge til termin' : '1 week until due')
                      : (lang === 'da' ? `${pregnancy.weeksLeft} uger til termin` : `${pregnancy.weeksLeft} weeks until due`)}
                  </p>
                ) : (
                  <p className="text-white/70 text-sm mt-1">{lang === 'da' ? 'Termin er nær!' : 'Due date is near!'}</p>
                )}
                {dueDateStr && (
                  <p className="text-white/50 text-xs mt-0.5">📅 {dueDateStr}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dagens fakta om graviditeten */}
      <div className="mx-5 mb-5">
        <div className="rounded-2xl p-5 border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--color-text-muted)' }}>
            {lang === 'da' ? 'Vidste du' : 'Did you know'}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '16px', lineHeight: '1.6' }}>
            {todayFact}
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className="mx-5 mb-5 grid grid-cols-2 gap-3">
        <Link to={createPageUrl('Knowledge')} className="rounded-2xl p-4 border flex items-center gap-3 active:opacity-70" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #5C3317 0%, #A0785A 100%)' }}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              {lang === 'da' ? 'Viden' : 'Knowledge'}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {lang === 'da' ? 'Artikler & FAQ' : 'Articles & FAQ'}
            </p>
          </div>
        </Link>
        <Link to={createPageUrl('Calendar')} className="rounded-2xl p-4 border flex items-center gap-3 active:opacity-70" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #5C3317 0%, #A0785A 100%)' }}>
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              {lang === 'da' ? 'Kalender' : 'Calendar'}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {lang === 'da' ? 'Dine aftaler' : 'Your events'}
            </p>
          </div>
        </Link>
      </div>

      {/* Kommende begivenheder */}
      {user && (
        <div className="mx-5 mb-5">
          <UpcomingEventCard userEmail={user.email} fullWidth />
        </div>
      )}

      {/* Relevante blogindlæg */}
      <AIRelevantPosts profile={profile} allPosts={posts} />
    </div>
  );
}