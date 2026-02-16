import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { allGestures } from '@/content/generated';
import { cn } from '@/lib/utils';
import { Search, Heart, SlidersHorizontal, Droplets, RectangleHorizontal } from 'lucide-react';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { ColoredTag } from '@/components/ColoredTag';
import { useState, useMemo } from 'react';
import { useUserData } from '@/lib/stores/user-data';
import { getBodyAreaColor } from '@/lib/body-area-colors';
import Fuse from 'fuse.js';
import type { Gesture } from '@/lib/types/gesture';
import { BrandHeader } from '@/components/BrandHeader';
import { useScrollRestore } from '@/lib/hooks/use-scroll-restore';

type SortOption = 'default' | 'favorites' | 'alpha' | 'intensity';

const SORT_LABELS: Record<SortOption, string> = {
    default: 'Default',
    favorites: 'Favorites first',
    alpha: 'A-Z',
    intensity: 'Intensity',
};

export function GestureList() {
    useScrollRestore('/gestures');
    const [search, setSearch] = useState('');
    const [selectedBodyArea, setSelectedBodyArea] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>('default');
    const [showFilters, setShowFilters] = useState(false);
    const { isGestureFavorite } = useUserData();

    const bodyAreas = useMemo(() => {
        const areas = new Set<string>();
        allGestures.forEach(g => g.bodyAreas.forEach((a: string) => areas.add(a)));
        return Array.from(areas).sort();
    }, []);

    const fuse = useMemo(
        () =>
            new Fuse(allGestures, {
                keys: [
                    { name: 'name', weight: 3 },
                    { name: 'summary', weight: 2 },
                    { name: 'tags', weight: 1.5 },
                    { name: 'bodyAreas', weight: 1 },
                    { name: 'description', weight: 0.5 },
                ],
                threshold: 0.4,
                includeScore: true,
            }),
        []
    );

    const filteredGestures = useMemo(() => {
        let results: Gesture[] = search.trim()
            ? fuse.search(search).map((r) => r.item)
            : [...allGestures];

        if (selectedBodyArea) {
            results = results.filter((g) => g.bodyAreas.includes(selectedBodyArea));
        }

        // Sort
        switch (sortBy) {
            case 'favorites':
                results.sort((a, b) => {
                    const aFav = isGestureFavorite(a.id) ? 0 : 1;
                    const bFav = isGestureFavorite(b.id) ? 0 : 1;
                    return aFav - bFav;
                });
                break;
            case 'alpha':
                results.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'intensity':
                results.sort((a, b) => b.intensity - a.intensity);
                break;
        }

        return results;
    }, [search, selectedBodyArea, sortBy, fuse, isGestureFavorite]);

    // ... (lines 82)
    return (
        <div className="max-w-2xl mx-auto pb-20">
            <div className="px-4 pt-4 pb-2">
                <BrandHeader title="Gestures" />
            </div>

            {/* Sticky search + filters */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg px-4 py-2 space-y-2">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search gestures..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        aria-label={showFilters ? 'Hide sort options' : 'Show sort options'}
                        aria-expanded={showFilters}
                        className={cn(
                            "h-10 w-10 rounded-md border flex items-center justify-center transition-colors",
                            showFilters
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-input text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                    </button>
                </div>

                {/* Sort options */}
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="space-y-2"
                    >
                        <label className="text-xs font-medium text-muted-foreground">Sort by</label>
                        <div className="flex gap-1.5 flex-wrap">
                            {(Object.keys(SORT_LABELS) as SortOption[]).map(option => (
                                <button
                                    key={option}
                                    onClick={() => setSortBy(option)}
                                    className={cn(
                                        "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                                        sortBy === option
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                    )}
                                >
                                    {SORT_LABELS[option]}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Body area filters */}
                <div role="group" aria-label="Filter by body area" className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                    <button
                        onClick={() => setSelectedBodyArea(null)}
                        aria-pressed={selectedBodyArea === null}
                        className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                            selectedBodyArea === null
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        )}
                    >
                        All
                    </button>
                    {bodyAreas.map(area => {
                        const color = getBodyAreaColor([area]);
                        const isActive = selectedBodyArea === area;
                        return (
                            <button
                                key={area}
                                onClick={() => setSelectedBodyArea(isActive ? null : area)}
                                aria-pressed={isActive}
                                className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap capitalize"
                                style={isActive
                                    ? { backgroundColor: color, color: 'white' }
                                    : { backgroundColor: `color-mix(in oklch, ${color} 12%, transparent)`, color }
                                }
                            >
                                {area}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 pt-2">
                {filteredGestures.map(gesture => (
                    <Link key={gesture.id} to={`/gestures/${gesture.id}`}>
                        <motion.div
                            layoutId={`card-${gesture.id}`}
                            className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        >
                            <div
                                className="aspect-[3/2] relative overflow-hidden"
                                style={{ backgroundColor: getBodyAreaColor(gesture.bodyAreas) }}
                            >
                                {gesture.media.poster ? (
                                    <motion.img
                                        layoutId={`image-${gesture.id}`}
                                        src={gesture.media.poster}
                                        alt={gesture.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <PlaceholderImage />
                                )}
                                <div
                                    className="absolute inset-0 mix-blend-color opacity-50 pointer-events-none"
                                    style={{ backgroundColor: getBodyAreaColor(gesture.bodyAreas) }}
                                />
                                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                                    {isGestureFavorite(gesture.id) && (
                                        <div className="bg-black/50 backdrop-blur-sm rounded-full p-1">
                                            <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                                        </div>
                                    )}
                                    <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                        {gesture.durationDefaults.defaultSec}s
                                    </div>
                                </div>
                                {gesture.equipment && gesture.equipment.length > 0 && (
                                    <div className="absolute bottom-2 left-2 flex items-center gap-1">
                                        {gesture.equipment.map(e => (
                                            <div
                                                key={e.name}
                                                className={cn(
                                                    "backdrop-blur-sm rounded-full p-1",
                                                    e.optional ? "bg-white/20" : "bg-black/50"
                                                )}
                                                title={`${e.name}${e.optional ? ' (optional)' : ''}`}
                                            >
                                                {e.name === 'massage oil' ? (
                                                    <Droplets className="w-3 h-3 text-white" />
                                                ) : e.name === 'mat' ? (
                                                    <RectangleHorizontal className="w-3 h-3 text-white" />
                                                ) : (
                                                    <span className="text-[9px] text-white leading-none px-0.5">{e.name}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                                        <ColoredTag key={tag} tag={tag} />
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
