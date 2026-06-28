import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Upload, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageContext';

const FEATURE_KEYS = [
  { key: 'graviditet', label: 'Graviditeten uge for uge' },
  { key: 'milepæle', label: 'Milepæle' },
  { key: 'tigerspring', label: 'Tigerspring' },
  { key: 'lys', label: 'Et lys i mørket' },
  { key: 'caféer', label: 'Babyvenlige caféer' },
  { key: 'kalender', label: 'Kalender' },
  { key: 'søvn', label: 'Søvnlog' },
  { key: 'fællesskab', label: 'Fællesskab' },
  { key: 'valg', label: 'Din app dine valg' },
];

function FeatureIconUploader({ featureKey, label, currentUrl, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onUploaded(featureKey, file_url);
      toast.success(`${label} uploadet`);
    } catch (err) {
      toast.error('Upload fejlede');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', border: '1px solid #EDE4DB', borderRadius: 10, backgroundColor: '#FAF6F1' }}>
      <div
        onClick={() => inputRef.current?.click()}
        style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: '#EBD8C4', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, border: '1.5px dashed #C9AA8F' }}
      >
        {uploading ? (
          <Loader2 size={22} color="#8B6A50" className="animate-spin" />
        ) : currentUrl ? (
          <img src={currentUrl} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <Upload size={20} color="#8B6A50" />
        )}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: '#2B1F16' }}>{label}</p>
        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#7A665A' }}>{currentUrl ? 'Klik for at skifte billede' : 'Klik for at uploade PNG'}</p>
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}

