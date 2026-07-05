import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '@/components/ui/PullToRefresh';
import PageHeader from '@/components/ui/PageHeader';
import { base44 } from '@/api/base44Client';
import { MapPin, Plus, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import ExpertCard from '@/components/booking/ExpertCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/components/ui/LanguageContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function Practitioners() {
  const { t } = useLanguage();
  const [expertSearchMode, setExpertSearchMode] = useState('all');
  const [expertCategory, setExpertCategory] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [showLocationConsent, setShowLocationConsent] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTipForm, setShowTipForm] = useState(false);
  const [tipData, setTipData] = useState({ practitionerInfo: '', whyGood: '' });
  const [tipSending, setTipSending] = useState(false);
  const [formData, setFormData] = useState({ name: '', speciality: '', city: '', phone: '', email: '', website: '' });
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
    queryFn: () => isAdmin ? base44.entities.Expert.list() : base44.entities.Expert.filter({ is_active: true }),
  });

  const addExpertMutation = useMutation({
    mutationFn: (expertData) => base44.entities.Expert.create(expertData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] });
      setShowAddForm(false);
      setFormData({ name: '', speciality: '', city: '', phone: '', email: '', website: '' });
      toast.success('Behandler tilføjet! ✓');
    },
    onError: () => toast.error('Kunne ikke tilføje behandler'),
  });

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
          {/* Tip os om en behandler */}
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
            <button
              className="w-full flex items-center justify-between p-4"
              onClick={() => setShowTipForm(!showTipForm)}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>Kender du en god behandler?</span>
              </div>
              {showTipForm ? (
                <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              ) : (
                <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              )}
            </button>

            {showTipForm && (
              <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-xs pt-3" style={{ color: 'var(--color-text-muted)' }}>
                  Tips os om en god behandler, så kigger vi på den og tilføjer den til listen 💛
                </p>
                <Textarea
                  placeholder="Behandlers info — navn, speciale, telefon og adresse *"
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
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full gap-2"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
            >
              <Plus className="w-4 h-4" />
              Tilføj behandler
            </Button>
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
                value={formData.speciality}
                onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
              />
              <Input
                placeholder="By"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <Input
                placeholder="Telefonnummer"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                placeholder="Webside"
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

          {/* Category pills */}
          <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-2 w-max pb-1">
              {EXPERT_CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setExpertCategory(cat.value)}
                  className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
                  style={expertCategory === cat.value
                    ? { background: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }
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
                  Anbefalede af brugerne
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