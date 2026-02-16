import { useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

type SwipeNavigationOptions = {
  prevUrl?: string;
  nextUrl?: string;
};

const SWIPE_THRESHOLD_PX = 60;
const SWIPE_VELOCITY_PX_MS = 0.3;

export function useSwipeNavigation({ prevUrl, nextUrl }: SwipeNavigationOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const touchState = useRef<{
    startX: number;
    startY: number;
    startTime: number;
  } | null>(null);

  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      if (direction === 'left' && nextUrl) {
        navigate(nextUrl);
      } else if (direction === 'right' && prevUrl) {
        navigate(prevUrl);
      }
    },
    [navigate, prevUrl, nextUrl],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchState.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
      };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchState.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchState.current.startX;
      const deltaY = touch.clientY - touchState.current.startY;
      const elapsed = Date.now() - touchState.current.startTime;

      touchState.current = null;

      // Ignore if vertical movement exceeds horizontal (user is scrolling)
      if (Math.abs(deltaY) > Math.abs(deltaX)) return;

      const absDeltaX = Math.abs(deltaX);
      const velocity = elapsed > 0 ? absDeltaX / elapsed : 0;

      if (absDeltaX > SWIPE_THRESHOLD_PX && velocity > SWIPE_VELOCITY_PX_MS) {
        handleSwipe(deltaX < 0 ? 'left' : 'right');
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleSwipe]);

  return {
    ref,
    hasPrev: !!prevUrl,
    hasNext: !!nextUrl,
  };
}
