import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Plus, Trash2, Save, Upload, ChevronDown, ChevronUp } from 'lucide-react';

const SECTION_TABS = ['Hero', 'Funktioner', 'Fordele', 'Anmeldelser', 'Afslutning'];

function SectionCard({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: '1px solid #EDE4DB', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#FFFDF9', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', color: '#2B1F16' }}>
        {title}
        {open ? <ChevronUp size={18} color="#9A8478" /> : <ChevronDown size={18} color="#9A8478" />}
      </button>
      {open && <div style={{ padding: '20px', background: '#FAF6F1' }}>{children}</div>}
    </div>
  );
}

function Field({ label, value, onChange, multiline, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#5B3F2B', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      {multiline
        ? <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #EDE4DB', fontSize: '0.9rem', color: '#2B1F16', resize: 'vertical', background: '#fff', boxSizing: 'border-box' }} />
        : <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #EDE4DB', fontSize: '0.9rem', color: '#2B1F16', background: '#fff', boxSizing: 'border-box' }} />
      }
    </div>
  );
}

function MediaUploader({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
      toast.success('Fil uploadet');
    } catch {
      toast.error('Upload fejlede');
    } finally {
      setUploading(false);
    }
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#5B3F2B', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      {value && (
        <div style={{ marginBottom: 8 }}>
          {value.match(/\.(mp4|webm|mov)$/i)
            ? <video src={value} controls style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 10 }} />
            : <img src={value} alt="preview" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 10, objectFit: 'cover' }} />
          }
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Indsæt URL eller upload fil" style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid #EDE4DB', fontSize: '0.9rem', color: '#2B1F16', background: '#fff' }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 10, backgroundColor: '#5B3F2B', color: '#fff', fontSize: '0.85rem', cursor: uploading ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}>
          <Upload size={14} /> {uploading ? 'Uploader...' : 'Upload'}
          <input type="file" accept="image/*,video/*" onChange={handleFile} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  );
}

