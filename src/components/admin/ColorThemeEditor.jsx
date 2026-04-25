import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ChevronLeft, Check } from 'lucide-react';

const DEFAULT_THEME = {
  name: '',
  description: '',
  preview_gradient: 'linear-gradient(135deg, #FAF6F1 0%, #C8A882 100%)',
  preview_dot: '#5C3317',
  light_bg: '#FAF6F1', light_card: '#FFFFFF', light_subtle: '#F3EDE4', light_border: '#EDE4D8',
  light_primary: '#5C3317', light_accent: '#A0785A', light_cappuccino: '#C8A882',
  light_text_primary: '#2C1A0E', light_text_secondary: '#6B4A2F', light_text_muted: '#9C816A',
  dark_bg: '#0A0A0A', dark_card: '#141414', dark_subtle: '#111111', dark_border: '#2A2A2A',
  dark_primary: '#F5F0EB', dark_accent: '#C8A882', dark_cappuccino: '#A0785A',
  dark_text_primary: '#F5F0EB', dark_text_secondary: '#C8B8A8', dark_text_muted: '#8A7060',
  is_active: true, order: 0,
};

const ColorField = ({ label, value, onChange }) => (
  <div className="flex items-center gap-2">
    <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
      className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0.5 flex-shrink-0"
      style={{ backgroundColor: 'var(--color-bg-subtle)' }} />
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-medium truncate" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      <p className="text-xs font-mono" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
    </div>
  </div>
);

function ThemeForm({ theme, onSave, onCancel, saving }) {
  const [form, setForm] = useState(theme);
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const lightFields = [
    ['light_bg', 'Baggrund'], ['light_card', 'Kort'], ['light_subtle', 'Subtil'],
    ['light_border', 'Border'], ['light_primary', 'Primær'], ['light_accent', 'Accent'],
    ['light_cappuccino', 'Cappuccino'], ['light_text_primary', 'Tekst primær'],
    ['light_text_secondary', 'Tekst sekundær'], ['light_text_muted', 'Tekst dæmpet'],
  ];
  const darkFields = [
    ['dark_bg', 'Baggrund'], ['dark_card', 'Kort'], ['dark_subtle', 'Subtil'],
    ['dark_border', 'Border'], ['dark_primary', 'Primær'], ['dark_accent', 'Accent'],
    ['dark_cappuccino', 'Cappuccino'], ['dark_text_primary', 'Tekst primær'],
    ['dark_text_secondary', 'Tekst sekundær'], ['dark_text_muted', 'Tekst dæmpet'],
  ];

  return (
    <div className="space-y-5 p-4 max-w-2xl mx-auto">
      <div className="space-y-1.5">
        <Label style={{ color: 'var(--color-text-secondary)' }}>Temaets navn *</Label>
        <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="fx Sand & Chokolade"
          style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} />
      </div>
      <div className="space-y-1.5">
        <Label style={{ color: 'var(--color-text-secondary)' }}>Beskrivelse</Label>
        <Input value={form.description} onChange={e => set('description', e.target.value)} placeholder="fx Klassisk og lunt"
          style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--color-text-secondary)' }}>Preview gradient (CSS)</Label>
          <Input value={form.preview_gradient} onChange={e => set('preview_gradient', e.target.value)}
            placeholder="linear-gradient(135deg, #FAF6F1 0%, #C8A882 100%)"
            style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} />
          <div className="h-10 rounded-lg mt-1" style={{ background: form.preview_gradient || '#ccc' }} />
        </div>
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--color-text-secondary)' }}>Preview prik-farve</Label>
          <div className="flex items-center gap-2 mt-1">
            <input type="color" value={form.preview_dot || '#000000'} onChange={e => set('preview_dot', e.target.value)}
              className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0.5"
              style={{ backgroundColor: 'var(--color-bg-subtle)' }} />
            <span className="text-sm font-mono" style={{ color: 'var(--color-text-primary)' }}>{form.preview_dot}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Lys tilstand */}
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>☀️ Lys tilstand</p>
          <div className="space-y-3">
            {lightFields.map(([key, label]) => (
              <ColorField key={key} label={label} value={form[key]} onChange={v => set(key, v)} />
            ))}
          </div>
        </div>
        {/* Mørk tilstand */}
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>🌙 Mørk tilstand</p>
          <div className="space-y-3">
            {darkFields.map(([key, label]) => (
              <ColorField key={key} label={label} value={form[key]} onChange={v => set(key, v)} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="rounded" />
          <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Aktiv (synlig for brugere)</span>
        </label>
        <div className="flex-1" />
        <Label style={{ color: 'var(--color-text-secondary)' }}>Rækkefølge</Label>
        <Input type="number" value={form.order ?? 0} onChange={e => set('order', Number(e.target.value))}
          className="w-20" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Annuller</Button>
        <Button onClick={() => onSave(form)} disabled={saving || !form.name} className="flex-1"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
          {saving ? 'Gemmer...' : 'Gem tema'}
        </Button>
      </div>
    </div>
  );
}

export default function ColorThemeEditor() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    base44.entities.ColorTheme.list('order', 100).then(data => {
      setThemes(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    setSaving(true);
    if (isNew) {
      await base44.entities.ColorTheme.create(form);
    } else {
      await base44.entities.ColorTheme.update(editing.id, form);
    }
    setSaving(false);
    toast.success('Tema gemt!');
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Slet dette tema?')) return;
    await base44.entities.ColorTheme.delete(id);
    toast.success('Slettet');
    load();
  };

  if (editing) {
    return (
      <div>
        <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b backdrop-blur-xl"
          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <button onClick={() => setEditing(null)} className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <h2 className="flex-1 font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>
            {isNew ? 'Nyt farvetema' : 'Rediger tema'}
          </h2>
        </div>
        <ThemeForm theme={editing} onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 max-w-2xl mx-auto mt-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Farvetemaer</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Brugere kan vælge mellem de aktive temaer</p>
        </div>
        <button
          onClick={() => { setIsNew(true); setEditing({ ...DEFAULT_THEME }); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
        >
          <Plus className="w-4 h-4" /> Nyt tema
        </button>
      </div>

      {loading ? (
        <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>Indlæser...</p>
      ) : themes.length === 0 ? (
        <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>Ingen temaer endnu — opret dit første!</p>
      ) : (
        themes.map(theme => (
          <div key={theme.id} className="flex items-center gap-3 p-3 rounded-2xl border"
            style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <div className="w-12 h-12 rounded-xl flex-shrink-0 relative overflow-hidden"
              style={{ background: theme.preview_gradient || '#ccc' }}>
              {theme.preview_dot && (
                <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white"
                  style={{ backgroundColor: theme.preview_dot }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{theme.name}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {theme.description || '—'} {!theme.is_active && <span className="text-orange-500 ml-1">· Inaktiv</span>}
              </p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setIsNew(false); setEditing({ ...theme }); }}
                className="p-2 rounded-xl" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                <Pencil className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              </button>
              <button onClick={() => handleDelete(theme.id)}
                className="p-2 rounded-xl" style={{ backgroundColor: '#fee2e2' }}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}