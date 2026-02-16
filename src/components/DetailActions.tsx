import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Play, Heart, Share2 } from 'lucide-react';
import { shareOrCopy } from '@/lib/share';
import { toast } from 'sonner';

interface DetailActionsProps {
  playLabel: string;
  onPlay: () => void;
  playDisabled?: boolean;
  shareData: { title: string; text?: string; url: string };
  isFavorite: boolean;
  onToggleFavorite: () => void;
  favoriteLabel: string;
}

export function DetailActions({
  playLabel,
  onPlay,
  playDisabled,
  shareData,
  isFavorite,
  onToggleFavorite,
  favoriteLabel,
}: DetailActionsProps) {
  return (
    <div className="flex gap-4">
      <Button
        className="flex-1 h-12 text-base shadow-lg"
        onClick={onPlay}
        disabled={playDisabled}
      >
        <Play className="w-5 h-5 mr-2 fill-current" />
        {playLabel}
      </Button>
      <Button
        variant="secondary"
        className="w-12 h-12 px-0"
        onClick={async () => {
          const result = await shareOrCopy(shareData);
          if (result === 'copied') {
            toast('Link copied to clipboard');
          }
        }}
        aria-label="Share"
      >
        <Share2 className="w-5 h-5 text-muted-foreground" />
      </Button>
      <Button
        variant="secondary"
        className="w-12 h-12 px-0"
        onClick={onToggleFavorite}
        aria-label={favoriteLabel}
      >
        <Heart
          className={cn(
            'w-6 h-6 transition-colors',
            isFavorite
              ? 'text-red-500 fill-red-500'
              : 'text-muted-foreground hover:text-red-500'
          )}
        />
      </Button>
    </div>
  );
}
