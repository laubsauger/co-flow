import { useEffect } from 'react';

const scrollPositions = new Map<string, number>();

/**
 * Saves scroll position on unmount and restores it on mount,
 * keyed by a stable identifier (typically the route path).
 */
/** Scroll to top on mount. Use on detail/target pages. */
export function useScrollTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
}

export function useScrollRestore(key: string) {
  useEffect(() => {
    const saved = scrollPositions.get(key);
    if (saved != null) {
      requestAnimationFrame(() => window.scrollTo(0, saved));
    }

    return () => {
      scrollPositions.set(key, window.scrollY);
    };
  }, [key]);
}
