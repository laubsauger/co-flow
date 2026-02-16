import { Hand } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlaceholderImageProps {
  className?: string;
  label?: string;
}

export function PlaceholderImage({ className, label }: PlaceholderImageProps) {
  return (
    <div
      className={cn(
        'w-full h-full bg-gradient-to-br from-secondary to-secondary/50 flex flex-col items-center justify-center gap-2',
        className
      )}
    >
      <Hand className="w-8 h-8 text-muted-foreground/40" />
      {label && (
        <span className="text-xs text-muted-foreground/40 font-medium">
          {label}
        </span>
      )}
    </div>
  );
}
