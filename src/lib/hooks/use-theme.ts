import { useEffect } from 'react';
import { useUserData, type ThemeMode } from '@/lib/stores/user-data';

function getSystemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(mode: ThemeMode) {
  const isDark = mode === 'dark' || (mode === 'system' && getSystemDark());
  document.documentElement.classList.toggle('dark', isDark);
}

/** Syncs the theme class on <html> with the user's preference. Call once in the app root. */
export function useTheme() {
  const themeMode = useUserData((s) => s.themeMode);

  useEffect(() => {
    applyTheme(themeMode);

    // Listen for OS theme changes when in system mode
    if (themeMode !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [themeMode]);
}
