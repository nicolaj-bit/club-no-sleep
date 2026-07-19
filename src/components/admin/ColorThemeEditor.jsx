import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ChevronLeft } from 'lucide-react';

// The 8 — and only 8 — color fields a theme consists of
const THEME_FIELDS = [
  { key: 'themeBackground',     label: 'Baggrund',          hint: 'Sidens baggrund' },
  { key: 'themeBackgroundSoft', label: 'Subtil baggrund',    hint: 'Sekundær overflade' },
  { key: 'themeCard',           label: 'Kort',               hint: 'Kort- / panel-baggrund' },
  { key: 'themeBorder',          label: 'Kant',               hint: 'Kanter & divisorer' },
  { key: 'themeAccent',          label: 'Accent',             hint: 'Knapper & fremhævning' },
  { key: 'textPrimary',         label: 'Primær tekst',       hint: 'Hovedtekst' },
  { key: 'textSecondary',       label: 'Sekundær tekst',     hint: 'Understøttende tekst' },
  { key: 'textOnDark',           label: 'Tekst på mørk',      hint: 'Tekst på accent/knap' },
];

const DEFAULT_COLORS = {
  themeBackground:     '#FAF6F1',
  themeBackgroundSoft: '#F3E9E1',
  themeCard:           '#FFFDF9',
  themeBorder:         '#EDE4DB',
  themeAccent:         '#5B3F2B',
  textPrimary:         '#2B1F16',
  textSecondary:       '#7A665A',
  textOnDark:          '#FFFDF9',
};

function ThemePreview({ theme }) {
  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: theme.themeBorder || '#EDE4DB' }}>
      <div className="p-3" style={{ backgroundColor: theme.themeBackground || '#FAF6F1' }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: theme.themeAccent || '#5B3F2B' }} />
          <div>
            <div className="h-2 w-20 rounded" style={{ backgroundColor: theme.textPrimary, opacity: 0.8 }} />
            <div className="h-1.5 w-14 rounded mt-1" style={{ backgroundColor: theme.textSecondary, opacity: 0.6 }} />
          </div>
        </div>
        <div className="rounded-lg p-2" style={{ backgroundColor: theme.themeCard, border: `1px solid ${theme.themeBorder || 'transparent'}` }}>
          <div className="h-2 w-full rounded mb-1.5" style={{ backgroundColor: theme.textPrimary, opacity: 0.15 }} />
          <div className="h-2 w-3/4 rounded mb-2" style={{ backgroundColor: theme.textSecondary, opacity: 0.2 }} />
          <div className="inline-flex px-3 py-1 rounded-full text-[10px] font-medium"
            style={{ backgroundColor: theme.themeAccent, color: theme.textOnDark }}>
            Knap
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeForm({ theme, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...DEFAULT_COLORS, ...theme });

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    const payload = {
      name: form.name,
      themeBackground: form.themeBackground,
      themeBackgroundSoft: form.themeBackgroundSoft,
      themeCard: form.themeCard,
      themeBorder: form.themeBorder,
      themeAccent: form.themeAccent,
      textPrimary: form.textPrimary,
      textSecondary: form.textSecondary,
      textOnDark: form.textOnDark,
      is_active: theme.is_active ?? true,
      order: theme.order ?? 0,
    };
    onSave(payload);
  };

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto">
      <div className="space-y-1.5">
        <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Navn</label>
        <Input value={form.name || ''} onChange={e => setField('name', e.target.value)} placeholder="fx Sand & Chokolade"
          style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>8 farver</p>
        <div className="grid grid-cols-2 gap-3">
          {THEME_FIELDS.map(({ key, label, hint }) => (
            <div key={key} className="flex items-center gap-3 p-2.5 rounded-xl border"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <input type="color" value={form[key] || '#000000'} onChange={e => setField(key, e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
                <p className="text-[10px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>{hint}</p>
                <input type="text" value={form[key] || ''} onChange={e => setField(key, e.target.value)}
                  className="w-full text-[10px] font-mono mt-1 bg-transparent outline-none border-b"
                  style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Live preview</p>
        <ThemePreview theme={form} />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">Annuller</Button>
        <Button onClick={handleSave} disabled={saving || !form.name} className="flex-1"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
          {saving ? 'Gemmer…' : 'Gem tema'}
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
    try {
      if (isNew) {
        await base44.entities.ColorTheme.create(form);
      } else {
        await base44.entities.ColorTheme.update(editing.id, form);
      }
      toast.success('Tema gemt!');
      setEditing(null);
      load();
    } catch (e) {
      toast.error('Kunne ikke gemme tema');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Slet dette tema?')) return;
    await base44.entities.ColorTheme.delete(id);
    toast.success('Tema slettet');
    load();
  };

  if (editing) {
    return (
      <div>
        <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b"
          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <button onClick={() => setEditing(null)} className="p-2 rounded-full"
            style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <h2 className="font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>
            {isNew ? 'Nyt tema' : 'Rediger tema'}
          </h2>
        </div>
        <ThemeForm theme={editing} onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 max-w-lg mx-auto mt-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Farvetemaer</p>
        <button onClick={() => { setIsNew(true); setEditing({ ...DEFAULT_COLORS }); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
          <Plus className="w-4 h-4" /> Nyt
        </button>
      </div>

      {loading ? (
        <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>Indlæser…</p>
      ) : themes.length === 0 ? (
        <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>Ingen temaer endnu</p>
      ) : themes.map(theme => (
        <div key={theme.id} className="flex items-center gap-3 p-3 rounded-2xl border"
          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex-shrink-0 flex gap-0.5 flex-wrap w-14">
            {[
              theme.themeBackground,
              theme.themeCard,
              theme.themeAccent,
              theme.textPrimary,
              theme.themeBackgroundSoft,
              theme.themeBorder,
            ].map((c, i) => (
              <div key={i} className="w-6 h-6 rounded-md border border-white/30" style={{ backgroundColor: c || '#ccc' }} />
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{theme.name}</p>
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
      ))}
    </div>
  );
}