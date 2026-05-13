import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Eye } from 'lucide-react';
import Footer from '@/components/Footer';

const DEFAULTS = {
  name: 'LALATOTO',
  tagline: 'En app skabt til danske forældre — søvn, trivsel og fællesskab samlet ét sted.',
  address: 'Kulbyvej 16, 4270 Høng',
  phone: '+45 40 40 88 88',
  email: 'kundeservice@lalatoto.dk',
  website: 'lalatoto.dk',
  cvr: '43 86 12 59',
  app_store_url: 'https://apps.apple.com/app/lalatoto/id6478508842',
  google_play_url: 'https://play.google.com/store/apps/details?id=com.lalatoto.app',
  logo_url: 'https://www.lalatoto.dk/cdn/shop/files/LALATOTO_logotype_Brun_600x.png?v=1730971736',
};

export default function AdminFooter() {
  const navigate = useNavigate();
  const [data, setData] = useState(DEFAULTS);
  const [recordId, setRecordId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    base44.entities.FooterContent.list().then((records) => {
      if (records && records.length > 0) {
        const r = records[0];
        setRecordId(r.id);
        setData({ ...DEFAULTS, ...r });
      }
    });
  }, []);

  const handleChange = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    if (recordId) {
      await base44.entities.FooterContent.update(recordId, data);
    } else {
      const created = await base44.entities.FooterContent.create(data);
      setRecordId(created.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const fields = [
    { section: 'Firma', items: [
      { key: 'name', label: 'Firmanavn' },
      { key: 'tagline', label: 'Tagline (under logo)', multiline: true },
      { key: 'logo_url', label: 'Logo URL' },
      { key: 'cvr', label: 'CVR-nummer' },
    ]},
    { section: 'Kontakt', items: [
      { key: 'address', label: 'Adresse' },
      { key: 'phone', label: 'Telefon' },
      { key: 'email', label: 'E-mail' },
      { key: 'website', label: 'Website (tekst)' },
    ]},
    { section: 'Download', items: [
      { key: 'app_store_url', label: 'App Store URL' },
      { key: 'google_play_url', label: 'Google Play URL' },
    ]},
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF6F1', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#FFF8F3',
        borderBottom: '1px solid #EDE4DB',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#5B3F2B', fontWeight: 500, fontSize: '0.9rem' }}>
          <ChevronLeft size={18} /> Tilbage
        </button>
        <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.2rem', color: '#2B1F16', fontWeight: 500 }}>Rediger Footer</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowPreview(p => !p)}
            style={{
              background: showPreview ? '#EDE4DB' : 'none',
              border: '1px solid #EDE4DB',
              borderRadius: 8,
              padding: '6px 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.85rem',
              color: '#5B3F2B',
              fontWeight: 500,
            }}
          >
            <Eye size={15} /> Forhåndsvisning
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              backgroundColor: saved ? '#6B8F5E' : '#5B3F2B',
              color: '#FAF6F1',
              border: 'none',
              borderRadius: 8,
              padding: '6px 18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'background 0.2s',
            }}
          >
            <Save size={15} />
            {saving ? 'Gemmer…' : saved ? 'Gemt ✓' : 'Gem'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Editor panel */}
        <div style={{
          width: showPreview ? 380 : '100%',
          flexShrink: 0,
          overflowY: 'auto',
          borderRight: showPreview ? '1px solid #EDE4DB' : 'none',
          padding: '24px 20px',
          backgroundColor: '#FFFDF9',
        }}>
          {fields.map(({ section, items }) => (
            <div key={section} style={{ marginBottom: 28 }}>
              <h3 style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#B08D72',
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: '1px solid #EDE4DB',
              }}>
                {section}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.map(({ key, label, multiline }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#5B3F2B', marginBottom: 4 }}>
                      {label}
                    </label>
                    {multiline ? (
                      <textarea
                        value={data[key] || ''}
                        onChange={e => handleChange(key, e.target.value)}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: '1px solid #EDE4DB',
                          backgroundColor: '#FAF6F1',
                          color: '#2B1F16',
                          fontSize: '0.88rem',
                          resize: 'vertical',
                          fontFamily: 'Inter, sans-serif',
                          boxSizing: 'border-box',
                        }}
                      />
                    ) : (
                      <input
                        type="text"
                        value={data[key] || ''}
                        onChange={e => handleChange(key, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: '1px solid #EDE4DB',
                          backgroundColor: '#FAF6F1',
                          color: '#2B1F16',
                          fontSize: '0.88rem',
                          fontFamily: 'Inter, sans-serif',
                          boxSizing: 'border-box',
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Live preview */}
        {showPreview && (
          <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#1C150F' }}>
            <div style={{ padding: '16px 16px 4px', color: '#8A7A6E', fontSize: '0.75rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Live forhåndsvisning
            </div>
            <Footer previewData={data} />
          </div>
        )}
      </div>
    </div>
  );
}