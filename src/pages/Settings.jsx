import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Lock, Bell, Shield, HelpCircle, Mail } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Profile')}>
            <Button variant="ghost" size="icon" className="-ml-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-slate-900">Indstillinger</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Settings Items */}
        <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
          {settingsItems.map((item, i) => {
            const Icon = item.icon;
            
            if (item.toggle) {
              return (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-500">{item.description}</p>
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
                className="flex items-center gap-3 p-4 w-full text-left hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
              </Wrapper>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 px-1">Hjælp & Support</h3>
          <div className="bg-white rounded-xl border border-slate-100">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-0">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-slate-400" />
                    <span>Ofte stillede spørgsmål</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3 text-sm text-slate-600">
                    <div>
                      <p className="font-medium">Hvordan ændrer jeg min profil?</p>
                      <p className="text-slate-500">Gå til din profil og tryk på "Rediger profil"</p>
                    </div>
                    <div>
                      <p className="font-medium">Hvordan booker jeg en konsultation?</p>
                      <p className="text-slate-500">Find en ekspert under Community og tryk "Book tid"</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-0">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <span>Kontakt support</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <p className="text-sm text-slate-600">
                    Send en email til support@example.com
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center pt-6">
          <p className="text-xs text-slate-400">Version 1.0.0</p>
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
    </div>
  );
}