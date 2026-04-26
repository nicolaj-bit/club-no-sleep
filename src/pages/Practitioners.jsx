import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import PullToRefresh from '@/components/ui/PullToRefresh';
import PageHeader from '@/components/ui/PageHeader';
import { base44 } from '@/api/base44Client';
import { MapPin } from 'lucide-react';
import ExpertCard from '@/components/booking/ExpertCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/components/ui/LanguageContext';

export default function Practitioners() {
  const { t } = useLanguage();
  const [expertSearchMode, setExpertSearchMode] = useState('all');
  const [expertCategory, setExpertCategory] = useState('all');
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

  const { data: experts = [], isLoading: loadingExperts, refetch } = useQuery({
    queryKey: ['experts'],
    queryFn: () => base44.entities.Expert.filter({ is_active: true }),
  });

  const { data: expertCategories = [] } = useQuery({
    queryKey: ['expertCategories'],
    queryFn: () => base44.entities.ExpertCategory.filter({ is_active: true }, 'order'),
  });

  const EXPERT_CATEGORIES = [
    { value: 'all', label: t.all },
    ...expertCategories.map(c => ({ value: c.key, label: c.label })),
  ];

  const filteredExperts = experts
    .filter(e => expertSearchMode === 'area' ? !!e.city : true)
    .filter(e => expertCategory === 'all' ? true : e.category === expertCategory);

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
        setExpertSearchMode('area');
        toast.success(t.locationActivated);
      },
      () => toast.error(t.locationError)
    );
  };

  const handleExpertAreaSearch = () => {
    if (expertSearchMode === 'area') {
      setExpertSearchMode('all');
      return;
    }
    if (!userLocation) {
      setShowLocationConsent(true);
      return;
    }
    setExpertSearchMode('area');
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
        <PageHeader title="Behandlere" />

        <div className="p-4 space-y-4">
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
              <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.findPractitioner}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {expertSearchMode === 'area' && userLocation ? t.showingInArea : t.showingRecommended}
              </p>
            </div>
            <Button
              size="sm"
              variant={expertSearchMode === 'area' ? 'default' : 'outline'}
              className="gap-2 rounded-full"
              onClick={handleExpertAreaSearch}
            >
              <MapPin className="w-4 h-4" />
              {expertSearchMode === 'area' ? t.all : t.searchInMyArea}
            </Button>
          </div>

          {loadingExperts ? (
            <div className="space-y-4">
              {[1, 2].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          ) : filteredExperts.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p style={{ color: 'var(--color-text-muted)' }}>
                {expertSearchMode === 'area' ? t.noExpertsInArea : t.noExpertsAvailable}
              </p>
              {expertSearchMode === 'area' && (
                <button className="text-sm text-blue-500 mt-2" onClick={() => setExpertSearchMode('all')}>
                  {t.showAllExperts}
                </button>
              )}
            </div>
          ) : (
            <>
              {expertSearchMode === 'all' && (
                <p className="text-xs font-medium uppercase tracking-wide px-1" style={{ color: 'var(--color-text-muted)' }}>
                  {t.recommendedPractitioners}
                </p>
              )}
              {filteredExperts.map(expert => (
                <ExpertCard key={expert.id} expert={expert} />
              ))}
            </>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}