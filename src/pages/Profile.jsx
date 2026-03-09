import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Camera, LogOut, Bookmark, Calendar, HelpCircle,
  Shield, MapPin, Settings, Users, Bell, Globe, Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import UserAvatar from '@/components/community/UserAvatar';

export default function Profile() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) { base44.auth.redirectToLogin(); return; }
        const u = await base44.auth.me();
        setUser(u);
      } catch {
        base44.auth.redirectToLogin();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['myBookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ client_email: user.email }, '-date', 5),
    enabled: !!user?.email,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['myFavorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, data);
      } else {
        await base44.entities.UserProfile.create({ ...data, user_email: user.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      setEditOpen(false);
      toast.success('Profil opdateret');
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateProfileMutation.mutate({ profile_image: file_url });
    } catch {
      toast.error('Kunne ikke uploade billede');
    }
  };

  const handleLogout = () => base44.auth.logout('/');

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center pt-24 gap-4" style={{ background: 'var(--color-bg)' }}>
        <Skeleton className="w-28 h-28 rounded-full" />
        <Skeleton className="h-5 w-36" />
      </div>
    );
  }

  const displayName = profile?.display_name || user?.full_name || 'Bruger';
  const username = profile?.username || user?.email?.split('@')[0];

  const gridItems = [
    { icon: Bookmark, label: 'Favoritter', page: 'Favorites' },
    { icon: HelpCircle, label: 'Spørgsmål', page: 'MyQuestions' },
    { icon: Settings, label: 'Indstillinger', page: 'Settings' },
  ];

  return (
    <div className="min-h-screen pb-10" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="pt-6 pb-2 px-6 text-center">
        <h1 className="text-2xl font-serif" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
          Profil
        </h1>
      </div>

      <div className="px-4 space-y-4 mt-2">
        {/* Profile card */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <div
            className="rounded-3xl p-6"
            style={{ background: 'var(--color-bg-card)' }}
          >
            <DialogTrigger asChild>
              <button
                className="flex flex-col items-center w-full text-center gap-3"
                onClick={() => setEditForm({
                  username: profile?.username || '',
                  display_name: profile?.display_name || '',
                  city: profile?.city || '',
                  child_birthdate: profile?.child_birthdate || '',
                })}
              >
                <div className="relative">
                  <UserAvatar src={profile?.profile_image} name={displayName} size="2xl" />
                  <label
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
                    style={{ background: 'var(--color-accent)' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <Camera className="w-3.5 h-3.5 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
                <div>
                  <p className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>{displayName}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>@{username}</p>
                  {profile?.city && (
                    <div className="flex items-center justify-center gap-1 mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs">{profile.city}</span>
                    </div>
                  )}
                </div>
                <span
                  className="text-xs px-4 py-1.5 rounded-full border"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  Rediger profil
                </span>
              </button>
            </DialogTrigger>
          </div>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rediger profil</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Brugernavn</Label>
                <Input value={editForm.username || ''} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} placeholder="dit_brugernavn" />
              </div>
              <div className="space-y-2">
                <Label>Visningsnavn</Label>
                <Input value={editForm.display_name || ''} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} placeholder="Dit navn" />
              </div>
              <div className="space-y-2">
                <Label>By</Label>
                <Input value={editForm.city || ''} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} placeholder="København" />
              </div>
              <div className="space-y-2">
                <Label>Barnets fødselsdag / terminsdato</Label>
                <Input type="date" value={editForm.child_birthdate || ''} onChange={(e) => setEditForm({ ...editForm, child_birthdate: e.target.value })} />
                <p className="text-xs text-slate-400">Du kan altid opdatere denne dato.</p>
              </div>
              <Button className="w-full" onClick={() => updateProfileMutation.mutate(editForm)} disabled={updateProfileMutation.isPending}>
                Gem ændringer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Grid menu */}
        <div className="grid grid-cols-2 gap-3">
          {gridItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={i}
                to={createPageUrl(item.page)}
                className="rounded-2xl p-5 flex flex-col gap-3 active:scale-[0.97] transition-transform"
                style={{ background: 'var(--color-bg-card)' }}
              >
                <Icon className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Privacy toggles */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-bg-card)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Del lokation</span>
            </div>
            <Switch
              checked={profile?.location_enabled || false}
              onCheckedChange={(checked) => updateProfileMutation.mutate({ location_enabled: checked })}
            />
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Vis mig som synlig</span>
            </div>
            <Switch
              checked={profile?.is_visible !== false}
              onCheckedChange={(checked) => updateProfileMutation.mutate({ is_visible: checked })}
            />
          </div>
        </div>

        {/* Log out */}
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl text-sm font-medium transition-all active:scale-[0.98]"
          style={{
            background: 'var(--color-bg-card)',
            color: '#c0614a',
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />
            Log ud
          </span>
        </button>

        <p className="text-center text-xs pb-2" style={{ color: 'var(--color-text-muted)' }}>v1.0</p>
      </div>
    </div>
  );
}