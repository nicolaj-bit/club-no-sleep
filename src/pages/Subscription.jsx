import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { requestPushPermission } from '@/utils/requestPushPermission';
import { Check, Sparkles, RefreshCw, Loader2, AlertCircle, Pencil, Plus, Trash2, Image, Video, X } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageContext';
import { motion } from 'framer-motion';
import { useRevenueCat } from '@/components/subscription/useRevenueCat';

const DEFAULT_FEATURES_DA = [
  { emoji: '🌙', text: 'AI søvnrådgivning til din baby' },
  { emoji: '💬', text: 'Ubegrænsede spørgsmål til eksperter' },
  { emoji: '🐯', text: 'Tigerspring notifikationer' },
  { emoji: '👩‍👩‍👦', text: 'Community for mødre & fædre' },
  { emoji: '📅', text: 'Kalender, søvnlog & dagbog' },
];

export default function Subscription() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState(null);
  const [restoreMessage, setRestoreMessage] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [content, setContent] = useState(null);
  const [contentId, setContentId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const da = lang === 'da';

  // RevenueCat — IAP på native, springes over på web
  const rc = useRevenueCat(userId || 'guest');

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          if (user.role === 'admin') setIsAdmin(true);
          setUserId(user.id || user.email);
          const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
          if (profiles.length) setProfile(profiles[0]);
        }
      } catch {}
      try {
        const records = await base44.entities.SubscriptionContent.list();
        if (records.length) {
          setContent(records[0]);
          setContentId(records[0].id);
        }
      } catch {}
    };
    load();

    // Hvis brugeren kommer tilbage fra succesfuld betaling, bed om push-tilladelse
    const params = new URLSearchParams(window.location.search);
    if (params.get('subscription') === 'success') {
      setTimeout(() => requestPushPermission(), 1500);
    }
  }, []);

  // Køb via RevenueCat IAP (native) eller Stripe (web)
  const handleIAPSubscribe = async () => {
    // /Subscription: naviger til /Checkout (dedikeret betalingsside)
    navigate('/Checkout');
    return;
  };

  const _handlePurchase = async () => {
    // Native iOS/iPadOS: brug RevenueCat In-App Purchase direkte
    if (rc.isNative) {
      const pkg = rc.offerings?.current?.availablePackages?.[0];
      if (!pkg) {
        console.error('[Subscription] Ingen RevenueCat offerings tilgængelige. Offerings:', rc.offerings);
        setError(da
          ? 'Abonnementet kunne ikke indlæses fra App Store. Tjek din internetforbindelse og prøv igen. (Teknisk fejl: ingen produkter fundet)'
          : 'Could not load subscription from App Store. Check your connection and try again. (Technical error: no products found)');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        await rc.purchase(pkg);
        setRestoreMessage(da ? '✓ Abonnement aktiveret!' : '✓ Subscription activated!');
        // Synkroniser profil med backend (RevenueCat webhook opdaterer asynkront)
        await base44.functions.invoke('verifySubscription', {}).catch(() => {});
      } catch (e) {
        if (!e.message?.includes('cancel') && e.code !== 'PURCHASE_CANCELLED') {
          console.error('[Subscription] Purchase error:', e);
          setError(e.message || (da ? 'Køb fejlede. Prøv igen.' : 'Purchase failed. Please try again.'));
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // Web: brug Stripe checkout
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {});
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        setError(da ? 'Kunne ikke starte betaling. Prøv igen.' : 'Could not start checkout. Please try again.');
      }
    } catch (e) {
      setError(da ? 'Kunne ikke starte betaling. Prøv igen.' : 'Could not start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    setError(null);
    setRestoreMessage(null);
    try {
      if (rc.restorePurchases) {
        // Gendan via RevenueCat
        const info = await rc.restorePurchases();
        const hasActive = info?.entitlements?.active && Object.keys(info.entitlements.active).length > 0;
        if (hasActive) {
          await base44.functions.invoke('verifySubscription', {});
          setRestoreMessage(da ? '✓ Abonnement gendannet!' : '✓ Subscription restored!');
        } else {
          setRestoreMessage(da ? 'Intet aktivt abonnement fundet.' : 'No active subscription found.');
        }
      } else {
        // Web/Android: tjek via Stripe backend
        const response = await base44.functions.invoke('verifySubscription', {});
        if (response.data?.active) {
          setRestoreMessage(da ? '✓ Abonnement gendannet!' : '✓ Subscription restored!');
        } else {
          setRestoreMessage(da
            ? 'Intet aktivt abonnement fundet på denne konto.'
            : 'No active subscription found on this account.');
        }
      }
    } catch (e) {
      setError(da ? 'Kunne ikke tjekke abonnement. Prøv igen.' : 'Could not verify subscription. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  const startEditing = () => {
    setDraft({
      headline: content?.headline || 'LALATOTO',
      subline: content?.subline || (da ? 'Din digitale følgesvend som forælder' : 'Your digital companion as a parent'),
      price_label: content?.price_label || (da ? '59 kr. / måned' : '59 DKK / month'),
      cta_label: content?.cta_label || (da ? 'Abonner — 59 kr./md.' : 'Subscribe — 59 DKK/mo.'),
      footer_note: content?.footer_note || (da ? 'Abonnementet fornyes automatisk. Annuller når som helst.' : 'Subscription renews automatically. Cancel anytime.'),
      logo_url: content?.logo_url || '',
      media_type: content?.media_type || 'none',
      media_url: content?.media_url || '',
      features: content?.features || DEFAULT_FEATURES_DA,
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (contentId) {
        const updated = await base44.entities.SubscriptionContent.update(contentId, draft);
        setContent(updated);
      } else {
        const created = await base44.entities.SubscriptionContent.create(draft);
        setContent(created);
        setContentId(created.id);
      }
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const type = file.type.startsWith('video') ? 'video' : 'image';
      setDraft(d => ({ ...d, media_url: file_url, media_type: type }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingMedia(false);
    }
  };

  const updateFeature = (i, key, val) => {
    setDraft(d => {
      const features = [...d.features];
      features[i] = { ...features[i], [key]: val };
      return { ...d, features };
    });
  };

  const addFeature = () => setDraft(d => ({ ...d, features: [...d.features, { emoji: '✨', text: '' }] }));
  const removeFeature = (i) => setDraft(d => ({ ...d, features: d.features.filter((_, idx) => idx !== i) }));

  const isActive = profile?.subscription_status === 'active' || rc.isSubscribed;
  const display = content || {};
  const features = display.features?.length ? display.features : DEFAULT_FEATURES_DA;
  const headline = display.headline || 'LALATOTO';
  const subline = display.subline || (da ? 'Din digitale følgesvend som forælder' : 'Your digital companion as a parent');
  // Brug pris fra RevenueCat, ellers vis cms-pris
  const iosPkg = rc.offerings?.current?.availablePackages?.[0];
  const iosPrice = iosPkg?.product?.priceString;
  const priceLabel = iosPrice
    ? `${iosPrice} / ${da ? 'måned' : 'month'}`
    : display.price_label || '59 kr. / måned';
  const ctaLabel = display.cta_label || (da ? 'Start abonnement' : 'Start subscription');
  const footerNote = display.footer_note || (da ? 'Abonnementet fornyes automatisk. Annuller når som helst.' : 'Subscription renews automatically. Cancel anytime.');

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #3A2B22 0%, #5B3F2B 55%, #C29A73 100%)',
          paddingTop: 'max(56px, env(safe-area-inset-top))',
          paddingBottom: 52,
        }}
      >
        {/* Admin edit button */}
        {isAdmin && !editing && (
          <button
            onClick={startEditing}
            className="absolute top-4 right-4 z-20 flex items-center justify-center w-9 h-9 rounded-full"
            style={{ background: 'rgba(255,255,255,0.15)', marginTop: 'env(safe-area-inset-top, 0px)' }}
          >
            <Pencil className="w-4 h-4 text-white" />
          </button>
        )}

        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-10" style={{ background: '#C29A73' }} />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10" style={{ background: '#EDE4DB' }} />

        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          {/* Logo */}
          {display.logo_url ? (
          <motion.img
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            src={display.logo_url}
            alt="logo"
            className="h-12 mb-5 object-contain"
          />
          ) : null}

          {/* Media / icon */}
          {display.media_type === 'image' && display.media_url ? (
            <motion.img
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              src={display.media_url}
              alt="hero"
              className="w-28 h-28 object-cover rounded-3xl mb-5"
              style={{ border: '2px solid rgba(255,255,255,0.2)' }}
            />
          ) : display.media_type === 'video' && display.media_url ? (
            <motion.video
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              src={display.media_url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full max-h-48 object-cover rounded-2xl mb-5"
            />
          ) : display.logo_url ? null : (
            <motion.img
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              src="https://media.base44.com/images/public/699f47a86e7e0a874d1159ed/4d581f250_Ikon.png"
              alt="LALATOTO"
              className="w-24 h-24 mb-5 object-contain rounded-3xl"
            />
          )}

          <motion.h1
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-4xl font-light text-white mb-2"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', letterSpacing: '-0.01em' }}
          >
            {headline}
          </motion.h1>

          <motion.p
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-sm text-white/70 max-w-xs leading-relaxed"
          >
            {subline}
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-5 pt-7 pb-8">

        {/* Price badge */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex items-center justify-center mb-6"
        >
          <div
            className="px-6 py-3 rounded-2xl flex items-center gap-2"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <Sparkles className="w-4 h-4" style={{ color: '#C29A73' }} />
            <span className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              {priceLabel}
            </span>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="rounded-2xl p-5 mb-6 space-y-4"
          style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xl flex-shrink-0">{f.emoji}</span>
              <span className="text-sm flex-1" style={{ color: 'var(--color-text-primary)' }}>{f.text}</span>
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#C29A73' }}>
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Error / restore message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-xl px-4 py-3 mb-4"
            style={{ background: 'rgba(220,60,40,0.08)', border: '1px solid rgba(220,60,40,0.2)' }}
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
            <p className="text-xs text-red-600">{error}</p>
          </motion.div>
        )}
        {restoreMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl px-4 py-3 mb-4 text-center"
            style={{ background: 'rgba(100,180,100,0.1)', border: '1px solid rgba(100,180,100,0.2)' }}
          >
            <p className="text-sm font-medium" style={{ color: '#3A7A3A' }}>{restoreMessage}</p>
          </motion.div>
        )}

        <div className="flex-1" />

        {/* CTA */}
        {isActive ? (
          <div className="w-full py-4 rounded-2xl text-center text-sm font-semibold mb-3"
            style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }}>
            {da ? '✓ Aktivt abonnement' : '✓ Active subscription'}
          </div>
        ) : (
          <motion.button
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            onClick={handleIAPSubscribe}
            disabled={loading || restoring || rc.loading}
            className="w-full py-4 rounded-2xl text-base font-semibold mb-3 flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
          >
            {loading || rc.loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {da ? 'Indlæser…' : 'Loading…'}</>
              : ctaLabel}
          </motion.button>
        )}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          onClick={handleRestore}
          disabled={loading || restoring}
          className="w-full py-3 rounded-2xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {restoring
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {da ? 'Tjekker…' : 'Checking…'}</>
            : <><RefreshCw className="w-3.5 h-3.5" /> {da ? 'Gendan eksisterende køb' : 'Restore existing purchase'}</>}
        </motion.button>

        <p className="text-xs text-center mt-4" style={{ color: 'var(--color-text-muted)' }}>{footerNote}</p>
      </div>

      {/* Admin Edit Panel */}
      {editing && draft && (
        <div
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Rediger abonnementsside</h2>
            <button onClick={() => setEditing(false)}>
              <X className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>

          <div className="flex-1 px-5 py-5 space-y-5">

            {/* Headline */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Overskrift</label>
              <input
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                value={draft.headline}
                onChange={e => setDraft(d => ({ ...d, headline: e.target.value }))}
              />
            </div>

            {/* Subline */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Undertitel</label>
              <input
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                value={draft.subline}
                onChange={e => setDraft(d => ({ ...d, subline: e.target.value }))}
              />
            </div>

            {/* Price label */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Prislabel</label>
              <input
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                value={draft.price_label}
                onChange={e => setDraft(d => ({ ...d, price_label: e.target.value }))}
              />
            </div>

            {/* CTA label */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Knap tekst</label>
              <input
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                value={draft.cta_label}
                onChange={e => setDraft(d => ({ ...d, cta_label: e.target.value }))}
              />
            </div>

            {/* Footer note */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Bundtekst</label>
              <input
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                value={draft.footer_note}
                onChange={e => setDraft(d => ({ ...d, footer_note: e.target.value }))}
              />
            </div>

            {/* Logo upload */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--color-text-muted)' }}>Logo billede</label>
              <label
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl cursor-pointer text-sm"
                style={{ backgroundColor: 'var(--color-bg-card)', border: '1px dashed var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                {uploadingMedia
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploader…</>
                  : <><Image className="w-4 h-4" /> Upload logo</>}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadingMedia(true);
                    base44.integrations.Core.UploadFile({ file }).then(({ file_url }) => {
                      setDraft(d => ({ ...d, logo_url: file_url }));
                      setUploadingMedia(false);
                    }).catch(() => setUploadingMedia(false));
                  }
                }} />
              </label>
              {draft.logo_url && (
                <div className="mt-2 relative flex justify-center">
                  <img src={draft.logo_url} alt="" className="h-12 object-contain" />
                  <button
                    onClick={() => setDraft(d => ({ ...d, logo_url: '' }))}
                    className="absolute top-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* Media upload */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--color-text-muted)' }}>Hero medie (billede eller video)</label>
              <label
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl cursor-pointer text-sm"
                style={{ backgroundColor: 'var(--color-bg-card)', border: '1px dashed var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                {uploadingMedia
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploader…</>
                  : <><Image className="w-4 h-4" /><Video className="w-4 h-4" /> Upload billede / video</>}
                <input type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
              </label>
              {draft.media_url && (
                <div className="mt-2 relative">
                  {draft.media_type === 'video'
                    ? <video src={draft.media_url} className="w-full rounded-xl max-h-32 object-cover" muted />
                    : <img src={draft.media_url} alt="" className="w-full rounded-xl max-h-32 object-cover" />}
                  <button
                    onClick={() => setDraft(d => ({ ...d, media_url: '', media_type: 'none' }))}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* Features */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--color-text-muted)' }}>Features</label>
              <div className="space-y-2">
                {draft.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className="w-12 rounded-lg px-2 py-2 text-center text-sm outline-none"
                      style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                      value={f.emoji}
                      onChange={e => updateFeature(i, 'emoji', e.target.value)}
                    />
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                      style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                      value={f.text}
                      onChange={e => updateFeature(i, 'text', e.target.value)}
                    />
                    <button onClick={() => removeFeature(i)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addFeature}
                  className="flex items-center gap-2 text-sm py-2"
                  style={{ color: '#C29A73' }}
                >
                  <Plus className="w-4 h-4" /> Tilføj feature
                </button>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="px-5 pb-8 pt-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 rounded-2xl text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Gemmer…</> : 'Gem ændringer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}