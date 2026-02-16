import { useEffect, useRef, useCallback, useSyncExternalStore } from 'react';

// External store pattern to avoid setState-in-effect lint errors
let wakeLockActive = false;
const listeners = new Set<() => void>();
function setWakeLockActive(value: boolean) {
  wakeLockActive = value;
  listeners.forEach((l) => l());
}
function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
function getSnapshot() {
  return wakeLockActive;
}

export function useWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const isActive = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setWakeLockActive(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) {
      release();
      return;
    }

    let cancelled = false;

    const acquire = async () => {
      try {
        const sentinel = await navigator.wakeLock.request('screen');
        if (cancelled) {
          await sentinel.release();
          return;
        }
        wakeLockRef.current = sentinel;
        setWakeLockActive(true);

        sentinel.addEventListener('release', () => {
          wakeLockRef.current = null;
          setWakeLockActive(false);
        });
      } catch {
        // Wake Lock API not available or permission denied
        setWakeLockActive(false);
      }
    };

    acquire();

    // Re-acquire on visibility change (browser releases lock when tab is hidden)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled && !cancelled) {
        acquire();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      release();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [enabled, release]);

  return { isActive, supported: 'wakeLock' in navigator };
}
