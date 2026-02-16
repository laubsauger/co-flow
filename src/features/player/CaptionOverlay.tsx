import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { parseVtt, getActiveCue, type VttCue } from '@/lib/utils/parse-vtt';
import { resolveGestureMediaUrl } from './hooks/resolve-media-url';
import { cn } from '@/lib/utils';

interface CaptionOverlayProps {
  gestureId: string;
  captionsFile: string | undefined;
  elapsedSec: number;
  glanceMode?: boolean;
}

export function CaptionOverlay({
  gestureId,
  captionsFile,
  elapsedSec,
  glanceMode,
}: CaptionOverlayProps) {
  const [cues, setCues] = useState<VttCue[]>([]);

  // Fetch and parse VTT when the captions file changes
  useEffect(() => {
    if (!captionsFile) {
      setCues([]);
      return;
    }

    const url = resolveGestureMediaUrl(gestureId, captionsFile);
    let cancelled = false;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${url}`);
        return r.text();
      })
      .then((raw) => {
        if (!cancelled) setCues(parseVtt(raw));
      })
      .catch(() => {
        if (!cancelled) setCues([]);
      });

    return () => {
      cancelled = true;
    };
  }, [gestureId, captionsFile]);

  const activeCue = useMemo(
    () => getActiveCue(cues, elapsedSec),
    [cues, elapsedSec]
  );

  if (!captionsFile || cues.length === 0) return null;

  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Captions"
      className="absolute bottom-4 left-4 right-4 flex justify-center pointer-events-none z-10"
    >
      <AnimatePresence mode="wait">
        {activeCue && (
          <motion.div
            key={activeCue.startSec}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'bg-black/70 text-white backdrop-blur-sm rounded-lg px-4 py-2 text-center max-w-[80%]',
              glanceMode ? 'text-lg' : 'text-sm'
            )}
          >
            {activeCue.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
