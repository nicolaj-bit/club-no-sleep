import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, GripVertical, Save } from 'lucide-react';

const EMPTY_ITEM = { label: '', type: 'scroll', target: '', order: 0, is_active: true, is_cta: false };

export default function AdminNavMenu() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.NavMenuContent.list('order').then((records) => {
      if (records && records.length > 0) {
        setItems(records.map(r => ({ ...r, _id: r.id })));
      } else {
        // Seed defaults
        setItems([
          { label: 'Funktioner', type: 'scroll', target: 'features', order: 0, is_active: true, is_cta: false },
          { label: 'Fordele', type: 'scroll', target: 'benefits', order: 1, is_active: true, is_cta: false },
          { label: 'Anmeldelser', type: 'scroll', target: 'reviews', order: 2, is_active: true, is_cta: false },
          { label: 'Hent appen', type: 'link', target: 'https://apps.apple.com/app/lalatoto/id6478508842', order: 3, is_active: true, is_cta: true },
        ]);
      }
    });
  }, []);

  const handleChange = (idx, key, value) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [key]: value } : item));
    setSaved(false);
  };

  const addItem = () => {
    setItems(prev => [...prev, { ...EMPTY_ITEM, order: prev.length }]);
    setSaved(false);
  };

  const removeItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // Update order based on array position
    const itemsWithOrder = items.map((item, i) => ({ ...item, order: i }));
    for (const item of itemsWithOrder) {
      if (item._id) {
        await base44.entities.NavMenuContent.update(item._id, {
          label: item.label, type: item.type, target: item.target,
          order: item.order, is_active: item.is_active, is_cta: item.is_cta,
        });
      } else {
        const created = await base44.entities.NavMenuContent.create({
          label: item.label, type: item.type, target: item.target,
          order: item.order, is_active: item.is_active, is_cta: item.is_cta,
        });
        item._id = created.id;
      }
    }
    setItems(itemsWithOrder);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF6F1', fontFamily: 'Inter, sans-serif' }}>
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
        <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.2rem', color: '#2B1F16', fontWeight: 500 }}>Rediger Navigationsmenu</span>
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

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>
        {/* Info */}
        <div style={{ backgroundColor: '#F3E9E1', borderRadius: 12, padding: '12px 16px', marginBottom: 28, fontSize: '0.85rem', color: '#5B3F2B' }}>
          💡 Menupunkterne vises i toppen på forsiden. Brug <strong>scroll</strong> til at rulle til en sektion (fx "features") eller <strong>link</strong> til en URL.
        </div>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {items.map((item, idx) => (
            <div key={idx} style={{
              backgroundColor: '#FFFDF9',
              border: '1px solid #EDE4DB',
              borderRadius: 16,
              padding: '16px 20px',
              opacity: item.is_active ? 1 : 0.5,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <GripVertical size={16} style={{ color: '#C9AA8F', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#B08D72', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Tekst
                  </label>
                  <input
                    value={item.label}
                    onChange={e => handleChange(idx, 'label', e.target.value)}
                    placeholder="fx Funktioner"
                    style={inputStyle}
                  />
                </div>
                <button
                  onClick={() => removeItem(idx)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D4846A', padding: 4, flexShrink: 0 }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select
                    value={item.type}
                    onChange={e => handleChange(idx, 'type', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="scroll">Scroll til sektion</option>
                    <option value="link">Link (URL)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{item.type === 'scroll' ? 'Sektion-ID (fx features)' : 'URL'}</label>
                  <input
                    value={item.target}
                    onChange={e => handleChange(idx, 'target', e.target.value)}
                    placeholder={item.type === 'scroll' ? 'features' : 'https://...'}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#5B3F2B', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={item.is_active}
                    onChange={e => handleChange(idx, 'is_active', e.target.checked)}
                    style={{ accentColor: '#5B3F2B' }}
                  />
                  Aktiv
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#5B3F2B', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={item.is_cta}
                    onChange={e => handleChange(idx, 'is_cta', e.target.checked)}
                    style={{ accentColor: '#5B3F2B' }}
                  />
                  Vis som knap (CTA)
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Add button */}
        <button
          onClick={addItem}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            border: '2px dashed #EDE4DB',
            borderRadius: 16,
            padding: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: '#B08D72',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <Plus size={16} /> Tilføj menupunkt
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #EDE4DB',
  backgroundColor: '#FAF6F1',
  color: '#2B1F16',
  fontSize: '0.88rem',
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
  marginTop: 4,
};

const labelStyle = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#B08D72',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};