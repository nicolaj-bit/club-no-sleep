import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Camera, ArrowRight, ArrowLeft, Baby, MapPin, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TOTAL_STEPS = 3;

export default function Onboarding() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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
    base44.auth.me().then(u => {
      setUser(u);
      setForm(f => ({
        ...f,
        display_name: u.full_name || '',
        username: (u.email?.split('@')[0] || '').toLowerCase().replace(/[^a-z0-9_]/g, ''),
      }));
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, profile_image: file_url }));
    setUploading(false);
  };

  const handleFinish = async () => {
    if (!form.username.trim()) {
      toast.error('Vælg venligst et brugernavn');
      return;
    }
    if (!form.accept_terms || !form.accept_privacy) {
      toast.error('Du skal acceptere handelsbetingelser og privatlivspolitik');
      return;
    }
    setSaving(true);
    const { accept_terms, accept_privacy, ...profileData } = form;
    await base44.entities.UserProfile.create({
      ...profileData,
      user_email: user.email,
    });
    window.location.href = createPageUrl('Home');
  };

  const steps = [
    {
      icon: User,
      title: 'Hvem er du?',
      subtitle: 'Lad os lære dig at kende',
      content: (
        <div className="space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
                style={{ background: 'var(--color-bg-subtle)' }}
              >
                {form.profile_image ? (
                  <img src={form.profile_image} alt="profil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">👩</span>
                )}
              </div>
              <label
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow"
                style={{ background: 'var(--color-accent)' }}
              >
                <Camera className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {uploading ? 'Uploader...' : 'Tryk for at tilføje foto'}
            </span>
          </div>

          <div className="space-y-2">
            <Label>Dit navn</Label>
            <Input
              value={form.display_name}
              onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
              placeholder="Navn..."
              style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
            />
          </div>
          <div className="space-y-2">
            <Label>Brugernavn</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-text-muted)' }}>@</span>
              <Input
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                placeholder="dit_brugernavn"
                className="pl-7"
                style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
              />
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Kun bogstaver, tal og underscore</p>
          </div>
        </div>
      ),
    },
    {
      icon: MapPin,
      title: 'Hvor bor du?',
      subtitle: 'Find mødre i nærheden af dig',
      content: (
        <div className="space-y-5">
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: 'var(--color-bg-subtle)' }}
          >
            <MapPin className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-accent)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Vi bruger din by til at vise dig andre mødre i nærheden — helt frivilligt.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Din by</Label>
            <Input
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              placeholder="fx København, Aarhus..."
              style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
            />
          </div>
        </div>
      ),
    },
    {
      icon: Baby,
      title: 'Om dit barn',
      subtitle: 'Så kan vi beregne tigerspring for dig',
      content: (
        <div className="space-y-5">
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: 'var(--color-bg-subtle)' }}
          >
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

          <div className="flex items-center gap-3 pt-4">
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>betingelser</span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.accept_terms}
              onChange={e => setForm(f => ({ ...f, accept_terms: e.target.checked }))}
              className="w-5 h-5 mt-0.5 cursor-pointer"
            />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Jeg accepterer <a href="#" className="https://www.lalatoto.dk/pages/handelsbetingelser">handelsbetingelserne</a>
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.accept_privacy}
              onChange={e => setForm(f => ({ ...f, accept_privacy: e.target.checked }))}
              className="w-5 h-5 mt-0.5 cursor-pointer"
            />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Jeg accepterer <a href="#" className="https://www.lalatoto.dk/pages/privatlivspolitik">privatlivspolitikken</a>
            </span>
          </label>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];
  const StepIcon = currentStep.icon;
  const isLast = step === TOTAL_STEPS - 1;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Top */}
      <div className="px-6 pt-14 pb-6">
        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-all duration-300"
              style={{
                background: i <= step ? 'var(--color-accent)' : 'var(--color-bg-subtle)',
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--color-bg-subtle)' }}
          >
            <StepIcon className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-serif" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
              {currentStep.title}
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{currentStep.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="px-6 py-8 space-y-3">
        <Button
          className="w-full h-14 text-base font-semibold rounded-2xl"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
          disabled={saving || uploading}
          onClick={() => {
            if (isLast) handleFinish();
            else setStep(s => s + 1);
          }}
        >
          {saving ? 'Gemmer...' : isLast ? 'Kom i gang 🎉' : (
            <span className="flex items-center gap-2">
              Næste <ArrowRight className="w-5 h-5" />
            </span>
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

        {!isLast && (
          <button
            onClick={() => {
              if (isLast) handleFinish();
              else setStep(s => s + 1);
            }}
            className="w-full py-2 text-sm text-center"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Spring over
          </button>
        )}
      </div>
    </div>
  );
}