export default function AdminLanding() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [phonesConfig, setPhonesConfig] = useState(null);
  const [iconsConfig, setIconsConfig] = useState(null);
  const [sleepAgentConfig, setSleepAgentConfig] = useState(null);
  const [phoneA, setPhoneA] = useState('');
  const [phoneB, setPhoneB] = useState('');
  const [hero1Image, setHero1Image] = useState('');
  const [hero1Config, setHero1Config] = useState(null);
  const [featureIcons, setFeatureIcons] = useState({});
  const [sleepAgentPrompt, setSleepAgentPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [shopifySyncing, setShopifySyncing] = useState(false);
  const [shopifyResult, setShopifyResult] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const u = await base44.auth.me();
        if (u?.role !== 'admin') { toast.error(t.adminLandingAdminRequired); return; }
        setUser(u);

        const configs = await base44.entities.AppConfig.list();
        const landingConfig = configs.find(c => c.key === 'landing_phones');
        if (landingConfig) {
          setPhonesConfig(landingConfig);
          setPhoneA(landingConfig.phone_a_url || '');
          setPhoneB(landingConfig.phone_b_url || '');
        }

        const iconsConfigRecord = configs.find(c => c.key === 'landing_feature_icons');
        if (iconsConfigRecord) {
          setIconsConfig(iconsConfigRecord);
          const map = {};
          (iconsConfigRecord.feature_icons || []).forEach(f => { map[f.key] = f.url; });
          setFeatureIcons(map);
        }

        const sleepAgentRecord = configs.find(c => c.key === 'sleep_agent_prompt');
        if (sleepAgentRecord) {
          setSleepAgentConfig(sleepAgentRecord);
          setSleepAgentPrompt(sleepAgentRecord.help_about_text_da || '');
        }

        const hero1Record = configs.find(c => c.key === 'landing_hero1_image');
        if (hero1Record) {
          setHero1Config(hero1Record);
          setHero1Image(hero1Record.hero1_image_url || '');
        }
      } catch (e) {
        console.error(e);
        toast.error(t.adminLandingError);
      }
    };
    loadData();
  }, []);

  const handleShopifySync = async () => {
    setShopifySyncing(true);
    setShopifyResult(null);
    try {
      const response = await base44.functions.invoke('shopifySync', { type: 'all' });
      if (response.data?.success) {
        setShopifyResult({ ok: true, message: t.adminLandingSyncResult.replace('{products}', response.data.synced.products ?? 0).replace('{blogs}', response.data.synced.blogs ?? 0) });
        toast.success('Shopify synkroniseret');
      } else {
        setShopifyResult({ ok: false, message: response.data?.error || 'Ukendt fejl' });
        toast.error(t.adminLandingSyncFailed);
      }
    } catch (e) {
      setShopifyResult({ ok: false, message: e?.message || t.adminLandingSyncFailed });
      toast.error(t.adminLandingSyncFailed);
    } finally {
      setShopifySyncing(false);
    }
  };

  const handleIconUploaded = (key, url) => {
    setFeatureIcons(prev => ({ ...prev, [key]: url }));
  };

  const handleSavePhones = async () => {
    setLoading(true);
    try {
      const data = { key: 'landing_phones', phone_a_url: phoneA, phone_b_url: phoneB };
      if (phonesConfig) {
        await base44.entities.AppConfig.update(phonesConfig.id, data);
      } else {
        await base44.entities.AppConfig.create(data);
      }
      toast.success(t.save);
    } catch (e) {
      toast.error(t.adminTermsPrivacyError);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHero1Image = async () => {
    setLoading(true);
    try {
      const data = { key: 'landing_hero1_image', hero1_image_url: hero1Image };
      if (hero1Config) {
        await base44.entities.AppConfig.update(hero1Config.id, data);
      } else {
        const created = await base44.entities.AppConfig.create(data);
        setHero1Config(created);
      }
      toast.success('Hero1-billede gemt');
    } catch (e) {
      toast.error('Fejl ved gemning');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIcons = async () => {
    setLoading(true);
    try {
      const icons = FEATURE_KEYS.map(f => ({ key: f.key, url: featureIcons[f.key] || '' }));
      const data = { key: 'landing_feature_icons', feature_icons: icons };
      if (iconsConfig) {
        await base44.entities.AppConfig.update(iconsConfig.id, data);
      } else {
        const created = await base44.entities.AppConfig.create(data);
        setIconsConfig(created);
      }
      toast.success(t.save);
    } catch (e) {
      toast.error(t.adminTermsPrivacyError);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div style={{ padding: '2rem', textAlign: 'center' }}>{t.adminLandingLoading}</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '0.25rem' }}>{t.adminLandingTitle}</h1>

      {/* PHONE MOCKUPS */}
      <h2 style={{ marginTop: '2rem', fontSize: '1.1rem' }}>{t.adminLandingPhones}</h2>
      <p style={{ color: '#7A665A', marginBottom: '1.5rem', fontSize: '0.88rem' }}>{t.adminLandingPhonesDesc}</p>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.88rem' }}>{t.adminLandingPhoneA}</label>
        <input type="text" value={phoneA} onChange={(e) => setPhoneA(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', borderRadius: 8, border: '1px solid #EDE4DB' }} />
        {phoneA && <img src={phoneA} alt="Preview A" style={{ maxWidth: 150, borderRadius: 8 }} />}
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.88rem' }}>{t.adminLandingPhoneB}</label>
        <input type="text" value={phoneB} onChange={(e) => setPhoneB(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', borderRadius: 8, border: '1px solid #EDE4DB' }} />
        {phoneB && <img src={phoneB} alt="Preview B" style={{ maxWidth: 150, borderRadius: 8 }} />}
      </div>
      <button onClick={handleSavePhones} disabled={loading} style={{ backgroundColor: '#5B3F2B', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', marginBottom: '3rem' }}>
        {loading ? t.saving : t.adminLandingButtonSavePhones}
      </button>

      {/* HERO1 MOBILE IMAGE */}
      <h2 style={{ fontSize: '1.1rem' }}>🖼️ Hero1 mobil-billede</h2>
      <p style={{ color: '#7A665A', marginBottom: '1.5rem', fontSize: '0.88rem' }}>Billede der vises i hero1-sektionen på landing-siden (kun på mobil). Upload eller indsæt en URL.</p>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.88rem' }}>Billede-URL:</label>
        <input type="text" value={hero1Image} onChange={(e) => setHero1Image(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', borderRadius: 8, border: '1px solid #EDE4DB' }} />
        {hero1Image && <img src={hero1Image} alt="Preview hero1" style={{ maxWidth: 200, borderRadius: 8 }} />}
      </div>
      <button onClick={handleSaveHero1Image} disabled={loading} style={{ backgroundColor: '#5B3F2B', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', marginBottom: '3rem' }}>
        {loading ? 'Gemmer...' : 'Gem hero1-billede'}
      </button>

      {/* FEATURE ICONS */}
      <h2 style={{ fontSize: '1.1rem' }}>{t.adminLandingIcons}</h2>
      <p style={{ color: '#7A665A', marginBottom: '1.5rem', fontSize: '0.88rem' }}>{t.adminLandingIconsDesc}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {FEATURE_KEYS.map(f => (
          <FeatureIconUploader
            key={f.key}
            featureKey={f.key}
            label={f.label}
            currentUrl={featureIcons[f.key]}
            onUploaded={handleIconUploaded}
          />
        ))}
      </div>

      <button onClick={handleSaveIcons} disabled={loading} style={{ backgroundColor: '#5B3F2B', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>
        {loading ? t.saving : t.adminLandingButtonSaveIcons}
      </button>

      {/* SHOPIFY SYNC */}
      <h2 style={{ marginTop: '3rem', fontSize: '1.1rem' }}>{t.adminLandingShopify}</h2>
      <p style={{ color: '#7A665A', marginBottom: '1rem', fontSize: '0.88rem' }}>
        {t.adminLandingShopifyDesc}
      </p>
      <button
        onClick={handleShopifySync}
        disabled={shopifySyncing}
        style={{ backgroundColor: '#5B3F2B', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.75rem' }}
      >
        {shopifySyncing ? t.adminLandingSyncing : t.adminLandingSyncNow}
      </button>
      {shopifyResult && (
        <p style={{ fontSize: '0.85rem', color: shopifyResult.ok ? '#3A7A3A' : '#a04040', marginBottom: '2rem' }}>
          {shopifyResult.message}
        </p>
      )}

      {/* SLEEP AGENT PROMPT */}
      <h2 style={{ marginTop: '3rem', fontSize: '1.1rem' }}>{t.adminLandingSleepAgent}</h2>
      <p style={{ color: '#7A665A', marginBottom: '1rem', fontSize: '0.88rem' }}>
        {t.adminLandingSleepAgentDesc}
      </p>
      <textarea
        value={sleepAgentPrompt}
        onChange={(e) => setSleepAgentPrompt(e.target.value)}
        rows={12}
        placeholder={t.adminLandingPromptPlaceholder}
        style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #EDE4DB', fontSize: '0.88rem', lineHeight: 1.6, resize: 'vertical', marginBottom: '0.75rem', fontFamily: 'inherit' }}
      />
      <button
        onClick={async () => {
          setLoading(true);
          try {
            const data = { key: 'sleep_agent_prompt', help_about_text_da: sleepAgentPrompt };
            if (sleepAgentConfig) {
              await base44.entities.AppConfig.update(sleepAgentConfig.id, data);
            } else {
              const created = await base44.entities.AppConfig.create(data);
              setSleepAgentConfig(created);
            }
            toast.success(t.save);
          } catch (e) {
            toast.error(t.adminTermsPrivacyError);
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
        style={{ backgroundColor: '#5B3F2B', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', marginBottom: '2rem' }}
      >
        {loading ? t.saving : t.adminLandingButtonSavePrompt}
      </button>
    </div>
  );
}