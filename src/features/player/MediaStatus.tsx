import { Volume2, Video, Captions } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Gesture } from '@/lib/types/gesture';

interface MediaStatusProps {
  gesture: Gesture;
  className?: string;
}

export function MediaStatus({ gesture, className }: MediaStatusProps) {
  const hasAudio = Boolean(gesture.media.audio);
  const hasVideo = Boolean(gesture.media.video);
  const hasCaptions = Boolean(gesture.media.captions);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <StatusDot
        icon={<Volume2 className="w-3 h-3" />}
        active={hasAudio}
        label="Audio"
      />
      <StatusDot
        icon={<Video className="w-3 h-3" />}
        active={hasVideo}
        label="Video"
      />
      <StatusDot
        icon={<Captions className="w-3 h-3" />}
        active={hasCaptions}
        label="Captions"
      />
    </div>
  );
}

function StatusDot({
  icon,
  active,
  label,
}: {
  icon: React.ReactNode;
  active: boolean;
  label: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5',
        active
          ? 'bg-primary/10 text-primary'
          : 'bg-muted text-muted-foreground/50'
      )}
      aria-label={`${label}: ${active ? 'available' : 'unavailable'}`}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </span>
  );
}
