import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import PullToRefresh from '@/components/ui/PullToRefresh';
import PageHeader from '@/components/ui/PageHeader';
import { base44 } from '@/api/base44Client';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/components/ui/LanguageContext';

export default function BabyFriendlyCafes() {
  const { t } = useLanguage();
  const [cafeSearchMode, setCafeSearchMode] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [showLocationConsent, setShowLocationConsent] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      base44.entities.UserProfile.filter({ user_email: u.email }).then(profiles => {
        if (profiles[0]?.latitude && profiles[0]?.longitude && profiles[0]?.location_enabled) {
          setUserLocation({ lat: profiles[0].latitude, lng: profiles[0].longitude });
        }
      });
    }).catch(() => {});
  }, []);

  const { data: cafes = [], isLoading: loadingCafes, refetch } = useQuery({
    queryKey: ['cafes'],
    queryFn: () => base44.entities.BabyFriendlyCafe.filter({ is_active: true }),
  });

  const filteredCafes = cafes
    .filter(c => cafeSearchMode === 'area' ? !!c.city : true);

  const doEnableLocation = async () => {
    setShowLocationConsent(false);
    if (!navigator.geolocation) {
      toast.error(t.browserNoLocation);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const approxLat = Math.round(latitude * 100) / 100;
        const approxLon = Math.round(longitude * 100) / 100;
        setUserLocation({ lat: approxLat, lng: approxLon });
        setCafeSearchMode('area');
        toast.success(t.locationActivated);
      },
      () => toast.error(t.locationError)
    );
  };

  const handleCafeAreaSearch = () => {
    if (cafeSearchMode === 'area') {
      setCafeSearchMode('all');
      return;
    }
    if (!userLocation) {
      setShowLocationConsent(true);
      return;
    }
    setCafeSearchMode('area');
  };

  return (
    <PullToRefresh onRefresh={refetch}>
      <Dialog open={showLocationConsent} onOpenChange={setShowLocationConsent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              {t.locationConsentTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t.locationConsentDesc}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.locationConsentNote}</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowLocationConsent(false)}
                className="flex-1 py-3 rounded-xl text-sm font-medium border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                {t.noThanks}
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
        <PageHeader title="Babyvenlige caféer" />

        <div className="p-4 space-y-4">
          {/* Search area button */}
          <div className="rounded-2xl p-4 border flex items-center justify-between" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <div>
              <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Find caféer</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {cafeSearchMode === 'area' && userLocation ? t.showingInArea : 'Alle caféer'}
              </p>
            </div>
            <Button
              size="sm"
              variant={cafeSearchMode === 'area' ? 'default' : 'outline'}
              className="gap-2 rounded-full"
              onClick={handleCafeAreaSearch}
            >
              <MapPin className="w-4 h-4" />
              {cafeSearchMode === 'area' ? t.all : t.searchInMyArea}
            </Button>
          </div>

          {loadingCafes ? (
            <div className="space-y-4">
              {[1, 2].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          ) : filteredCafes.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p style={{ color: 'var(--color-text-muted)' }}>
                {cafeSearchMode === 'area' ? 'Ingen caféer i dit område' : 'Ingen caféer tilgængelige'}
              </p>
              {cafeSearchMode === 'area' && (
                <button className="text-sm text-blue-500 mt-2" onClick={() => setCafeSearchMode('all')}>
                  Vis alle caféer
                </button>
              )}
            </div>
          ) : (
            <>
              {cafeSearchMode === 'all' && (
                <p className="text-xs font-medium uppercase tracking-wide px-1" style={{ color: 'var(--color-text-muted)' }}>
                  Populære caféer
                </p>
              )}
              {filteredCafes.map(cafe => (
                <div key={cafe.id} className="rounded-2xl p-4 border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{cafe.name}</h3>
                  {cafe.city && <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{cafe.city}</p>}
                  {cafe.description && <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>{cafe.description}</p>}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}