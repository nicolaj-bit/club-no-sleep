import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PullToRefresh from '@/components/ui/PullToRefresh';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Camera, LogOut, Bookmark, HelpCircle, Shield, MapPin, Settings, Bell, Globe, Mail, Phone, UserPlus, ChevronRight, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/components/ui/ThemeProvider';
import UserAvatar from '@/components/community/UserAvatar';
import { useLanguage } from '@/components/ui/LanguageContext';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useActiveProfile } from '@/components/ui/ActiveProfileContext';
import { useActiveChild } from '@/components/ui/ActiveChildContext';
import ChildSwitcher from '@/components/children/ChildSwitcher';
import AddChildSheet from '@/components/children/AddChildSheet';
import { Baby, Pencil } from 'lucide-react';
import ReactivateSubscriptionBanner from '@/components/subscription/ReactivateSubscriptionBanner';

export default function Profile() {
  const { isDark } = useTheme();
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeProfile, allProfiles, refreshProfiles } = useActiveProfile();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpConfig, setHelpConfig] = useState(null);
  const [addChildOpen, setAddChildOpen] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    wonderweeks_notifications: true,
    notif_pregnancy_weekly: true,
    notif_calendar_reminder: true,
    notif_sleep_encouragement: true,
    notif_blog_new: true,
  });
  const { children: myChildren, activeChild, setActiveChildId, refetch: refetchChildren } = useActiveChild();

  const profile = activeProfile;

  useEffect(() => {
    base44.entities.AppConfig.filter({ key: 'help_modal' }).then(results => {
      if (results[0]) setHelpConfig(results[0]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!profile) return;
    setNotifPrefs({
      wonderweeks_notifications: profile.wonderweeks_notifications !== false,
      notif_pregnancy_weekly: profile.notif_pregnancy_weekly !== false,
      notif_calendar_reminder: profile.notif_calendar_reminder !== false,
      notif_sleep_encouragement: profile.notif_sleep_encouragement !== false,
      notif_blog_new: profile.notif_blog_new !== false,
    });
  }, [profile?.id]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const u = await base44.auth.me();
          setUser(u);
        }
      } catch {
        // Gæst — ingen redirect
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, data);
      } else {
        await base44.entities.UserProfile.create({ ...data, user_email: user.email });
      }
    },
    onSuccess: () => {
      refreshProfiles();
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center pt-24 gap-4 px-4" style={{ background: 'var(--color-bg)' }}>
        <Skeleton className="w-24 h-24 rounded-full" />
        <Skeleton className="h-5 w-40" />
      </div>
    );
  }

  // Gæst: ikke logget ind
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-20" style={{ background: 'var(--color-bg)' }}>
        <img
          src="https://media.base44.com/images/public/699f47a86e7e0a874d1159ed/4d581f250_Ikon.png"
          alt="LALATOTO"
          className="w-20 h-20 rounded-3xl mb-6 object-contain"
        />
        <h1 className="text-3xl font-light mb-2 text-center" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          {lang === 'da' ? 'Opret din profil' : 'Create your profile'}
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: 'var(--color-text-muted)' }}>
          {lang === 'da'
            ? 'Log ind eller opret en konto for at gemme dine data og blive medlem.'
            : 'Log in or create an account to save your data and become a member.'}
        </p>
        <button
          onClick={() => base44.auth.redirectToLogin('/Profile')}
          className="w-full max-w-xs py-4 rounded-2xl text-base font-semibold mb-3"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
        >
          {lang === 'da' ? 'Log ind / Opret konto' : 'Log in / Sign up'}
        </button>
        <button
          onClick={() => base44.auth.redirectToLogin('/Subscription')}
          className="w-full max-w-xs py-3 rounded-2xl text-sm"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          {lang === 'da' ? 'Bliv medlem →' : 'Become a member →'}
        </button>
      </div>
    );
  }

  const displayName = profile?.display_name || user?.full_name || 'Bruger';

  // Card background: matcher menu-knapper præcist
  const cardBg = isDark ? '#3A2B22' : 'linear-gradient(135deg, #F7F2EC, #EDE4D8)';
  const cardBgSolid = isDark ? '#3A2B22' : '#F0EBE3'; // fallback for border-b rows
  const cardBorder = isDark ? '#3A312B' : '#E8DDD2';

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
    refreshProfiles();
    refetchChildren();
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="min-h-screen pb-10" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="pt-10 pb-3 px-5 flex items-center justify-between">
        <h1 className="text-4xl font-light" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          {t.profileTitle}
        </h1>
      </div>

      <div className="px-4 space-y-3">

        {/* Genaktiver abonnement banner — vises kun ved udløbet abonnement */}
        <ReactivateSubscriptionBanner />

        {/* Færdiggør profil — vis kun hvis ingen profil */}
        {!profile && (
          <>
            <button
              onClick={() => navigate('/Onboarding')}
              className="w-full rounded-3xl overflow-hidden relative active:opacity-90 transition-opacity text-left"
              style={{
                background: 'linear-gradient(135deg, #C8A882, #8A5A30)',
                minHeight: 110,
                border: 'none',
              }}
            >
              <div className="flex items-center gap-4 p-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-light text-white leading-snug" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                    Færdiggør din profil
                  </p>
                  <p className="text-sm text-white/75 mt-1">Fortæl os lidt om dig og dit barn</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/60 flex-shrink-0" />
              </div>
            </button>


          </>
        )}

        {/* Hero profile card — kun når profil eksisterer */}
        {profile && <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <div
            className="rounded-3xl overflow-hidden relative"
            style={{
              backgroundImage: 'url(https://media.base44.com/images/public/699f47a86e7e0a874d1159ed/bdc519741_4.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: `1px solid ${cardBorder}`,
              minHeight: 110
            }}
          >
            <div className="flex items-center gap-4 p-5 pr-4">
              {/* Avatar – rund, lidt større */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2" style={{ borderColor: cardBorder }}>
                  {profile?.profile_image
                    ? <img src={profile.profile_image} alt={displayName} className="w-full h-full object-cover" />
                    : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-semibold" style={{ background: isDark ? '#3A2B22' : '#DCC1B0', color: isDark ? '#F5EFE9' : '#5B3F2B' }}>
                        {displayName?.[0]?.toUpperCase()}
                      </div>
                    )
                  }
                </div>
                {/* Kamera-ikon */}
                <label className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shadow-md" style={{ background: isDark ? '#3A312B' : '#EDE4DB' }}>
                  <Camera className="w-3.5 h-3.5" style={{ color: 'var(--color-text-secondary)' }} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>

              {/* Tekst */}
              <div className="flex-1 min-w-0 pl-1">
                <p style={{ color: '#3A2B1E', fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 400, fontSize: '1.75rem', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                  {displayName}
                </p>
                <p className="mt-1.5" style={{ color: '#9A7A62', fontSize: '0.72rem', letterSpacing: '0.03em', fontStyle: 'italic' }}>
                  {lang === 'da' ? 'Dit rum, kun for dig' : 'Your space, just for you'}
                </p>

              </div>

              {/* Rediger-knap – absolut placeret i nederste højre hjørne */}
              <div className="flex flex-col items-end justify-end self-stretch py-1 flex-shrink-0">
                {/* Rediger-knap */}
                <DialogTrigger asChild>
                  <button
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full active:opacity-70 transition-opacity whitespace-nowrap"
                    style={{ background: isDark ? '#3A312B' : '#EDE4DB', color: 'var(--color-text-secondary)' }}
                    onClick={() => setEditForm({
                      username: profile?.username || '',
                      display_name: profile?.display_name || '',
                      gender: profile?.gender || '',
                      city: profile?.city || '',
                      child_birthdate: profile?.child_birthdate || '',
                      child_due_date: profile?.child_due_date || '',
                    })}
                  >
                    {t.edit} <ChevronRight className="w-3 h-3" />
                  </button>
                </DialogTrigger>
              </div>
            </div>
          </div>

          <DialogContent className="max-h-[90vh] flex flex-col p-0 gap-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <DialogTitle style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>{t.editProfile}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="space-y-5 px-6 py-5">

                {/* Navn */}
                <div className="space-y-1.5">
                  <Label htmlFor="display_name" className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{t.displayName}</Label>
                  <Input id="display_name" value={editForm.display_name || ''} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} placeholder="Dit navn" style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }} />
                </div>

                {/* Brugernavn */}
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{t.username}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-text-muted)' }}>@</span>
                    <Input id="username" value={editForm.username || ''} onChange={(e) => setEditForm({ ...editForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })} placeholder="dit_brugernavn" className="pl-7" style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }} />
                  </div>
                </div>

                {/* By */}
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{t.city}</Label>
                  <Input id="city" value={editForm.city || ''} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} placeholder="København" style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }} />
                </div>

                {/* Divider */}
                <div className="h-px w-full" style={{ background: 'var(--color-border)' }} />

                {/* Børn */}
                <div className="space-y-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {lang === 'da' ? 'Mine børn' : 'My children'}
                  </p>
                  {myChildren.length === 0 && (
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {lang === 'da' ? 'Ingen børn tilføjet endnu' : 'No children added yet'}
                    </p>
                  )}
                  {myChildren.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
                    >
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {child.name}{!child.birthdate && child.due_date ? ' 🤰' : ''}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          {child.birthdate
                            ? (lang === 'da' ? `Født ${child.birthdate}` : `Born ${child.birthdate}`)
                            : child.due_date
                              ? (lang === 'da' ? `Termin ${child.due_date}` : `Due ${child.due_date}`)
                              : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setEditOpen(false); setTimeout(() => { setEditingChild(child); setAddChildOpen(true); }, 200); }}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full"
                        style={{ background: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                      >
                        <Pencil className="w-3 h-3" />
                        {lang === 'da' ? 'Rediger' : 'Edit'}
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => { setEditOpen(false); setTimeout(() => { setEditingChild(null); setAddChildOpen(true); }, 200); }}
                    className="text-xs px-3 py-1.5 rounded-full"
                    style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', color: 'var(--color-accent)' }}
                  >
                    + {lang === 'da' ? 'Tilføj barn' : 'Add child'}
                  </button>
                </div>

              </div>
            </ScrollArea>

            {/* Gem-knap sticky i bunden */}
            <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <Button
                className="w-full h-12 rounded-2xl text-base font-semibold"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
                onClick={() => updateProfileMutation.mutate(editForm)}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? t.saving : t.saveChanges}
              </Button>
            </div>
          </DialogContent>
        </Dialog>}

        {/* Børnesektion */}
        <p className="text-xs font-semibold uppercase tracking-widest px-1 pt-1" style={{ color: 'var(--color-text-muted)' }}>
          {lang === 'da' ? 'Mine børn' : 'My children'}
        </p>

        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${cardBorder}` }}>
          {myChildren.map((child, i) => (
            <div
              key={child.id}
              className={`flex items-center gap-3 px-4 py-3.5 ${i < myChildren.length - 1 ? 'border-b' : ''}`}
              style={{ background: cardBgSolid, borderColor: cardBorder }}
            >
              <button
                onClick={() => setActiveChildId(child.id)}
                className="flex items-center gap-3 flex-1 text-left"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: activeChild?.id === child.id ? 'linear-gradient(135deg, #C8A882, #A0785A)' : 'var(--color-bg-subtle)' }}
                >
                  <Baby className="w-4 h-4" style={{ color: activeChild?.id === child.id ? '#fff' : 'var(--color-text-muted)' }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {child.name}
                    {!child.birthdate && child.due_date && ' 🤰'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {child.birthdate
                      ? (lang === 'da' ? `Født ${child.birthdate}` : `Born ${child.birthdate}`)
                      : child.due_date
                        ? (lang === 'da' ? `Termin ${child.due_date}` : `Due ${child.due_date}`)
                        : ''}
                  </p>
                </div>
              </button>
              <button
                onClick={() => { setEditingChild(child); setAddChildOpen(true); }}
                className="p-2 rounded-full active:opacity-60"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            onClick={() => { setEditingChild(null); setAddChildOpen(true); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 active:opacity-70 transition-opacity"
            style={{ background: cardBgSolid, borderTop: myChildren.length > 0 ? `1px solid ${cardBorder}` : 'none' }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-bg-subtle)' }}>
              <Baby className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
              {lang === 'da' ? '+ Tilføj barn' : '+ Add child'}
            </p>
          </button>
        </div>

        <AddChildSheet
          open={addChildOpen}
          onClose={() => { setAddChildOpen(false); setEditingChild(null); }}
          onSaved={() => { setAddChildOpen(false); setEditingChild(null); refetchChildren(); }}
          editChild={editingChild}
        />

        {/* Section label */}
        <p className="text-xs font-semibold uppercase tracking-widest px-1 pt-1" style={{ color: 'var(--color-text-muted)' }}>
          {lang === 'da' ? 'Genveje' : 'Shortcuts'}
        </p>

        {/* 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Bookmark, label: t.favorites, sub: lang === 'da' ? 'Dine gemte øjeblikke' : 'Your saved moments', page: 'Favorites' },
            { icon: Bell, label: t.notifications, sub: lang === 'da' ? 'Hvad du vil have besked om' : 'What to be notified of', action: () => setNotifOpen(true) },
            { icon: Settings, label: t.settings, sub: lang === 'da' ? 'Tilpas appen til dig' : 'Customise the app', page: 'Settings' },
            { icon: UserPlus, label: lang === 'da' ? 'Deling & adgang' : 'Sharing & access', sub: lang === 'da' ? 'Inviter en du stoler på' : 'Invite someone you trust', page: 'FamilyInvite' },
          ].map((item, i) => {
            const Icon = item.icon;
            const inner = (
              <>
                <div className="flex items-center justify-between">
                  <Icon className="w-5 h-5" style={{ color: '#B08D72' }} />
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--color-text-primary)' }}>{item.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{item.sub}</p>
                </div>
              </>
            );
            return item.action ? (
              <button
                key={i}
                onClick={item.action}
                className="rounded-2xl p-4 flex flex-col gap-2 cursor-pointer active:opacity-70 transition-opacity text-left"
                style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
              >
                {inner}
              </button>
            ) : (
              <Link
                key={i}
                to={createPageUrl(item.page)}
                className="rounded-2xl p-4 flex flex-col gap-2 cursor-pointer active:opacity-70 transition-opacity"
                style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
              >
                {inner}
              </Link>
            );
          })}
        </div>

        {/* Section label */}
        <p className="text-xs font-semibold uppercase tracking-widest px-1 pt-1" style={{ color: 'var(--color-text-muted)' }}>
          {lang === 'da' ? 'Andre' : 'Other'}
        </p>

        {/* List rows */}
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${cardBorder}` }}>
          {/* Help */}
          <button
            onClick={() => setHelpOpen(true)}
            className="w-full flex items-center gap-3 px-5 py-4 active:opacity-70 transition-opacity border-b text-left"
            style={{ background: cardBgSolid, borderColor: cardBorder }}
          >
            <HelpCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#B08D72' }} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.help}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>FAQ, {lang === 'da' ? 'kontakt & support' : 'contact & support'}</p>
            </div>
            <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
          </button>

          {/* Share location toggle */}
          <div
            className="flex items-center gap-3 px-5 py-4 border-b"
            style={{ background: cardBgSolid, borderColor: cardBorder }}
          >
            <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: '#B08D72' }} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.shareLocation}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {lang === 'da' ? 'Se relevante mødre i nærheden' : 'See nearby moms'}
              </p>
            </div>
            <Switch checked={profile?.location_enabled || false} onCheckedChange={(checked) => updateProfileMutation.mutate({ location_enabled: checked })} />
          </div>

          {/* Language */}
          <button
            onClick={() => setLangSheetOpen(true)}
            className="w-full flex items-center gap-3 px-5 py-4 active:opacity-70 transition-opacity"
            style={{ background: cardBgSolid }}
          >
            <Globe className="w-5 h-5 flex-shrink-0" style={{ color: '#B08D72' }} />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.language}</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full mr-1" style={{ background: isDark ? '#2A2A2A' : '#EDE4DB', color: 'var(--color-text-muted)' }}>
              {lang === 'en' ? '🇬🇧 English' : '🇩🇰 Dansk'}
            </span>
            <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        {/* Log out */}
        <button
          onClick={() => base44.auth.logout('/')}
          className="w-full py-4 rounded-2xl text-sm font-medium cursor-pointer active:opacity-70 transition-opacity"
          style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: 'var(--color-text-muted)' }}
        >
          <span className="flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />
            {t.logOut}
          </span>
        </button>

        <p className="text-center text-xs pb-2" style={{ color: 'var(--color-text-muted)' }}>{t.v1}</p>
      </div>

      {/* Help modal */}
      <AnimatePresence>
        {helpOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
              onClick={() => setHelpOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="fixed left-4 right-4 z-50 rounded-3xl overflow-hidden"
              style={{
                bottom: 'calc(max(16px, env(safe-area-inset-bottom)) + 72px)',
                backgroundColor: isDark ? '#121212' : '#FFFFFF',
                boxShadow: '0 -4px 40px rgba(44,26,14,0.12)',
              }}
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-4">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                  {t.helpAndContact}
                </span>
                <button onClick={() => setHelpOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center active:opacity-50" style={{ backgroundColor: isDark ? '#2A2A2A' : '#F0E9E0' }}>
                  <X className="w-3.5 h-3.5" style={{ color: 'var(--color-text-secondary)' }} />
                </button>
              </div>
              <div className="px-4 pb-5 flex flex-col gap-2.5">
                <div className="px-4 py-3 rounded-2xl" style={{ backgroundColor: isDark ? '#1A1A1A' : '#F3E9E1' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>{t.aboutApp}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {lang === 'da' ? (helpConfig?.help_about_text_da || 'LALATOTO er din digitale følgesvend som forælder.') : (helpConfig?.help_about_text_en || 'LALATOTO is your digital companion as a parent.')}
                  </p>
                </div>
                <a href={`mailto:${helpConfig?.help_contact_email || 'hej@lalatoto.dk'}`} className="flex items-center gap-4 px-5 py-4 rounded-2xl active:scale-95 transition-transform" style={{ backgroundColor: isDark ? '#1A1A1A' : '#F3E9E1' }}>
                  <Mail className="w-5 h-5 flex-shrink-0" style={{ color: '#B08D72' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.writeToUs}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{helpConfig?.help_contact_email || 'hej@lalatoto.dk'}</p>
                  </div>
                </a>
                <a href={`tel:${helpConfig?.help_phone || ''}`} className="flex items-center gap-4 px-5 py-4 rounded-2xl active:scale-95 transition-transform" style={{ backgroundColor: isDark ? '#1A1A1A' : '#F3E9E1' }}>
                  <Phone className="w-5 h-5 flex-shrink-0" style={{ color: '#B08D72' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.callUs}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{helpConfig?.help_phone || ''}</p>
                  </div>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notification preferences */}
      <BottomSheet open={notifOpen} onOpenChange={setNotifOpen} title="Notifikationer">
        <div className="px-5 py-4 space-y-5">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Vælg hvilke notifikationer du vil modtage.</p>
          {[
            { key: 'wonderweeks_notifications', label: 'Tigerspring', desc: 'Når dit barn nærmer sig et nyt tigerspring' },
            { key: 'notif_pregnancy_weekly', label: 'Ugentlig graviditetsopdatering', desc: 'Hvad sker der i din graviditetsuge' },
            { key: 'notif_calendar_reminder', label: 'Kalender påmindelser', desc: 'Notifikation om kommende aftaler' },
            { key: 'notif_sleep_encouragement', label: 'Søvnopmuntring', desc: 'Personlige råd baseret på dine søvnlogs' },
            { key: 'notif_blog_new', label: 'Nyt indhold', desc: 'Nye blogindlæg og artikler' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
              </div>
              <Switch
                checked={notifPrefs[key]}
                onCheckedChange={async (val) => {
                  const updated = { ...notifPrefs, [key]: val };
                  setNotifPrefs(updated);
                  if (profile?.id) {
                    await base44.entities.UserProfile.update(profile.id, { [key]: val });
                  }
                }}
              />
            </div>
          ))}
          <div className="h-2" />
        </div>
      </BottomSheet>

      {/* Language picker modal */}
      <AnimatePresence>
        {langSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
              onClick={() => setLangSheetOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="fixed left-4 right-4 z-50 rounded-3xl overflow-hidden"
              style={{
                bottom: 'calc(max(16px, env(safe-area-inset-bottom)) + 72px)',
                backgroundColor: isDark ? '#121212' : '#FFFFFF',
                boxShadow: '0 -4px 40px rgba(44,26,14,0.12)',
              }}
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-4">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>{t.chooseLanguage}</span>
                <button onClick={() => setLangSheetOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center active:opacity-50" style={{ backgroundColor: isDark ? '#2A2A2A' : '#F0E9E0' }}>
                  <X className="w-3.5 h-3.5" style={{ color: 'var(--color-text-secondary)' }} />
                </button>
              </div>
              <div className="px-4 pb-5 flex flex-col gap-2.5">
                {[{ code: 'da', flag: '🇩🇰', label: 'Dansk' }, { code: 'en', flag: '🇬🇧', label: 'English' }].map((option) => {
                  const active = lang === option.code;
                  return (
                    <button
                      key={option.code}
                      onClick={() => { setLang(option.code); setLangSheetOpen(false); }}
                      className="flex items-center gap-4 px-5 py-4 rounded-2xl text-left active:scale-95 transition-transform"
                      style={{ backgroundColor: active ? (isDark ? '#FFFFFF' : '#5B3F2B') : (isDark ? '#1A1A1A' : '#F3E9E1') }}
                    >
                      <span className="text-2xl">{option.flag}</span>
                      <span className="text-[15px] font-medium flex-1" style={{ color: active ? '#FFFFFF' : (isDark ? '#CCCCCC' : '#4A2E1A') }}>
                        {option.label}
                      </span>
                      {active && <div className="w-2 h-2 rounded-full bg-white" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </PullToRefresh>
  );
}