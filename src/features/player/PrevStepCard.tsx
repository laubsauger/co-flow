import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { springs } from '@/motion/tokens';
import type { PlayerStep } from '@/lib/types/player';

interface PrevStepCardProps {
  step: PlayerStep;
}

export function PrevStepCard({ step }: PrevStepCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 0.4, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={springs.soft}
      className="w-full max-w-sm pointer-events-none"
    >
      <div className="bg-card border rounded-xl px-4 py-3 flex items-center gap-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-primary" />
        </div>
        <p className="font-medium text-sm truncate flex-1">{step.gesture.name}</p>
        <span className="text-xs text-muted-foreground tabular-nums">
          {step.durationSec}s
        </span>
      </div>
    </motion.div>
  );
}
