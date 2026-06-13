import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Upload, Loader2 } from 'lucide-react';

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
  const [user, setUser] = useState(null);
  const [phonesConfig, setPhonesConfig] = useState(null);
  const [iconsConfig, setIconsConfig] = useState(null);
  const [phoneA, setPhoneA] = useState('');
  const [phoneB, setPhoneB] = useState('');
  const [featureIcons, setFeatureIcons] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const u = await base44.auth.me();
        if (u?.role !== 'admin') { toast.error('Du skal være admin'); return; }
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
      } catch (e) {
        console.error(e);
        toast.error('Fejl ved loading');
      }
    };
    loadData();
  }, []);

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
      toast.success('Telefoner gemt');
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
      toast.success('Ikoner gemt');
    } catch (e) {
      toast.error('Fejl ved gemning');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '0.25rem' }}>Landing page admin</h1>

      {/* PHONE MOCKUPS */}
      <h2 style={{ marginTop: '2rem', fontSize: '1.1rem' }}>📱 iPhone mockup billeder</h2>
      <p style={{ color: '#7A665A', marginBottom: '1.5rem', fontSize: '0.88rem' }}>Rediger billede-URLer for de to iPhone mockups på forsiden</p>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.88rem' }}>Telefon A (venstre):</label>
        <input type="text" value={phoneA} onChange={(e) => setPhoneA(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', borderRadius: 8, border: '1px solid #EDE4DB' }} />
        {phoneA && <img src={phoneA} alt="Preview A" style={{ maxWidth: 150, borderRadius: 8 }} />}
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.88rem' }}>Telefon B (højre):</label>
        <input type="text" value={phoneB} onChange={(e) => setPhoneB(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', borderRadius: 8, border: '1px solid #EDE4DB' }} />
        {phoneB && <img src={phoneB} alt="Preview B" style={{ maxWidth: 150, borderRadius: 8 }} />}
      </div>
      <button onClick={handleSavePhones} disabled={loading} style={{ backgroundColor: '#5B3F2B', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', marginBottom: '3rem' }}>
        {loading ? 'Gemmer...' : 'Gem telefoner'}
      </button>

      {/* FEATURE ICONS */}
      <h2 style={{ fontSize: '1.1rem' }}>🖼️ Feature ikoner</h2>
      <p style={{ color: '#7A665A', marginBottom: '1.5rem', fontSize: '0.88rem' }}>Upload et billede (PNG/SVG) for hvert feature. Hvis intet billede er valgt vises standard-ikonet.</p>

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
        {loading ? 'Gemmer...' : 'Gem ikoner'}
      </button>
    </div>
  );
}