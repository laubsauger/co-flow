import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/lib/stores/player';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, X, Eye, Smartphone, Captions } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { springs } from '@/motion/tokens';
import { cn } from '@/lib/utils';
import { PrevStepCard } from './PrevStepCard';
import { CurrentStepCard } from './CurrentStepCard';
import { NextStepCard } from './NextStepCard';
import { ProgressOverview } from './ProgressOverview';
import { MediaStatus } from './MediaStatus';
import { CaptionOverlay } from './CaptionOverlay';
import { useWakeLock } from './useWakeLock';
import { useAudioChainer } from './hooks/use-audio-chainer';
import { startSnapshotLoop } from '@/lib/stores/session-resume';

export function PlayerView() {
    const {
        status,
        currentStepIndex,
        steps,
        play,
        pause,
        next,
        prev,
        tick,
        elapsedTime,
        glanceMode,
        wakeLockEnabled,
        toggleGlanceMode,
        toggleWakeLock,
    } = usePlayerStore();

    const navigate = useNavigate();
    const { isActive: wakeLockActive } = useWakeLock(
        wakeLockEnabled && status === 'playing'
    );
    const [captionsEnabled, setCaptionsEnabled] = useState(false);

    // Audio chaining engine
    useAudioChainer();

    // Session persistence — save snapshot every 3s while playing
    useEffect(() => {
        const cleanup = startSnapshotLoop();
        return cleanup;
    }, []);

    // requestAnimationFrame timer loop
    useEffect(() => {
        let lastTime = performance.now();
        let frameId: number;

        const loop = (time: number) => {
            const dt = (time - lastTime) / 1000;
            lastTime = time;
            tick(dt);
            frameId = requestAnimationFrame(loop);
        };

        if (status === 'playing') {
            frameId = requestAnimationFrame(loop);
        } else {
            lastTime = performance.now();
        }

        return () => cancelAnimationFrame(frameId);
    }, [status, tick]);

    // Empty state
    if (steps.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold">Nothing queued up</h2>
                    <p className="text-sm text-muted-foreground mt-2">Head back and choose something to play.</p>
                    <Button onClick={() => navigate('/')} className="mt-4">Go Home</Button>
                </div>
            </div>
        );
    }

    // Completed state
    if (status === 'completed') {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-primary text-primary-foreground">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={springs.bouncy}
                    className="text-center space-y-6"
                >
                    <h1 className="text-4xl font-bold">Well done</h1>
                    <p className="text-primary-foreground/80">You showed up for yourself today.</p>
                    <Button variant="secondary" onClick={() => navigate('/')} className="w-full">
                        Done
                    </Button>
                </motion.div>
            </div>
        );
    }

    const currentStep = steps[currentStepIndex];
    const nextStep = steps[currentStepIndex + 1];
    const prevStep = steps[currentStepIndex - 1];
    const progress = Math.min(100, (elapsedTime / currentStep.durationSec) * 100);
    const remainingTime = Math.ceil(Math.max(0, currentStep.durationSec - elapsedTime));

    return (
        <div
            role="region"
            aria-label="Guided session player"
            className={cn(
                'h-screen flex flex-col bg-background relative overflow-hidden',
                glanceMode && 'glance-mode'
            )}
        >
            {/* Top Bar */}
            <div className="flex-shrink-0 px-4 pt-4 pb-2 flex justify-between items-center z-10">
                <Button variant="ghost" size="icon" onClick={() => navigate('/')} aria-label="Close player">
                    <X className="w-6 h-6" />
                </Button>

                <ProgressOverview
                    steps={steps}
                    currentStepIndex={currentStepIndex}
                    elapsedTime={elapsedTime}
                />

                {/* Toggle buttons */}
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn('h-8 w-8', glanceMode && 'bg-primary/10 text-primary')}
                        onClick={toggleGlanceMode}
                        aria-label={glanceMode ? 'Disable glance mode' : 'Enable glance mode'}
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn('h-8 w-8', wakeLockActive && 'bg-primary/10 text-primary')}
                        onClick={toggleWakeLock}
                        aria-label={wakeLockEnabled ? 'Allow screen sleep' : 'Keep screen awake'}
                    >
                        <Smartphone className="w-4 h-4" />
                    </Button>
                    {currentStep?.gesture.media.captions && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn('h-8 w-8', captionsEnabled && 'bg-primary/10 text-primary')}
                            onClick={() => setCaptionsEnabled((v) => !v)}
                            aria-label={captionsEnabled ? 'Hide captions' : 'Show captions'}
                        >
                            <Captions className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Card Stack */}
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-4 overflow-hidden">
                {/* Prev */}
                <AnimatePresence mode="popLayout">
                    {prevStep && (
                        <PrevStepCard key={`prev-${currentStepIndex - 1}`} step={prevStep} />
                    )}
                </AnimatePresence>

                {/* Current */}
                <AnimatePresence mode="wait">
                    <CurrentStepCard
                        key={`current-${currentStepIndex}`}
                        step={currentStep}
                        remainingTime={remainingTime}
                        progress={progress}
                        glanceMode={glanceMode}
                        playerStatus={status}
                    />
                </AnimatePresence>

                {/* Next */}
                <AnimatePresence mode="popLayout">
                    {nextStep && (
                        <NextStepCard key={`next-${currentStepIndex + 1}`} step={nextStep} />
                    )}
                </AnimatePresence>
            </div>

            {/* Captions overlay */}
            {captionsEnabled && (
                <CaptionOverlay
                    gestureId={currentStep.gesture.id}
                    captionsFile={currentStep.gesture.media.captions}
                    elapsedSec={elapsedTime}
                    glanceMode={glanceMode}
                />
            )}

            {/* Screen reader live region for step changes */}
            <div aria-live="polite" className="sr-only">
                Step {currentStepIndex + 1} of {steps.length}: {currentStep.gesture.name}.
                {remainingTime} seconds remaining.
            </div>

            {/* Media Status */}
            <div className="flex justify-center pb-2">
                <MediaStatus gesture={currentStep.gesture} />
            </div>

            {/* Controls */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={springs.soft}
                className={cn(
                    'flex-shrink-0 pb-6 flex items-center justify-center gap-8 bg-background/80 backdrop-blur-lg border-t z-30',
                    glanceMode ? 'h-36' : 'h-28'
                )}
            >
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(glanceMode ? 'h-18 w-18' : 'h-14 w-14')}
                    onClick={prev}
                    aria-label="Previous step"
                >
                    <SkipBack className={cn(glanceMode ? 'w-9 h-9' : 'w-7 h-7')} />
                </Button>

                <Button
                    size="icon"
                    className={cn(
                        'rounded-full shadow-2xl bg-primary text-primary-foreground hover:scale-105 transition-transform',
                        glanceMode ? 'h-24 w-24' : 'h-20 w-20'
                    )}
                    onClick={status === 'playing' ? pause : play}
                    aria-label={status === 'playing' ? 'Pause' : 'Play'}
                >
                    {status === 'playing' ? (
                        <Pause className={cn('fill-current', glanceMode ? 'w-12 h-12' : 'w-10 h-10')} />
                    ) : (
                        <Play className={cn('fill-current ml-1', glanceMode ? 'w-12 h-12' : 'w-10 h-10')} />
                    )}
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(glanceMode ? 'h-18 w-18' : 'h-14 w-14')}
                    onClick={next}
                    aria-label="Next step"
                >
                    <SkipForward className={cn(glanceMode ? 'w-9 h-9' : 'w-7 h-7')} />
                </Button>
            </motion.div>
        </div>
    );
}
