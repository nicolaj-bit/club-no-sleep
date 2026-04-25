import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { da, enUS } from 'date-fns/locale';
import WonderWeekCard from '@/components/wonderweeks/WonderWeekCard';
import { getAgeInWeeks, getCurrentWonderWeek } from '@/components/wonderweeks/wonderweeksData';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useTranslation } from '@/components/hooks/useTranslation';
import { useActiveProfile } from '@/components/ui/ActiveProfileContext';
import ChildDevelopmentCard from '@/components/home/ChildDevelopmentCard';
import SleepSummaryCard from '@/components/home/SleepSummaryCard';
import PregnancyDiaryCard from '@/components/home/PregnancyDiaryCard';
import UpcomingEventCard from '@/components/home/UpcomingEventCard';
import AIRelevantPosts from '@/components/home/AIRelevantPosts';
import SleepAdviceCard from '@/components/home/SleepAdviceCard';
import NotificationBell from '@/components/ui/NotificationBell';
import PregnancyHomeView from '@/components/home/PregnancyHomeView';

function getDailyAffirmationIndex() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return dayOfYear;
}

function getGreeting(lang, name) {
  const hour = new Date().getHours();
  let greeting;
  if (hour >= 5 && hour < 12) {
    greeting = lang === 'da' ? 'Godmorgen' : 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    greeting = lang === 'da' ? 'Godeftermiddag' : 'Good afternoon';
  } else if (hour >= 17 && hour < 21) {
    greeting = lang === 'da' ? 'Godaften' : 'Good evening';
  } else {
    greeting = lang === 'da' ? 'Godnat' : 'Good night';
  }
  return `${greeting}, ${name} 🤍`;
}

export default function Home() {
  const { t, lang } = useLanguage();
  const { activeProfile, loading: profileLoading } = useActiveProfile();
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [, setCurrentTime] = useState(new Date());

  useEffect(() => {
    base44.auth.isAuthenticated().then(isAuth => {
      if (isAuth) {
        base44.auth.me().then(u => { setUser(u); setUserLoading(false); }).catch(() => setUserLoading(false));
      } else {
        setUserLoading(false);
      }
    }).catch(() => setUserLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Redirect to onboarding if no profile exists after loading
  useEffect(() => {
    if (!profileLoading && user && activeProfile === null) {
      window.location.href = createPageUrl('Onboarding');
    }
  }, [profileLoading, user, activeProfile]);

  const { data: posts = [] } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, '-published_date', 20),
  });

  const profile = activeProfile;

  // Kommende forældre: har terminsdato i fremtiden men ikke fødselsdato
  const isExpecting = profile?.child_due_date && !profile?.child_birthdate && new Date(profile.child_due_date) > new Date();

  const ageInWeeks = getAgeInWeeks(profile?.child_due_date, profile?.child_birthdate);
  const wonderWeek = ageInWeeks !== null ? getCurrentWonderWeek(ageInWeeks) : null;

  const affirmationIndex = getDailyAffirmationIndex();
  const affirmation = t.affirmations[affirmationIndex % t.affirmations.length];
  const todayStr = format(new Date(), "EEEE 'd.' d. MMMM", { locale: lang === 'en' ? enUS : da });
  const displayName = profile?.display_name || user?.full_name || (profile?.gender === 'male' ? (lang === 'da' ? 'far' : 'dad') : (lang === 'da' ? 'mor' : 'mom'));
  const greeting = getGreeting(lang, displayName);

  const affirmationItems = useMemo(
    () => (lang === 'da' && affirmation ? [{ text: affirmation }] : []),
    [lang, affirmation]
  );
  const translatedAffirmations = useTranslation(affirmationItems);
  const displayAffirmation = lang === 'da' && translatedAffirmations[0]?.text
    ? translatedAffirmations[0].text
    : affirmation;

  // Vent til BÅDE profil OG user er loaded før vi beslutter view
  if (profileLoading || userLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Graviditetsview: har terminsdato i fremtiden, barnet ikke født endnu
  if (isExpecting) {
    return <PregnancyHomeView profile={profile} user={user} posts={posts} />;
  }

  // Normalt dashboard: barnet er født (child_birthdate sat) ELLER terminsdato er passeret

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

      {/* Daily Affirmation */}
      <div className="mx-5 mb-5">
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #5C3317 0%, #A0785A 100%)' }}
        >

          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/50 mb-3">{t.dailyWord}</p>
          <p className="text-white text-[15px] font-light leading-relaxed relative z-10" style={{ textWrap: 'pretty', fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '17px', lineHeight: '1.55' }}>
            {displayAffirmation}
          </p>
        </div>
      </div>

      {/* Child development age pill */}
      <ChildDevelopmentCard profile={profile} />

      {/* Sleep/Diary + Calendar row */}
      {user && (
        <div className="mx-5 mb-5 flex gap-3">
          {profile?.child_due_date
            ? <PregnancyDiaryCard week={ageInWeeks !== null ? Math.max(1, Math.min(42, 40 - Math.ceil((new Date(profile.child_due_date) - new Date()) / (7 * 86400000)))) : null} />
            : <SleepSummaryCard userEmail={user.email} />}
          <UpcomingEventCard userEmail={user.email} />
        </div>
      )}

      {/* Wonder Week Card */}
      {wonderWeek && wonderWeek.status !== 'complete' && (
        <div className="mb-5">
          <WonderWeekCard wonderWeek={wonderWeek} ageInWeeks={ageInWeeks} />
        </div>
      )}

      {/* AI Sleep Advice — only shown when 5+ logs exist */}
      {user && <SleepAdviceCard userEmail={user.email} />}

      {/* AI-curated blog posts */}
      <AIRelevantPosts profile={profile} allPosts={posts} />
    </div>
  );
}