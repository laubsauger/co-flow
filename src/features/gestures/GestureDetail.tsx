import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { allGestures } from '@/content/generated';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Play, Timer, Heart, AlertTriangle, Droplets, RectangleHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { getBodyAreaColor } from '@/lib/body-area-colors';
import { usePlayerStore } from '@/lib/stores/player';
import { useUserData } from '@/lib/stores/user-data';
import { SafetyCheckDialog } from '@/components/SafetyCheckDialog';
import { ColoredTag } from '@/components/ColoredTag';
import { DetailHero } from '@/components/DetailHero';
import { useSwipeNavigation } from '@/lib/hooks/use-swipe-navigation';
import { TranscriptSection } from './TranscriptSection';
import { useScrollTop } from '@/lib/hooks/use-scroll-restore';

export function GestureDetail() {
    useScrollTop();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { loadGesture, play } = usePlayerStore();
    const { toggleFavoriteGesture, isGestureFavorite } = useUserData();
    const [showSafetyCheck, setShowSafetyCheck] = useState(false);

    const gesture = allGestures.find(g => g.id === id);
    const currentIndex = allGestures.findIndex(g => g.id === id);
    const prevGesture = currentIndex > 0 ? allGestures[currentIndex - 1] : undefined;
    const nextGesture = currentIndex < allGestures.length - 1 ? allGestures[currentIndex + 1] : undefined;
    const { ref: swipeRef, hasPrev, hasNext } = useSwipeNavigation({
        prevUrl: prevGesture ? `/gestures/${prevGesture.id}` : undefined,
        nextUrl: nextGesture ? `/gestures/${nextGesture.id}` : undefined,
    });

    if (!gesture) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
                <h1 className="text-2xl font-bold">Gesture Not Found</h1>
                <Link to="/gestures" className="text-primary hover:underline">Return to Library</Link>
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
        <div ref={swipeRef} className="min-h-screen bg-background pb-20 relative">
            {/* Detail Header / Hero */}
            <DetailHero
                poster={gesture.media.poster}
                alt={gesture.name}
                bodyAreas={gesture.bodyAreas}
                backTo="/gestures"
                backLabel="Back to library"
            >
                <h1 className="text-3xl font-bold tracking-tight text-foreground drop-shadow-sm mb-2">
                    {gesture.name}
                </h1>
                <div className="flex gap-2 mb-2 flex-wrap">
                    {gesture.tags.map(tag => (
                        <ColoredTag key={tag} tag={tag} size="md" className="backdrop-blur-md" />
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
            </DetailHero>

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
                    <h3 className="font-medium text-muted-foreground mb-2">Body Areas</h3>
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                        {gesture.bodyAreas.map(area => (
                            <span
                                key={area}
                                className="capitalize text-xs font-medium px-2.5 py-1 rounded-full text-white whitespace-nowrap"
                                style={{ backgroundColor: getBodyAreaColor([area]) }}
                            >
                                {area}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Equipment */}
                {gesture.equipment && gesture.equipment.length > 0 && (
                    <div className="text-sm">
                        <h3 className="font-medium text-muted-foreground mb-2">Equipment</h3>
                        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                            {gesture.equipment.map(e => (
                                <span
                                    key={e.name}
                                    className={cn(
                                        "capitalize text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 whitespace-nowrap",
                                        e.optional
                                            ? "bg-secondary text-secondary-foreground"
                                            : "bg-foreground/10 text-foreground"
                                    )}
                                >
                                    {e.name === 'massage oil' ? (
                                        <Droplets className="w-3 h-3" />
                                    ) : e.name === 'mat' ? (
                                        <RectangleHorizontal className="w-3 h-3" />
                                    ) : null}
                                    {e.name}{e.optional ? ' (optional)' : ''}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Transcript */}
                {gesture.media.transcript && (
                    <TranscriptSection
                        gestureId={gesture.id}
                        transcriptFile={gesture.media.transcript}
                    />
                )}
            </div>

            {/* Swipe edge indicators */}
            {hasPrev && prevGesture && (
                <div className="fixed left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground/30 pointer-events-none z-20">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-xs max-w-[60px] truncate hidden sm:inline">{prevGesture.name}</span>
                </div>
            )}
            {hasNext && nextGesture && (
                <div className="fixed right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground/30 pointer-events-none z-20">
                    <span className="text-xs max-w-[60px] truncate hidden sm:inline">{nextGesture.name}</span>
                    <ChevronRight className="w-4 h-4" />
                </div>
            )}

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
