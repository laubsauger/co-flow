import { cn } from '@/lib/utils';
import type { PlayerStep } from '@/lib/types/player';

interface ProgressOverviewProps {
  steps: PlayerStep[];
  currentStepIndex: number;
  elapsedTime: number;
}

export function ProgressOverview({ steps, currentStepIndex, elapsedTime }: ProgressOverviewProps) {
  const totalDuration = steps.reduce((sum, s) => sum + s.durationSec, 0);
  const completedDuration = steps
    .slice(0, currentStepIndex)
    .reduce((sum, s) => sum + s.durationSec, 0) + elapsedTime;
  const totalRemaining = Math.ceil(Math.max(0, totalDuration - completedDuration));

  const minutes = Math.floor(totalRemaining / 60);
  const seconds = totalRemaining % 60;
  const remainingLabel = minutes > 0
    ? `${minutes}:${seconds.toString().padStart(2, '0')} left`
    : `${seconds}s left`;

  return (
    <div className="w-full max-w-sm space-y-2">
      {/* Step counter + remaining time */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span className="font-medium tabular-nums">
          {currentStepIndex + 1} / {steps.length}
        </span>
        <span className="tabular-nums">{remainingLabel}</span>
      </div>

      {/* Segmented progress bar */}
      <div className="flex gap-1 w-full">
        {steps.map((step, i) => {
          let segmentProgress = 0;
          if (i < currentStepIndex) {
            segmentProgress = 100;
          } else if (i === currentStepIndex) {
            segmentProgress = Math.min(100, (elapsedTime / step.durationSec) * 100);
          }

          return (
            <div
              key={`${step.gesture.id}-${i}`}
              className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden"
            >
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300 ease-linear',
                  i <= currentStepIndex ? 'bg-primary' : 'bg-secondary'
                )}
                style={{ width: `${segmentProgress}%` }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
