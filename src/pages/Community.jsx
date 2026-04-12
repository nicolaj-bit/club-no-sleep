import React, { useState, useEffect } from 'react';
import { useScrollDirection } from '@/components/ui/useScrollDirection';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '@/components/ui/PullToRefresh';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, MessageCircle, Users, Radio, Calendar, ChevronRight, Shield, Heart, Lock } from 'lucide-react';
import { useActiveProfile } from '@/components/ui/ActiveProfileContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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

const TABS = [
  { value: 'nearby', icon: Radio, label: 'Nær mig' },
  { value: 'chats', icon: MessageCircle, label: 'Chats' },
  { value: 'experts', icon: Calendar, label: 'Behandlere' },
];

export default function Community() {
  const headerVisible = useScrollDirection();
  const queryClient = useQueryClient();
  const { isMom, activeProfile } = useActiveProfile();
  const [activeTab, setActiveTab] = useState('nearby');
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [expertSearchMode, setExpertSearchMode] = useState('all'); // 'all' | 'area'
  const [expertCategory, setExpertCategory] = useState('all');

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

  const { data: expertCategories = [] } = useQuery({
    queryKey: ['expertCategories'],
    queryFn: () => base44.entities.ExpertCategory.filter({ is_active: true }, 'order'),
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

  const EXPERT_CATEGORIES = [
    { value: 'all', label: 'Alle' },
    ...expertCategories.map(c => ({ value: c.key, label: c.label })),
  ];

  // Filter experts by area and/or category
  const filteredExperts = experts
    .filter(e => expertSearchMode === 'area' ? !!e.city : true)
    .filter(e => expertCategory === 'all' ? true : e.category === expertCategory);

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
        <h1 className="text-2xl font-light" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif', letterSpacing: '0.06em' }}>Community</h1>
      </header>

      <div className="p-4">
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
                  ? { background: 'linear-gradient(135deg, #C8A882, #A0785A)', color: '#fff', boxShadow: '0 2px 12px rgba(160,120,90,0.35)' }
                  : { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
          {/* Om os – direkte link */}
          <Link
            to={createPageUrl('AboutUs')}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
            style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
          >
            <Heart className="w-4 h-4" />
            Om os
          </Link>
        </div>
        </div>
        <div>

          {/* Far-profil blokeringsbesked for community-tabs */}
          {(activeTab === 'nearby' || activeTab === 'chats') && !isMom && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)' }}>
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
                Kun for mødre
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Community-funktionen er forbeholdt mor-profiler. Vores mission er at bekæmpe natteensomhed blandt mødre — et trygt rum kun for dem.
              </p>
              <p className="text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>
                Skift til din mor-profil for at få adgang.
              </p>
            </div>
          )}

          {/* Nearby Tab */}
          {activeTab === 'nearby' && isMom && <div className="space-y-4">
            {/* Privacy Settings */}
            <div className="rounded-xl p-4 border space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                    <MapPin className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Lokation</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Find folk i nærheden</p>
                  </div>
                </div>
                {locationEnabled ? (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                    Aktiv
                  </span>
                ) : (
                  <Button size="sm" onClick={handleEnableLocation}>
                    Aktiver
                  </Button>
                )}
              </div>
              
              {locationEnabled && (
                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <Label htmlFor="visibility" className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Vis mig som synlig for andre
                  </Label>
                  <Switch
                    id="visibility"
                    checked={isVisible}
                    onCheckedChange={handleToggleVisibility}
                  />
                </div>
              )}
            </div>

            {/* Denmark Map */}
            <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
              <div className="px-4 pt-3 pb-2 flex items-center justify-between" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Aktive mødre i Danmark</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {allVisibleUsers.filter(u => u.user_email !== user?.email).length} aktive nu
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {isVisible ? 'Synlig' : 'Skjult'}
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
              <DenmarkMap
                users={allVisibleUsers.filter(u => u.user_email !== user?.email)}
                currentUserLocation={locationEnabled ? userLocation : null}
                onStartChat={handleStartChat}
              />
              <div className="px-4 py-2 flex items-center gap-4 text-xs" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-muted)' }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>Dig</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#C8A882' }} />
                  <span>Andre aktive</span>
                </div>
              </div>
            </div>

            {/* Nearby Users */}
            {!locationEnabled ? (
              <div className="text-center py-12">
                <Radio className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                <p style={{ color: 'var(--color-text-muted)' }}>Aktiver lokation for at se hvem der er i nærheden</p>
              </div>
            ) : loadingNearby ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
            ) : nearbyUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                <p style={{ color: 'var(--color-text-muted)' }}>Ingen brugere i nærheden (20 km)</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {nearbyUsers.length} {nearbyUsers.length === 1 ? 'person' : 'personer'} indenfor 20 km
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
          </div>}

          {/* Chats Tab */}
          {activeTab === 'chats' && isMom && <div className="space-y-3">
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
          </div>}

          {/* Experts Tab */}
          {activeTab === 'experts' && <div className="space-y-4">
            {/* Category pills */}
            <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <div className="flex gap-2 w-max pb-1">
                {EXPERT_CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setExpertCategory(cat.value)}
                    className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
                    style={expertCategory === cat.value
                      ? { background: 'linear-gradient(135deg, #C8A882, #A0785A)', color: '#fff' }
                      : { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

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
          </div>}



        </div>
      </div>
    </div>
    </PullToRefresh>
  );
}