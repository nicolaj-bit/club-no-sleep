import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Camera, LogOut, ChevronRight, Bookmark,
  Calendar, HelpCircle, Shield, MapPin, Settings
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
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  const displayName = profile?.display_name || user?.full_name || 'Bruger';
  const username = profile?.username || user?.email?.split('@')[0];

  const menuItems = [
    { icon: Bookmark, label: 'Mine favoritter', count: favorites.length, page: 'Favorites' },
    { icon: Calendar, label: 'Mine bookinger', count: bookings.length, page: 'MyBookings' },
    { icon: HelpCircle, label: 'Mine spørgsmål', page: 'MyQuestions' },
    { icon: Settings, label: 'Indstillinger', page: 'Settings' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Hero / Avatar section */}
      <div className="relative pt-12 pb-8 flex flex-col items-center px-6">
        {/* Subtle decorative gradient */}
        <div
          className="absolute inset-x-0 top-0 h-48 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, var(--color-bg-subtle), transparent)',
          }}
        />

        {/* Avatar */}
        <div className="relative z-10">
          <div className="ring-4 ring-white/60 rounded-full shadow-xl">
            <UserAvatar
              src={profile?.profile_image}
              name={displayName}
              size="2xl"
            />
          </div>
          <label className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-md"
            style={{ background: 'var(--color-primary)' }}>
            <Camera className="w-4 h-4 text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        {/* Name & meta */}
        <div className="z-10 mt-4 text-center">
          <h2 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            {displayName}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>@{username}</p>

          {profile?.city && (
            <div className="flex items-center justify-center gap-1 mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-sm">{profile.city}</span>
            </div>
          )}

          {profile?.role === 'expert' && (
            <span className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-accent)' }}>
              EKSPERT
            </span>
          )}
        </div>

        {/* Edit button */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <button
              className="z-10 mt-5 text-sm px-6 py-2 rounded-full border font-medium transition-all"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
                background: 'var(--color-bg-card)',
              }}
              onClick={() => setEditForm({
                username: profile?.username || '',
                display_name: profile?.display_name || '',
                city: profile?.city || '',
                child_birthdate: profile?.child_birthdate || '',
              })}
            >
              Rediger profil
            </button>
          </DialogTrigger>
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
      </div>

      {/* Divider */}
      <div className="mx-6 h-px" style={{ background: 'var(--color-border)' }} />

      {/* Menu items */}
      <div className="px-4 py-5 space-y-2">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link
              key={i}
              to={createPageUrl(item.page)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all active:scale-[0.98]"
              style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--color-bg-subtle)' }}>
                <Icon className="w-4.5 h-4.5" style={{ color: 'var(--color-text-secondary)' }} />
              </div>
              <span className="flex-1 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {item.label}
              </span>
              {item.count !== undefined && item.count > 0 && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }}>
                  {item.count}
                </span>
              )}
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </Link>
          );
        })}
      </div>

      {/* Privacy */}
      <div className="px-4 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3 px-1"
          style={{ color: 'var(--color-text-muted)' }}>
          Privatliv
        </p>
        <div className="rounded-2xl overflow-hidden divide-y"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', divideColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <MapPin className="w-4.5 h-4.5" style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Del lokation</span>
            </div>
            <Switch
              checked={profile?.location_enabled || false}
              onCheckedChange={(checked) => updateProfileMutation.mutate({ location_enabled: checked })}
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Shield className="w-4.5 h-4.5" style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Vis mig som synlig</span>
            </div>
            <Switch
              checked={profile?.is_visible !== false}
              onCheckedChange={(checked) => updateProfileMutation.mutate({ is_visible: checked })}
            />
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 pb-10">
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-2xl text-sm font-medium transition-all active:scale-[0.98]"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            color: '#e05252',
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />
            Log ud
          </span>
        </button>
      </div>
    </div>
  );
}