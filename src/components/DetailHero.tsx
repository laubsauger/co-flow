import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { getBodyAreaColor } from '@/lib/body-area-colors';
import type { ReactNode } from 'react';

interface DetailHeroProps {
  poster?: string;
  alt: string;
  bodyAreas: string[];
  backTo: string;
  backLabel: string;
  /** Rendered top-right of hero (e.g. favorite button) */
  actions?: ReactNode;
  /** Rendered bottom of hero overlay (title, tags, meta) */
  children: ReactNode;
  /** Optional framer-motion layoutId props for shared element transitions */
  imageLayoutId?: string;
  placeholderType?: 'gesture' | 'flow';
}

export function DetailHero({
  poster,
  alt,
  bodyAreas,
  backTo,
  backLabel,
  actions,
  children,
  placeholderType,
}: DetailHeroProps) {
  const tintColor = bodyAreas.length > 0 ? getBodyAreaColor(bodyAreas) : undefined;

  return (
    <div
      className="w-full relative h-[40vh] sm:h-[50vh] overflow-hidden"
      style={{ backgroundColor: tintColor ?? 'var(--secondary)' }}
    >
      {poster ? (
        <img src={poster} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <PlaceholderImage type={placeholderType} />
      )}
      {tintColor && (
        <div
          className="absolute inset-0 mix-blend-color opacity-40 pointer-events-none"
          style={{ backgroundColor: tintColor }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

      {/* Back button — top left */}
      <div className="absolute top-4 left-4 z-10">
        <Link to={backTo} aria-label={backLabel}>
          <Button
            className="bg-background/50 hover:bg-background/80 text-foreground backdrop-blur-md rounded-full w-10 h-10 p-0 shadow-sm"
            variant="ghost"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Button>
        </Link>
      </div>

      {/* Top-right actions */}
      {actions && (
        <div className="absolute top-4 right-4 z-10">
          {actions}
        </div>
      )}

      {/* Bottom overlay content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-6 pt-10 bg-gradient-to-t from-background/90 via-background/60 to-transparent backdrop-blur-[2px]">
        {children}
      </div>
    </div>
  );
}
