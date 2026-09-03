import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '@/components/ui/PullToRefresh';
import PageHeader from '@/components/ui/PageHeader';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MessageCircle, Lock } from 'lucide-react';
import { useActiveProfile } from '@/components/ui/ActiveProfileContext';
import DenmarkMap from '@/components/community/DenmarkMap';
import { useLanguage } from '@/components/ui/LanguageContext';
import ContentLock from '@/components/subscription/ContentLock';
import { useSubscription } from '@/components/subscription/useSubscription';

export default function Community() {
  const queryClient = useQueryClient();
  const { isMom } = useActiveProfile();
  const { t } = useLanguage();
  const { isActive: hasSubscription, loading: subscriptionLoading } = useSubscription();
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

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', user?.email],
    queryFn: () => base44.entities.ChatConversation.filter(
      { participants: user.email },
      '-last_message_at'
    ),
    enabled: !!user?.email,
  });

  const { data: unreadMessages = [] } = useQuery({
    queryKey: ['unreadMessages', user?.email],
    queryFn: async () => {
      const msgs = await base44.entities.ChatMessage.filter({ is_read: false });
      return msgs.filter(m => m.sender_email !== user?.email);
    },
    enabled: !!user?.email,
  });

  const hasUnread = unreadMessages.length > 0;

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
    await queryClient.invalidateQueries(['unreadMessages', user?.email]);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <PageHeader
        title="Et lys i mørket"
        rightAction={
          <Link to={createPageUrl('ChatList')} className="relative p-2 rounded-full active:opacity-60" style={{ color: 'var(--color-text-secondary)' }}>
            <MessageCircle className="w-5 h-5" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
            )}
          </Link>
        }
      />

      <div className="p-4 flex-1">
        <ContentLock locked={!hasSubscription} loading={subscriptionLoading} blurHeight="400px">
        {/* Far-profil blokeringsbesked */}
        {!isMom && !isAdmin && (
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

        {/* Kortet fylder hele området */}
        {(isMom || isAdmin) && (
          <div style={{ height: 'calc(100dvh - 160px)', minHeight: 320 }}>
            <DenmarkMap
              users={allVisibleUsers.filter(u => u.user_email !== user?.email)}
              currentUserLocation={userLocation}
              onStartChat={handleStartChat}
              isVisible={isVisible}
              onToggleVisibility={handleToggleVisibility}
            />
          </div>
        )}
        </ContentLock>
      </div>
    </div>
    </PullToRefresh>
  );
}