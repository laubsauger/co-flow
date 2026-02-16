import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { allGestures } from '@/content/generated';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, Play, Timer, Heart, AlertTriangle } from 'lucide-react';
import { usePlayerStore } from '@/lib/stores/player';
import { useUserData } from '@/lib/stores/user-data';
import { SafetyCheckDialog } from '@/components/SafetyCheckDialog';

export function GestureDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { loadGesture, play } = usePlayerStore();
    const { toggleFavoriteGesture, isGestureFavorite } = useUserData();
    const [showSafetyCheck, setShowSafetyCheck] = useState(false);

    const gesture = allGestures.find(g => g.id === id);

    if (!gesture) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
                <h1 className="text-2xl font-bold">Gesture Not Found</h1>
                <Link to="/" className="text-primary hover:underline">Return to Library</Link>
            </div>
        );
    }

    const hasContraindications = gesture.contraindications && gesture.contraindications.length > 0;

    const startPlayback = () => {
        loadGesture(gesture.id);
        play();
        navigate('/play');
    };

    const handlePlay = () => {
        if (hasContraindications) {
            setShowSafetyCheck(true);
        } else {
            startPlayback();
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Detail Header / Hero */}
            <motion.div
                layoutId={`card-${gesture.id}`}
                className="w-full relative h-[40vh] sm:h-[50vh] overflow-hidden"
            >
                {gesture.media.poster ? (
                    <motion.img
                        layoutId={`image-${gesture.id}`}
                        src={gesture.media.poster}
                        alt={gesture.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">
                        No Image
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />

                <div className="absolute top-4 left-4 z-10">
                    <Link to="/" aria-label="Back to library">
                        <Button className="bg-background/50 hover:bg-background/80 text-foreground backdrop-blur-md rounded-full w-10 h-10 p-0 shadow-sm" variant="ghost">
                            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                        </Button>
                    </Link>
                </div>

                <div className="absolute bottom-6 left-4 right-4 text-left z-10">
                    <motion.h1
                        layoutId={`title-${gesture.id}`}
                        className="text-3xl font-bold tracking-tight text-foreground drop-shadow-sm mb-2"
                    >
                        {gesture.name}
                    </motion.h1>
                    <div className="flex gap-2 mb-2 flex-wrap">
                        {gesture.tags.map(tag => (
                            <span key={tag} className="text-xs backdrop-blur-md bg-background/30 px-2 py-1 rounded-full border border-white/10 text-foreground/80 font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-foreground/70">
                        <span className="flex items-center gap-1">
                            <Timer className="w-4 h-4" /> {gesture.durationDefaults.defaultSec}s
                        </span>
                        <span className="flex items-center gap-1">
                            ⚡ Intensity {gesture.intensity}/5
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Content */}
            <div className="p-6 max-w-2xl mx-auto space-y-8">
                {/* Contraindication Warning Banner */}
                {gesture.contraindications && gesture.contraindications.length > 0 && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                            <h3 className="font-medium text-sm text-destructive">
                                Contraindications
                            </h3>
                        </div>
                        <ul className="text-sm text-destructive/80 space-y-1">
                            {gesture.contraindications.map(c => (
                                <li key={c}>- {c}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Play Action */}
                <div className="flex gap-4">
                    <Button
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg h-12 text-base"
                        onClick={handlePlay}
                    >
                        <Play className="w-5 h-5 mr-2 fill-current" />
                        Try Gesture
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-12 h-12 px-0"
                        onClick={() => toggleFavoriteGesture(gesture.id)}
                        aria-label={isGestureFavorite(gesture.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <Heart
                            className={cn(
                                'w-6 h-6 transition-colors',
                                isGestureFavorite(gesture.id)
                                    ? 'text-red-500 fill-red-500'
                                    : 'text-muted-foreground hover:text-red-500'
                            )}
                        />
                    </Button>
                </div>

                {/* Description */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold tracking-tight">Instructions</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {gesture.description}
                    </p>

                    <div className="bg-secondary/30 rounded-lg p-4 mt-4">
                        <h3 className="font-medium mb-2 text-sm uppercase tracking-wide text-muted-foreground">Quick Guide</h3>
                        <p className="text-foreground">{gesture.summary}</p>
                    </div>
                </div>

                {/* Technical Details */}
                <div className="text-sm">
                    <h3 className="font-medium text-muted-foreground mb-1">Body Areas</h3>
                    <div className="flex flex-wrap gap-1">
                        {gesture.bodyAreas.map(area => (
                            <span key={area} className="capitalize">{area}</span>
                        ))}
                    </div>
                </div>
            </div>

            {hasContraindications && (
                <SafetyCheckDialog
                    open={showSafetyCheck}
                    onOpenChange={setShowSafetyCheck}
                    contraindications={gesture.contraindications!}
                    onConfirm={startPlayback}
                />
            )}
        </div>
    );
}
