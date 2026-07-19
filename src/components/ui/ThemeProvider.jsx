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

// ── Mapping: 8 theme fields → the --color-* CSS variables they control ──
// When a theme is applied, ONLY these variables are updated — nothing else.
const THEME_VAR_MAP = {
  themeBackground:     ['--color-bg', '--color-sand'],
  themeBackgroundSoft: ['--color-bg-subtle', '--color-accent-warm', '--color-card-warm'],
  themeCard:          ['--color-bg-card', '--color-nav-bg'],
  themeBorder:        ['--color-border', '--color-divider', '--color-card-mid'],
  themeAccent:        ['--color-accent', '--color-accent-soft', '--color-primary', '--color-primary-light', '--color-brown-dark', '--color-brown-light', '--color-cappuccino'],
  textPrimary:        ['--color-text-primary'],
  textSecondary:      ['--color-text-secondary', '--color-text-muted'],
};

// textOnDark has no --color-* equivalent — it's set as a standalone token
const TEXT_ON_DARK_VAR = '--theme-text-on-dark';

// All CSS variables that applyThemeObject can set — used for reset
const ALL_THEME_VARS = [
  ...Object.values(THEME_VAR_MAP).flat(),
  TEXT_ON_DARK_VAR,
];

function applyThemeObject(theme) {
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(THEME_VAR_MAP).forEach(([field, cssVars]) => {
    const value = theme[field];
    if (!value) return;
    cssVars.forEach(v => root.style.setProperty(v, value));
  });
  if (theme.textOnDark) {
    root.style.setProperty(TEXT_ON_DARK_VAR, theme.textOnDark);
  }
}

function resetThemeOverrides() {
  const root = document.documentElement;
  ALL_THEME_VARS.forEach(v => root.style.removeProperty(v));
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

  // Apply dark mode immediately
  useEffect(() => {
    applyDarkMode(isDark);
  }, []);

  // Load and apply the saved theme on mount
  useEffect(() => {
    if (!colorThemeId || colorThemeId === '__default__') return;
    fetchThemeById(colorThemeId).then(theme => {
      if (theme) {
        currentThemeRef.current = theme;
        applyThemeObject(theme);
      }
    }).catch(() => {});
  }, []);

  const toggle = () => {
    setIsDark(d => {
      const next = !d;
      applyDarkMode(next);
      // Theme colors persist across dark/light toggles — no need to re-apply
      localStorage.setItem('lalatoto-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const setColorTheme = async (id, themeObj) => {
    setColorThemeId(id);
    localStorage.setItem('lalatoto-color-theme-id', id);
    if (id === '__default__') {
      currentThemeRef.current = null;
      resetThemeOverrides();
      return;
    }
    let theme = themeObj || themeCache[id];
    if (!theme) theme = await fetchThemeById(id);
    if (theme) {
      currentThemeRef.current = theme;
      themeCache[id] = theme;
      applyThemeObject(theme);
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