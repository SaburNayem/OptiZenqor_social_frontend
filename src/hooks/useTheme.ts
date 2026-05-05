import { useEffect, useState } from 'react';
import { ThemeMode, ThemeState } from '../types';

const STORAGE_KEY = 'optizenqor.theme';

function getPreferredMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme(): ThemeState {
  const [mode, setMode] = useState<ThemeMode>(() => getPreferredMode());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    root.style.colorScheme = mode;
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  return {
    mode,
    setMode,
    toggleMode: () => setMode((current) => (current === 'dark' ? 'light' : 'dark')),
  };
}
