import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { showInAppLogin } from '@/lib/showInAppLogin';
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
import LegalModal from '@/components/landing/LegalModal';
import PageHeader from '@/components/ui/PageHeader';

// Brand-farver fra style guide – matcher menu-knapper præcist
const CARD_BG_LIGHT_SOLID = 'var(--color-bg-card)';
const CARD_BG_DARK = 'var(--color-bg-card)';
const BORDER_LIGHT = 'var(--color-border)';
const BORDER_DARK = 'var(--color-border)';
const ICON_COLOR = 'var(--color-accent)';

export default function Settings() {
  const { isDark, toggle } = useTheme();
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [faqContent, setFaqContent] = useState(null);
  const [supportContent, setSupportContent] = useState(null);
  const [helpLoaded, setHelpLoaded] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    wonderweeks_notifications: true,
    notif_pregnancy_weekly: true,
    notif_calendar_reminder: true,
    notif_sleep_encouragement: true,
    notif_blog_new: true
  });
  const [notifSaving, setNotifSaving] = useState(false);

  const cardBg = isDark ? CARD_BG_DARK : 'linear-gradient(135deg, var(--color-bg-card), var(--color-bg-subtle))';
  const cardBgSolid = isDark ? CARD_BG_DARK : CARD_BG_LIGHT_SOLID;
  const cardBorder = isDark ? BORDER_DARK : BORDER_LIGHT;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
        if (profiles.length) {
          setProfile(profiles[0]);
          const p = profiles[0];
          setNotifPrefs({
            wonderweeks_notifications: p.wonderweeks_notifications !== false,
            notif_pregnancy_weekly: p.notif_pregnancy_weekly !== false,
            notif_calendar_reminder: p.notif_calendar_reminder !== false,
            notif_sleep_encouragement: p.notif_sleep_encouragement !== false,
            notif_blog_new: p.notif_blog_new !== false
          });
        }
      } catch {
        showInAppLogin('/Settings');
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
      setProfile((p) => ({ ...p, subscription_cancel_at: res.data.cancel_at }));
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
      setFaqContent(results.find((r) => r.type === 'faq') || null);
      setSupportContent(results.find((r) => r.type === 'support') || null);
      setHelpLoaded(true);
    };
    loadHelp();
  }, []);

  const openPrivacy = () => setPrivacyOpen(true);
  const openTerms = () => setTermsOpen(true);

  const gridItems = [
  ...(isAdmin ? [{ icon: FileText, label: 'Admin', link: 'AdminEditor' }] : []),
  { icon: Lock, label: t.password, action: () => setPasswordOpen(true) },
  { icon: Bell, label: t.notifications, action: () => setNotifOpen(true) },
  { icon: HelpCircle, label: t.help, accordion: true }];


  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: 'var(--color-bg)' }}>
      <PageHeader title={t.settingsTitle} backUrl={createPageUrl('Profile')} />

      <div className="px-4 space-y-4 mt-2">

        {/* Grid items */}
        <div className="grid grid-cols-2 gap-3">
          {gridItems.filter((i) => !i.accordion).map((item, i) => {
            const Icon = item.icon;

            if (item.toggle) {
              return (
                <div
                  key={i}
                  className="rounded-2xl p-5 flex flex-col gap-3 border"
                  style={{ background: cardBg, borderColor: cardBorder }}>
                  
                  <Icon className="w-6 h-6" style={{ color: ICON_COLOR }} />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.label}</span>
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                </div>);

            }

            const Wrapper = item.link ? Link : 'button';
            const wrapperProps = item.link ? { to: createPageUrl(item.link) } : { onClick: item.action };

            return (
              <Wrapper
                key={i}
                {...wrapperProps}
                className="rounded-2xl p-5 flex flex-col gap-3 text-left cursor-pointer active:opacity-70 transition-opacity border"
                style={{ background: cardBg, borderColor: cardBorder }}>
                
                <Icon className="w-6 h-6" style={{ color: ICON_COLOR }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.label}</span>
              </Wrapper>);

          })}
        </div>

        {/* Tema – Lys / Mørk */}
        <div
          className="rounded-2xl p-5 space-y-3 border"
          style={{ background: cardBg, borderColor: cardBorder }}>
          
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
                color: !isDark ? 'var(--color-primary-foreground)' : 'var(--color-text-muted)'
              }}>
              
              <Sun className="w-4 h-4 mx-auto mb-1" style={{ color: !isDark ? 'var(--color-primary-foreground)' : 'var(--color-text-muted)' }} />
              {t.light}
            </button>
            <button
              onClick={() => !isDark && toggle()}
              className="py-3 rounded-xl text-sm font-medium border transition-all cursor-pointer"
              style={{
                background: isDark ? 'var(--color-accent)' : 'transparent',
                borderColor: isDark ? 'var(--color-accent)' : cardBorder,
                color: isDark ? '#fff' : 'var(--color-text-muted)'
              }}>
              
              <Moon className="w-4 h-4 mx-auto mb-1" style={{ color: isDark ? '#fff' : 'var(--color-text-muted)' }} />
              {t.dark}
            </button>
          </div>
          <UserColorThemePicker />
        </div>

        {/* Admin push */}
        {isAdmin && <PushNotificationSender />}

        {/* Admin sandbox checkout — kun for admin (test af IAP via App Store Sandbox) */}
        {isAdmin &&
        <Link
          to="/Checkout"
          className="w-full py-4 rounded-2xl text-sm font-medium cursor-pointer active:opacity-70 transition-opacity border flex items-center justify-center gap-2"
          style={{ background: cardBg, borderColor: cardBorder, color: 'var(--color-text-secondary)' }}>
          
            <CreditCard className="w-4 h-4" style={{ color: ICON_COLOR }} />
            Sandbox betaling (admin)
          </Link>
        }

        {/* FAQ + Support */}
        <div
          className="rounded-2xl overflow-hidden border"
          style={{ background: cardBgSolid, borderColor: cardBorder }}>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq" className="border-0 border-b" style={{ borderColor: cardBorder }}>
              




              
              <AccordionContent className="px-5 pb-4 text-sm leading-relaxed prose prose-sm max-w-none" style={{ color: 'var(--color-text-muted)' }}>
                {faqContent ?
                <div dangerouslySetInnerHTML={{ __html: faqContent.content }} /> :
                !helpLoaded ? t.loading : t.noFaqAvailable}
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
                {supportContent ?
                <div dangerouslySetInnerHTML={{ __html: supportContent.content }} /> :
                !helpLoaded ? t.loading : t.noSupportInfo}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Betingelser + Privatliv */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={openTerms}
            className="py-4 rounded-2xl text-sm font-medium cursor-pointer active:opacity-70 transition-opacity border flex items-center justify-center gap-2"
            style={{ background: cardBg, borderColor: cardBorder, color: 'var(--color-text-secondary)' }}>
            
            <FileText className="w-4 h-4" style={{ color: ICON_COLOR }} />
            Betingelser
          </button>
          <button
            onClick={openPrivacy}
            className="py-4 rounded-2xl text-sm font-medium cursor-pointer active:opacity-70 transition-opacity border flex items-center justify-center gap-2"
            style={{ background: cardBg, borderColor: cardBorder, color: 'var(--color-text-secondary)' }}>
            
            <Shield className="w-4 h-4" style={{ color: ICON_COLOR }} />
            Privatliv
          </button>
        </div>

        {/* Opsig abonnement */}
        <button
          onClick={() => setCancelOpen(true)}
          className="w-full py-4 rounded-2xl text-sm font-medium cursor-pointer active:opacity-70 transition-opacity border"
          style={{ background: cardBg, borderColor: cardBorder, color: 'var(--color-text-secondary)' }}>
          
          <span className="flex items-center justify-center gap-2">
            <CreditCard className="w-4 h-4" style={{ color: ICON_COLOR }} />
            {profile?.subscription_cancel_at ?
            `Opsagt — adgang til ${new Date(profile.subscription_cancel_at).toLocaleDateString('da-DK', { day: 'numeric', month: 'long' })}` :
            'Opsig abonnement'}
          </span>
        </button>

        {/* Slet konto */}
        <button
          onClick={() => setDeleteOpen(true)}
          className="w-full py-4 rounded-2xl text-sm font-medium cursor-pointer active:opacity-70 transition-opacity border"
          style={{ background: cardBg, borderColor: cardBorder, color: 'var(--color-text-secondary)' }}>
          
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
            <Input id="current-pw" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-pw">{t.newPassword}</Label>
            <Input id="new-pw" type="password" value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-pw">{t.confirmPassword}</Label>
            <Input id="confirm-pw" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
          </div>
          <Button className="w-full" style={{ background: 'var(--color-accent)', color: '#fff' }} onClick={() => {
            if (passwordForm.new !== passwordForm.confirm) {toast.error(t.passwordMismatch);return;}
            toast.success(t.passwordUpdated);
            setPasswordOpen(false);
            setPasswordForm({ current: '', new: '', confirm: '' });
          }}>
            {t.updatePassword}
          </Button>
          <div className="h-2" />
        </div>
      </BottomSheet>

      {/* Notification preferences */}
      <BottomSheet open={notifOpen} onOpenChange={setNotifOpen} title="Notifikationer">
        <div className="px-5 py-4 space-y-5">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Vælg hvilke notifikationer du vil modtage.</p>

          {[
          { key: 'wonderweeks_notifications', label: 'Tigerspring', desc: 'Når dit barn nærmer sig et nyt tigerspring' },
          { key: 'notif_pregnancy_weekly', label: 'Ugentlig graviditetsopdatering', desc: 'Hvad sker der i din graviditetsuge' },
          { key: 'notif_calendar_reminder', label: 'Kalender påmindelser', desc: 'Notifikation om kommende aftaler' },
          { key: 'notif_sleep_encouragement', label: 'Søvnopmuntring', desc: 'Personlige råd baseret på dine søvnlogs' },
          { key: 'notif_blog_new', label: 'Nyt indhold', desc: 'Nye blogindlæg og artikler' }].
          map(({ key, label, desc }) =>
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
              }} />
            
            </div>
          )}
          <div className="h-2" />
        </div>
      </BottomSheet>

      {/* Terms */}
      {termsOpen && <LegalModal type="terms" title="Handelsbetingelser" onClose={() => setTermsOpen(false)} />}

      {/* Privacy */}
      {privacyOpen && <LegalModal type="privacy" title={t.privacy} onClose={() => setPrivacyOpen(false)} />}

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
            className="text-sm underline underline-offset-2 cursor-pointer"
            style={{ color: 'var(--color-accent)' }}>
            
            Læs handelsbetingelserne →
          </button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleCancelSubscription}
            disabled={cancelLoading}>
            
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
            <Input id="delete-confirm" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder={t.deleteConfirmWord} />
          </div>
          <Button variant="destructive" className="w-full" disabled={deleteConfirm !== t.deleteConfirmWord} onClick={async () => {
            try {
              const { Capacitor } = await import('@capacitor/core');
              if (Capacitor.isNativePlatform()) {
                const mod = await import('@onesignal/capacitor-plugin');
                const OneSignal = mod.default ?? mod.OneSignal;
                await OneSignal.logout();
              }
            } catch {}
            base44.auth.logout('/');
          }}>
            <Trash2 className="w-4 h-4 mr-2" />
            {t.deletePermanently}
          </Button>
          <div className="h-2" />
        </div>
      </BottomSheet>
    </div>);

}