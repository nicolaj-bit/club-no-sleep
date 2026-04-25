import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

export const COLOR_THEMES = [
  {
    id: 'sand',
    name: 'Sand & Chokolade',
    description: 'Det klassiske LALATOTO look',
    light: {
      bg: '#FAF6F1', card: '#FFFFFF', subtle: '#F3EDE4', border: '#EDE4D8',
      primary: '#5C3317', accent: '#A0785A', cappuccino: '#C8A882',
      textPrimary: '#2C1A0E', textSecondary: '#6B4A2F', textMuted: '#9C816A',
    },
    dark: {
      bg: '#0A0A0A', card: '#141414', subtle: '#111111', border: '#2A2A2A',
      primary: '#F5F0EB', accent: '#C8A882', cappuccino: '#A0785A',
      textPrimary: '#F5F0EB', textSecondary: '#C8B8A8', textMuted: '#8A7060',
    },
    previewBg: 'linear-gradient(135deg, #FAF6F1 0%, #C8A882 100%)',
    previewDot: '#5C3317',
  },
  {
    id: 'rose',
    name: 'Rose & Blush',
    description: 'Blødt og feminint',
    light: {
      bg: '#FDF6F7', card: '#FFFFFF', subtle: '#FAF0F2', border: '#F2DDE1',
      primary: '#7C2D3E', accent: '#C4687A', cappuccino: '#E8A8B4',
      textPrimary: '#2D0D15', textSecondary: '#7C2D3E', textMuted: '#B07080',
    },
    dark: {
      bg: '#0D0709', card: '#180B0E', subtle: '#130810', border: '#2E1820',
      primary: '#F5E0E5', accent: '#E8A8B4', cappuccino: '#C4687A',
      textPrimary: '#F5E0E5', textSecondary: '#E8B8C4', textMuted: '#9A6070',
    },
    previewBg: 'linear-gradient(135deg, #FDF6F7 0%, #E8A8B4 100%)',
    previewDot: '#7C2D3E',
  },
  {
    id: 'sage',
    name: 'Sage & Naturgrøn',
    description: 'Rolig og naturlig',
    light: {
      bg: '#F5F8F5', card: '#FFFFFF', subtle: '#EAF0EA', border: '#D8E6D8',
      primary: '#2D5A36', accent: '#5A8C62', cappuccino: '#A8C8A8',
      textPrimary: '#0D1F10', textSecondary: '#2D5A36', textMuted: '#6A9070',
    },
    dark: {
      bg: '#070D08', card: '#0E1810', subtle: '#0B1409', border: '#1E2E20',
      primary: '#D5EDD8', accent: '#A8C8A8', cappuccino: '#5A8C62',
      textPrimary: '#D5EDD8', textSecondary: '#B8D8BC', textMuted: '#708A72',
    },
    previewBg: 'linear-gradient(135deg, #F5F8F5 0%, #A8C8A8 100%)',
    previewDot: '#2D5A36',
  },
  {
    id: 'slate',
    name: 'Slate & Steel',
    description: 'Moderne og maskulin',
    light: {
      bg: '#F5F6F8', card: '#FFFFFF', subtle: '#ECEEF2', border: '#D8DCE6',
      primary: '#1E2D4A', accent: '#4A6090', cappuccino: '#8CA0C4',
      textPrimary: '#0D1220', textSecondary: '#1E2D4A', textMuted: '#607090',
    },
    dark: {
      bg: '#07080D', card: '#0E1018', subtle: '#0B0E14', border: '#1E2230',
      primary: '#D5DCF0', accent: '#8CA0C4', cappuccino: '#4A6090',
      textPrimary: '#D5DCF0', textSecondary: '#B8C4E0', textMuted: '#607090',
    },
    previewBg: 'linear-gradient(135deg, #F5F6F8 0%, #8CA0C4 100%)',
    previewDot: '#1E2D4A',
  },
  {
    id: 'lavender',
    name: 'Lavendel & Lilla',
    description: 'Drømmende og blødt',
    light: {
      bg: '#F8F6FC', card: '#FFFFFF', subtle: '#F0EDF8', border: '#E0D8F0',
      primary: '#4A2D7A', accent: '#8A60C0', cappuccino: '#C0A8E8',
      textPrimary: '#1A0D30', textSecondary: '#4A2D7A', textMuted: '#907098',
    },
    dark: {
      bg: '#09070D', card: '#130E18', subtle: '#0F0B14', border: '#261E34',
      primary: '#E0D5F5', accent: '#C0A8E8', cappuccino: '#8A60C0',
      textPrimary: '#E0D5F5', textSecondary: '#C8B8E8', textMuted: '#9070A0',
    },
    previewBg: 'linear-gradient(135deg, #F8F6FC 0%, #C0A8E8 100%)',
    previewDot: '#4A2D7A',
  },
  {
    id: 'midnight',
    name: 'Midnight & Guld',
    description: 'Elegant og luksuriøs',
    light: {
      bg: '#F8F7F2', card: '#FFFFFF', subtle: '#F0EDE0', border: '#E0D8C0',
      primary: '#1A1A2E', accent: '#8A7840', cappuccino: '#C8A832',
      textPrimary: '#0A0A14', textSecondary: '#3A3820', textMuted: '#7A7050',
    },
    dark: {
      bg: '#06060E', card: '#0E0E18', subtle: '#0A0A14', border: '#1E1E30',
      primary: '#F0E8C0', accent: '#C8A832', cappuccino: '#8A7840',
      textPrimary: '#F0E8C0', textSecondary: '#D8C888', textMuted: '#908050',
    },
    previewBg: 'linear-gradient(135deg, #1A1A2E 0%, #C8A832 100%)',
    previewDot: '#C8A832',
  },
];

export default function ColorThemePicker() {
  const [config, setConfig] = useState(null);
  const [selected, setSelected] = useState('sand');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.AppConfig.filter({ key: 'app_theme' }).then(results => {
      const cfg = results[0];
      if (cfg) {
        setConfig(cfg);
        setSelected(cfg.color_theme || 'sand');
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    if (config?.id) {
      await base44.entities.AppConfig.update(config.id, { color_theme: selected });
    } else {
      const created = await base44.entities.AppConfig.create({ key: 'app_theme', color_theme: selected });
      setConfig(created);
    }
    // Persist globally so ThemeProvider picks it up
    localStorage.setItem('lalatoto-color-theme', selected);
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
        {COLOR_THEMES.map(theme => (
          <button
            key={theme.id}
            onClick={() => setSelected(theme.id)}
            className="relative rounded-2xl border-2 overflow-hidden text-left transition-all"
            style={{
              borderColor: selected === theme.id ? 'var(--color-primary)' : 'var(--color-border)',
              backgroundColor: 'var(--color-bg-card)',
            }}
          >
            {/* Preview swatch */}
            <div
              className="h-16 w-full"
              style={{ background: theme.previewBg }}
            >
              <div
                className="absolute top-3 right-3 w-5 h-5 rounded-full border-2 border-white"
                style={{ backgroundColor: theme.previewDot }}
              />
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
        disabled={saving}
        className="w-full"
        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
      >
        {saving ? 'Gemmer...' : 'Gem farvetema'}
      </Button>
    </div>
  );
}