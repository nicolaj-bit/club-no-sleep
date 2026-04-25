import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/ui/ThemeProvider';
import { Check } from 'lucide-react';

export default function UserColorThemePicker() {
  const { colorTheme, setColorTheme } = useTheme();
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    base44.entities.ColorTheme.filter({ is_active: true }, 'order', 50).then(setThemes).catch(() => {});
  }, []);

  if (themes.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {themes.map(theme => (
        <button
          key={theme.id}
          onClick={() => setColorTheme(theme.id, theme)}
          className="relative rounded-xl overflow-hidden border-2 transition-all active:opacity-70"
          style={{
            borderColor: colorTheme === theme.id ? 'var(--color-primary)' : 'var(--color-border)',
          }}
        >
          <div className="h-10 w-full" style={{ background: theme.preview_gradient || '#ccc' }} />
          <p className="text-[10px] font-medium py-1 px-1 text-center leading-tight truncate"
            style={{ color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-card)' }}>
            {theme.name.split(' ')[0]}
          </p>
          {colorTheme === theme.id && (
            <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary)' }}>
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}