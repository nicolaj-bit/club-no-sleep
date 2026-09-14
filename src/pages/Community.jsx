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

  const { data: unreadData } = useQuery({
    queryKey: ['chatUnread', user?.email],
    queryFn: async () => {
      const res = await base44.functions.invoke('chatApi', { action: 'has_unread' });
      return res.data;
    },
    enabled: !!user?.email,
  });

  const hasUnread = unreadData?.has_unread === true;

  const handleToggleVisibility = async (checked) => {
    setIsVisible(checked);
    if (userProfile) {
      await base44.entities.UserProfile.update(userProfile.id, {
        is_visible: checked,
      });
    }
  };

  const handleStartChat = async (targetUser) => {
    try {
      const res = await base44.functions.invoke('chatApi', {
        action: 'start_conversation',
        target_email: targetUser.user_email,
        target_username: targetUser.username,
        target_image: targetUser.profile_image,
      });
      const conv = res.data?.conversation;
      if (conv) {
        queryClient.invalidateQueries(['chatUnread', user?.email]);
        window.location.href = createPageUrl(`Chat?id=${conv.id}`);
      }
    } catch {}
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries(['lights']);
    await queryClient.invalidateQueries(['conversations', user?.email]);
    await queryClient.invalidateQueries(['chatUnread', user?.email]);
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