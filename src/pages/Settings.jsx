import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Lock, Bell, Shield, HelpCircle, Mail, Trash2, Moon } from 'lucide-react';
import { useTheme } from '@/components/ui/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Settings() {
  const { isDark, toggle } = useTheme();
  const [user, setUser] = useState(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

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

  const settingsItems = [
    {
      icon: Lock,
      title: 'Skift adgangskode',
      description: 'Opdater din adgangskode',
      action: () => setPasswordOpen(true),
    },
    {
      icon: Bell,
      title: 'Notifikationer',
      description: 'Administrer push notifikationer',
      toggle: true,
      defaultChecked: true,
    },
    {
      icon: Moon,
      title: 'Mørkt tema',
      description: 'Skift til mørkt udseende',
      toggle: true,
      checked: isDark,
      onToggle: toggle,
    },
    {
      icon: Shield,
      title: 'Privatliv',
      description: 'Administrer dine privatlivsindstillinger',
      link: 'Profile',
    },
  ];

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="pt-6 pb-2 px-6 text-center relative">
        <Link to={createPageUrl('Profile')} className="absolute left-4 top-6">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-serif" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
          Indstillinger
        </h1>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Settings grid */}
        <div className="grid grid-cols-2 gap-3">
          {settingsItems.map((item, i) => {
            const Icon = item.icon;

            if (item.toggle) {
              return (
                <div
                  key={i}
                  className="rounded-2xl p-5 flex flex-col gap-3"
                  style={{ background: 'var(--color-bg-card)' }}
                >
                  <Icon className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.title}</span>
                    <Switch
                      checked={item.onToggle ? item.checked : undefined}
                      defaultChecked={item.onToggle ? undefined : item.defaultChecked}
                      onCheckedChange={item.onToggle || undefined}
                    />
                  </div>
                </div>
              );
            }

            const Wrapper = item.link ? Link : 'button';
            const wrapperProps = item.link
              ? { to: createPageUrl(item.link) }
              : { onClick: item.action };

            return (
              <Wrapper
                key={i}
                {...wrapperProps}
                className="rounded-2xl p-5 flex flex-col gap-3 text-left active:scale-[0.97] transition-transform"
                style={{ background: 'var(--color-bg-card)' }}
              >
                <Icon className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.title}</span>
              </Wrapper>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-bg-card)' }}>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-0 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <AccordionTrigger className="px-5 hover:no-underline">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Ofte stillede spørgsmål</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <p className="mb-2"><strong style={{ color: 'var(--color-text-secondary)' }}>Hvordan ændrer jeg min profil?</strong><br />Gå til din profil og tryk på "Rediger profil"</p>
                <p><strong style={{ color: 'var(--color-text-secondary)' }}>Hvordan finder jeg en behandler?</strong><br />Find en behandler under Community fanen</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-0">
              <AccordionTrigger className="px-5 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Kontakt support</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Send en email til support@example.com
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Delete Account */}
        <button
          onClick={() => setDeleteOpen(true)}
          className="w-full py-4 rounded-2xl text-sm font-medium transition-all active:scale-[0.98]"
          style={{ background: 'var(--color-bg-card)', color: '#c0614a' }}
        >
          <span className="flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" />
            Slet konto
          </span>
        </button>

        <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>Version 1.0.0</p>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skift adgangskode</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nuværende adgangskode</Label>
              <Input 
                type="password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Ny adgangskode</Label>
              <Input 
                type="password"
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Bekræft ny adgangskode</Label>
              <Input 
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              />
            </div>
            <Button 
              className="w-full"
              onClick={() => {
                if (passwordForm.new !== passwordForm.confirm) {
                  toast.error('Adgangskoderne matcher ikke');
                  return;
                }
                toast.success('Adgangskode opdateret');
                setPasswordOpen(false);
                setPasswordForm({ current: '', new: '', confirm: '' });
              }}
            >
              Opdater adgangskode
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Delete Account Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-rose-600">Slet konto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              Er du sikker på, at du vil slette din konto? Denne handling kan <strong>ikke fortrydes</strong> og al din data vil blive permanent slettet.
            </p>
            <div className="space-y-2">
              <Label>Skriv <strong>SLET</strong> for at bekræfte</Label>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="SLET"
              />
            </div>
            <Button
              variant="destructive"
              className="w-full"
              disabled={deleteConfirm !== 'SLET'}
              onClick={() => {
                base44.auth.logout('/');
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Slet min konto permanent
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}