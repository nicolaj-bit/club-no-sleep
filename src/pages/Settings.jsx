import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Lock, Bell, Shield, HelpCircle, Mail, Trash2, Moon, FileText, Sun } from 'lucide-react';
import PushNotificationSender from '@/components/admin/PushNotificationSender';
import { useTheme } from '@/components/ui/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Settings() {
  const { isDark, toggle } = useTheme();
  const [user, setUser] = useState(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

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

  const gridItems = [
    ...(isAdmin ? [{ icon: FileText, label: 'Blog & Artikler', link: 'AdminEditor' }] : []),
    { icon: Lock, label: 'Adgangskode', action: () => setPasswordOpen(true) },
    { icon: Bell, label: 'Notifikationer', toggle: true, defaultChecked: true },
    { icon: Shield, label: 'Privatliv', link: 'Profile' },
    { icon: HelpCircle, label: 'Hjælp', accordion: true },
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
        <h1 className="text-2xl" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
          Indstillinger
        </h1>
      </div>

      <div className="px-4 space-y-4 mt-2">

        {/* Grid items */}
        <div className="grid grid-cols-2 gap-3">
          {gridItems.filter(i => !i.accordion).map((item, i) => {
            const Icon = item.icon;

            if (item.toggle) {
              return (
                <div key={i} className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: 'var(--color-bg-card)' }}>
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
                className="rounded-2xl p-5 flex flex-col gap-3 text-left cursor-pointer active:opacity-70 transition-opacity"
                style={{ background: 'var(--color-bg-card)' }}
              >
                <Icon className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.label}</span>
              </Wrapper>
            );
          })}
        </div>

        {/* Tema – Lys / Mørk */}
        <div className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--color-bg-card)' }}>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Tema</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Vælg dit foretrukne look</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => isDark && toggle()}
              className="py-3 rounded-xl text-sm font-medium border-2 transition-all cursor-pointer"
              style={{
                background: !isDark ? 'var(--color-bg)' : 'transparent',
                borderColor: !isDark ? 'var(--color-text-primary)' : 'transparent',
                color: 'var(--color-text-primary)',
              }}
            >
              <Sun className="w-4 h-4 mx-auto mb-1" style={{ color: 'var(--color-text-muted)' }} />
              Lys
            </button>
            <button
              onClick={() => !isDark && toggle()}
              className="py-3 rounded-xl text-sm font-medium transition-all cursor-pointer"
              style={{
                background: isDark ? '#5a5047' : 'var(--color-bg-subtle)',
                color: isDark ? '#fff' : 'var(--color-text-secondary)',
              }}
            >
              <Moon className="w-4 h-4 mx-auto mb-1" />
              Mørk
            </button>
          </div>
        </div>

        {/* Admin push */}
        {isAdmin && <PushNotificationSender />}

        {/* FAQ + Support */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-bg-card)' }}>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq" className="border-0 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <AccordionTrigger className="px-5 hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Ofte stillede spørgsmål</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                <p className="mb-3"><strong style={{ color: 'var(--color-text-secondary)' }}>Hvordan ændrer jeg min profil?</strong><br />Gå til din profil og tryk på "Rediger".</p>
                <p><strong style={{ color: 'var(--color-text-secondary)' }}>Hvordan finder jeg en behandler?</strong><br />Find en behandler under Community-fanen.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="support" className="border-0">
              <AccordionTrigger className="px-5 hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Kontakt support</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Send en email til <a href="mailto:support@lalatoto.dk" className="underline" style={{ color: 'var(--color-accent)' }}>support@lalatoto.dk</a>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Delete account */}
        <button
          onClick={() => setDeleteOpen(true)}
          className="w-full py-4 rounded-2xl text-sm font-medium cursor-pointer active:opacity-70 transition-opacity"
          style={{ background: 'var(--color-bg-card)', color: '#c0614a' }}
        >
          <span className="flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" />
            Slet konto
          </span>
        </button>

        <p className="text-center text-xs pb-2" style={{ color: 'var(--color-text-muted)' }}>Version 1.0.0</p>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Skift adgangskode</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-pw">Nuværende adgangskode</Label>
              <Input id="current-pw" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw">Ny adgangskode</Label>
              <Input id="new-pw" type="password" value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw">Bekræft ny adgangskode</Label>
              <Input id="confirm-pw" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
            </div>
            <Button className="w-full" onClick={() => {
              if (passwordForm.new !== passwordForm.confirm) { toast.error('Adgangskoderne matcher ikke'); return; }
              toast.success('Adgangskode opdateret');
              setPasswordOpen(false);
              setPasswordForm({ current: '', new: '', confirm: '' });
            }}>
              Opdater adgangskode
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-rose-600">Slet konto</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Er du sikker? Denne handling kan <strong>ikke fortrydes</strong> — al din data slettes permanent.
            </p>
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">Skriv <strong>SLET</strong> for at bekræfte</Label>
              <Input id="delete-confirm" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="SLET" />
            </div>
            <Button variant="destructive" className="w-full" disabled={deleteConfirm !== 'SLET'} onClick={() => base44.auth.logout('/')}>
              <Trash2 className="w-4 h-4 mr-2" />
              Slet min konto permanent
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}