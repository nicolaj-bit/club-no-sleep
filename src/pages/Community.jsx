import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '@/components/ui/PullToRefresh';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, MessageCircle, Users, Radio, Calendar, ChevronRight } from 'lucide-react';
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
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);

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

  const handleEnableLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Din browser understøtter ikke lokation');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationEnabled(true);
        
        if (userProfile) {
          await base44.entities.UserProfile.update(userProfile.id, {
            latitude,
            longitude,
            location_enabled: true,
          });
        }
        toast.success('Lokation aktiveret');
      },
      (error) => {
        toast.error('Kunne ikke hente lokation');
      }
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

  const handleRefresh = async () => {
    await queryClient.invalidateQueries(['nearbyUsers']);
    await queryClient.invalidateQueries(['conversations', user?.email]);
    await queryClient.invalidateQueries(['experts']);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-3">
        <h1 className="text-xl font-semibold text-slate-900">Community</h1>
      </header>

      <div className="p-4">
        <Tabs defaultValue="nearby" className="w-full">
          <TabsList className="w-full bg-slate-100 p-1 rounded-xl">
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
              Eksperter
            </TabsTrigger>
          </TabsList>

          {/* Nearby Tab */}
          <TabsContent value="nearby" className="mt-4 space-y-4">
            {/* Privacy Settings */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Lokation</p>
                    <p className="text-xs text-slate-500">Find folk i nærheden</p>
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
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <Label htmlFor="visibility" className="text-sm text-slate-600">
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

            {/* Nearby Users */}
            {!locationEnabled ? (
              <div className="text-center py-12">
                <Radio className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Aktiver lokation for at se hvem der er i nærheden</p>
              </div>
            ) : loadingNearby ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
            ) : nearbyUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Ingen brugere i nærheden (20 km)</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">
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
                <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Ingen samtaler endnu</p>
                <p className="text-sm text-slate-400 mt-1">Start en chat med nogen i nærheden</p>
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
                    className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-100"
                  >
                    <UserAvatar 
                      src={otherImage}
                      name={otherName}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900">{otherName}</h3>
                      {conv.last_message && (
                        <p className="text-sm text-slate-500 truncate">{conv.last_message}</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </Link>
                );
              })
            )}
          </TabsContent>

          {/* Experts Tab */}
          <TabsContent value="experts" className="mt-4 space-y-4">
            {loadingExperts ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-48 rounded-2xl" />
                ))}
              </div>
            ) : experts.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Ingen eksperter tilgængelige</p>
              </div>
            ) : (
              experts.map(expert => (
                <ExpertCard key={expert.id} expert={expert} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </PullToRefresh>
  );
}