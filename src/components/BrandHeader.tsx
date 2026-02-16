import { Link } from 'react-router-dom';

interface BrandHeaderProps {
    title?: string;
}

export function BrandHeader({ title }: BrandHeaderProps) {
    return (
        <div className="flex items-center gap-3 select-none">
            <Link to="/" className="flex items-center gap-3 no-underline">
                <svg width="22" height="22" viewBox="-40 -34 80 76" fill="none" className="text-primary flex-shrink-0">
                    <path
                        d="M0,38 C-18,28 -38,16 -38,-2 C-38,-18 -28,-30 -16,-30 C-8,-30 -2,-24 0,-18 C2,-24 8,-30 16,-30 C28,-30 38,-18 38,-2 C38,16 18,28 0,38Z"
                        stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
                    />
                    <path d="M0,8 C0,-2 6,-10 14,-12 C14,-12 12,-2 6,4 C4,6 0,8 0,8Z" fill="currentColor" opacity="0.5" />
                    <path d="M0,10 C0,0 -5,-8 -10,-10 C-10,-10 -8,-1 -4,4 C-2,6 0,10 0,10Z" fill="currentColor" opacity="0.35" />
                    <line x1="0" y1="8" x2="0" y2="20" stroke="currentColor" strokeWidth="3" opacity="0.4" />
                </svg>
                <span className="text-base font-bold tracking-wider uppercase text-primary">co-flow</span>
            </Link>
            {title && (
                <div className="flex items-baseline gap-2.5">
                    <span className="text-muted-foreground/40 text-sm font-light">/</span>
                    <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
                </div>
            )}
        </div>
    );
}
