import { createContext, useContext, useEffect, useState } from 'react';
import { COLOR_THEMES } from '@/components/admin/ColorThemePicker';

const ThemeContext = createContext({ isDark: false, toggle: () => {}, colorTheme: 'sand', setColorTheme: () => {} });

function applyDarkMode(dark) {
  if (dark) {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }
}

function applyColorTheme(themeId, isDark) {
  const theme = COLOR_THEMES.find(t => t.id === themeId) || COLOR_THEMES[0];
  const vars = isDark ? theme.dark : theme.light;
  const root = document.documentElement;
  root.style.setProperty('--color-bg', vars.bg);
  root.style.setProperty('--color-bg-card', vars.card);
  root.style.setProperty('--color-bg-subtle', vars.subtle);
  root.style.setProperty('--color-border', vars.border);
  root.style.setProperty('--color-primary', vars.primary);
  root.style.setProperty('--color-accent', vars.accent);
  root.style.setProperty('--color-cappuccino', vars.cappuccino);
  root.style.setProperty('--color-text-primary', vars.textPrimary);
  root.style.setProperty('--color-text-secondary', vars.textSecondary);
  root.style.setProperty('--color-text-muted', vars.textMuted);
  root.style.setProperty('--color-primary-light', vars.accent);
  document.body.style.backgroundColor = vars.bg;
  document.body.style.color = vars.textPrimary;
  if (isDark) {
    document.documentElement.style.backgroundColor = vars.bg;
  } else {
    document.documentElement.style.backgroundColor = '';
  }
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('lalatoto-theme') === 'dark');
  const [colorTheme, setColorTheme_state] = useState(() => localStorage.getItem('lalatoto-color-theme') || 'sand');

  // Apply immediately on mount
  useEffect(() => {
    applyDarkMode(isDark);
    applyColorTheme(colorTheme, isDark);
  }, []);

  // Fetch color theme from DB (non-blocking)
  useEffect(() => {
    import('@/api/base44Client').then(({ base44 }) => {
      base44.entities.AppConfig.filter({ key: 'app_theme' }).then(results => {
        const dbTheme = results[0]?.color_theme;
        if (dbTheme && dbTheme !== colorTheme) {
          setColorTheme(dbTheme);
          localStorage.setItem('lalatoto-color-theme', dbTheme);
          applyColorTheme(dbTheme, isDark);
        }
      }).catch(() => {});
    });
  }, []);

  const toggle = () => {
    setIsDark(d => {
      const next = !d;
      applyDarkMode(next);
      applyColorTheme(colorTheme, next);
      localStorage.setItem('lalatoto-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const setColorTheme = (themeId) => {
    setColorTheme_state(themeId);
    localStorage.setItem('lalatoto-color-theme', themeId);
    applyColorTheme(themeId, isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggle, colorTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}