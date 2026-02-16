import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { SideBadge } from '@/components/SideBadge';
import { getBodyAreaColor } from '@/lib/body-area-colors';
import type { PlayerStep } from '@/lib/types/player';

interface NextStepCardProps {
  step: PlayerStep;
}

export function NextStepCard({ step }: NextStepCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
      className="w-full pointer-events-none"
    >
      <div
        className="bg-card border rounded-xl px-4 py-3 flex items-center gap-3 border-l-[3px]"
        style={{ borderLeftColor: getBodyAreaColor(step.gesture.bodyAreas) }}
      >
        {/* Thumbnail */}
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
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase text-muted-foreground font-medium">Up Next</p>
          <p className="font-medium text-sm truncate">{step.gesture.name}</p>
        </div>
        {step.side && <SideBadge side={step.side} />}
        <span className="text-xs text-muted-foreground tabular-nums flex items-center gap-0.5">
          {step.durationSec}s
          <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  );
}
