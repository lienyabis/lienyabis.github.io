import { useEffect, useState } from 'react';

const STORAGE_KEY = 'ns-portfolio-theme';

/**
 * Dark mode is the default; the visitor's choice is remembered locally.
 */
export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      // storage can be blocked (private mode) - the theme still applies for this session
    }
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' };
}
