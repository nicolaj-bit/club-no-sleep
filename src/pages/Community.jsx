import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '@/components/ui/PullToRefresh';
import PageHeader from '@/components/ui/PageHeader';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MessageCircle, Radio, ChevronRight, Lock } from 'lucide-react';
import { useActiveProfile } from '@/components/ui/ActiveProfileContext';
import { Skeleton } from '@/components/ui/skeleton';
import UserAvatar from '@/components/community/UserAvatar';
import DenmarkMap from '@/components/community/DenmarkMap';
import { useLanguage } from '@/components/ui/LanguageContext';
import ContentLock from '@/components/subscription/ContentLock';
import { useSubscription } from '@/components/subscription/useSubscription';

export default function Community() {
  const queryClient = useQueryClient();
  const { isMom, activeProfile } = useActiveProfile();
  const { t } = useLanguage();
  const { isActive: hasSubscription, loading: subscriptionLoading } = useSubscription();
  const TABS = [
    { value: 'nearby', icon: Radio, label: t.nearMe },
    { value: 'chats', icon: MessageCircle, label: t.chats },
  ];
  const [activeTab, setActiveTab] = useState('nearby');
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);

        const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
        if (profiles.length > 0) {
          setUserProfile(profiles[0]);
          setIsVisible(profiles[0].is_visible !== false);
          if (profiles[0].latitude && profiles[0].longitude) {
            setUserLocation({ lat: profiles[0].latitude, lng: profiles[0].longitude });
          }
        }
      } catch {}
    };
    loadUser();
  }, []);

  const { data: allVisibleUsers = [] } = useQuery({
    queryKey: ['allVisibleUsers'],
    queryFn: () => base44.entities.UserProfile.filter({ is_visible: true, location_enabled: true }),
  });

  const { data: conversations = [], isLoading: loadingChats } = useQuery({
    queryKey: ['conversations', user?.email],
    queryFn: () => base44.entities.ChatConversation.filter(
      { participants: user.email },
      '-last_message_at'
    ),
    enabled: !!user?.email,
  });

  const handleToggleVisibility = async (checked) => {
    setIsVisible(checked);
    if (userProfile) {
      await base44.entities.UserProfile.update(userProfile.id, {
        is_visible: checked,
      });
    }
  };

  const handleStartChat = async (targetUser) => {
    const existing = conversations.find(c =>
      c.participants.includes(targetUser.user_email)
    );

    if (existing) {
      window.location.href = createPageUrl(`Chat?id=${existing.id}`);
      return;
    }

    const conv = await base44.entities.ChatConversation.create({
      participants: [user.email, targetUser.user_email],
      participant_usernames: [userProfile?.username || user.full_name, targetUser.username],
      participant_images: [userProfile?.profile_image, targetUser.profile_image],
    });

    window.location.href = createPageUrl(`Chat?id=${conv.id}`);
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries(['allVisibleUsers']);
    await queryClient.invalidateQueries(['conversations', user?.email]);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <PageHeader title="Et lys i mørket" />

      <div className="p-4 flex-1 flex flex-col">
        {/* Pill tab navigation */}
        <div className="overflow-x-auto mb-4" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-2 w-max">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
                style={isActive
                  ? { background: 'var(--color-primary)', color: 'var(--color-primary-foreground)', boxShadow: '0 2px 12px rgba(160,120,90,0.35)' }
                  : { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
        </div>
        <div className="flex-1">
          <ContentLock locked={!hasSubscription} loading={subscriptionLoading} blurHeight="400px">
          {/* Far-profil blokeringsbesked for community-tabs */}
          {(activeTab === 'nearby' || activeTab === 'chats') && !isMom && !isAdmin && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ background: 'var(--color-primary)' }}>
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
                {t.onlyForMoms}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {t.onlyForMomsDesc}
              </p>
              <p className="text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>
                {t.switchToMomProfile}
              </p>
            </div>
          )}

          {/* Nearby Tab — kortet fylder hele området */}
          {activeTab === 'nearby' && (isMom || isAdmin) && (
            <div style={{ height: 'calc(100dvh - 200px)', minHeight: 320 }}>
              <DenmarkMap
                users={allVisibleUsers.filter(u => u.user_email !== user?.email)}
                currentUserLocation={userLocation}
                onStartChat={handleStartChat}
                isVisible={isVisible}
                onToggleVisibility={handleToggleVisibility}
              />
            </div>
          )}

          {/* Chats Tab */}
          {activeTab === 'chats' && (isMom || isAdmin) && <div className="space-y-3">
            {loadingChats ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                <p style={{ color: 'var(--color-text-muted)' }}>{t.noConversations}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{t.startChatNearby}</p>
              </div>
            ) : (
              conversations.map(conv => {
                const otherIndex = conv.participants?.findIndex(p => p !== user?.email) || 0;
                const otherName = conv.participant_usernames?.[otherIndex] || t.unknown;
                const otherImage = conv.participant_images?.[otherIndex];

                return (
                  <Link
                    key={conv.id}
                    to={createPageUrl(`Chat?id=${conv.id}`)}
                    className="flex items-center gap-3 rounded-xl p-4 border"
                    style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                  >
                    <UserAvatar
                      src={otherImage}
                      name={otherName}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{otherName}</h3>
                      {conv.last_message && (
                        <p className="text-sm truncate" style={{ color: 'var(--color-text-muted)' }}>{conv.last_message}</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                  </Link>
                );
              })
            )}
          </div>}
          </ContentLock>
        </div>
      </div>
    </div>
    </PullToRefresh>
  );
}