import { useSyncExternalStore } from 'react';
import { useUserData } from '@/lib/stores/user-data';

// Subscribe to OS prefers-reduced-motion
const mediaQuery =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

function subscribe(callback: () => void) {
  mediaQuery?.addEventListener('change', callback);
  return () => mediaQuery?.removeEventListener('change', callback);
}

function getSnapshot() {
  return mediaQuery?.matches ?? false;
}

/**
 * Returns true if reduced motion should be applied.
 * Merges OS preference with in-app toggle (either one = reduce).
 */
export function useReducedMotion(): boolean {
  const osPrefers = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const appPrefers = useUserData((s) => s.reducedMotion);
  return osPrefers || appPrefers;
}
