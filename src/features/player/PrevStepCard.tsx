import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { SideBadge } from '@/components/SideBadge';
import { getBodyAreaColor } from '@/lib/body-area-colors';
import type { PlayerStep } from '@/lib/types/player';

interface PrevStepCardProps {
  step: PlayerStep;
}

export function PrevStepCard({ step }: PrevStepCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.4 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
      className="w-full pointer-events-none"
    >
      <div
        className="bg-card border rounded-xl px-4 py-3 flex items-center gap-3 border-l-[3px]"
        style={{ borderLeftColor: getBodyAreaColor(step.gesture.bodyAreas) }}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden bg-secondary relative">
          <img
            src={step.gesture.poster || step.gesture.media.poster || '/media/generic-gesture.png'}
            className="w-full h-full object-cover"
            alt=""
          />
          <div
            className="absolute inset-0 mix-blend-color opacity-30"
            style={{ backgroundColor: getBodyAreaColor(step.gesture.bodyAreas) }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Check className="w-4 h-4 text-white drop-shadow-md" />
          </div>
        </div>
        <p className="font-medium text-sm truncate flex-1">{step.gesture.name}</p>
        {step.side && <SideBadge side={step.side} />}
        <span className="text-xs text-muted-foreground tabular-nums">
          {step.durationSec}s
        </span>
      </div>
    </motion.div>
  );
}
