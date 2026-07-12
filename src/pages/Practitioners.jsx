import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '@/components/ui/PullToRefresh';
import PageHeader from '@/components/ui/PageHeader';
import { base44 } from '@/api/base44Client';
import { MapPin, Instagram, Lightbulb, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/components/ui/LanguageContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ContentLock from '@/components/subscription/ContentLock';
import { useSubscription } from '@/components/subscription/useSubscription';

function getMapsUrl(address) {
  const query = encodeURIComponent(address);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    return `https://maps.apple.com/?q=${query}`;
  }
  return `https://maps.google.com/?q=${query}`;
}

export default function Practitioners() {
  const { t } = useLanguage();
  const { isActive: hasSubscription, loading: subscriptionLoading } = useSubscription();
  const [searchMode, setSearchMode] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [showLocationConsent, setShowLocationConsent] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({ name: '', title: '', city: '', address: '', instagram: '', website: '' });
  const [showTipForm, setShowTipForm] = useState(false);
  const [tipData, setTipData] = useState({ practitionerInfo: '', whyGood: '' });
  const [tipSending, setTipSending] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => {
      setIsAdmin(u?.role === 'admin');
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

  const addExpertMutation = useMutation({
    mutationFn: (expertData) => base44.entities.Expert.create({ ...expertData, is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] });
      setShowAddForm(false);
      setFormData({ name: '', title: '', city: '', address: '', instagram: '', website: '' });
      toast.success('Behandler tilføjet! ✓');
    },
    onError: () => toast.error('Kunne ikke tilføje behandler'),
  });

  const filteredExperts = experts
    .filter(e => searchMode === 'area' ? !!e.city : true);

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
        setSearchMode('area');
        toast.success(t.locationActivated);
      },
      () => toast.error(t.locationError)
    );
  };

  const handleAreaSearch = () => {
    if (searchMode === 'area') {
      setSearchMode('all');
      return;
    }
    if (!userLocation) {
      setShowLocationConsent(true);
      return;
    }
    setSearchMode('area');
  };

  const handleSendTip = async () => {
    if (!tipData.practitionerInfo.trim()) {
      toast.error('Udfyld venligst behandlerens info');
      return;
    }
    setTipSending(true);
    await base44.functions.invoke('sendContactEmail', {
      name: 'App bruger',
      email: 'tip@lalatoto.dk',
      message: `Behandler info:\n${tipData.practitionerInfo}\n\nHvorfor god:\n${tipData.whyGood || '(ikke udfyldt)'}`,
    });
    await base44.entities.AppNotification.create({
      title: '👨‍⚕️ Ny behandler-anbefaling',
      message: `Behandler info: ${tipData.practitionerInfo}${tipData.whyGood ? ` — ${tipData.whyGood}` : ''}`,
      emoji: '👨‍⚕️',
    });
    setTipSending(false);
    setTipData({ practitionerInfo: '', whyGood: '' });
    setShowTipForm(false);
    toast.success('Tak for dit tip! Vi kigger på det 🙏');
  };

  const handleAddExpert = () => {
    if (!formData.name.trim()) {
      toast.error('Navn er påkrævet');
      return;
    }
    addExpertMutation.mutate(formData);
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
          {/* Intro tekst */}
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Vi har samlet en række mor og barn behandlere. Fælles for dem alle er, at de er anbefalet af JER. Vi tilføjer kun behandlere til listen, som er direkte anbefalet af vores brugere og følgere. For det er SÅ vigtigt at blive mødt af omsorg, forståelse og høj faglighed, når man er allermest sårbar.
          </p>

          {/* Tip os om en behandler */}
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
            <button
              className="w-full flex items-center justify-between p-4"
              onClick={() => setShowTipForm(!showTipForm)}
              style={{ backgroundColor: 'var(--color-primary)', borderRadius: '1rem' }}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" style={{ color: 'var(--color-primary-foreground)' }} />
                <span className="font-medium text-sm" style={{ color: 'var(--color-primary-foreground)' }}>Kan du anbefale en behandler?</span>
              </div>
              {showTipForm ? (
                <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-primary-foreground)' }} />
              ) : (
                <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-primary-foreground)' }} />
              )}
            </button>

            {showTipForm && (
              <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-xs pt-3" style={{ color: 'var(--color-text-muted)' }}>
                  Tips os om en god behandler, så kigger vi på det og tilføjer den til listen 💛
                </p>
                <Textarea
                  placeholder="Behandlers info — navn, speciale, telefon og adresse"
                  value={tipData.practitionerInfo}
                  onChange={(e) => setTipData({ ...tipData, practitionerInfo: e.target.value })}
                  className="min-h-20"
                />
                <Textarea
                  placeholder="Hvorfor er denne behandler god?"
                  value={tipData.whyGood}
                  onChange={(e) => setTipData({ ...tipData, whyGood: e.target.value })}
                  className="min-h-20"
                />
                <Button
                  className="w-full"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
                  onClick={handleSendTip}
                  disabled={tipSending}
                >
                  {tipSending ? 'Sender...' : 'Send tip'}
                </Button>
              </div>
            )}
          </div>

          {/* Admin add button */}
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full gap-2 text-sm font-medium underline py-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {showAddForm ? 'Skjul formular' : '+ Tilføj behandler (admin)'}
            </button>
          )}

          {/* Add expert form */}
          {showAddForm && isAdmin && (
            <div className="rounded-2xl p-4 border space-y-3" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <Input
                placeholder="Navn *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                placeholder="Speciale"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Input
                placeholder="Adresse"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <Input
                placeholder="By"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <Input
                placeholder="Instagram (fx https://instagram.com/navn)"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              />
              <Input
                placeholder="Hjemmeside"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddForm(false)}
                >
                  Annuller
                </Button>
                <Button
                  className="flex-1"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
                  onClick={handleAddExpert}
                  disabled={addExpertMutation.isPending}
                >
                  {addExpertMutation.isPending ? 'Tilføjer...' : 'Tilføj'}
                </Button>
              </div>
            </div>
          )}

          <ContentLock locked={!hasSubscription} loading={subscriptionLoading} blurHeight="400px">
            {/* Search area button */}
            <div className="rounded-2xl p-4 border flex items-center justify-between" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div>
                <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Find behandlere</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {searchMode === 'area' && userLocation ? t.showingInArea : 'Alle behandlere'}
                </p>
              </div>
              <Button
                size="sm"
                variant={searchMode === 'area' ? 'default' : 'outline'}
                className="gap-2 rounded-full"
                onClick={handleAreaSearch}
              >
                <MapPin className="w-4 h-4" />
                {searchMode === 'area' ? t.all : t.searchInMyArea}
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
                  {searchMode === 'area' ? 'Ingen behandlere i dit område' : 'Ingen behandlere tilgængelige'}
                </p>
                {searchMode === 'area' && (
                  <button className="text-sm text-blue-500 mt-2" onClick={() => setSearchMode('all')}>
                    Vis alle behandlere
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className="text-xs font-medium uppercase tracking-wide px-1" style={{ color: 'var(--color-text-muted)' }}>
                  Anbefalede af brugerne
                </p>
                <div className="space-y-3">
                  {filteredExperts.map(expert => (
                    <div key={expert.id} className="rounded-2xl p-4 border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                      <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{expert.name}</h3>
                      {expert.title && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{expert.title}</p>
                      )}
                      {expert.address && (
                        <a
                          href={getMapsUrl(expert.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs mt-1.5 w-fit"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          {expert.address}
                        </a>
                      )}
                      {!expert.address && expert.city && <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{expert.city}</p>}
                      {expert.bio && <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>{expert.bio}</p>}
                      {(expert.instagram || expert.website) && (
                        <div className="flex gap-3 mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                          {expert.instagram && (
                            <a
                              href={expert.instagram.startsWith('http') ? expert.instagram : `https://instagram.com/${expert.instagram}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs font-medium"
                              style={{ color: 'var(--color-accent)' }}
                            >
                              <Instagram className="w-4 h-4" />
                              Instagram
                            </a>
                          )}
                          {expert.website && (
                            <a
                              href={expert.website.startsWith('http') ? expert.website : `https://${expert.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs font-medium"
                              style={{ color: 'var(--color-accent)' }}
                            >
                              <Globe className="w-4 h-4" />
                              Webside
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </ContentLock>
        </div>
      </div>
    </PullToRefresh>
  );
}