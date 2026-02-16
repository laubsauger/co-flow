import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { springs } from '@/motion/tokens';
import { getBodyAreaColor } from '@/lib/body-area-colors';
import type { PlayerStep } from '@/lib/types/player';

interface NextStepCardProps {
  step: PlayerStep;
}

export function NextStepCard({ step }: NextStepCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 0.5, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={springs.soft}
      className="w-full max-w-sm pointer-events-none"
    >
      <div
        className="bg-card border rounded-xl px-4 py-3 flex items-center gap-3 border-l-[3px]"
        style={{ borderLeftColor: getBodyAreaColor(step.gesture.bodyAreas) }}
      >
        <p className="text-xs uppercase text-muted-foreground font-medium">Up Next</p>
        <p className="font-medium text-sm truncate flex-1">{step.gesture.name}</p>
        <span className="text-xs text-muted-foreground tabular-nums flex items-center gap-0.5">
          {step.durationSec}s
          <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  );
}
