import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Camera, LogOut, Bookmark, HelpCircle, Shield, MapPin, Settings, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    updateProfileMutation.mutate({ profile_image: file_url });
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center pt-24 gap-4 px-4" style={{ background: 'var(--color-bg)' }}>
        <Skeleton className="w-24 h-24 rounded-full" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-28" />
      </div>
    );
  }

  const displayName = profile?.display_name || user?.full_name || 'Bruger';
  const username = profile?.username || user?.email?.split('@')[0];

  const menuItems = [
    { icon: Bookmark, label: 'Favoritter', sublabel: `${favorites.length} gemte`, page: 'Favorites' },
    { icon: HelpCircle, label: 'Mine spørgsmål', sublabel: 'Se dine spørgsmål', page: 'MyQuestions' },
    { icon: Settings, label: 'Indstillinger', sublabel: 'App & konto', page: 'Settings' },
  ];

  return (
    <div className="min-h-screen pb-10" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="pt-8 pb-4 px-6 text-center">
        <h1 className="text-2xl" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
          Profil
        </h1>
      </div>

      <div className="px-4 space-y-3">
        {/* Profile hero card */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <div className="rounded-3xl p-6" style={{ background: 'var(--color-bg-card)' }}>
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <UserAvatar src={profile?.profile_image} name={displayName} size="2xl" />
                <label
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shadow-sm"
                  style={{ background: 'var(--color-accent)' }}
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lg leading-tight truncate" style={{ color: 'var(--color-text-primary)' }}>{displayName}</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>@{username}</p>
                {profile?.city && (
                  <div className="flex items-center gap-1 mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs">{profile.city}</span>
                  </div>
                )}
              </div>
              <DialogTrigger asChild>
                <button
                  className="text-xs px-3 py-1.5 rounded-full border flex-shrink-0 cursor-pointer"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                  onClick={() => setEditForm({
                    username: profile?.username || '',
                    display_name: profile?.display_name || '',
                    city: profile?.city || '',
                    child_birthdate: profile?.child_birthdate || '',
                  })}
                >
                  Rediger
                </button>
              </DialogTrigger>
            </div>
          </div>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rediger profil</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Brugernavn</Label>
                <Input id="username" value={editForm.username || ''} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} placeholder="dit_brugernavn" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_name">Visningsnavn</Label>
                <Input id="display_name" value={editForm.display_name || ''} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} placeholder="Dit navn" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">By</Label>
                <Input id="city" value={editForm.city || ''} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} placeholder="København" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthdate">Barnets fødselsdag</Label>
                <Input id="birthdate" type="date" value={editForm.child_birthdate || ''} onChange={(e) => setEditForm({ ...editForm, child_birthdate: e.target.value })} />
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Bruges til beregning af tigerspring 🐯</p>
              </div>
              <Button className="w-full" onClick={() => updateProfileMutation.mutate(editForm)} disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? 'Gemmer…' : 'Gem ændringer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Menu items */}
        <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--color-bg-card)' }}>
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={i}
                to={createPageUrl(item.page)}
                className="flex items-center gap-4 px-5 py-4 cursor-pointer active:opacity-70 transition-opacity"
                style={{ borderBottom: i < menuItems.length - 1 ? '1px solid var(--color-border)' : 'none' }}
              >
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-bg-subtle)' }}>
                  <Icon className="w-4.5 h-4.5" style={{ color: 'var(--color-text-secondary)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{item.sublabel}</p>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
              </Link>
            );
          })}
        </div>

        {/* Privacy toggles */}
        <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--color-bg-card)' }}>
          <p className="px-5 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Privatliv</p>
          <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Del lokation</span>
            </div>
            <Switch
              checked={profile?.location_enabled || false}
              onCheckedChange={(checked) => updateProfileMutation.mutate({ location_enabled: checked })}
            />
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
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
          onClick={() => base44.auth.logout('/')}
          className="w-full py-4 rounded-3xl text-sm font-medium cursor-pointer active:opacity-70 transition-opacity"
          style={{ background: 'var(--color-bg-card)', color: '#c0614a' }}
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