import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '@/components/ui/PullToRefresh';
import PageHeader from '@/components/ui/PageHeader';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MessageCircle, ChevronRight, Lock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import UserAvatar from '@/components/community/UserAvatar';
import { useLanguage } from '@/components/ui/LanguageContext';
import ContentLock from '@/components/subscription/ContentLock';
import { useSubscription } from '@/components/subscription/useSubscription';
import { useActiveProfile } from '@/components/ui/ActiveProfileContext';

export default function ChatList() {
  const queryClient = useQueryClient();
  const { isMom } = useActiveProfile();
  const { t, lang } = useLanguage();
  const { isActive: hasSubscription, loading: subscriptionLoading } = useSubscription();
  const [user, setUser] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch {}
    };
    loadUser();
  }, []);

  const { data: conversations = [], isLoading: loadingChats } = useQuery({
    queryKey: ['conversations', user?.email],
    queryFn: () => base44.entities.ChatConversation.filter(
      { participants: user.email },
      '-last_message_at'
    ),
    enabled: !!user?.email,
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries(['conversations', user?.email]);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <PageHeader title={lang === 'da' ? 'Beskeder' : 'Messages'} backUrl="/Community" />

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

        {/* Chat oversigt */}
        {(isMom || isAdmin) && <div className="space-y-3">
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
    </PullToRefresh>
  );
}