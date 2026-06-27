import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '@/components/ui/PullToRefresh';
import PageHeader from '@/components/ui/PageHeader';
import { base44 } from '@/api/base44Client';
import { MapPin, Plus, Instagram, Facebook, Lightbulb, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/components/ui/LanguageContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

function getMapsUrl(address) {
  const query = encodeURIComponent(address);
  // "geo:" åbner brugerens valgte kort-app på Android.
  // På iOS er der ingen universel "vælg kort-app" standard —
  // Apple Maps er default, men vi bruger maps.apple.com som fallback
  // så iOS spørger brugeren hvis de har Google Maps installeret.
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    return `https://maps.apple.com/?q=${query}`;
  }
  return `https://maps.google.com/?q=${query}`;
}

export default function BabyFriendlyCafes() {
  const { t } = useLanguage();
  const [cafeSearchMode, setCafeSearchMode] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [showLocationConsent, setShowLocationConsent] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', city: '', address: '', phone: '', website: '', instagram: '', facebook: '' });
  const [showTipForm, setShowTipForm] = useState(false);
  const [tipData, setTipData] = useState({ cafeInfo: '', whyGood: '' });
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

  const { data: cafes = [], isLoading: loadingCafes, refetch } = useQuery({
    queryKey: ['cafes'],
    queryFn: () => isAdmin ? base44.entities.BabyFriendlyCafe.list() : base44.entities.BabyFriendlyCafe.filter({ is_active: true }),
  });

  const addCafeMutation = useMutation({
    mutationFn: (cafeData) => base44.entities.BabyFriendlyCafe.create(cafeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cafes'] });
      setShowAddForm(false);
      setFormData({ name: '', description: '', city: '', address: '', phone: '', website: '', instagram: '', facebook: '' });
      toast.success('Café tilføjet! ✓');
    },
    onError: () => toast.error('Kunne ikke tilføje café'),
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

  const handleSendTip = async () => {
    if (!tipData.cafeInfo.trim()) {
      toast.error('Udfyld venligst caféens info');
      return;
    }
    setTipSending(true);
    // Send email til admin
    await base44.functions.invoke('sendContactEmail', {
      name: 'App bruger',
      email: 'tip@lalatoto.dk',
      message: `Café info:\n${tipData.cafeInfo}\n\nHvorfor god:\n${tipData.whyGood || '(ikke udfyldt)'}`,
    });
    // Opret in-app notifikation til admins
    await base44.entities.AppNotification.create({
      title: '☕ Ny café-anbefaling',
      message: `Café info: ${tipData.cafeInfo}${tipData.whyGood ? ` — ${tipData.whyGood}` : ''}`,
      emoji: '☕',
    });
    setTipSending(false);
    setTipData({ cafeInfo: '', whyGood: '' });
    setShowTipForm(false);
    toast.success('Tak for dit tip! Vi kigger på det 🙏');
  };

  const handleAddCafe = () => {
    if (!formData.name.trim()) {
      toast.error('Navn er påkrævet');
      return;
    }
    addCafeMutation.mutate(formData);
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
          {/* Intro tekst */}
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Nogle dage har man bare brug for at komme væk hjemmefra og drikke en kop kaffe, man ikke selv har lavet.
            Vi har samlet en række babyvenlige caféer, som alle er anbefalet af mødre selv. Steder hvor der er plads til babylyde, amning, krummer på gulvet og alt hvad der ellers følger med livet med en baby.
          </p>

          {/* Tip os om en café */}
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
            <button
              className="w-full flex items-center justify-between p-4"
              onClick={() => setShowTipForm(!showTipForm)}
              style={{ backgroundColor: 'var(--color-primary)', borderRadius: '1rem' }}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" style={{ color: '#fff' }} />
                <span className="font-medium text-sm" style={{ color: '#fff' }}>Kender du en god café?</span>
              </div>
              {showTipForm ? (
                <ChevronUp className="w-4 h-4" style={{ color: '#fff' }} />
              ) : (
                <ChevronDown className="w-4 h-4" style={{ color: '#fff' }} />
              )}
            </button>

            {showTipForm && (
              <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-xs pt-3" style={{ color: 'var(--color-text-muted)' }}>
                  Fortæl os, hvis du kender en babyvenlig café, så vi kan tilføje den til listen. Jo flere jo bedre!
                </p>
                <Textarea
                  placeholder="Caféens navn og hjemmeside eller Instagram profil"
                  value={tipData.cafeInfo}
                  onChange={(e) => setTipData({ ...tipData, cafeInfo: e.target.value })}
                  className="min-h-20"
                />
                <Textarea
                  placeholder="Hvad kan du særligt godt lide ved netop dette sted?"
                  value={tipData.whyGood}
                  onChange={(e) => setTipData({ ...tipData, whyGood: e.target.value })}
                  className="min-h-20"
                />
                <Button
                  className="w-full"
                  style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
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
              {showAddForm ? 'Skjul formular' : '+ Tilføj café (admin)'}
            </button>
          )}

          {/* Add cafe form */}
          {showAddForm && isAdmin && (
            <div className="rounded-2xl p-4 border space-y-3" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <Input
                placeholder="Caféens navn *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Textarea
                placeholder="Beskrivelse"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-20"
              />
              <Input
                placeholder="By"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <Input
                placeholder="Adresse"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <Input
                placeholder="Telefonnummer"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                placeholder="Webside"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
              <Input
                placeholder="Instagram (fx https://instagram.com/cafenavn)"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              />
              <Input
                placeholder="Facebook (fx https://facebook.com/cafenavn)"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
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
                  style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
                  onClick={handleAddCafe}
                  disabled={addCafeMutation.isPending}
                >
                  {addCafeMutation.isPending ? 'Tilføjer...' : 'Tilføj'}
                </Button>
              </div>
            </div>
          )}

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
              {['Sjælland', 'Fyn', 'Jylland', 'Bornholm'].map(region => {
                const regionCafes = filteredCafes.filter(c => c.amenities?.includes(region));
                if (regionCafes.length === 0) return null;
                return (
                  <div key={region}>
                    <p className="text-sm font-semibold uppercase tracking-wider px-1 mb-2 mt-4" style={{ color: 'var(--color-text-muted)' }}>
                      {region}
                    </p>
                    <div className="space-y-3">
                      {regionCafes.map(cafe => (
                        <div key={cafe.id} className="rounded-2xl p-4 border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                          <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{cafe.name}</h3>
                          {cafe.address && (
                            <a
                              href={getMapsUrl(cafe.address)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs mt-1 w-fit"
                              style={{ color: 'var(--color-accent)' }}
                            >
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                              {cafe.address}
                            </a>
                          )}
                          {!cafe.address && cafe.city && <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{cafe.city}</p>}
                          {cafe.description && <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>{cafe.description}</p>}
                          {(cafe.instagram || cafe.facebook || cafe.website) && (
                            <div className="flex gap-3 mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                              {cafe.instagram && (
                                <a
                                  href={cafe.instagram.startsWith('http') ? cafe.instagram : `https://instagram.com/${cafe.instagram}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs font-medium"
                                  style={{ color: 'var(--color-accent)' }}
                                >
                                  <Instagram className="w-4 h-4" />
                                  Instagram
                                </a>
                              )}
                              {cafe.facebook && (
                                <a
                                  href={cafe.facebook.startsWith('http') ? cafe.facebook : `https://facebook.com/${cafe.facebook}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs font-medium"
                                  style={{ color: '#1877F2' }}
                                >
                                  <Facebook className="w-4 h-4" />
                                  Facebook
                                </a>
                              )}
                              {cafe.website && (
                                <a
                                  href={cafe.website.startsWith('http') ? cafe.website : `https://${cafe.website}`}
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
                  </div>
                );
              })}

              {/* Caféer uden landsdel */}
              {(() => {
                const regions = ['Sjælland', 'Fyn', 'Jylland', 'Bornholm'];
                const unassigned = filteredCafes.filter(c => !regions.some(r => c.amenities?.includes(r)));
                if (unassigned.length === 0) return null;
                return (
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider px-1 mb-2 mt-4" style={{ color: 'var(--color-text-muted)' }}>
                      Øvrige
                    </p>
                    <div className="space-y-3">
                      {unassigned.map(cafe => (
                        <div key={cafe.id} className="rounded-2xl p-4 border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                          <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{cafe.name}</h3>
                          {cafe.address && (
                            <a
                              href={getMapsUrl(cafe.address)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs mt-1 w-fit"
                              style={{ color: 'var(--color-accent)' }}
                            >
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                              {cafe.address}
                            </a>
                          )}
                          {cafe.description && <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>{cafe.description}</p>}
                          {(cafe.instagram || cafe.facebook || cafe.website) && (
                            <div className="flex gap-3 mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                              {cafe.instagram && (
                                <a href={cafe.instagram.startsWith('http') ? cafe.instagram : `https://instagram.com/${cafe.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
                                  <Instagram className="w-4 h-4" /> Instagram
                                </a>
                              )}
                              {cafe.facebook && (
                                <a href={cafe.facebook.startsWith('http') ? cafe.facebook : `https://facebook.com/${cafe.facebook}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#1877F2' }}>
                                  <Facebook className="w-4 h-4" /> Facebook
                                </a>
                              )}
                              {cafe.website && (
                                <a href={cafe.website.startsWith('http') ? cafe.website : `https://${cafe.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
                                  <Globe className="w-4 h-4" /> Webside
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}