import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ isDark: false, toggle: () => {} });

function applyTheme(dark) {
  if (dark) {
    document.documentElement.classList.add('dark');
    document.documentElement.style.backgroundColor = '#000000';
    document.documentElement.style.colorScheme = 'dark';
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.backgroundColor = '';
    document.documentElement.style.colorScheme = 'light';
  }
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('lalatoto-theme') === 'dark';
    applyTheme(saved);
    return saved;
  });

  const toggle = () => {
    setIsDark(d => {
      const next = !d;
      applyTheme(next);
      localStorage.setItem('lalatoto-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}