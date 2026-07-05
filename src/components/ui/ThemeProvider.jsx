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

// Convert hex (#RRGGBB) to HSL string "H S% L%" for shadcn/Tailwind tokens
function hexToHsl(hex) {
  if (!hex || hex.length < 7) return null;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyThemeObject(theme, isDark) {
  if (!theme) return;
  const prefix = isDark ? 'dark_' : 'light_';
  const root = document.documentElement;

  const get = (field) => theme[prefix + field] || '';

  const bg = get('bg');
  const card = get('card');
  const subtle = get('subtle');
  const border = get('border');
  const primary = get('primary');
  const accent = get('accent');
  const cappuccino = get('cappuccino');
  const textPrimary = get('text_primary');
  const textSecondary = get('text_secondary');
  const textMuted = get('text_muted');

  // ── LALATOTO CSS variables ──
  const colorVars = {
    '--color-bg': bg,
    '--color-bg-card': card,
    '--color-bg-subtle': subtle,
    '--color-border': border,
    '--color-divider': border,
    '--color-primary': primary,
    '--color-primary-light': accent,
    '--color-accent': accent,
    '--color-accent-soft': accent,
    '--color-accent-warm': subtle || bg,
    '--color-cappuccino': cappuccino || accent,
    '--color-text-primary': textPrimary,
    '--color-text-secondary': textSecondary,
    '--color-text-muted': textMuted,
    '--color-brown-dark': primary,
    '--color-brown-light': accent,
    '--color-sand': bg,
    '--color-nav-bg': card,
    '--color-card-warm': subtle || card,
    '--color-card-mid': border,
  };
  Object.entries(colorVars).forEach(([cssVar, value]) => {
    if (value) root.style.setProperty(cssVar, value);
  });

  // ── Shadcn / Tailwind HSL tokens ──
  const hslVars = {};
  if (bg) {
    hslVars['--background'] = hexToHsl(bg);
    hslVars['--sidebar-background'] = hexToHsl(bg);
  }
  if (textPrimary) {
    hslVars['--foreground'] = hexToHsl(textPrimary);
    hslVars['--sidebar-foreground'] = hexToHsl(textPrimary);
    hslVars['--card-foreground'] = hexToHsl(textPrimary);
    hslVars['--popover-foreground'] = hexToHsl(textPrimary);
    hslVars['--accent-foreground'] = hexToHsl(textPrimary);
    hslVars['--secondary-foreground'] = hexToHsl(textPrimary);
    hslVars['--sidebar-accent-foreground'] = hexToHsl(textPrimary);
  }
  if (card) {
    hslVars['--card'] = hexToHsl(card);
    hslVars['--popover'] = hexToHsl(card);
    hslVars['--secondary'] = hexToHsl(card);
    hslVars['--sidebar-accent'] = hexToHsl(card);
  }
  if (subtle) {
    hslVars['--muted'] = hexToHsl(subtle);
    hslVars['--accent'] = hexToHsl(subtle);
  }
  if (primary) {
    hslVars['--primary'] = hexToHsl(primary);
    hslVars['--sidebar-primary'] = hexToHsl(primary);
    hslVars['--ring'] = hexToHsl(primary);
    hslVars['--sidebar-ring'] = hexToHsl(primary);
    hslVars['--sidebar-border'] = hexToHsl(border || primary);
  }
  // Primary-foreground = background (so text on primary buttons is readable)
  if (bg) {
    hslVars['--primary-foreground'] = hexToHsl(bg);
    hslVars['--sidebar-primary-foreground'] = hexToHsl(bg);
  }
  if (border) {
    hslVars['--border'] = hexToHsl(border);
    hslVars['--input'] = hexToHsl(border);
  }
  if (textSecondary) {
    hslVars['--muted-foreground'] = hexToHsl(textSecondary);
  }
  Object.entries(hslVars).forEach(([cssVar, value]) => {
    if (value) root.style.setProperty(cssVar, value);
  });

  // ── Body ──
  document.body.style.backgroundColor = bg;
  document.body.style.color = textPrimary;
  document.documentElement.style.backgroundColor = bg;
}

// All CSS variables that applyThemeObject can set — used for reset
const ALL_THEME_VARS = [
  '--color-bg', '--color-bg-card', '--color-bg-subtle', '--color-border',
  '--color-divider', '--color-primary', '--color-primary-light',
  '--color-accent', '--color-accent-soft', '--color-accent-warm',
  '--color-cappuccino', '--color-text-primary', '--color-text-secondary',
  '--color-text-muted', '--color-brown-dark', '--color-brown-light',
  '--color-sand', '--color-nav-bg', '--color-card-warm', '--color-card-mid',
  // Shadcn HSL tokens
  '--background', '--foreground', '--card', '--card-foreground',
  '--popover', '--popover-foreground', '--primary', '--primary-foreground',
  '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
  '--accent', '--accent-foreground', '--border', '--input', '--ring',
  '--sidebar-background', '--sidebar-foreground', '--sidebar-primary',
  '--sidebar-primary-foreground', '--sidebar-accent', '--sidebar-accent-foreground',
  '--sidebar-border', '--sidebar-ring',
];

function resetThemeOverrides() {
  const root = document.documentElement;
  ALL_THEME_VARS.forEach(v => root.style.removeProperty(v));
  document.body.style.removeProperty('background-color');
  document.body.style.removeProperty('color');
  document.documentElement.style.removeProperty('background-color');
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
    if (!colorThemeId || colorThemeId === '__default__') return;
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