import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Lock, Bell, Shield, HelpCircle, Mail, Trash2, Moon, FileText, Sun } from 'lucide-react';
import PushNotificationSender from '@/components/admin/PushNotificationSender';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useLanguage } from '@/components/ui/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BottomSheet } from '@/components/ui/BottomSheet';

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

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

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
    setPrivacyOpen(true);
    setPrivacyLoading(true);
    try {
      const results = await base44.entities.LegalContent.filter({ type: 'privacy' });
      setPrivacyContent(results[0] || null);
    } finally {
      setPrivacyLoading(false);
    }
  };

  const gridItems = [
    ...(isAdmin ? [{ icon: FileText, label: t.blogAndArticles, link: 'AdminEditor' }] : []),
    { icon: Lock, label: t.password, action: () => setPasswordOpen(true) },
    { icon: Bell, label: t.notifications, toggle: true, defaultChecked: true },
    { icon: Shield, label: t.privacy, action: openPrivacy },
    { icon: HelpCircle, label: t.help, accordion: true },
  ];

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="pt-8 pb-4 px-5 flex items-center justify-center relative">
        <Link to={createPageUrl('Profile')} className="absolute left-4">
          <button className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer" style={{ background: 'var(--color-bg-card)' }}>
            <ChevronLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </Link>
        <h1 className="text-3xl font-light" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif', letterSpacing: '0.06em' }}>
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
                <div key={i} className="rounded-2xl p-5 flex flex-col gap-3 border" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <Icon className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
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
                style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
              >
                <Icon className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.label}</span>
              </Wrapper>
            );
          })}
        </div>

        {/* Tema – Lys / Mørk */}
        <div className="rounded-2xl p-5 space-y-3 border" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.theme}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{t.chooseTheme}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => isDark && toggle()}
              className="py-3 rounded-xl text-sm font-medium border transition-all cursor-pointer"
              style={{
                background: !isDark ? '#E7D3B1' : '#C9B899',
                borderColor: !isDark ? '#E7D3B1' : '#C9B899',
                color: 'var(--color-text-primary)',
              }}
            >
              <Sun className="w-4 h-4 mx-auto mb-1" style={{ color: 'var(--color-text-muted)' }} />
              {t.light}
            </button>
            <button
              onClick={() => !isDark && toggle()}
              className="py-3 rounded-xl text-sm font-medium border transition-all cursor-pointer"
              style={{
                background: isDark ? '#B8A989' : 'transparent',
                borderColor: isDark ? '#B8A989' : 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <Sun className="w-4 h-4 mx-auto mb-1" style={{ color: 'var(--color-text-muted)' }} />
              {t.dark}
            </button>
          </div>
        </div>

        {/* Admin push */}
        {isAdmin && <PushNotificationSender />}

        {/* FAQ + Support */}
        <div className="rounded-2xl overflow-hidden border" style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq" className="border-0 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <AccordionTrigger className="px-5 hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.faq}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4 text-sm leading-relaxed prose prose-sm max-w-none" style={{ color: 'var(--color-text-muted)' }}>
                {faqContent
                  ? <div dangerouslySetInnerHTML={{ __html: faqContent.content }} />
                  : (!helpLoaded ? 'Indlæser...' : 'Ingen FAQ tilgængelig endnu.')}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="support" className="border-0">
              <AccordionTrigger className="px-5 hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.contactSupport}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4 text-sm prose prose-sm max-w-none" style={{ color: 'var(--color-text-muted)' }}>
                {supportContent
                  ? <div dangerouslySetInnerHTML={{ __html: supportContent.content }} />
                  : (!helpLoaded ? 'Indlæser...' : 'Ingen supportinfo tilgængelig endnu.')}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Delete account */}
        <button
          onClick={() => setDeleteOpen(true)}
          className="w-full py-4 rounded-2xl text-sm font-medium cursor-pointer active:opacity-70 transition-opacity border"
          style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          <span className="flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" />
            {t.deleteAccount}
          </span>
        </button>

        <p className="text-center text-xs pb-2" style={{ color: 'var(--color-text-muted)' }}>{t.version}</p>
      </div>

      {/* Change Password Bottom Sheet */}
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
          <Button className="w-full" onClick={() => {
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

      {/* Privacy Bottom Sheet */}
      <BottomSheet open={privacyOpen} onOpenChange={setPrivacyOpen} title="Privatliv">
        <div className="px-5 py-4">
          {privacyLoading ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>Indlæser...</p>
          ) : privacyContent ? (
            <div className="text-sm leading-relaxed prose prose-sm max-w-none pb-4" style={{ color: 'var(--color-text-primary)' }}
              dangerouslySetInnerHTML={{ __html: privacyContent.content }}
            />
          ) : (
            <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>Ingen privatlivspolitik tilgængelig endnu.</p>
          )}
          <div className="h-2" />
        </div>
      </BottomSheet>

      {/* Delete Account Bottom Sheet */}
      <BottomSheet open={deleteOpen} onOpenChange={setDeleteOpen} title={t.deleteAccount}>
        <div className="px-5 py-4 space-y-4">
          <p className="text-sm leading-relaxed text-rose-500">
            {t.deleteWarning}
          </p>
          <div className="space-y-2">
            <Label htmlFor="delete-confirm">{t.typeToConfirmDelete}</Label>
            <Input id="delete-confirm" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder={t.deleteConfirmWord} />
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