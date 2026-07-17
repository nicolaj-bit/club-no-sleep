import React, { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { da, enUS } from 'date-fns/locale';
import WonderWeekCard from '@/components/wonderweeks/WonderWeekCard';
import { getAgeInWeeks, getCurrentWonderWeek } from '@/components/wonderweeks/wonderweeksData';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useTranslation } from '@/components/hooks/useTranslation';
import { useActiveProfile } from '@/components/ui/ActiveProfileContext';
import ChildDevelopmentCard from '@/components/home/ChildDevelopmentCard';
import SleepSummaryCard from '@/components/home/SleepSummaryCard';
import UpcomingEventCard from '@/components/home/UpcomingEventCard';
import AIRelevantPosts from '@/components/home/AIRelevantPosts';
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

function getDailyAffirmationIndex() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return dayOfYear;
}

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
  const { user, isLoadingAuth } = useAuth();

  // Handle return from Stripe checkout — trigger subscription verification
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('subscription') === 'success') {
      window.history.replaceState({}, '', '/app');
      base44.functions.invoke('verifySubscription', {}).catch(() => {});
    }
  }, []);

  // No onboarding redirect — users complete profile after payment

  const { data: posts = [] } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, '-published_date', 20),
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  const profile = activeProfile;

  // Brug aktivt barn hvis det findes, ellers fald tilbage til profil
  const childBirthdate = activeChild?.birthdate || profile?.child_birthdate;
  const childDueDate = activeChild?.due_date || profile?.child_due_date;

  // Kommende forældre: har terminsdato i fremtiden men ikke fødselsdato
  const isExpecting = childDueDate && !childBirthdate && new Date(childDueDate) > new Date();

  const ageInWeeks = getAgeInWeeks(childDueDate, childBirthdate);
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
  if (profileLoading || childLoading || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
  };

  // Graviditetsview: har terminsdato i fremtiden, barnet ikke født endnu
  if (isExpecting) {
    return (
      <PullToRefresh onRefresh={handleRefresh}>
        <PregnancyHomeView profile={profile} user={user} posts={posts} activeChild={activeChild} />
      </PullToRefresh>
    );
  }

  // Normalt dashboard: barnet er født (child_birthdate sat) ELLER terminsdato er passeret

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div key={activeChild?.id || 'no-child'} className="min-h-screen pb-28" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
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

      {/* Genaktiver abonnement banner — vises kun ved udløbet abonnement */}
      {user && <div className="mx-5 mb-4"><ReactivateSubscriptionBanner /></div>}

      {/* Færdiggør medlemskab banner — vises hvis bruger sprang betaling over */}
      {user && <div className="mx-5 mb-4"><CompleteMembershipBanner /></div>}

      {/* Færdiggør profil banner — kun hvis ingen profil */}
      {user && !profile && (
        <div className="mx-5 mb-4">
          <Link
            to="/Profile"
            className="flex items-center gap-3 rounded-2xl px-4 py-3.5 active:opacity-80 transition-opacity"
            style={{ background: 'var(--color-primary)', boxShadow: '0 2px 12px rgba(160,120,80,0.25)' }}
          >
            <span className="text-2xl">✨</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white leading-tight">Færdiggør din profil</p>
              <p className="text-xs text-white/75 mt-0.5">Det tager kun 2 minutter →</p>
            </div>
          </Link>
        </div>
      )}





      {/* Daglig personlig besked */}
      {user && profile && <DailyPersonalMessage userEmail={user.email} profile={profile} />}

      {/* Sleep/Diary + Calendar row */}
      {user && (
        <div className="mx-5 mb-5 flex gap-3">
          <SleepSummaryCard userEmail={user.email} />
          <UpcomingEventCard userEmail={user.email} />
        </div>
      )}

      {/* Active Moms Card — kun for mor-profiler */}
      {profile?.profile_label === 'mor' && (
        <div className="mx-5 mb-5">
          <ActiveMomsCard />
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

      {/* AI-curated blog posts — skjules for gæster */}
      {user && Array.isArray(posts) && <AIRelevantPosts profile={profile} allPosts={posts} />}
    </div>
    </PullToRefresh>
  );
}