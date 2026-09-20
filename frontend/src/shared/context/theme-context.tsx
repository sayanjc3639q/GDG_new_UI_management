'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  targetTheme: Theme | null;
  isTransitioning: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [targetTheme, setTargetTheme] = useState<Theme | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('gdg_theme') as Theme | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = prefersDark ? 'dark' : 'light';
      setThemeState(initial);
      document.documentElement.setAttribute('data-theme', initial);
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    if (newTheme === theme) return;
    setTargetTheme(newTheme);
    setIsTransitioning(true);

    // Switch theme midway through cloud sweep (at 450ms)
    setTimeout(() => {
      setThemeState(newTheme);
      localStorage.setItem('gdg_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }, 450);

    // End cloud overlay animation
    setTimeout(() => {
      setIsTransitioning(false);
      setTargetTheme(null);
    }, 1100);
  };

  const toggleTheme = () => {
    if (isTransitioning) return;
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, targetTheme, isTransitioning, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
