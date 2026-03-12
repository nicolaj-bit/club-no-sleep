import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Camera, ArrowRight, ArrowLeft, Baby, MapPin, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Onboarding() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [openModal, setOpenModal] = useState(null);
  const [legalContent, setLegalContent] = useState({ terms: '', privacy: '' });

  const [form, setForm] = useState({
    username: '',
    display_name: '',
    city: '',
    profile_image: '',
    child_birthdate: '',
    child_due_date: '',
    accept_terms: false,
    accept_privacy: false,
  });

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        setForm(f => ({
          ...f,
          display_name: u.full_name || '',
          username: (u.email?.split('@')[0] || '').toLowerCase().replace(/[^a-z0-9_]/g, ''),
        }));
      })
      .catch(() => base44.auth.redirectToLogin());

    base44.entities.LegalContent.list().then(items => {
      const terms = items.find(i => i.type === 'terms');
      const privacy = items.find(i => i.type === 'privacy');
      setLegalContent({
        terms: terms?.content || 'Handelsbetingelserne er ikke opsat endnu.',
        privacy: privacy?.content || 'Privatlivspolitikken er ikke opsat endnu.',
      });
    });
  }, []);

  const setField = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
  };

  const validateStep0 = () => {
    const newErrors = {};
    if (!form.display_name.trim()) newErrors.display_name = 'Indtast dit navn';
    if (!form.username.trim()) newErrors.username = 'Vælg et brugernavn';
    else if (form.username.length < 3) newErrors.username = 'Mindst 3 tegn';
    if (!form.accept_terms) newErrors.accept_terms = 'Du skal acceptere handelsbetingelserne';
    if (!form.accept_privacy) newErrors.accept_privacy = 'Du skal acceptere privatlivspolitikken';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, profile_image: file_url }));
    setUploading(false);
  };

  const handleFinish = async () => {
    setSaving(true);
    const { accept_terms, accept_privacy, ...profileData } = form;
    await base44.entities.UserProfile.create({
      ...profileData,
      user_email: user.email,
    });
    window.location.href = createPageUrl('Home');
  };

  const STEPS = [
    { icon: Shield, title: 'Velkommen til LALATOTO', subtitle: 'Opret din profil og acceptér betingelserne' },
    { icon: MapPin, title: 'Hvor bor du?', subtitle: 'Find mødre i nærheden af dig' },
    { icon: Baby, title: 'Om dit barn', subtitle: 'Så kan vi beregne tigerspring for dig' },
  ];

  const current = STEPS[step];
  const StepIcon = current.icon;

  return (
    <>
      {/* Legal modals */}
      <Dialog open={!!openModal} onOpenChange={() => setOpenModal(null)}>
        <DialogContent className="max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {openModal === 'terms' ? 'Handelsbetingelser' : 'Privatlivspolitik'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-80 pr-4">
            <div
              style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', fontSize: '0.875rem' }}
              className="whitespace-pre-wrap"
            >
              {openModal === 'terms' ? legalContent.terms : legalContent.privacy}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>

        {/* Header */}
        <div className="px-6 pt-14 pb-6">
          {/* Progress bar */}
          <div className="flex gap-2 mb-8">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full transition-all duration-500"
                style={{ background: i <= step ? 'var(--color-accent)' : 'var(--color-bg-subtle)' }}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-bg-subtle)' }}>
              <StepIcon className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-serif" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
                {current.title}
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{current.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* STEP 0 */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="space-y-5">

                {/* Profilbillede */}
                <div className="flex flex-col items-center gap-2 pb-2">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden" style={{ background: 'var(--color-bg-subtle)' }}>
                      {form.profile_image
                        ? <img src={form.profile_image} alt="profil" className="w-full h-full object-cover" />
                        : <span className="text-4xl">👩</span>
                      }
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow" style={{ background: 'var(--color-accent)' }}>
                      <Camera className="w-4 h-4 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {uploading ? 'Uploader...' : 'Tilføj profilbillede (valgfrit)'}
                  </span>
                </div>

                {/* Navn */}
                <div className="space-y-1.5">
                  <Label>Dit navn</Label>
                  <Input
                    value={form.display_name}
                    onChange={e => setField('display_name', e.target.value)}
                    placeholder="Navn..."
                    style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: errors.display_name ? '#ef4444' : 'var(--color-border)' }}
                  />
                  {errors.display_name && <p className="text-xs text-red-500">{errors.display_name}</p>}
                </div>

                {/* Brugernavn */}
                <div className="space-y-1.5">
                  <Label>Brugernavn</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-text-muted)' }}>@</span>
                    <Input
                      value={form.username}
                      onChange={e => setField('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="dit_brugernavn"
                      className="pl-7"
                      style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: errors.username ? '#ef4444' : 'var(--color-border)' }}
                    />
                  </div>
                  {errors.username
                    ? <p className="text-xs text-red-500">{errors.username}</p>
                    : <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Kun bogstaver, tal og underscore</p>
                  }
                </div>

                {/* Betingelser */}
                <div className="rounded-2xl p-4 space-y-4" style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.accept_terms}
                      onChange={e => setField('accept_terms', e.target.checked)}
                      className="w-5 h-5 mt-0.5 cursor-pointer flex-shrink-0"
                    />
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Jeg accepterer{' '}
                      <button type="button" onClick={() => setOpenModal('terms')} className="underline font-semibold" style={{ color: 'var(--color-accent)' }}>
                        handelsbetingelserne
                      </button>
                    </span>
                  </label>
                  {errors.accept_terms && <p className="text-xs text-red-500">{errors.accept_terms}</p>}

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.accept_privacy}
                      onChange={e => setField('accept_privacy', e.target.checked)}
                      className="w-5 h-5 mt-0.5 cursor-pointer flex-shrink-0"
                    />
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Jeg accepterer{' '}
                      <button type="button" onClick={() => setOpenModal('privacy')} className="underline font-semibold" style={{ color: 'var(--color-accent)' }}>
                        privatlivspolitikken
                      </button>
                    </span>
                  </label>
                  {errors.accept_privacy && <p className="text-xs text-red-500">{errors.accept_privacy}</p>}
                </div>

              </motion.div>
            )}

            {/* STEP 1 – Lokation */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="space-y-5">
                <div className="rounded-2xl p-5 text-center" style={{ background: 'var(--color-bg-subtle)' }}>
                  <MapPin className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-accent)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Vi bruger din by til at vise dig andre mødre i nærheden — helt frivilligt.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Din by</Label>
                  <Input
                    value={form.city}
                    onChange={e => setField('city', e.target.value)}
                    placeholder="fx København, Aarhus..."
                    style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 2 – Barn */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="space-y-5">
                <div className="rounded-2xl p-5 text-center" style={{ background: 'var(--color-bg-subtle)' }}>
                  <span className="text-4xl">🐯</span>
                  <p className="text-sm mt-3" style={{ color: 'var(--color-text-secondary)' }}>
                    Vi bruger barnets fødselsdato eller terminsdato til at beregne udviklingsspring og sende dig relevante notifikationer.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Barnets fødselsdato</Label>
                  <Input
                    type="date"
                    value={form.child_birthdate}
                    onChange={e => setForm(f => ({ ...f, child_birthdate: e.target.value, child_due_date: '' }))}
                    style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>eller</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                </div>
                <div className="space-y-2">
                  <Label>Terminsdato (hvis ikke født endnu)</Label>
                  <Input
                    type="date"
                    value={form.child_due_date}
                    onChange={e => setForm(f => ({ ...f, child_due_date: e.target.value, child_birthdate: '' }))}
                    style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
                  />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Bottom nav */}
        <div className="px-6 py-8 space-y-3">
          <Button
            className="w-full h-14 text-base font-semibold rounded-2xl"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
            disabled={saving || uploading}
            onClick={() => {
              if (step === 0) {
                if (validateStep0()) setStep(1);
              } else if (step === 1) {
                setStep(2);
              } else {
                handleFinish();
              }
            }}
          >
            {saving ? 'Gemmer...' : step === 2 ? 'Kom i gang 🎉' : (
              <span className="flex items-center gap-2">Næste <ArrowRight className="w-5 h-5" /></span>
            )}
          </Button>

          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="w-full py-3 text-sm flex items-center justify-center gap-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <ArrowLeft className="w-4 h-4" /> Tilbage
            </button>
          )}

          {step > 0 && step < 2 && (
            <button
              onClick={() => setStep(s => s + 1)}
              className="w-full py-2 text-sm text-center"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Spring over
            </button>
          )}

          {step === 2 && (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="w-full py-2 text-sm text-center"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Spring over
            </button>
          )}
        </div>

      </div>
    </>
  );
}