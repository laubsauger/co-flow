import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { allGestures } from '@/content/generated';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';

export function GestureList() {
    const [search, setSearch] = useState('');
    const [selectedBodyArea, setSelectedBodyArea] = useState<string | null>(null);

    const bodyAreas = useMemo(() => {
        const areas = new Set<string>();
        // @ts-ignore
        allGestures.forEach(g => g.bodyAreas.forEach(a => areas.add(a)));
        return Array.from(areas).sort();
    }, []);

    const filteredGestures = useMemo(() => {
        return allGestures.filter(g => {
            const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
                g.summary.toLowerCase().includes(search.toLowerCase());
            const matchesArea = selectedBodyArea ? g.bodyAreas.includes(selectedBodyArea) : true;
            return matchesSearch && matchesArea;
        });
    }, [search, selectedBodyArea]);

    return (
        <div className="p-4 max-w-2xl mx-auto pb-20">
            <header className="mb-6 space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Library</h1>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search gestures..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setSelectedBodyArea(null)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                            selectedBodyArea === null
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        )}
                    >
                        All
                    </button>
                    {bodyAreas.map(area => (
                        <button
                            key={area}
                            onClick={() => setSelectedBodyArea(area)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap capitalize",
                                selectedBodyArea === area
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            )}
                        >
                            {area}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredGestures.map(gesture => (
                    <Link key={gesture.id} to={`/gestures/${gesture.id}`}>
                        <motion.div
                            layoutId={`card-${gesture.id}`}
                            className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        >
                            <div className="h-32 bg-secondary relative overflow-hidden">
                                {gesture.media.poster ? (
                                    <motion.img
                                        layoutId={`image-${gesture.id}`}
                                        src={gesture.media.poster}
                                        alt={gesture.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                    {gesture.durationDefaults.defaultSec}s
                                </div>
                            </div>
                            <div className="p-4">
                                <motion.h3 layoutId={`title-${gesture.id}`} className="font-semibold leading-none tracking-tight mb-2">
                                    {gesture.name}
                                </motion.h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {gesture.summary}
                                </p>
                                <div className="mt-3 flex gap-1 flex-wrap">
                                    {gesture.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
