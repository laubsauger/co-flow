import { cn } from '@/lib/utils';

interface PlaceholderImageProps {
  className?: string;
  label?: string;
}

export function PlaceholderImage({ className, label }: PlaceholderImageProps) {
  return (
    <div
      className={cn(
        'w-full h-full bg-gradient-to-br from-accent/60 to-secondary flex flex-col items-center justify-center gap-2',
        className
      )}
    >
      <svg width="32" height="32" viewBox="-40 -34 80 76" fill="none" className="text-primary/25">
        <path
          d="M0,38 C-18,28 -38,16 -38,-2 C-38,-18 -28,-30 -16,-30 C-8,-30 -2,-24 0,-18 C2,-24 8,-30 16,-30 C28,-30 38,-18 38,-2 C38,16 18,28 0,38Z"
          stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
        />
        <path d="M0,8 C0,-2 6,-10 14,-12 C14,-12 12,-2 6,4 C4,6 0,8 0,8Z" fill="currentColor" opacity="0.6"/>
        <path d="M0,10 C0,0 -5,-8 -10,-10 C-10,-10 -8,-1 -4,4 C-2,6 0,10 0,10Z" fill="currentColor" opacity="0.4"/>
        <line x1="0" y1="8" x2="0" y2="20" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
      </svg>
      {label && (
        <span className="text-xs text-muted-foreground/40 font-medium">
          {label}
        </span>
      )}
    </div>
  );
}