/* ── HERO ── */
function HeroEditor() {
  const [data, setData] = useState({});
  const [id, setId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.LandingHero.list().then(records => {
      if (records[0]) { setData(records[0]); setId(records[0].id); }
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (id) await base44.entities.LandingHero.update(id, data);
      else { const r = await base44.entities.LandingHero.create(data); setId(r.id); }
      toast.success('Gemt!');
    } finally { setSaving(false); }
  };

  const set = (k) => (v) => setData(d => ({ ...d, [k]: v }));

  return (
    <div>
      <Field label="Badge tekst" value={data.badge_text} onChange={set('badge_text')} placeholder="📱 Din babys bedste start" />
      <Field label="Overskrift linje 1" value={data.headline} onChange={set('headline')} placeholder="Søvn, trivsel &" />
      <Field label="Kursiv del" value={data.headline_italic} onChange={set('headline_italic')} placeholder="fællesskab" />
      <Field label="Overskrift linje 3" value={data.headline_suffix} onChange={set('headline_suffix')} placeholder="for hele familien" />
      <Field label="Brødtekst" value={data.subtext} onChange={set('subtext')} multiline placeholder="LALATOTO-appen hjælper dig..." />
      <MediaUploader label="App mockup billede/video" value={data.media_url} onChange={set('media_url')} />
      <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, backgroundColor: '#5B3F2B', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
        <Save size={16} /> {saving ? 'Gemmer...' : 'Gem Hero'}
      </button>
    </div>
  );
}

/* ── FEATURES ── */
function FeaturesEditor() {
  const [items, setItems] = useState([]);
  const [sectionHeadline, setSectionHeadline] = useState('');
  const [sectionSubline, setSectionSubline] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.LandingFeature.list('order').then(records => {
      setItems(records);
      if (records[0]) { setSectionHeadline(records[0].section_headline || ''); setSectionSubline(records[0].section_subline || ''); }
    });
  }, []);

  const update = (idx, k, v) => setItems(arr => arr.map((item, i) => i === idx ? { ...item, [k]: v } : item));
  const add = () => setItems(arr => [...arr, { emoji: '✨', title: '', description: '', order: arr.length, is_active: true }]);
  const remove = async (idx) => {
    const item = items[idx];
    if (item.id) await base44.entities.LandingFeature.delete(item.id);
    setItems(arr => arr.filter((_, i) => i !== idx));
  };

  const save = async () => {
    setSaving(true);
    try {
      for (let i = 0; i < items.length; i++) {
        const d = { ...items[i], order: i, section_headline: i === 0 ? sectionHeadline : items[i].section_headline, section_subline: i === 0 ? sectionSubline : items[i].section_subline };
        if (d.id) await base44.entities.LandingFeature.update(d.id, d);
        else { const r = await base44.entities.LandingFeature.create(d); items[i] = { ...d, id: r.id }; }
      }
      toast.success('Gemt!');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <Field label="Sektionens overskrift" value={sectionHeadline} onChange={setSectionHeadline} placeholder="Designet til dig" />
      <Field label="Sektionens undertitel" value={sectionSubline} onChange={setSectionSubline} placeholder="Alt i én app" />
      <div style={{ marginBottom: 12, borderTop: '1px solid #EDE4DB', paddingTop: 16 }}>
        {items.map((item, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #EDE4DB', borderRadius: 12, padding: 16, marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={item.emoji || ''} onChange={e => update(i, 'emoji', e.target.value)} placeholder="🌙" style={{ width: 60, padding: '8px', borderRadius: 8, border: '1px solid #EDE4DB', fontSize: '1.2rem', textAlign: 'center' }} />
              <input value={item.title || ''} onChange={e => update(i, 'title', e.target.value)} placeholder="Titel" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #EDE4DB', fontSize: '0.9rem' }} />
              <button onClick={() => remove(i)} style={{ padding: '8px', borderRadius: 8, border: '1px solid #EDE4DB', background: '#fff', cursor: 'pointer', color: '#e57373' }}><Trash2 size={16} /></button>
            </div>
            <textarea value={item.description || ''} onChange={e => update(i, 'description', e.target.value)} placeholder="Beskrivelse..." rows={2} style={{ width: '100%', marginTop: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid #EDE4DB', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={add} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: '1px solid #5B3F2B', background: '#fff', color: '#5B3F2B', cursor: 'pointer', fontWeight: 600 }}><Plus size={16} /> Tilføj</button>
        <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, backgroundColor: '#5B3F2B', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}><Save size={16} /> {saving ? 'Gemmer...' : 'Gem funktioner'}</button>
      </div>
    </div>
  );
}

/* ── BENEFITS ── */
function BenefitsEditor() {
  const [items, setItems] = useState([]);
  const [sectionHeadline, setSectionHeadline] = useState('');
  const [sectionSubline, setSectionSubline] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.LandingBenefit.list('order').then(records => {
      setItems(records);
      if (records[0]) { setSectionHeadline(records[0].section_headline || ''); setSectionSubline(records[0].section_subline || ''); }
    });
  }, []);

  const update = (idx, k, v) => setItems(arr => arr.map((item, i) => i === idx ? { ...item, [k]: v } : item));
  const add = () => setItems(arr => [...arr, { stat: '', label: '', sub: '', order: arr.length, is_active: true }]);
  const remove = async (idx) => {
    const item = items[idx];
    if (item.id) await base44.entities.LandingBenefit.delete(item.id);
    setItems(arr => arr.filter((_, i) => i !== idx));
  };

  const save = async () => {
    setSaving(true);
    try {
      for (let i = 0; i < items.length; i++) {
        const d = { ...items[i], order: i, section_headline: i === 0 ? sectionHeadline : items[i].section_headline, section_subline: i === 0 ? sectionSubline : items[i].section_subline };
        if (d.id) await base44.entities.LandingBenefit.update(d.id, d);
        else await base44.entities.LandingBenefit.create(d);
      }
      toast.success('Gemt!');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <Field label="Sektionens overskrift" value={sectionHeadline} onChange={setSectionHeadline} placeholder="Alt det en forælder egentlig har brug for" />
      <Field label="Undertitel" value={sectionSubline} onChange={setSectionSubline} placeholder="Hvorfor LALATOTO?" />
      <div style={{ marginBottom: 12, borderTop: '1px solid #EDE4DB', paddingTop: 16 }}>
        {items.map((item, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #EDE4DB', borderRadius: 12, padding: 16, marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <input value={item.stat || ''} onChange={e => update(i, 'stat', e.target.value)} placeholder="10+" style={{ width: 80, padding: '8px 12px', borderRadius: 8, border: '1px solid #EDE4DB', fontSize: '0.9rem', fontWeight: 600 }} />
              <input value={item.label || ''} onChange={e => update(i, 'label', e.target.value)} placeholder="Titel" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #EDE4DB', fontSize: '0.9rem' }} />
              <button onClick={() => remove(i)} style={{ padding: '8px', borderRadius: 8, border: '1px solid #EDE4DB', background: '#fff', cursor: 'pointer', color: '#e57373' }}><Trash2 size={16} /></button>
            </div>
            <input value={item.sub || ''} onChange={e => update(i, 'sub', e.target.value)} placeholder="Undertekst" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #EDE4DB', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={add} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: '1px solid #5B3F2B', background: '#fff', color: '#5B3F2B', cursor: 'pointer', fontWeight: 600 }}><Plus size={16} /> Tilføj</button>
        <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, backgroundColor: '#5B3F2B', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}><Save size={16} /> {saving ? 'Gemmer...' : 'Gem fordele'}</button>
      </div>
    </div>
  );
}

/* ── REVIEWS ── */
function ReviewsEditor() {
  const [items, setItems] = useState([]);
  const [sectionHeadline, setSectionHeadline] = useState('');
  const [sectionSubline, setSectionSubline] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.LandingReview.list('order').then(records => {
      setItems(records);
      if (records[0]) { setSectionHeadline(records[0].section_headline || ''); setSectionSubline(records[0].section_subline || ''); }
    });
  }, []);

  const update = (idx, k, v) => setItems(arr => arr.map((item, i) => i === idx ? { ...item, [k]: v } : item));
  const add = () => setItems(arr => [...arr, { name: '', role: '', text: '', stars: 5, order: arr.length, is_active: true }]);
  const remove = async (idx) => {
    const item = items[idx];
    if (item.id) await base44.entities.LandingReview.delete(item.id);
    setItems(arr => arr.filter((_, i) => i !== idx));
  };

  const save = async () => {
    setSaving(true);
    try {
      for (let i = 0; i < items.length; i++) {
        const d = { ...items[i], order: i, section_headline: i === 0 ? sectionHeadline : items[i].section_headline, section_subline: i === 0 ? sectionSubline : items[i].section_subline };
        if (d.id) await base44.entities.LandingReview.update(d.id, d);
        else await base44.entities.LandingReview.create(d);
      }
      toast.success('Gemt!');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <Field label="Sektionens overskrift" value={sectionHeadline} onChange={setSectionHeadline} placeholder="Elsket af tusinder" />
      <Field label="Undertitel" value={sectionSubline} onChange={setSectionSubline} placeholder="Hvad siger familierne?" />
      <div style={{ marginBottom: 12, borderTop: '1px solid #EDE4DB', paddingTop: 16 }}>
        {items.map((item, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #EDE4DB', borderRadius: 12, padding: 16, marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <input value={item.name || ''} onChange={e => update(i, 'name', e.target.value)} placeholder="Navn" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #EDE4DB', fontSize: '0.9rem' }} />
              <input value={item.role || ''} onChange={e => update(i, 'role', e.target.value)} placeholder="Rolle" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #EDE4DB', fontSize: '0.9rem' }} />
              <input type="number" min={1} max={5} value={item.stars || 5} onChange={e => update(i, 'stars', Number(e.target.value))} style={{ width: 56, padding: '8px', borderRadius: 8, border: '1px solid #EDE4DB', fontSize: '0.9rem', textAlign: 'center' }} />
              <button onClick={() => remove(i)} style={{ padding: '8px', borderRadius: 8, border: '1px solid #EDE4DB', background: '#fff', cursor: 'pointer', color: '#e57373' }}><Trash2 size={16} /></button>
            </div>
            <textarea value={item.text || ''} onChange={e => update(i, 'text', e.target.value)} placeholder="Anmeldelsestekst..." rows={2} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #EDE4DB', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={add} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: '1px solid #5B3F2B', background: '#fff', color: '#5B3F2B', cursor: 'pointer', fontWeight: 600 }}><Plus size={16} /> Tilføj</button>
        <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, backgroundColor: '#5B3F2B', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}><Save size={16} /> {saving ? 'Gemmer...' : 'Gem anmeldelser'}</button>
      </div>
    </div>
  );
}

/* ── CTA ── */
function CTAEditor() {
  const [data, setData] = useState({});
  const [id, setId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.LandingCTA.list().then(records => {
      if (records[0]) { setData(records[0]); setId(records[0].id); }
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (id) await base44.entities.LandingCTA.update(id, data);
      else { const r = await base44.entities.LandingCTA.create(data); setId(r.id); }
      toast.success('Gemt!');
    } finally { setSaving(false); }
  };

  const set = (k) => (v) => setData(d => ({ ...d, [k]: v }));

  return (
    <div>
      <Field label="Overskrift" value={data.headline} onChange={set('headline')} placeholder="Klar til bedre nætter?" />
      <Field label="Brødtekst" value={data.subtext} onChange={set('subtext')} multiline placeholder="Hent LALATOTO gratis og bliv en del af fællesskabet..." />
      <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, backgroundColor: '#5B3F2B', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
        <Save size={16} /> {saving ? 'Gemmer...' : 'Gem afslutning'}
      </button>
    </div>
  );
}

export default function AdminLandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF6F1', padding: '24px 16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2rem', fontWeight: 500, color: '#2B1F16', marginBottom: 4 }}>Rediger landingsside</h1>
          <p style={{ fontSize: '0.9rem', color: '#9A8478' }}>Klik på en sektion for at redigere indholdet. Ændringer vises på <a href="/landing" target="_blank" style={{ color: '#5B3F2B' }}>/landing</a></p>
        </div>

        <SectionCard title="🏠 Hero — øverste sektion" defaultOpen={true}>
          <HeroEditor />
        </SectionCard>
        <SectionCard title="⭐ Funktioner">
          <FeaturesEditor />
        </SectionCard>
        <SectionCard title="📊 Fordele">
          <BenefitsEditor />
        </SectionCard>
        <SectionCard title="💬 Anmeldelser">
          <ReviewsEditor />
        </SectionCard>
        <SectionCard title="🚀 Afslutning / CTA">
          <CTAEditor />
        </SectionCard>
      </div>
    </div>
  );
}