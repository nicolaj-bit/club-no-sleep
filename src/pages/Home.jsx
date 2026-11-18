import React, { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { da, enUS } from 'date-fns/locale';
import WonderWeekCard from '@/components/wonderweeks/WonderWeekCard';
import { getAgeInWeeks, getCurrentWonderWeek } from '@/components/wonderweeks/wonderweeksData';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useActiveProfile } from '@/components/ui/ActiveProfileContext';
import { useInviteAccess } from '@/components/auth/InviteAccessContext';
import ChildDevelopmentCard from '@/components/home/ChildDevelopmentCard';
import SleepSummaryCard from '@/components/home/SleepSummaryCard';
import UpcomingEventCard from '@/components/home/UpcomingEventCard';
import SleepAdviceCard from '@/components/home/SleepAdviceCard';
import DailyPersonalMessage from '@/components/home/DailyPersonalMessage';
import NotificationBell from '@/components/ui/NotificationBell';
import PregnancyHomeView from '@/components/home/PregnancyHomeView';
import ActiveMomsCard from '@/components/home/ActiveMomsCard';
import ChildSwitcher from '@/components/children/ChildSwitcher';
import { useActiveChild } from '@/components/ui/ActiveChildContext';
import PullToRefresh from '@/components/ui/PullToRefresh';
import { useAuth } from '@/lib/AuthContext';
import ReactivateSubscriptionBanner from '@/components/subscription/ReactivateSubscriptionBanner';
import CompleteMembershipBanner from '@/components/subscription/CompleteMembershipBanner';
import { useDailyAffirmationIndex } from '@/hooks/useDailyAffirmationIndex';
import BrandLoader from '@/components/ui/BrandLoader';

function getGreeting(lang, name) {
  const hour = new Date().getHours();
  let greeting;
  if (hour >= 6 && hour < 9) {
    greeting = lang === 'da' ? 'Godmorgen' : 'Good morning';
  } else if (hour >= 9 && hour < 12) {
    greeting = lang === 'da' ? 'God formiddag' : 'Good morning';
  } else if (hour >= 12 && hour < 18) {
    greeting = lang === 'da' ? 'God eftermiddag' : 'Good afternoon';
  } else if (hour >= 18 && hour < 23) {
    greeting = lang === 'da' ? 'Godaften' : 'Good evening';
  } else {
    greeting = lang === 'da' ? 'Jeg ser dig' : 'I see you';
  }
  return `${greeting}, ${name} `;
}

export default function Home() {
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();
  const { activeProfile, loading: profileLoading } = useActiveProfile();
  const { activeChild, loading: childLoading } = useActiveChild();
  const { isInvited, permissions } = useInviteAccess();
  const { user, isLoadingAuth } = useAuth();

  const canSeeSleep = !isInvited || permissions?.can_see_sleep_log;
  const canSeeCalendar = !isInvited || permissions?.can_see_calendar;
  const canSeeWonderWeeks = !isInvited || permissions?.can_see_wonder_weeks;
  const canSeeKnowledge = !isInvited || permissions?.can_see_knowledge;

  // Tilbage fra et gennemført køb — bekræft abonnementet hos backend
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('subscription') === 'success') {
      window.history.replaceState({}, '', '/app');
      base44.functions.invoke('verifySubscription', {}).catch(() => {});
    }
  }, []);

  // No onboarding redirect — users complete profile after payment

  const profile = activeProfile;

  // Terminsdato/fødselsdato bor på Child. Findes et aktivt barn, læses BÅDE
  // birthdate og due_date fra det samme barn — aldrig et fra Child og et fra
  // UserProfile, som kan give en umulig kombination (ny terminsdato + gammel,
  // efterladt fødselsdato fra profilen). Kun uden noget Child-data falder vi
  // tilbage til profilen (legacy).
  const childBirthdate = activeChild ? activeChild.birthdate : profile?.child_birthdate;
  const childDueDate = activeChild ? activeChild.due_date : profile?.child_due_date;

  // Kommende forældre: har terminsdato i fremtiden men ikke fødselsdato
  const isExpecting = childDueDate && !childBirthdate && new Date(childDueDate) > new Date();

  const ageInWeeks = getAgeInWeeks(childDueDate, childBirthdate);
  const wonderWeek = ageInWeeks !== null ? getCurrentWonderWeek(ageInWeeks, lang) : null;

  const affirmationIndex = useDailyAffirmationIndex(t.affirmations.length);
  const affirmation = t.affirmations[affirmationIndex] || t.affirmations[0];
  const todayStr = format(new Date(), "EEEE 'd.' d. MMMM", { locale: lang === 'en' ? enUS : da });
  const displayName = profile?.display_name || user?.full_name || (profile?.gender === 'male' ? (lang === 'da' ? 'far' : 'dad') : (lang === 'da' ? 'mor' : 'mom'));
  const greeting = getGreeting(lang, displayName);

  const displayAffirmation = affirmation;

  // Vent til BÅDE profil OG user er loaded før vi beslutter view
  if (profileLoading || childLoading || isLoadingAuth) {
    return (
      <BrandLoader />
    );
  }

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div key={activeChild?.id || 'no-child'} className="min-h-screen pb-28" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="px-5 pb-4" style={{ paddingTop: 'max(24px, env(safe-area-inset-top, 0px))' }}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <ChildSwitcher />
            <h1 className="text-[38px] font-light leading-tight mt-2" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{greeting}</h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {user && <NotificationBell userEmail={user.email} />}
          </div>
        </div>
      </div>

      {/* Terminskort — vises lige efter velkomsthilsen */}
      {isExpecting && <PregnancyHomeView profile={profile} activeChild={activeChild} />}

      {/* Genaktiver abonnement banner — vises kun ved udløbet abonnement (skjules for inviterede) */}
      {user && !isInvited && <div className="mx-5 mb-4"><ReactivateSubscriptionBanner /></div>}

      {/* Færdiggør medlemskab banner — vises hvis bruger sprang betaling over (skjules for inviterede) */}
      {user && !isInvited && <div className="mx-5 mb-4"><CompleteMembershipBanner /></div>}






      {/* Sleep/Diary + Calendar row — vises i begge faser */}
      {user && (
        <div className="mx-5 mb-5 flex gap-3">
          {canSeeSleep && <SleepSummaryCard userEmail={user.email} />}
          {canSeeCalendar && <UpcomingEventCard userEmail={user.email} />}
        </div>
      )}

      {/* Active Moms Card — vises til mor-profiler der ikke er inviterede, i begge faser */}
      {profile?.profile_label === 'mor' && !isInvited && (
        <div className="mx-5 mb-5">
          <ActiveMomsCard />
        </div>
      )}

      {/* Daglig personlig besked — vises i begge faser */}
      {user && profile && <DailyPersonalMessage userEmail={user.email} profile={profile} />}

      {/* Fase-specifikt indhold */}
      {!isExpecting && (
        <>
          {/* Wonder Week Card — kun dashboard (født barn) */}
          {canSeeWonderWeeks && wonderWeek && wonderWeek.status !== 'complete' && (
            <div className="mb-5">
              <WonderWeekCard wonderWeek={wonderWeek} ageInWeeks={ageInWeeks} />
            </div>
          )}

          {/* AI Sleep Advice — kun dashboard (kræver søvnlogs) */}
          {user && !isInvited && <SleepAdviceCard userEmail={user.email} />}
        </>
      )}

      {/* Her lå før en sektion med blogindlæg, som AI'en valgte efter barnets
          alder. Bloggen er fjernet fra appen, og sektionen med den. */}
    </div>
    </PullToRefresh>
  );
}