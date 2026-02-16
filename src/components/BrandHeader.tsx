import { Sparkles } from 'lucide-react';

export function BrandHeader() {
    return (
        <div className="flex items-center gap-1.5 text-muted-foreground/80 mb-1 select-none">
            <Sparkles className="w-3.5 h-3.5 text-primary fill-primary/20" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-foreground/80">co-flow</span>
        </div>
    );
}
