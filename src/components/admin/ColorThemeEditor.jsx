import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageContext';

// The 6 core colors admin picks — all others are derived
const CORE_COLORS = [
  { key: 'c_bg',         label: 'admin.theme.colors.bg',    hint: 'admin.theme.colors.bg_hint' },
  { key: 'c_card',       label: 'admin.theme.colors.card',        hint: 'admin.theme.colors.card_hint' },
  { key: 'c_primary',    label: 'admin.theme.colors.primary',      hint: 'admin.theme.colors.primary_hint' },
  { key: 'c_accent',     label: 'admin.theme.colors.accent',      hint: 'admin.theme.colors.accent_hint' },
  { key: 'c_text',       label: 'admin.theme.colors.text',       hint: 'admin.theme.colors.text_hint' },
  { key: 'c_dark_bg',    label: 'admin.theme.colors.dark_bg', hint: 'admin.theme.colors.dark_bg_hint' },
];

const DEFAULT_CORE = {
  c_bg: '#FAF6F1', c_card: '#FFFFFF', c_primary: '#5C3317',
  c_accent: '#A0785A', c_text: '#2C1A0E', c_dark_bg: '#0A0A0A',
};

// Derive all 20 theme fields from just 6 core colors
function deriveTheme(name, description, core, isActive, order) {
  const { c_bg, c_card, c_primary, c_accent, c_text, c_dark_bg } = core;

  // Lighten/darken helpers (simple hex manipulation)
  const blend = (hex, ratio) => {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
    const mix = (c, t) => Math.round(c + (t - c) * ratio);
    const nr = mix(r, ratio > 0 ? 255 : 0), ng = mix(g, ratio > 0 ? 255 : 0), nb = mix(b, ratio > 0 ? 255 : 0);
    return '#' + [Math.min(255,Math.max(0,mix(r,ratio>0?255:0))), Math.min(255,Math.max(0,mix(g,ratio>0?255:0))), Math.min(255,Math.max(0,mix(b,ratio>0?255:0)))].map(x => x.toString(16).padStart(2,'0')).join('');
  };

  const lighten = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
    return '#' + [Math.min(255,Math.round(r+(255-r)*a)),Math.min(255,Math.round(g+(255-g)*a)),Math.min(255,Math.round(b+(255-b)*a))].map(x=>x.toString(16).padStart(2,'0')).join('');
  };
  const darken = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
    return '#' + [Math.round(r*(1-a)),Math.round(g*(1-a)),Math.round(b*(1-a))].map(x=>Math.max(0,x).toString(16).padStart(2,'0')).join('');
  };

  // Dark card is slightly lighter than dark bg
  const dark_card = lighten(c_dark_bg, 0.08);
  const dark_subtle = lighten(c_dark_bg, 0.05);
  const dark_border = lighten(c_dark_bg, 0.18);

  return {
    name, description,
    preview_gradient: `linear-gradient(135deg, ${c_bg} 0%, ${c_accent} 100%)`,
    preview_dot: c_primary,
    // Light
    light_bg: c_bg,
    light_card: c_card,
    light_subtle: lighten(c_bg, 0.6),
    light_border: lighten(c_accent, 0.6),
    light_primary: c_primary,
    light_accent: c_accent,
    light_cappuccino: lighten(c_accent, 0.3),
    light_text_primary: c_text,
    light_text_secondary: lighten(c_text, 0.3),
    light_text_muted: lighten(c_text, 0.55),
    // Dark
    dark_bg: c_dark_bg,
    dark_card,
    dark_subtle,
    dark_border,
    dark_primary: lighten(c_bg, 0.85),
    dark_accent: c_accent,
    dark_cappuccino: darken(c_accent, 0.1),
    dark_text_primary: lighten(c_bg, 0.88),
    dark_text_secondary: lighten(c_bg, 0.65),
    dark_text_muted: lighten(c_text, 0.35),
    is_active: isActive,
    order,
  };
}

function ThemePreview({ core }) {
  const { c_bg, c_card, c_primary, c_accent, c_text } = core;
  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#E0D8D0' }}>
      <div className="p-3" style={{ backgroundColor: c_bg }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: c_primary }} />
          <div>
            <div className="h-2 w-20 rounded" style={{ backgroundColor: c_text, opacity: 0.8 }} />
            <div className="h-1.5 w-14 rounded mt-1" style={{ backgroundColor: c_accent, opacity: 0.5 }} />
          </div>
        </div>
        <div className="rounded-lg p-2" style={{ backgroundColor: c_card }}>
          <div className="h-2 w-full rounded mb-1.5" style={{ backgroundColor: c_text, opacity: 0.15 }} />
          <div className="h-2 w-3/4 rounded mb-2" style={{ backgroundColor: c_text, opacity: 0.1 }} />
          <div className="inline-flex px-3 py-1 rounded-full text-[10px] font-medium text-white" style={{ backgroundColor: c_primary }}>
            Knap
          </div>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_THEME_META = { name: '', description: '', is_active: true, order: 0 };

