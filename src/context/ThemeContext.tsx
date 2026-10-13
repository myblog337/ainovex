import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: 'dark' | 'light';
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  themeMode: 'dark',
  toggleTheme: () => {},
  setThemeMode: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('ainovex-theme-mode') as ThemeMode;
    if (saved && ['dark', 'light', 'system'].includes(saved)) {
      return saved;
    }
    const legacy = localStorage.getItem('ainovex-theme');
    if (legacy === 'light') return 'light';
    return 'dark';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() => {
    if (themeMode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return themeMode;
  });

  useEffect(() => {
    const updateTheme = () => {
      let activeTheme: 'dark' | 'light' = 'dark';
      if (themeMode === 'system') {
        activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        activeTheme = themeMode;
      }

      setResolvedTheme(activeTheme);
      localStorage.setItem('ainovex-theme-mode', themeMode);
      localStorage.setItem('ainovex-theme', activeTheme);

      const root = document.documentElement;
      root.dataset.theme = activeTheme;
      document.body.dataset.theme = activeTheme;
      if (activeTheme === 'light') {
        root.classList.remove('dark');
        root.classList.add('light');
        document.body.classList.remove('dark');
        document.body.classList.add('light');
      } else {
        root.classList.remove('light');
        root.classList.add('dark');
        document.body.classList.remove('light');
        document.body.classList.add('dark');
      }
    };

    updateTheme();

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeModeState(prev => {
      const current = prev === 'system' ? resolvedTheme : prev;
      return current === 'dark' ? 'light' : 'dark';
    });
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const setTheme = (theme: 'dark' | 'light') => {
    setThemeModeState(theme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: resolvedTheme,
        themeMode,
        toggleTheme,
        setThemeMode,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
