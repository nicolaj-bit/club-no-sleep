import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

export default function ColorThemePicker() {
  const [themes, setThemes] = useState([]);
  const [config, setConfig] = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.ColorTheme.filter({ is_active: true }, 'order', 50).then(setThemes).catch(() => {});
    base44.entities.AppConfig.filter({ key: 'app_theme' }).then(results => {
      const cfg = results[0];
      if (cfg) {
        setConfig(cfg);
        setSelected(cfg.color_theme || null);
      }
    });
  }, []);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    if (config?.id) {
      await base44.entities.AppConfig.update(config.id, { color_theme: selected });
    } else {
      const created = await base44.entities.AppConfig.create({ key: 'app_theme', color_theme: selected });
      setConfig(created);
    }
    localStorage.setItem('lalatoto-color-theme-id', selected);
    setSaving(false);
    toast.success('Farvetema gemt! Brugerne vil se det nye tema ved næste åbning.');
  };

  return (
    <div className="p-4 space-y-5 max-w-2xl mx-auto mt-2">
      <div>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Vælg appens farvetema</p>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Temaet gælder for alle brugere af appen</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {themes.map(theme => (
          <button
            key={theme.id}
            onClick={() => setSelected(theme.id)}
            className="relative rounded-2xl border-2 overflow-hidden text-left transition-all"
            style={{
              borderColor: selected === theme.id ? 'var(--color-primary)' : 'var(--color-border)',
              backgroundColor: 'var(--color-bg-card)',
            }}
          >
            <div className="h-16 w-full" style={{ background: theme.preview_gradient || '#ccc' }}>
              {theme.preview_dot && (
                <div
                  className="absolute top-3 right-3 w-5 h-5 rounded-full border-2 border-white"
                  style={{ backgroundColor: theme.preview_dot }}
                />
              )}
            </div>
            <div className="px-3 py-2.5">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{theme.name}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{theme.description}</p>
            </div>
            {selected === theme.id && (
              <div
                className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      <Button
        onClick={handleSave}
        disabled={saving || !selected}
        className="w-full"
        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
      >
        {saving ? 'Gemmer...' : 'Gem farvetema'}
      </Button>
    </div>
  );
}