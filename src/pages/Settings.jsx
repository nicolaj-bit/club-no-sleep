import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Lock, Bell, Shield, HelpCircle, Mail, Trash2 } from 'lucide-react';
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
      icon: Shield,
      title: 'Privatliv',
      description: 'Administrer dine privatlivsindstillinger',
      link: 'Profile',
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b px-4 py-3" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Profile')}>
            <Button variant="ghost" size="icon" className="-ml-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Indstillinger</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Dark Mode Toggle */}
        <div className="rounded-xl border divide-y" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                <Moon className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
              </div>
              <div>
                <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Mørkt tema</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Skift mellem lys og mørk visning</p>
              </div>
            </div>
            <Switch checked={dark} onCheckedChange={toggle} />
          </div>
        </div>

        {/* Settings Items */}
        <div className="rounded-xl border divide-y" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          {settingsItems.map((item, i) => {
            const Icon = item.icon;
            
            if (item.toggle) {
              return (
                <div key={i} className="flex items-center justify-between p-4" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                      <Icon className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                    </div>
                    <div>
                      <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.title}</h3>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.description}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={item.defaultChecked} />
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
                className="flex items-center gap-3 p-4 w-full text-left transition-colors"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                  <Icon className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                </div>
                <div>
                  <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.title}</h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.description}</p>
                </div>
              </Wrapper>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--color-text-primary)' }}>Hjælp & Support</h3>
          <div className="rounded-xl border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-0">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ color: 'var(--color-text-primary)' }}>Ofte stillede spørgsmål</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Hvordan ændrer jeg min profil?</p>
                      <p style={{ color: 'var(--color-text-muted)' }}>Gå til din profil og tryk på "Rediger profil"</p>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Hvordan booker jeg en konsultation?</p>
                      <p style={{ color: 'var(--color-text-muted)' }}>Find en ekspert under Community og tryk "Book tid"</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-0">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ color: 'var(--color-text-primary)' }}>Kontakt support</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Send en email til support@example.com
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Delete Account */}
        <div className="mt-4">
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-3 p-4 w-full text-left rounded-xl border hover:bg-rose-50 transition-colors"
            style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className="font-medium text-rose-600">Slet konto</h3>
              <p className="text-xs text-slate-500">Permanent sletning af din konto og data</p>
            </div>
          </button>
        </div>

        {/* App Info */}
        <div className="text-center pt-6">
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Version 1.0.0</p>
        </div>
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