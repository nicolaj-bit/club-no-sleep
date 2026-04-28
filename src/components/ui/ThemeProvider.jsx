import { createContext, useContext, useEffect, useState, useRef } from 'react';

const ThemeContext = createContext({ isDark: false, toggle: () => {}, colorTheme: null, setColorTheme: () => {} });

// Cache fetched DB themes in memory so we don't re-fetch every render
const themeCache = {};

function applyDarkMode(dark) {
  if (dark) {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }
}

function applyThemeObject(theme, isDark) {
  if (!theme) return;
  const prefix = isDark ? 'dark_' : 'light_';
  const root = document.documentElement;
  const set = (cssVar, field) => {
    const val = theme[prefix + field];
    if (val) root.style.setProperty(cssVar, val);
  };
  set('--color-bg', 'bg');
  set('--color-bg-card', 'card');
  set('--color-bg-subtle', 'subtle');
  set('--color-border', 'border');
  set('--color-primary', 'primary');
  set('--color-accent', 'accent');
  set('--color-cappuccino', 'cappuccino');
  set('--color-text-primary', 'text_primary');
  set('--color-text-secondary', 'text_secondary');
  set('--color-text-muted', 'text_muted');
  set('--color-divider', 'border');
  root.style.setProperty('--color-primary-light', theme[prefix + 'accent'] || '');
  const bg = theme[prefix + 'bg'] || '';
  const textPrimary = theme[prefix + 'text_primary'] || '';
  document.body.style.backgroundColor = bg;
  document.body.style.color = textPrimary;
  document.documentElement.style.backgroundColor = isDark ? bg : '';
}

async function fetchThemeById(id) {
  if (!id) return null;
  if (themeCache[id]) return themeCache[id];
  const { base44 } = await import('@/api/base44Client');
  const results = await base44.entities.ColorTheme.filter({ id });
  const theme = results[0] || null;
  if (theme) themeCache[id] = theme;
  return theme;
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('lalatoto-theme') === 'dark');
  const [colorThemeId, setColorThemeId] = useState(() => localStorage.getItem('lalatoto-color-theme-id') || null);
  const currentThemeRef = useRef(null);
  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;

  // Apply dark mode immediately
  useEffect(() => {
    applyDarkMode(isDark);
  }, []);

  // Load and apply the saved theme on mount
  useEffect(() => {
    if (!colorThemeId) return;
    fetchThemeById(colorThemeId).then(theme => {
      if (theme) {
        currentThemeRef.current = theme;
        applyThemeObject(theme, isDarkRef.current);
      }
    }).catch(() => {});
  }, []);

  const toggle = () => {
    setIsDark(d => {
      const next = !d;
      isDarkRef.current = next;
      applyDarkMode(next);
      if (currentThemeRef.current) applyThemeObject(currentThemeRef.current, next);
      localStorage.setItem('lalatoto-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const setColorTheme = async (id, themeObj) => {
    setColorThemeId(id);
    localStorage.setItem('lalatoto-color-theme-id', id);
    let theme = themeObj || themeCache[id];
    if (!theme) theme = await fetchThemeById(id);
    if (theme) {
      currentThemeRef.current = theme;
      themeCache[id] = theme;
      applyThemeObject(theme, isDarkRef.current);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggle, colorTheme: colorThemeId, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}