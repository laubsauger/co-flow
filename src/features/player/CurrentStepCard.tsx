import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video } from 'lucide-react';
import { springs } from '@/motion/tokens';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { resolveGestureMediaUrl } from './hooks/resolve-media-url';
import { getBodyAreaColor } from '@/lib/body-area-colors';
import type { PlayerStep, PlayerStatus } from '@/lib/types/player';

interface CurrentStepCardProps {
  step: PlayerStep;
  remainingTime: number;
  progress: number;
  glanceMode?: boolean;
  playerStatus?: PlayerStatus;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}:${s.toString().padStart(2, '0')}`;
  return `${s}`;
}

export function CurrentStepCard({ step, remainingTime, progress, glanceMode, playerStatus }: CurrentStepCardProps) {
  const posterSrc = step.gesture.poster || step.gesture.media.poster;
  const hasVideo = Boolean(step.gesture.media.video);

  const [videoEnabled, setVideoEnabled] = useState(false);
  const [videoReadyForGesture, setVideoReadyForGesture] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Video is ready only if the readiness matches the current gesture
  const videoReady = videoReadyForGesture === step.gesture.id;

  // Play/pause video in sync with player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoEnabled) return;

    if (playerStatus === 'playing') {
      video.play().catch(() => { });
    } else {
      video.pause();
    }
  }, [playerStatus, videoEnabled]);

  const toggleVideo = useCallback(() => {
    setVideoEnabled((prev) => {
      if (!prev) setVideoReadyForGesture(null);
      return !prev;
    });
  }, []);

  const videoSrc = hasVideo
    ? resolveGestureMediaUrl(step.gesture.id, step.gesture.media.video!)
    : undefined;

  return (
    <motion.div
      layout
      key={step.gesture.id}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={springs.snappy}
      className="w-full max-w-sm bg-card border rounded-3xl shadow-xl overflow-hidden flex flex-col aspect-[3/4]"
    >
      {/* Media area — poster or video */}
      <div
        className="w-full h-1/2 relative"
        style={{ backgroundColor: getBodyAreaColor(step.gesture.bodyAreas) }}
      >
        {/* Poster (or fallback) */}
        <img
          src={posterSrc || '/media/generic-gesture.png'}
          className={cn(
            'w-full h-full object-cover absolute inset-0',
            videoEnabled && videoReady && 'opacity-0'
          )}
          alt={step.gesture.name}
        />
        {/* Body area tint */}
        <div
          className="absolute inset-0 mix-blend-color opacity-35 pointer-events-none"
          style={{ backgroundColor: getBodyAreaColor(step.gesture.bodyAreas) }}
        />

        {/* Lazy-loaded video overlay — key forces remount on step change */}
        <AnimatePresence>
          {videoEnabled && videoSrc && (
            <motion.video
              key={step.gesture.id}
              ref={videoRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: videoReady ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={videoSrc}
              loop
              muted
              playsInline
              onCanPlay={() => setVideoReadyForGesture(step.gesture.id)}
              className="w-full h-full object-cover absolute inset-0"
            />
          )}
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/10" />

        {/* Countdown */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-48 h-48 rounded-full bg-black/30 blur-3xl" />
          <div className={cn(
            'relative font-bold text-white tabular-nums tracking-tighter leading-none',
            glanceMode ? 'text-[7.5rem]' : 'text-[5rem]',
            '[text-shadow:_0_2px_12px_rgba(0,0,0,0.6),_0_0_40px_rgba(0,0,0,0.3)]'
          )}>
            {formatTime(remainingTime)}
          </div>
        </div>

        {/* Side indicator */}
        {step.side && (
          <div className="absolute top-4 right-4">
            <span className={cn(
              'bg-white/90 text-black font-bold rounded-full uppercase tracking-wide',
              glanceMode ? 'text-sm px-3.5 py-1.5' : 'text-xs px-2.5 py-1'
            )}>
              {step.side === 'left' ? 'L' : 'R'}
            </span>
          </div>
        )}

        {/* Video toggle */}
        {hasVideo && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute bottom-3 right-3 h-8 w-8 rounded-full',
              videoEnabled
                ? 'bg-white/90 text-black'
                : 'bg-black/40 text-white'
            )}
            onClick={toggleVideo}
            aria-label={videoEnabled ? 'Hide video' : 'Show video'}
          >
            <Video className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 w-full p-6 flex flex-col justify-between">
        <div className="space-y-2">
          <h2 className={cn(
            'font-bold leading-tight',
            glanceMode ? 'text-3xl' : 'text-2xl'
          )}>
            {step.gesture.name}
          </h2>
          {!glanceMode && (
            <p className="text-muted-foreground text-base leading-snug line-clamp-2">
              {step.gesture.summary}
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className={cn(
          'w-full bg-secondary rounded-full overflow-hidden mt-4',
          glanceMode ? 'h-3' : 'h-2'
        )}>
          <motion.div
            className="bg-primary h-full rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'linear' }}
          />
        </div>
      </div>
    </motion.div>
  );
}