function ThemeForm({ theme, onSave, onCancel, saving }) {
  const { t } = useLanguage();
  // Extract core colors from existing theme or defaults
  const initCore = theme?.c_bg ? {
    c_bg: theme.c_bg, c_card: theme.c_card, c_primary: theme.c_primary,
    c_accent: theme.c_accent, c_text: theme.c_text, c_dark_bg: theme.c_dark_bg,
  } : DEFAULT_CORE;

  const [name, setName] = useState(theme?.name || '');
  const [description, setDescription] = useState(theme?.description || '');
  const [isActive, setIsActive] = useState(theme?.is_active ?? true);
  const [order, setOrder] = useState(theme?.order ?? 0);
  const [core, setCore] = useState(initCore);

  const setC = (key, val) => setCore(c => ({ ...c, [key]: val }));

  const handleSave = () => {
    const derived = deriveTheme(name, description, core, isActive, order);
    // Also store the 6 core colors so we can re-edit later
    onSave({ ...derived, ...core });
  };

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto">
      <div className="space-y-1.5">
        <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{t('admin.theme.form.name')}</label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="fx Sand & Chokolade"
          style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{t('admin.theme.form.description')}</label>
        <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="fx Klassisk og lunt"
          style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{t('admin.theme.form.core_colors')}</p>
        <div className="grid grid-cols-2 gap-3">
          {CORE_COLORS.map(({ key, label, hint }) => (
            <div key={key} className="flex items-center gap-3 p-2.5 rounded-xl border"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <input type="color" value={core[key] || '#000000'} onChange={e => setC(key, e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight" style={{ color: 'var(--color-text-primary)' }}>{t(label)}</p>
                <p className="text-[10px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>{t(hint)}</p>
                <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{core[key]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>{t('admin.theme.form.preview')}</p>
        <ThemePreview core={core} />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded" />
          <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{t('admin.theme.form.active_for_users')}</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('admin.theme.form.order')}</span>
          <Input type="number" value={order} onChange={e => setOrder(Number(e.target.value))}
            className="w-16 text-center" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} />
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">{t('admin.theme.form.cancel')}</Button>
        <Button onClick={handleSave} disabled={saving || !name} className="flex-1"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
          {saving ? t('admin.theme.form.saving') : t('admin.theme.form.save')}
        </Button>
      </div>
    </div>
  );
}

export default function ColorThemeEditor() {
  const { t } = useLanguage();
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
    toast.success(t('admin.theme.toast.saved'));
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm(t('admin.theme.dialog.confirm_delete'))) return;
    await base44.entities.ColorTheme.delete(id);
    toast.success(t('admin.theme.toast.deleted'));
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
            {isNew ? t('admin.theme.header.new') : t('admin.theme.header.edit')}
          </h2>
        </div>
        <ThemeForm theme={editing} onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 max-w-lg mx-auto mt-2">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t('admin.theme.list.title')}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t('admin.theme.list.description')}</p>
        </div>
        <button onClick={() => { setIsNew(true); setEditing({ ...DEFAULT_THEME_META, ...DEFAULT_CORE }); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
          <Plus className="w-4 h-4" /> {t('admin.theme.list.new_button')}
        </button>
      </div>

      {loading ? (
        <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('admin.theme.list.loading')}</p>
      ) : themes.length === 0 ? (
        <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('admin.theme.list.empty')}</p>
      ) : themes.map(theme => (
        <div key={theme.id} className="flex items-center gap-3 p-3 rounded-2xl border"
          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          {/* Color dots preview */}
          <div className="flex-shrink-0 flex gap-0.5 flex-wrap w-14">
            {[theme.light_bg, theme.light_primary, theme.light_accent, theme.light_text_primary, theme.dark_bg, theme.light_cappuccino].map((c, i) => (
              <div key={i} className="w-6 h-6 rounded-md border border-white/30" style={{ backgroundColor: c || '#ccc' }} />
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{theme.name}</p>
            <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
              {theme.description || '—'}
              {!theme.is_active && <span className="text-orange-500 ml-1">· {t('admin.theme.list.inactive')}</span>}
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
      ))}
    </div>
  );
}