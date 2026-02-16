import { cn } from '@/lib/utils';

interface PlaceholderImageProps {
  type?: 'flow' | 'gesture';
  className?: string;
}

export function PlaceholderImage({ type = 'gesture', className }: PlaceholderImageProps) {
  const src = type === 'flow' ? '/media/generic-flow.png' : '/media/generic-gesture.png';

  return (
    <div className={cn("w-full h-full bg-secondary overflow-hidden", className)}>
      <img
        src={src}
        alt={`${type} placeholder`}
        className="w-full h-full object-cover opacity-80 mix-blend-multiply grayscale-[20%]"
      />
    </div>
  );
}
