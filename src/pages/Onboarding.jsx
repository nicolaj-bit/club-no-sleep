import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Camera, ArrowRight, ArrowLeft, Baby, MapPin, User, Mail, CheckCircle, RefreshCw, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

// Flow:
// Step 0 – Acceptér betingelser + dit navn/brugernavn
// Step 1 – Bekræft e-mail
// Step 2 – Hvor bor du?
// Step 3 – Om dit barn

export default function Onboarding() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [resending, setResending] = useState(false);
  const [errors, setErrors] = useState({});

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

  const [openModal, setOpenModal] = useState(null);
  const [legalContent, setLegalContent] = useState({ terms: '', privacy: '' });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm(f => ({
        ...f,
        display_name: u.full_name || '',
        username: (u.email?.split('@')[0] || '').toLowerCase().replace(/[^a-z0-9_]/g, ''),
      }));
      // Hvis e-mail allerede er bekræftet, spring step 1 over
      if (u.email_verified) {
        setStep(s => s === 1 ? 2 : s);
      }
    }).catch(() => base44.auth.redirectToLogin());

    base44.entities.LegalContent.list().then(items => {
      const terms = items.find(i => i.type === 'terms');
      const privacy = items.find(i => i.type === 'privacy');
      setLegalContent({
        terms: terms?.content || 'Handelsbetingelserne er ikke opsat endnu.',
        privacy: privacy?.content || 'Privatlivspolitikken er ikke opsat endnu.',
      });
    });
  }, []);

  // Poll for e-mail bekræftelse når vi er på step 1
  useEffect(() => {
    if (step !== 1) return;
    const interval = setInterval(async () => {
      try {
        const u = await base44.auth.me();
        if (u.email_verified) {
          clearInterval(interval);
          setUser(u);
          toast.success('E-mail bekræftet! 🎉');
          setStep(2);
        }
      } catch (_) {}
    }, 3000);
    return () => clearInterval(interval);
  }, [step]);

  const validateStep0 = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = 'Vælg et brugernavn';
    else if (form.username.length < 3) newErrors.username = 'Mindst 3 tegn';
    if (!form.display_name.trim()) newErrors.display_name = 'Indtast dit navn';
    if (!form.accept_terms) newErrors.accept_terms = 'Du skal acceptere handelsbetingelserne';
    if (!form.accept_privacy) newErrors.accept_privacy = 'Du skal acceptere privatlivspolitikken';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep0Next = () => {
    if (!validateStep0()) return;
    setStep(1);
  };

  const handleCheckEmail = async () => {
    setCheckingEmail(true);
    try {
      const u = await base44.auth.me();
      if (u.email_verified) {
        setUser(u);
        toast.success('E-mail bekræftet! 🎉');
        setStep(2);
      } else {
        toast.error('E-mailen er endnu ikke bekræftet. Tjek din indbakke.');
      }
    } catch (_) {
      toast.error('Noget gik galt – prøv igen');
    }
    setCheckingEmail(false);
  };

  const handleResendEmail = async () => {
    setResending(true);
    try {
      await base44.auth.resendVerificationEmail();
      toast.success('Bekræftelsesmail sendt igen!');
    } catch (_) {
      toast.error('Kunne ikke sende mail – prøv igen');
    }
    setResending(false);
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
    if (!form.username.trim()) {
      toast.error('Vælg venligst et brugernavn');
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

  const setField = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
  };

  // TOTAL progress steps shown in bar (excluding email-verify step)
  const profileSteps = 3; // step 0 (accept), step 2 (by), step 3 (barn)
  const progressStep = step === 0 ? 0 : step === 1 ? 1 : step - 1;

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
            <div style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', fontSize: '0.875rem' }} className="whitespace-pre-wrap">
              {openModal === 'terms' ? legalContent.terms : legalContent.privacy}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>

        {/* Top header */}
        <div className="px-6 pt-14 pb-6">
          {/* Progress bar – 4 steps total */}
          <div className="flex gap-2 mb-8">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full transition-all duration-500"
                style={{ background: i <= step ? 'var(--color-accent)' : 'var(--color-bg-subtle)' }}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 px-6 overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* STEP 0 – Acceptér betingelser */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-bg-subtle)' }}>
                    <Shield className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-serif" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
                      Velkommen til LALATOTO
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Opret din profil og acceptér betingelserne</p>
                  </div>
                </div>

                {/* Profilbillede */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
                      style={{ background: 'var(--color-bg-subtle)' }}
                    >
                      {form.profile_image ? (
                        <img src={form.profile_image} alt="profil" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">👩</span>
                      )}
                    </div>
                    <label
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shadow"
                      style={{ background: 'var(--color-accent)' }}
                    >
                      <Camera className="w-3.5 h-3.5 text-white" />
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

                {/* Checkboxes */}
                <div
                  className="rounded-2xl p-4 space-y-4"
                  style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.accept_terms}
                      onChange={e => setField('accept_terms', e.target.checked)}
                      className="w-5 h-5 mt-0.5 cursor-pointer flex-shrink-0"
                    />
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Jeg accepterer{' '}
                      <button
                        type="button"
                        onClick={e => { e.preventDefault(); setOpenModal('terms'); }}
                        className="underline font-semibold"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        handelsbetingelserne
                      </button>
                    </span>
                  </label>
                  {errors.accept_terms && <p className="text-xs text-red-500 -mt-2">{errors.accept_terms}</p>}

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.accept_privacy}
                      onChange={e => setField('accept_privacy', e.target.checked)}
                      className="w-5 h-5 mt-0.5 cursor-pointer flex-shrink-0"
                    />
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Jeg accepterer{' '}
                      <button
                        type="button"
                        onClick={e => { e.preventDefault(); setOpenModal('privacy'); }}
                        className="underline font-semibold"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        privatlivspolitikken
                      </button>
                    </span>
                  </label>
                  {errors.accept_privacy && <p className="text-xs text-red-500 -mt-2">{errors.accept_privacy}</p>}
                </div>
              </motion.div>
            )}

            {/* STEP 1 – Bekræft e-mail */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-bg-subtle)' }}>
                    <Mail className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-serif" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
                      Bekræft din e-mail
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Et vigtigt trin for din sikkerhed</p>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-6 text-center space-y-4"
                  style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
                >
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
                    <Mail className="w-8 h-8" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-base mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      Vi har sendt dig en mail
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Klik på linket i mailen til{' '}
                      <span className="font-semibold">{user?.email}</span>{' '}
                      for at bekræfte din konto.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 justify-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    Venter på bekræftelse...
                  </div>
                </div>

                <div
                  className="rounded-2xl p-4 space-y-3"
                  style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
                >
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Har du allerede klikket på linket?</p>
                  <Button
                    className="w-full h-12 rounded-xl font-semibold"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
                    onClick={handleCheckEmail}
                    disabled={checkingEmail}
                  >
                    {checkingEmail ? (
                      <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Tjekker...</span>
                    ) : (
                      <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Jeg har bekræftet min e-mail</span>
                    )}
                  </Button>

                  <button
                    onClick={handleResendEmail}
                    disabled={resending}
                    className="w-full py-2 text-sm text-center"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {resending ? 'Sender...' : 'Send bekræftelsesmail igen'}
                  </button>
                </div>

                <button
                  onClick={() => setStep(0)}
                  className="w-full py-3 text-sm flex items-center justify-center gap-2"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <ArrowLeft className="w-4 h-4" /> Ret e-mailadresse / gå tilbage
                </button>
              </motion.div>
            )}

            {/* STEP 2 – Lokation */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-bg-subtle)' }}>
                    <MapPin className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-serif" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
                      Hvor bor du?
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Find mødre i nærheden af dig</p>
                  </div>
                </div>

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

            {/* STEP 3 – Om dit barn */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-bg-subtle)' }}>
                    <Baby className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-serif" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>
                      Om dit barn
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Så kan vi beregne tigerspring for dig</p>
                  </div>
                </div>

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

        {/* Bottom navigation */}
        <div className="px-6 py-8 space-y-3">
          {step === 0 && (
            <Button
              className="w-full h-14 text-base font-semibold rounded-2xl"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
              onClick={handleStep0Next}
              disabled={uploading}
            >
              <span className="flex items-center gap-2">
                Fortsæt <ArrowRight className="w-5 h-5" />
              </span>
            </Button>
          )}

          {step === 1 && null /* Knapper er inde i step-inholdet */}

          {step === 2 && (
            <>
              <Button
                className="w-full h-14 text-base font-semibold rounded-2xl"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
                onClick={() => setStep(3)}
              >
                <span className="flex items-center gap-2">Næste <ArrowRight className="w-5 h-5" /></span>
              </Button>
              <button
                onClick={() => setStep(3)}
                className="w-full py-2 text-sm text-center"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Spring over
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <Button
                className="w-full h-14 text-base font-semibold rounded-2xl"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
                disabled={saving}
                onClick={handleFinish}
              >
                {saving ? 'Gemmer...' : 'Kom i gang 🎉'}
              </Button>
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 text-sm flex items-center justify-center gap-2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <ArrowLeft className="w-4 h-4" /> Tilbage
              </button>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="w-full py-2 text-sm text-center"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Spring over
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}