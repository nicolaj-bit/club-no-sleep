import React, { useState, useEffect } from 'react';
import { useScrollDirection } from '@/components/ui/useScrollDirection';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '@/components/ui/PullToRefresh';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, MessageCircle, Users, Radio, Calendar, ChevronRight, Shield, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserAvatar from '@/components/community/UserAvatar';
import NearbyUserCard from '@/components/community/NearbyUserCard';
import ExpertCard from '@/components/booking/ExpertCard';
import DenmarkMap from '@/components/community/DenmarkMap';
import { toast } from 'sonner';

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function Community() {
  const headerVisible = useScrollDirection();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [expertSearchMode, setExpertSearchMode] = useState('all'); // 'all' | 'area'

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        
        // Load user profile
        const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
        if (profiles.length > 0) {
          setUserProfile(profiles[0]);
          setIsVisible(profiles[0].is_visible !== false);
          setLocationEnabled(!!profiles[0].location_enabled);
          if (profiles[0].latitude && profiles[0].longitude) {
            setUserLocation({ lat: profiles[0].latitude, lng: profiles[0].longitude });
          }
        }
      } catch {}
    };
    loadUser();
  }, []);

  const { data: nearbyUsers = [], isLoading: loadingNearby } = useQuery({
    queryKey: ['nearbyUsers', userLocation?.lat, userLocation?.lng],
    queryFn: async () => {
      if (!userLocation) return [];
      const profiles = await base44.entities.UserProfile.filter({ 
        is_visible: true,
        location_enabled: true
      });
      
      return profiles
        .filter(p => p.user_email !== user?.email && p.latitude && p.longitude)
        .map(p => ({
          ...p,
          distance: calculateDistance(userLocation.lat, userLocation.lng, p.latitude, p.longitude)
        }))
        .filter(p => p.distance <= 20) // 20km radius
        .sort((a, b) => a.distance - b.distance);
    },
    enabled: !!userLocation && locationEnabled,
  });

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

  const { data: experts = [], isLoading: loadingExperts } = useQuery({
    queryKey: ['experts'],
    queryFn: () => base44.entities.Expert.filter({ is_active: true }),
  });

  const [showLocationConsent, setShowLocationConsent] = useState(false);

  const handleEnableLocation = () => {
    // Vis consent-dialog INDEN OS-tilladelse anmodes
    setShowLocationConsent(true);
  };

  const doEnableLocation = async () => {
    setShowLocationConsent(false);
    if (!navigator.geolocation) {
      toast.error('Din browser understøtter ikke lokation');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Gem kun afrundet (ca. 1 km præcision) – aldrig eksakt GPS
        const approxLat = Math.round(latitude * 100) / 100;
        const approxLon = Math.round(longitude * 100) / 100;
        setUserLocation({ lat: approxLat, lng: approxLon });
        setLocationEnabled(true);
        if (userProfile) {
          await base44.entities.UserProfile.update(userProfile.id, {
            latitude: approxLat,
            longitude: approxLon,
            location_enabled: true,
          });
        }
        toast.success('Lokation aktiveret');
      },
      () => toast.error('Kunne ikke hente lokation')
    );
  };

  const handleToggleVisibility = async (checked) => {
    setIsVisible(checked);
    if (userProfile) {
      await base44.entities.UserProfile.update(userProfile.id, {
        is_visible: checked,
      });
    }
  };

  const handleStartChat = async (targetUser) => {
    // Check for existing conversation
    const existing = conversations.find(c => 
      c.participants.includes(targetUser.user_email)
    );
    
    if (existing) {
      window.location.href = createPageUrl(`Chat?id=${existing.id}`);
      return;
    }

    // Create new conversation
    const conv = await base44.entities.ChatConversation.create({
      participants: [user.email, targetUser.user_email],
      participant_usernames: [userProfile?.username || user.full_name, targetUser.username],
      participant_images: [userProfile?.profile_image, targetUser.profile_image],
    });
    
    window.location.href = createPageUrl(`Chat?id=${conv.id}`);
  };

  const handleExpertAreaSearch = () => {
    if (expertSearchMode === 'area') {
      setExpertSearchMode('all');
      return;
    }
    if (!userLocation) {
      // Show same consent dialog before requesting location
      setShowLocationConsent(true);
      // After consent is granted (doEnableLocation), user can tap the button again
      return;
    }
    setExpertSearchMode('area');
  };

  // Filter experts by area (city match) or show all
  const filteredExperts = expertSearchMode === 'area'
    ? experts.filter(e => e.city) // In area mode, show experts that have a city listed
    : experts;

  const handleRefresh = async () => {
    await queryClient.invalidateQueries(['nearbyUsers']);
    await queryClient.invalidateQueries(['conversations', user?.email]);
    await queryClient.invalidateQueries(['experts']);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    {/* Location consent dialog */}
    <Dialog open={showLocationConsent} onOpenChange={setShowLocationConsent}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            Brug af lokation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Aktiver lokation for at opdage mødre i nærheden, der også er vågne. <strong>Din præcise lokation deles aldrig med andre brugere</strong> — kun en omtrentlig afstand vises (fx "2 km væk").
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Lokation bruges udelukkende til at finde brugere i nærheden. Du kan til enhver tid deaktivere det igen under indstillinger.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowLocationConsent(false)}
              className="flex-1 py-3 rounded-xl text-sm font-medium border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              Nej tak
            </button>
            <button
              onClick={doEnableLocation}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Aktiver lokation
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b px-4 py-3 transition-transform duration-300"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
          transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Community</h1>
      </header>

      <div className="p-4">
        <Tabs defaultValue="nearby" className="w-full">
          <TabsList className="w-full p-1 rounded-xl" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <TabsTrigger value="nearby" className="flex-1 rounded-lg gap-1.5">
              <Radio className="w-4 h-4" />
              Nær mig
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex-1 rounded-lg gap-1.5">
              <MessageCircle className="w-4 h-4" />
              Chats
            </TabsTrigger>
            <TabsTrigger value="experts" className="flex-1 rounded-lg gap-1.5">
              <Calendar className="w-4 h-4" />
              Behandlere
            </TabsTrigger>
            <TabsTrigger value="about" className="flex-1 rounded-lg gap-1.5">
              <Heart className="w-4 h-4" />
              Om os
            </TabsTrigger>
          </TabsList>

          {/* Nearby Tab */}
          <TabsContent value="nearby" className="mt-5 space-y-5">

            {/* Map card */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
              <DenmarkMap
                users={allVisibleUsers.filter(u => u.user_email !== user?.email)}
                currentUserLocation={locationEnabled && isVisible ? userLocation : null}
                onStartChat={handleStartChat}
              />
              {/* Map footer: legend + visibility toggle */}
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span>Dig</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{allVisibleUsers.filter(u => u.user_email !== user?.email).length} aktive</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {isVisible && locationEnabled ? 'Synlig' : 'Skjult'}
                  </span>
                  <Switch
                    checked={isVisible && locationEnabled}
                    onCheckedChange={async (checked) => {
                      if (checked && !locationEnabled) {
                        await handleEnableLocation();
                      } else {
                        handleToggleVisibility(checked);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Nearby users list */}
            {!locationEnabled ? (
              <div className="rounded-2xl px-5 py-10 text-center" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                  <MapPin className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <p className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Find mødre i nærheden</p>
                <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>Del din omtrentlige lokation for at opdage andre vågne forældre</p>
                <button
                  onClick={handleEnableLocation}
                  className="px-6 py-2.5 rounded-full text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)' }}
                >
                  Aktiver lokation
                </button>
              </div>
            ) : loadingNearby ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
              </div>
            ) : nearbyUsers.length === 0 ? (
              <div className="rounded-2xl px-5 py-10 text-center" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                  <Users className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <p className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Ingen i nærheden endnu</p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Ingen inden for 20 km er online lige nu</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide px-1" style={{ color: 'var(--color-text-muted)' }}>
                  {nearbyUsers.length} {nearbyUsers.length === 1 ? 'person' : 'personer'} inden for 20 km
                </p>
                {nearbyUsers.map(nearbyUser => (
                  <NearbyUserCard
                    key={nearbyUser.id}
                    user={nearbyUser}
                    distance={nearbyUser.distance}
                    onStartChat={handleStartChat}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Chats Tab */}
          <TabsContent value="chats" className="mt-4 space-y-3">
            {loadingChats ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                <p style={{ color: 'var(--color-text-muted)' }}>Ingen samtaler endnu</p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Start en chat med nogen i nærheden</p>
              </div>
            ) : (
              conversations.map(conv => {
                const otherIndex = conv.participants?.findIndex(p => p !== user?.email) || 0;
                const otherName = conv.participant_usernames?.[otherIndex] || 'Ukendt';
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
          </TabsContent>

          {/* Experts Tab */}
          <TabsContent value="experts" className="mt-4 space-y-4">
            {/* Search area button */}
            <div className="rounded-2xl p-4 border flex items-center justify-between" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div>
                <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Find behandler</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {expertSearchMode === 'area' && userLocation
                    ? `Viser eksperter i dit område`
                    : 'Viser anbefalede behandlere'}
                </p>
              </div>
              <Button
                size="sm"
                variant={expertSearchMode === 'area' ? 'default' : 'outline'}
                className="gap-2 rounded-full"
                onClick={handleExpertAreaSearch}
              >
                <MapPin className="w-4 h-4" />
                {expertSearchMode === 'area' ? 'Alle' : 'Søg i mit område'}
              </Button>
            </div>

            {loadingExperts ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-48 rounded-2xl" />
                ))}
              </div>
            ) : filteredExperts.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                <p style={{ color: 'var(--color-text-muted)' }}>
                  {expertSearchMode === 'area'
                    ? 'Ingen eksperter fundet i dit område'
                    : 'Ingen eksperter tilgængelige'}
                </p>
                {expertSearchMode === 'area' && (
                  <button
                    className="text-sm text-blue-500 mt-2"
                    onClick={() => setExpertSearchMode('all')}
                  >
                    Vis alle eksperter
                  </button>
                )}
              </div>
            ) : (
              <>
                {expertSearchMode === 'all' && (
                  <p className="text-xs font-medium uppercase tracking-wide px-1" style={{ color: 'var(--color-text-muted)' }}>
                    Anbefalede behandlere
                  </p>
                )}
                {filteredExperts.map(expert => (
                  <ExpertCard key={expert.id} expert={expert} />
                ))}
              </>
            )}
          </TabsContent>
          {/* About Tab */}
          <TabsContent value="about" className="mt-4">
            <Link
              to={createPageUrl('AboutUs')}
              className="flex items-center gap-4 rounded-2xl p-5 border active:opacity-70 transition-opacity"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)' }}>
                🧡
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-0.5" style={{ color: 'var(--color-text-primary)' }}>Mød familien bag LALATOTO</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Lær Sara & Nicolaj at kende, og send os en besked</p>
              </div>
              <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
            </Link>
          </TabsContent>

        </Tabs>
      </div>
    </div>
    </PullToRefresh>
  );
}