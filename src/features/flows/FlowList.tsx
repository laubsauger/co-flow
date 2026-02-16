import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { allFlows, allGestures } from '@/content/generated';

import { Play } from 'lucide-react';
import { usePlayerStore } from '@/lib/stores/player';
import type { PlayerStep } from '@/lib/types/player';

export function FlowList() {
    const navigate = useNavigate();
    const { loadFlow, play } = usePlayerStore();

    const handlePlayFlow = (flowId: string) => {
        const flow = allFlows.find(f => f.id === flowId);
        if (!flow) {
            console.error(`Flow ${flowId} not found`);
            return;
        }

        const steps: PlayerStep[] = [];
        for (const s of flow.steps) {
            const gesture = allGestures.find(g => g.id === s.gestureId);
            if (!gesture) {
                console.warn(`Gesture ${s.gestureId} skipped in flow ${flowId}`);
                continue;
            }
            steps.push({
                gesture,
                durationSec: s.durationSec,
            });
        }

        if (steps.length > 0) {
            loadFlow(flow.name, steps);
            play();
            navigate('/play');
        }
    };

    return (
        <div className="p-4 max-w-2xl mx-auto pb-20">
            <header className="mb-6 space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Flows</h1>
                <p className="text-muted-foreground">Curated sessions for you.</p>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {allFlows.map(flow => (
                    <motion.div
                        key={flow.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden flex"
                    >
                        <div className="w-24 bg-secondary flex-shrink-0 flex items-center justify-center">
                            <span className="text-2xl">🌊</span>
                        </div>
                        <div className="p-4 flex-1">
                            <h3 className="font-semibold leading-none tracking-tight mb-1">
                                {flow.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {flow.description}
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex gap-1">
                                    {flow.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handlePlayFlow(flow.id)}
                                    className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center hover:scale-105 transition-transform"
                                >
                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
