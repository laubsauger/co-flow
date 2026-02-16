import { cn } from '@/lib/utils';
import type { PlayerStep } from '@/lib/types/player';

interface ProgressOverviewProps {
  steps: PlayerStep[];
  currentStepIndex: number;
  elapsedTime: number;
  /** Render only the remaining time label. */
  timeOnly?: boolean;
  /** Render only the segmented progress bar. */
  barOnly?: boolean;
}

export function ProgressOverview({ steps, currentStepIndex, elapsedTime, timeOnly, barOnly }: ProgressOverviewProps) {
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

  if (timeOnly) {
    return (
      <span className="text-xs text-muted-foreground tabular-nums">
        {remainingLabel}
      </span>
    );
  }

  if (barOnly) {
    return (
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
    );
  }

  // Full render (both rows) — fallback if neither flag is set
  return (
    <div className="w-full max-w-sm space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span className="font-medium tabular-nums">
          {currentStepIndex + 1} / {steps.length}
        </span>
        <span className="tabular-nums">{remainingLabel}</span>
      </div>

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
