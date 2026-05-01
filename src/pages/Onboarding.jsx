import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Camera, ArrowRight, ArrowLeft, Baby, MapPin, Shield, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/components/ui/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Onboarding() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0);
  const hasPaid = new URLSearchParams(window.location.search).get('subscription') === 'success';
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [openModal, setOpenModal] = useState(null);
  const [legalContent, setLegalContent] = useState({ terms: '', privacy: '' });

  const [form, setForm] = useState({
    username: '',
    display_name: '',
    profile_label: '', // 'mor' | 'far'
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
    if (!form.profile_label) newErrors.profile_label = t.errorChooseRole;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!form.display_name.trim()) newErrors.display_name = t.errorEnterName;
    if (!form.username.trim()) newErrors.username = t.errorChooseUsername;
    else if (form.username.length < 3) newErrors.username = t.errorUsernameMin;
    if (!form.accept_terms) newErrors.accept_terms = t.errorAcceptTerms;
    if (!form.accept_privacy) newErrors.accept_privacy = t.errorAcceptPrivacy;
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
      gender: form.profile_label === 'mor' ? 'female' : 'male',
      user_email: user.email,
      subscription_status: hasPaid ? 'active' : 'trial',
      subscription_started_at: hasPaid ? new Date().toISOString() : undefined,
      trial_started_at: hasPaid ? undefined : new Date().toISOString(),
    });
    // Gem GDPR consent-log
    await base44.entities.ConsentLog.create({
      user_email: user.email,
      terms_version: '1.0',
      privacy_version: '1.0',
      accepted_at: new Date().toISOString(),
    });

    // Onboarding done — go to home
    window.location.href = '/';
  };

  const STEPS = [
    { icon: Shield, title: t.whoAreYou, subtitle: t.chooseRoleSubtitle },
    { icon: Shield, title: t.welcomeTitle, subtitle: t.welcomeSubtitle },
    { icon: MapPin, title: t.whereDoYouLive, subtitle: t.findNearbyMoms },
    { icon: Baby, title: t.aboutYourChild, subtitle: t.calculateWonderWeeksSubtitle },
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
              {openModal === 'terms' ? t.termsTitle : t.privacyTitle}
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

            {/* STEP 0 – Mor eller far */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="space-y-6">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {t.lalatotoBuiltForFamily}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: t.mom, value: 'mor', emoji: '🤍', desc: t.momDesc },
                    { label: t.dad, value: 'far', emoji: '💙', desc: t.dadDesc },
                  ].map(option => {
                    const active = form.profile_label === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => { setField('profile_label', option.value); setErrors({}); }}
                        className="flex flex-col items-center gap-3 p-5 rounded-3xl transition-all active:scale-95"
                        style={{
                          backgroundColor: active ? 'transparent' : 'var(--color-bg-subtle)',
                          border: `2px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                          background: active ? 'linear-gradient(135deg, rgba(200,168,130,0.18), rgba(160,120,90,0.12))' : '',
                        }}
                      >
                        <span className="text-4xl">{option.emoji}</span>
                        <div className="text-center">
                          <p className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>{option.label}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{option.desc}</p>
                        </div>
                        {active && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent)' }}>
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {errors.profile_label && <p className="text-xs text-red-500 text-center">{errors.profile_label}</p>}

                {form.profile_label === 'mor' && (
                  <div className="rounded-2xl p-4 text-sm leading-relaxed" style={{ backgroundColor: 'rgba(200,168,130,0.12)', border: '1px solid rgba(200,168,130,0.25)' }}>
                    <p className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{t.nightLonelinessTitle}</p>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                      {t.nightLonelinessDesc}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 1 – Profil & betingelser */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="space-y-5">

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
                    {uploading ? t.uploadingLabel : t.addProfilePic}
                  </span>
                </div>

                {/* Navn */}
                <div className="space-y-1.5">
                  <Label>{t.yourName}</Label>
                  <Input
                    value={form.display_name}
                    onChange={e => setField('display_name', e.target.value)}
                    placeholder={t.namePlaceholder}
                    style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: errors.display_name ? '#ef4444' : 'var(--color-border)' }}
                  />
                  {errors.display_name && <p className="text-xs text-red-500">{errors.display_name}</p>}
                </div>

                {/* Brugernavn */}
                <div className="space-y-1.5">
                  <Label>{t.usernameLabel}</Label>
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
                    : <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.usernameHint}</p>
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
                      {t.iAcceptTerms}{' '}
                      <button type="button" onClick={() => setOpenModal('terms')} className="underline font-semibold" style={{ color: 'var(--color-accent)' }}>
                        {t.termsLinkLabel}
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
                      {t.iAcceptTerms}{' '}
                      <button type="button" onClick={() => setOpenModal('privacy')} className="underline font-semibold" style={{ color: 'var(--color-accent)' }}>
                        {t.privacyLinkLabel}
                      </button>
                    </span>
                  </label>
                  {errors.accept_privacy && <p className="text-xs text-red-500">{errors.accept_privacy}</p>}
                </div>

              </motion.div>
            )}

            {/* STEP 2 – Lokation */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="space-y-5">
                <div className="rounded-2xl p-5 text-center" style={{ background: 'var(--color-bg-subtle)' }}>
                  <MapPin className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-accent)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {t.cityDesc}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{t.yourCity}</Label>
                  <Input
                    value={form.city}
                    onChange={e => setField('city', e.target.value)}
                    placeholder={t.cityPlaceholder}
                    style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 3 – Barn */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="space-y-5">
                <div className="rounded-2xl p-5 text-center" style={{ background: 'var(--color-bg-subtle)' }}>
                  <span className="text-4xl">🐯</span>
                  <p className="text-sm mt-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {t.calculateWonderWeeksSubtitle}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{t.childBirthdateLabel}</Label>
                  <Input
                    type="date"
                    value={form.child_birthdate}
                    onChange={e => setForm(f => ({ ...f, child_birthdate: e.target.value, child_due_date: '' }))}
                    style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.orLabel}</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                </div>
                <div className="space-y-2">
                  <Label>{t.dueDateLabel}</Label>
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
                if (validateStep1()) setStep(2);
              } else if (step === 2) {
                setStep(3);
              } else if (step === 3) {
                handleFinish();
              }
            }}
          >
            {saving ? t.saving : step === 3 ? (
              <span className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> {hasPaid ? t.getStarted : 'Start gratis prøveperiode'}</span>
            ) : (
              <span className="flex items-center gap-2">{t.next} <ArrowRight className="w-5 h-5" /></span>
            )}
          </Button>

          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="w-full py-3 text-sm flex items-center justify-center gap-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <ArrowLeft className="w-4 h-4" /> {t.back}
            </button>
          )}

          {/* Skip for step 2 (city) and step 3 (child date) */}
          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="w-full py-2 text-sm text-center"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {t.skip}
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="w-full py-2 text-sm text-center"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {t.skip}
            </button>
          )}
        </div>

      </div>
    </>
  );
}