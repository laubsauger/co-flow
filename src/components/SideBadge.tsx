import { cn } from '@/lib/utils';

interface SideBadgeProps {
  side: 'left' | 'right';
  className?: string;
}

export function SideBadge({ side, className }: SideBadgeProps) {
  return (
    <span
      className={cn(
        'text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full border',
        side === 'left'
          ? 'bg-blue-500/15 text-blue-500 border-blue-500/25'
          : 'bg-amber-500/15 text-amber-500 border-amber-500/25',
        className,
      )}
    >
      {side === 'left' ? 'L' : 'R'}
    </span>
  );
}
