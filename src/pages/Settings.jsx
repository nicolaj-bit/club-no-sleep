import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Lock, Bell, Shield, HelpCircle, Mail, Trash2, Moon, FileText, Sun, CreditCard } from 'lucide-react';
import PushNotificationSender from '@/components/admin/PushNotificationSender';
import UserColorThemePicker from '@/components/ui/UserColorThemePicker';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useLanguage } from '@/components/ui/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BottomSheet } from '@/components/ui/BottomSheet';

// Brand-farver fra style guide – matcher menu-knapper præcist
const CARD_BG_LIGHT_SOLID = '#F0EBE3';
const CARD_BG_DARK    = '#3A2B22';
const BORDER_LIGHT    = '#E8DDD2';
const BORDER_DARK     = '#3A312B';
const ICON_COLOR      = '#C29A73';

export default function Settings() {
  const { isDark, toggle } = useTheme();
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [privacyContent, setPrivacyContent] = useState(null);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [faqContent, setFaqContent] = useState(null);
  const [supportContent, setSupportContent] = useState(null);
  const [helpLoaded, setHelpLoaded] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsContent, setTermsContent] = useState(null);
  const [termsLoading, setTermsLoading] = useState(false);

  const cardBg     = isDark ? CARD_BG_DARK : 'linear-gradient(135deg, #F7F2EC, #EDE4D8)';
  const cardBgSolid = isDark ? CARD_BG_DARK : CARD_BG_LIGHT_SOLID;
  const cardBorder = isDark ? BORDER_DARK  : BORDER_LIGHT;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
        if (profiles.length) setProfile(profiles[0]);
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      const res = await base44.functions.invoke('cancelSubscription', {});
      const cancelDate = new Date(res.data.cancel_at).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' });
      toast.success(`Abonnement opsagt. Du har adgang til ${cancelDate}.`);
      setCancelOpen(false);
      setProfile(p => ({ ...p, subscription_cancel_at: res.data.cancel_at }));
    } catch (e) {
      toast.error(e.message || 'Noget gik galt. Prøv igen.');
    } finally {
      setCancelLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const loadHelp = async () => {
      const results = await base44.entities.LegalContent.list();
      setFaqContent(results.find(r => r.type === 'faq') || null);
      setSupportContent(results.find(r => r.type === 'support') || null);
      setHelpLoaded(true);
    };
    loadHelp();
  }, []);

  const openPrivacy = async () => {
    setPrivacyLoading(true);
    try {
      const results = await base44.entities.LegalContent.filter({ type: 'privacy' });
      setPrivacyContent(results[0] || null);
      setPrivacyOpen(true);
    } finally {
      setPrivacyLoading(false);
    }
  };

  const openTerms = async () => {
    setTermsLoading(true);
    try {
      const results = await base44.entities.LegalContent.filter({ type: 'terms' });
      setTermsContent(results[0] || null);
      setTermsOpen(true);
    } finally {
      setTermsLoading(false);
    }
  };

  const gridItems = [
    ...(isAdmin ? [{ icon: FileText, label: t.blogAndArticles, link: 'AdminEditor' }] : []),
    { icon: Lock,        label: t.password,      action: () => setPasswordOpen(true) },
    { icon: Bell,        label: t.notifications, toggle: true, defaultChecked: true },
    { icon: Shield,      label: t.privacy,       action: openPrivacy },
    { icon: HelpCircle,  label: t.help,          accordion: true },
  ];

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="pt-8 pb-4 px-5 flex items-center justify-center relative">
        <Link to={createPageUrl('Profile')} className="absolute left-4">
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: isDark ? CARD_BG_DARK : 'linear-gradient(135deg, #F7F2EC, #EDE4D8)', border: `1px solid ${cardBorder}` }}
          >
            <ChevronLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </Link>
        <h1
          className="text-3xl font-light"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif', letterSpacing: '0.06em' }}
        >
          {t.settingsTitle}
        </h1>
      </div>

      <div className="px-4 space-y-4 mt-2">

        {/* Grid items */}
        <div className="grid grid-cols-2 gap-3">
          {gridItems.filter(i => !i.accordion).map((item, i) => {
            const Icon = item.icon;

            if (item.toggle) {
              return (
                <div
                  key={i}
                  className="rounded-2xl p-5 flex flex-col gap-3 border"
                  style={{ background: cardBg, borderColor: cardBorder }}
                >
                  <Icon className="w-6 h-6" style={{ color: ICON_COLOR }} />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.label}</span>
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                </div>
              );
            }

            const Wrapper = item.link ? Link : 'button';
            const wrapperProps = item.link ? { to: createPageUrl(item.link) } : { onClick: item.action };

            return (
              <Wrapper
                key={i}
                {...wrapperProps}
                className="rounded-2xl p-5 flex flex-col gap-3 text-left cursor-pointer active:opacity-70 transition-opacity border"
                style={{ background: cardBg, borderColor: cardBorder }}
              >
                <Icon className="w-6 h-6" style={{ color: ICON_COLOR }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.label}</span>
              </Wrapper>
            );
          })}
        </div>

        {/* Tema – Lys / Mørk */}
        <div
          className="rounded-2xl p-5 space-y-3 border"
          style={{ background: cardBg, borderColor: cardBorder }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.theme}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{t.chooseTheme}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => isDark && toggle()}
              className="py-3 rounded-xl text-sm font-medium border transition-all cursor-pointer"
              style={{
                background: !isDark ? 'var(--color-accent)' : 'transparent',
                borderColor: !isDark ? 'var(--color-accent)' : cardBorder,
                color: !isDark ? '#fff' : 'var(--color-text-muted)',
              }}
            >
              <Sun className="w-4 h-4 mx-auto mb-1" style={{ color: !isDark ? '#fff' : 'var(--color-text-muted)' }} />
              {t.light}
            </button>
            <button
              onClick={() => !isDark && toggle()}
              className="py-3 rounded-xl text-sm font-medium border transition-all cursor-pointer"
              style={{
                background: isDark ? 'var(--color-accent)' : 'transparent',
                borderColor: isDark ? 'var(--color-accent)' : cardBorder,
                color: isDark ? '#fff' : 'var(--color-text-muted)',
              }}
            >
              <Moon className="w-4 h-4 mx-auto mb-1" style={{ color: isDark ? '#fff' : 'var(--color-text-muted)' }} />
              {t.dark}
            </button>
          </div>
          <UserColorThemePicker />
        </div>

        {/* Admin push */}
        {isAdmin && <PushNotificationSender />}

        {/* FAQ + Support */}
        <div
          className="rounded-2xl overflow-hidden border"
          style={{ background: cardBgSolid, borderColor: cardBorder }}
        >
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq" className="border-0 border-b" style={{ borderColor: cardBorder }}>
              <AccordionTrigger className="px-5 hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5" style={{ color: ICON_COLOR }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.faq}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4 text-sm leading-relaxed prose prose-sm max-w-none" style={{ color: 'var(--color-text-muted)' }}>
                {faqContent
                  ? <div dangerouslySetInnerHTML={{ __html: faqContent.content }} />
                  : (!helpLoaded ? t.loading : t.noFaqAvailable)}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="support" className="border-0">
              <AccordionTrigger className="px-5 hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5" style={{ color: ICON_COLOR }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.contactSupport}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4 text-sm prose prose-sm max-w-none" style={{ color: 'var(--color-text-muted)' }}>
                {supportContent
                  ? <div dangerouslySetInnerHTML={{ __html: supportContent.content }} />
                  : (!helpLoaded ? t.loading : t.noSupportInfo)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Betingelser + Privatliv */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={openTerms}
            disabled={termsLoading}
            className="py-4 rounded-2xl text-sm font-medium cursor-pointer active:opacity-70 transition-opacity border flex items-center justify-center gap-2"
            style={{ background: cardBg, borderColor: cardBorder, color: 'var(--color-text-secondary)' }}
          >
            <FileText className="w-4 h-4" style={{ color: ICON_COLOR }} />
            {termsLoading ? '…' : 'Betingelser'}
          </button>
          <button
            onClick={openPrivacy}
            disabled={privacyLoading}
            className="py-4 rounded-2xl text-sm font-medium cursor-pointer active:opacity-70 transition-opacity border flex items-center justify-center gap-2"
            style={{ background: cardBg, borderColor: cardBorder, color: 'var(--color-text-secondary)' }}
          >
            <Shield className="w-4 h-4" style={{ color: ICON_COLOR }} />
            {privacyLoading ? '…' : 'Privatliv'}
          </button>
        </div>

        {/* Opsig abonnement */}
        <button
          onClick={() => setCancelOpen(true)}
          className="w-full py-4 rounded-2xl text-sm font-medium cursor-pointer active:opacity-70 transition-opacity border"
          style={{ background: cardBg, borderColor: cardBorder, color: 'var(--color-text-secondary)' }}
        >
          <span className="flex items-center justify-center gap-2">
            <CreditCard className="w-4 h-4" style={{ color: ICON_COLOR }} />
            {profile?.subscription_cancel_at
              ? `Opsagt — adgang til ${new Date(profile.subscription_cancel_at).toLocaleDateString('da-DK', { day: 'numeric', month: 'long' })}`
              : 'Opsig abonnement'}
          </span>
        </button>

        {/* Slet konto */}
        <button
          onClick={() => setDeleteOpen(true)}
          className="w-full py-4 rounded-2xl text-sm font-medium cursor-pointer active:opacity-70 transition-opacity border"
          style={{ background: cardBg, borderColor: cardBorder, color: 'var(--color-text-secondary)' }}
        >
          <span className="flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" style={{ color: '#e57373' }} />
            {t.deleteAccount}
          </span>
        </button>

        <p className="text-center text-xs pb-2" style={{ color: 'var(--color-text-muted)' }}>{t.version}</p>
      </div>

      {/* Change Password */}
      <BottomSheet open={passwordOpen} onOpenChange={setPasswordOpen} title={t.changePassword}>
        <div className="px-5 py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-pw">{t.currentPassword}</Label>
            <Input id="current-pw" type="password" value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-pw">{t.newPassword}</Label>
            <Input id="new-pw" type="password" value={passwordForm.new} onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-pw">{t.confirmPassword}</Label>
            <Input id="confirm-pw" type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
          </div>
          <Button className="w-full" style={{ background: 'var(--color-accent)', color: '#fff' }} onClick={() => {
            if (passwordForm.new !== passwordForm.confirm) { toast.error(t.passwordMismatch); return; }
            toast.success(t.passwordUpdated);
            setPasswordOpen(false);
            setPasswordForm({ current: '', new: '', confirm: '' });
          }}>
            {t.updatePassword}
          </Button>
          <div className="h-2" />
        </div>
      </BottomSheet>

      {/* Terms */}
      <BottomSheet open={termsOpen} onOpenChange={setTermsOpen} title="Handelsbetingelser">
        <div className="px-5 py-4">
          {termsContent ? (
            <div className="rounded-2xl p-5 mb-4 border" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
              <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: termsContent.content }} />
            </div>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>Ingen handelsbetingelser tilgængelige</p>
          )}
          <div className="h-2" />
        </div>
      </BottomSheet>

      {/* Privacy */}
      <BottomSheet open={privacyOpen} onOpenChange={setPrivacyOpen} title={t.privacy}>
        <div className="px-5 py-4">
          {privacyLoading ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>{t.loading}</p>
          ) : privacyContent ? (
            <div className="rounded-2xl p-5 mb-4 border" style={{ background: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
              <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: privacyContent.content }} />
            </div>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>{t.noPrivacyPolicy}</p>
          )}
          <div className="h-2" />
        </div>
      </BottomSheet>

      {/* Cancel subscription */}
      <BottomSheet open={cancelOpen} onOpenChange={setCancelOpen} title="Opsig abonnement">
        <div className="px-5 py-4 space-y-4">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
            Du kan til enhver tid opsige dit abonnement. Opsigelse træder i kraft ved udløbet af den <strong>løbende måned</strong> — ingen binding.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Du bevarer adgang til LALATOTO resten af den betalte periode. Der refunderes ikke for resterende dage.
          </p>
          <button
            onClick={openTerms}
            disabled={termsLoading}
            className="text-sm underline underline-offset-2 cursor-pointer"
            style={{ color: 'var(--color-accent)' }}
          >
            {termsLoading ? '…' : 'Læs handelsbetingelserne →'}
          </button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleCancelSubscription}
            disabled={cancelLoading}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {cancelLoading ? 'Opsiger…' : 'Bekræft opsigelse'}
          </Button>
          <button onClick={() => setCancelOpen(false)} className="w-full py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Fortryd
          </button>
          <div className="h-2" />
        </div>
      </BottomSheet>

      {/* Delete account */}
      <BottomSheet open={deleteOpen} onOpenChange={setDeleteOpen} title={t.deleteAccount}>
        <div className="px-5 py-4 space-y-4">
          <p className="text-sm leading-relaxed text-rose-500">{t.deleteWarning}</p>
          <div className="space-y-2">
            <Label htmlFor="delete-confirm">{t.typeToConfirmDelete}</Label>
            <Input id="delete-confirm" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder={t.deleteConfirmWord} />
          </div>
          <Button variant="destructive" className="w-full" disabled={deleteConfirm !== t.deleteConfirmWord} onClick={() => base44.auth.logout('/')}>
            <Trash2 className="w-4 h-4 mr-2" />
            {t.deletePermanently}
          </Button>
          <div className="h-2" />
        </div>
      </BottomSheet>
    </div>
  );
}