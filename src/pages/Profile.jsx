import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Camera, LogOut, Bookmark, HelpCircle, Shield, MapPin, Settings, Bell, Globe, Mail, Phone, UserPlus, ChevronRight } from 'lucide-react';
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
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useActiveProfile } from '@/components/ui/ActiveProfileContext';

export default function Profile() {
  const { isDark } = useTheme();
  const { t, lang, setLang } = useLanguage();
  const queryClient = useQueryClient();
  const { activeProfile, allProfiles, refreshProfiles } = useActiveProfile();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpConfig, setHelpConfig] = useState(null);

  useEffect(() => {
    base44.entities.AppConfig.filter({ key: 'help_modal' }).then(results => {
      if (results[0]) setHelpConfig(results[0]);
    }).catch(() => {});
  }, []);

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

  const profile = activeProfile;

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

  const displayName = profile?.display_name || user?.full_name || 'Bruger';

  // Card background: warm beige
  const cardBg = isDark ? '#1E1E1E' : '#F3E9E1';
  const cardBorder = isDark ? '#2A2A2A' : '#EDE4DB';

  return (
    <div className="min-h-screen pb-10" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="pt-10 pb-3 px-5 flex items-center justify-between">
        <h1 className="text-4xl font-light" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          {t.profileTitle}
        </h1>
      </div>

      <div className="px-4 space-y-3">

        {/* Hero profile card */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <div
            className="rounded-3xl overflow-hidden relative flex"
            style={{ background: cardBg, border: `1px solid ${cardBorder}`, minHeight: '120px' }}
          >
            {/* Left: avatar + text + edit button */}
            <div className="flex items-center gap-3 p-5 flex-1 min-w-0">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <UserAvatar src={profile?.profile_image} name={displayName} size="lg" />
                <label
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer shadow-sm"
                  style={{ background: isDark ? '#2A2A2A' : '#EDE4DB' }}
                >
                  <Camera className="w-3 h-3" style={{ color: '#B08D72' }} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>

              {/* Text + edit */}
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <p className="text-2xl font-semibold leading-tight" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                  {displayName}
                </p>
                <p className="text-xs flex items-center gap-1" style={{ color: '#B08D72' }}>
                  🤍 {lang === 'da' ? 'Dit rolige rum' : 'Your calm space'}
                </p>
                <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  {lang === 'da' ? 'Et sted kun for dig.' : 'A place just for you.'}
                </p>
                <DialogTrigger asChild>
                  <button
                    className="self-start flex items-center gap-1 text-xs px-3 py-1.5 rounded-full active:opacity-70 transition-opacity"
                    style={{ background: isDark ? '#2A2A2A' : '#EDE4DB', color: 'var(--color-text-secondary)' }}
                    onClick={() => setEditForm({
                      username: profile?.username || '',
                      display_name: profile?.display_name || '',
                      gender: profile?.gender || '',
                      city: profile?.city || '',
                      child_birthdate: profile?.child_birthdate || '',
                    })}
                  >
                    {lang === 'da' ? 'Rediger profil' : 'Edit profile'} <ChevronRight className="w-3 h-3" />
                  </button>
                </DialogTrigger>
              </div>
            </div>

            {/* Right: floral illustration */}
            <div className="flex-shrink-0 w-28 flex items-center justify-center opacity-30 pointer-events-none select-none pr-2" aria-hidden>
              <svg viewBox="0 0 90 120" fill="none" xmlns="http://www.w3.org/2000/svg" width="80" height="110">
                {/* Main stem */}
                <path d="M45 110 Q43 85 48 65 Q50 50 44 30 Q42 18 46 8" stroke="#8B6F5A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                {/* Branch left */}
                <path d="M44 55 Q30 48 22 35" stroke="#8B6F5A" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                {/* Branch right */}
                <path d="M46 45 Q60 38 68 28" stroke="#8B6F5A" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                {/* Small branch left mid */}
                <path d="M45 70 Q34 65 28 55" stroke="#8B6F5A" strokeWidth="1" strokeLinecap="round" fill="none"/>
                {/* Small branch right mid */}
                <path d="M47 60 Q58 55 63 46" stroke="#8B6F5A" strokeWidth="1" strokeLinecap="round" fill="none"/>
                {/* Flowers left */}
                <circle cx="22" cy="35" r="4" fill="#C4A882" opacity="0.7"/>
                <circle cx="22" cy="35" r="2" fill="#8B6F5A" opacity="0.5"/>
                {/* Flower left mid */}
                <circle cx="28" cy="55" r="3" fill="#C4A882" opacity="0.6"/>
                <circle cx="28" cy="55" r="1.5" fill="#8B6F5A" opacity="0.4"/>
                {/* Flowers right */}
                <circle cx="68" cy="28" r="4" fill="#C4A882" opacity="0.7"/>
                <circle cx="68" cy="28" r="2" fill="#8B6F5A" opacity="0.5"/>
                {/* Flower right mid */}
                <circle cx="63" cy="46" r="3" fill="#C4A882" opacity="0.6"/>
                <circle cx="63" cy="46" r="1.5" fill="#8B6F5A" opacity="0.4"/>
                {/* Top flower */}
                <circle cx="46" cy="8" r="5" fill="#C4A882" opacity="0.7"/>
                <circle cx="46" cy="8" r="2.5" fill="#8B6F5A" opacity="0.5"/>
                {/* Small leaves */}
                <path d="M44 30 Q38 25 36 18 Q42 20 44 30Z" fill="#C4A882" opacity="0.3"/>
                <path d="M44 30 Q50 24 53 17 Q47 20 44 30Z" fill="#C4A882" opacity="0.3"/>
              </svg>
            </div>
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
                <Label>{t.genderLabel}</Label>
                <div className="flex gap-3">
                  {[{ value: 'female', label: t.female }, { value: 'male', label: t.male }].map(option => (
                    <label
                      key={option.value}
                      className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer"
                      style={{ backgroundColor: 'var(--color-bg-subtle)' }}
                    >
                      <input
                        type="checkbox"
                        checked={editForm.gender === option.value}
                        onChange={() => { if (!profile?.gender) setEditForm({ ...editForm, gender: option.value }); }}
                        disabled={!!profile?.gender}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{option.label}</span>
                    </label>
                  ))}
                </div>
                {profile?.gender && (
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.genderLocked}</p>
                )}
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

        {/* Section label */}
        <p className="text-xs font-semibold uppercase tracking-widest px-1 pt-1" style={{ color: 'var(--color-text-muted)' }}>
          {lang === 'da' ? 'Genveje' : 'Shortcuts'}
        </p>

        {/* 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Bookmark, label: t.favorites, sub: lang === 'da' ? 'Dine gemte øjeblikke' : 'Your saved moments', page: 'Favorites' },
            { icon: Bell, label: t.notifications, sub: lang === 'da' ? 'Hvad du vil have besked om' : 'What to be notified of', page: 'Settings' },
            { icon: Settings, label: t.settings, sub: lang === 'da' ? 'Tilpas appen til dig' : 'Customise the app', page: 'Settings' },
            { icon: UserPlus, label: lang === 'da' ? 'Deling & adgang' : 'Sharing & access', sub: lang === 'da' ? 'Inviter en du stoler på' : 'Invite someone you trust', page: 'FamilyInvite' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={i}
                to={createPageUrl(item.page)}
                className="rounded-2xl p-4 flex flex-col gap-2 cursor-pointer active:opacity-70 transition-opacity"
                style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
              >
                <div className="flex items-center justify-between">
                  <Icon className="w-5 h-5" style={{ color: '#B08D72' }} />
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--color-text-primary)' }}>{item.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{item.sub}</p>
                </div>
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
            style={{ background: cardBg, borderColor: cardBorder }}
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
            style={{ background: cardBg, borderColor: cardBorder }}
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
            style={{ background: cardBg }}
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
  );
}