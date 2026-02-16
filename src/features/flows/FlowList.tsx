import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { allFlows, allGestures, gestureMap } from '@/content/generated';
import { Play, Heart, Layers, Search, Pencil } from 'lucide-react';
import { usePlayerStore } from '@/lib/stores/player';
import { useUserData } from '@/lib/stores/user-data';
import { useUserFlows } from '@/lib/stores/user-flows';
import { springs } from '@/motion/tokens';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { ColoredTag } from '@/components/ColoredTag';
import { useState, useMemo } from 'react';
import { getBodyAreaColor, getFlowGradient } from '@/lib/body-area-colors';
import Fuse from 'fuse.js';
import type { PlayerStep } from '@/lib/types/player';
import type { Gesture } from '@/lib/types/gesture';
import { BrandHeader } from '@/components/BrandHeader';

const fuseInstance = new Fuse(allFlows, {
    keys: [
        { name: 'name', weight: 3 },
        { name: 'description', weight: 2 },
        { name: 'tags', weight: 1.5 },
    ],
    threshold: 0.4,
});

type Tab = 'curated' | 'mine';

export function FlowList() {
    const navigate = useNavigate();
    const { loadFlow, play } = usePlayerStore();
    const { isFlowFavorite } = useUserData();
    const { flows: userFlows } = useUserFlows();
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<Tab>('curated');

    const handlePlayFlow = (e: React.MouseEvent, flowId: string, isUserFlow: boolean) => {
        e.preventDefault();
        e.stopPropagation();

        const flow = isUserFlow
            ? userFlows.find(f => f.id === flowId)
            : allFlows.find(f => f.id === flowId);
        if (!flow) return;

        const steps: PlayerStep[] = [];
        for (const s of flow.steps) {
            const gesture = isUserFlow
                ? gestureMap.get(s.gestureId)
                : allGestures.find(g => g.id === s.gestureId);
            if (!gesture) continue;
            steps.push({ gesture, durationSec: s.durationSec });
        }

        if (steps.length > 0) {
            loadFlow(flow.name, steps);
            play();
            navigate('/play');
        }
    };

    const formatDuration = (steps: { durationSec: number }[]) => {
        const total = steps.reduce((sum, s) => sum + s.durationSec, 0);
        const m = Math.floor(total / 60);
        return `${m}m`;
    };

    const filteredCurated = useMemo(() => {
        if (!search.trim()) return allFlows;
        return fuseInstance.search(search).map((r) => r.item);
    }, [search]);

    const filteredUserFlows = useMemo(() => {
        if (!search.trim()) return userFlows;
        const q = search.toLowerCase();
        return userFlows.filter(
            (f) =>
                f.name.toLowerCase().includes(q) ||
                f.description.toLowerCase().includes(q)
        );
    }, [search, userFlows]);

    return (
        <div className="p-4 max-w-2xl mx-auto pb-20">
            <header className="mb-4 space-y-3">
                <div className="flex items-baseline gap-2">
                    <BrandHeader />
                    <span className="text-muted-foreground/40 text-sm">/</span>
                    <h1 className="text-lg font-semibold tracking-tight">Flows</h1>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search flows..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Tabs */}
                <div role="tablist" aria-label="Flow categories" className="flex gap-1 bg-secondary/50 rounded-lg p-1">
                    <button
                        role="tab"
                        aria-selected={tab === 'curated'}
                        onClick={() => setTab('curated')}
                        className={cn(
                            'flex-1 text-sm font-medium py-1.5 rounded-md transition-colors',
                            tab === 'curated'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        Curated
                    </button>
                    <button
                        role="tab"
                        aria-selected={tab === 'mine'}
                        onClick={() => setTab('mine')}
                        className={cn(
                            'flex-1 text-sm font-medium py-1.5 rounded-md transition-colors',
                            tab === 'mine'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        My Flows{userFlows.length > 0 && ` (${userFlows.length})`}
                    </button>
                </div>
            </header>

            {tab === 'curated' && (
                <div className="grid grid-cols-1 gap-3">
                    {filteredCurated.map((flow, i) => (
                        <Link key={flow.id} to={`/flows/${flow.id}`}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ ...springs.soft, delay: i * 0.05 }}
                                className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {(() => {
                                    const firstGesture = flow.steps[0] ? gestureMap.get(flow.steps[0].gestureId) as Gesture | undefined : undefined;
                                    const poster = flow.poster || firstGesture?.media.poster;
                                    const tintColor = firstGesture ? getBodyAreaColor(firstGesture.bodyAreas) : undefined;
                                    return (
                                        <div
                                            className="aspect-[2/1] relative overflow-hidden"
                                            style={{ backgroundColor: tintColor ?? 'var(--secondary)' }}
                                        >
                                            {poster ? (
                                                <img src={poster} alt={flow.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <PlaceholderImage type="flow" />
                                            )}
                                            {tintColor && (
                                                <div
                                                    className="absolute inset-0 mix-blend-color opacity-50 pointer-events-none"
                                                    style={{ backgroundColor: tintColor }}
                                                />
                                            )}
                                            <div className="absolute top-2 right-2 flex items-center gap-1.5">
                                                {isFlowFavorite(flow.id) && (
                                                    <div className="bg-black/50 backdrop-blur-sm rounded-full p-1">
                                                        <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                                                    </div>
                                                )}
                                                <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                                    {formatDuration(flow.steps)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-1">
                                        <h3 className="font-semibold leading-tight">
                                            {flow.name}
                                        </h3>
                                        <button
                                            onClick={(e) => handlePlayFlow(e, flow.id, false)}
                                            aria-label={`Play ${flow.name}`}
                                            className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0 ml-3"
                                        >
                                            <Play className="w-4 h-4 fill-current ml-0.5" />
                                        </button>
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                                        {flow.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Layers className="w-3.5 h-3.5" />
                                                {flow.steps.length} steps
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            {flow.tags.slice(0, 3).map(tag => (
                                                <ColoredTag key={tag} tag={tag} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            )}

            {tab === 'mine' && (
                <div className="grid grid-cols-1 gap-3">
                    {filteredUserFlows.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p className="text-sm mb-2">Your flows will live here</p>
                            <Link
                                to="/builder"
                                className="text-primary text-sm hover:underline"
                            >
                                Design your first in the Builder
                            </Link>
                        </div>
                    ) : (
                        filteredUserFlows.map((flow, i) => (
                            <Link key={flow.id} to={`/builder/${flow.id}`}>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ ...springs.soft, delay: i * 0.05 }}
                                    className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    {/* Generic Gradient Header */}
                                    <div
                                        className="h-24 relative overflow-hidden"
                                        style={{
                                            background: getFlowGradient(
                                                flow.steps.flatMap(s => gestureMap.get(s.gestureId)?.bodyAreas || [])
                                            )
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-black/10" />

                                        {/* Edit/Play Overlay */}
                                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                                            <div className="bg-black/40 text-white text-xs px-2 py-1 rounded-full backdrop-blur-md border border-white/10">
                                                {formatDuration(flow.steps)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-1">
                                            <h3 className="font-semibold leading-tight">
                                                {flow.name}
                                            </h3>
                                            <div className="flex items-center gap-2.5 flex-shrink-0 ml-3">
                                                <Link
                                                    to={`/builder/${flow.id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    aria-label={`Edit ${flow.name}`}
                                                    className="text-muted-foreground hover:text-foreground rounded-full w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                                {flow.steps.length > 0 && (
                                                    <button
                                                        onClick={(e) => handlePlayFlow(e, flow.id, true)}
                                                        aria-label={`Play ${flow.name}`}
                                                        className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center hover:scale-105 transition-transform"
                                                    >
                                                        <Play className="w-4 h-4 fill-current ml-0.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {flow.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                                                {flow.description}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Layers className="w-3.5 h-3.5" />
                                                {flow.steps.length} steps
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
