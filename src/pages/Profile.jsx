import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Camera, LogOut, Bookmark, HelpCircle, Shield, MapPin, Settings, ChevronLeft, Users, Bell, Globe, HelpCircle as Help } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTheme } from '@/components/ui/ThemeProvider';
import UserAvatar from '@/components/community/UserAvatar';
import { useLanguage } from '@/components/ui/LanguageContext';
import { BottomSheet } from '@/components/ui/BottomSheet';

export default function Profile() {
  const { isDark } = useTheme();
  const { t, lang, setLang } = useLanguage();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [langSheetOpen, setLangSheetOpen] = useState(false);

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
      toast.success(t.profileUpdated);
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
      </div>
    );
  }

  const displayName = profile?.display_name || user?.full_name || 'Bruger';
  const username = profile?.username || user?.email?.split('@')[0];

  const gridItems = [
    { icon: Bookmark, label: t.favorites, page: 'Favorites' },
    { icon: Bell, label: t.notifications, page: 'Settings' },
    { icon: HelpCircle, label: t.questions, page: 'MyQuestions' },
    { icon: Settings, label: t.settings, page: 'Settings' },
    { icon: Help, label: t.help, page: 'Settings' },
  ];

  return (
    <div className="min-h-screen pb-10" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="pt-8 pb-4 px-5 flex items-center justify-center relative">
        <h1 className="text-2xl" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
          {t.profileTitle}
        </h1>
      </div>

      <div className="px-4 space-y-3">
        {/* Profile hero card */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <div
            className="rounded-3xl p-5"
            style={{ background: isDark ? '#E7D3B1' : '#F8F3ED', borderColor: isDark ? '#E7D3B1' : '#F8F3ED' }}
          >
            <DialogTrigger asChild>
              <button
                className="flex items-center gap-3 w-full text-left cursor-pointer active:opacity-70 transition-opacity"
                onClick={() => setEditForm({
                  username: profile?.username || '',
                  display_name: profile?.display_name || '',
                  city: profile?.city || '',
                  child_birthdate: profile?.child_birthdate || '',
                })}
              >
                <div className="relative">
                  <UserAvatar src={profile?.profile_image} name={displayName} size="lg" />
                  <label
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                    style={{ background: 'var(--color-accent)' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <Camera className="w-3 h-3 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{displayName}</p>
                  {profile?.city && (
                    <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      <MapPin className="w-3 h-3" />{profile.city}
                    </p>
                  )}
                </div>
                <span className="ml-auto text-xs px-3 py-1 rounded-full" style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }}>
                  {t.edit}
                </span>
              </button>
            </DialogTrigger>
          </div>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.editProfile}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t.username}</Label>
                <Input id="username" value={editForm.username || ''} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} placeholder="dit_brugernavn" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_name">{t.displayName}</Label>
                <Input id="display_name" value={editForm.display_name || ''} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} placeholder="Dit navn" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t.city}</Label>
                <Input id="city" value={editForm.city || ''} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} placeholder="København" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthdate">{t.childBirthdate}</Label>
                <Input id="birthdate" type="date" value={editForm.child_birthdate || ''} onChange={(e) => setEditForm({ ...editForm, child_birthdate: e.target.value })} />
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.wonderWeekInfo}</p>
              </div>
              <Button className="w-full" onClick={() => updateProfileMutation.mutate(editForm)} disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? t.saving : t.saveChanges}
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
                className="rounded-2xl p-5 flex flex-col gap-3 cursor-pointer active:opacity-70 transition-opacity border"
                style={{ background: isDark ? '#E7D3B1' : '#F8F3ED', borderColor: isDark ? '#E7D3B1' : '#F8F3ED', color: 'var(--color-text-primary)' }}
              >
                <Icon className="w-6 h-6" style={{ color: 'var(--color-text-secondary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Privacy toggles */}
        <div className="rounded-2xl overflow-hidden border" style={{ background: isDark ? '#E7D3B1' : '#F8F3ED', borderColor: isDark ? '#E7D3B1' : '#F8F3ED' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{t.shareLocation}</span>
            </div>
            <Switch checked={profile?.location_enabled || false} onCheckedChange={(checked) => updateProfileMutation.mutate({ location_enabled: checked })} />
          </div>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{t.showAsVisible}</span>
            </div>
            <Switch checked={profile?.is_visible !== false} onCheckedChange={(checked) => updateProfileMutation.mutate({ is_visible: checked })} />
          </div>
          <button
            onClick={() => setLangSheetOpen(true)}
            className="w-full flex items-center justify-between px-5 py-4 active:opacity-70 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{t.language}</span>
            </div>
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }}>
              {lang === 'en' ? '🇬🇧 English' : '🇩🇰 Dansk'}
            </span>
          </button>
        </div>

        {/* Log out */}
        <button
          onClick={() => base44.auth.logout('/')}
          className="w-full py-4 rounded-2xl text-sm font-medium cursor-pointer active:opacity-70 transition-opacity border"
          style={{ background: isDark ? '#E7D3B1' : '#F8F3ED', borderColor: isDark ? '#E7D3B1' : '#F8F3ED', color: 'var(--color-text-muted)' }}
        >
          <span className="flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />
            {t.logOut}
          </span>
        </button>

        <p className="text-center text-xs pb-2" style={{ color: 'var(--color-text-muted)' }}>{t.v1}</p>
      </div>

      {/* Language picker */}
      <BottomSheet open={langSheetOpen} onOpenChange={setLangSheetOpen} title={t.chooseLanguage}>
        <div className="py-2">
          {[{ code: 'da', flag: '🇩🇰', label: 'Dansk' }, { code: 'en', flag: '🇬🇧', label: 'English' }].map((option, i, arr) => (
            <React.Fragment key={option.code}>
              <button
                onClick={() => { setLang(option.code); setLangSheetOpen(false); }}
                className="w-full flex items-center justify-between px-5 py-4 active:opacity-60 transition-opacity"
              >
                <span className="text-base" style={{ color: 'var(--color-text-primary)' }}>
                  {option.flag} {option.label}
                </span>
                {lang === option.code && (
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>✓</span>
                )}
              </button>
              {i < arr.length - 1 && <div className="h-px mx-5" style={{ backgroundColor: 'var(--color-border)' }} />}
            </React.Fragment>
          ))}
          <div className="h-2" />
        </div>
      </BottomSheet>
    </div>
  );
}