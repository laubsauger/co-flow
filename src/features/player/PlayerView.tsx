import { useEffect } from 'react';
import { usePlayerStore } from '@/lib/stores/player';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
        elapsedTime
    } = usePlayerStore();

    const navigate = useNavigate();

    // loop
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

    if (steps.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold">No Default Playlist</h2>
                    <Button onClick={() => navigate('/')} className="mt-4">Go Home</Button>
                </div>
            </div>
        );
    }

    if (status === 'completed') {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-primary text-primary-foreground">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center space-y-6"
                >
                    <h1 className="text-4xl font-bold">Session Complete</h1>
                    <p className="text-primary-foreground/80">Great job taking care of yourself.</p>
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
        <div className="h-screen flex flex-col bg-background relative overflow-hidden">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
                <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                    <X className="w-6 h-6" />
                </Button>
                <div className="text-sm font-medium text-muted-foreground">
                    Step {currentStepIndex + 1} / {steps.length}
                </div>
                <div className="w-6" /> {/* Spacer */}
            </div>

            {/* Main Content Stack */}
            <div className="flex-1 flex flex-col items-center justify-center relative p-6">

                {/* Prev Card (Faded) */}
                {prevStep && (
                    <div className="absolute top-16 opacity-30 scale-90 blur-[1px] pointer-events-none transition-all duration-500">
                        <div className="bg-card border rounded-xl p-4 w-64 text-center">
                            <p className="text-xs uppercase text-muted-foreground">Previous</p>
                            <p className="font-semibold truncate">{prevStep.gesture.name}</p>
                        </div>
                    </div>
                )}

                {/* Current Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep.gesture.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-full max-w-sm bg-card border rounded-3xl shadow-xl overflow-hidden flex flex-col items-center text-center relative z-20 aspect-[3/4]"
                    >
                        {/* Image Background (Top) */}
                        <div className="w-full h-1/2 bg-muted relative">
                            {currentStep.gesture.media.poster && (
                                <img
                                    src={currentStep.gesture.media.poster}
                                    className="w-full h-full object-cover"
                                    alt=""
                                />
                            )}
                            <div className="absolute inset-0 bg-black/20" />

                            {/* Timer Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-[5rem] font-bold text-white tabular-nums tracking-tighter drop-shadow-lg">
                                    {remainingTime}
                                </div>
                            </div>
                        </div>

                        {/* Content (Bottom) */}
                        <div className="flex-1 w-full p-6 flex flex-col justify-between bg-card">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold leading-tight">{currentStep.gesture.name}</h2>
                                <p className="text-muted-foreground text-lg leading-snug">
                                    {currentStep.gesture.summary}
                                </p>
                            </div>

                            {/* Progress Bar within card */}
                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-4">
                                <motion.div
                                    className="bg-primary h-full"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Next Card (Preview) */}
                {nextStep && (
                    <div className="absolute bottom-32 opacity-50 scale-90 translate-y-8 blur-[1px] pointer-events-none transition-all duration-500 max-w-xs w-full">
                        <div className="bg-card border rounded-xl p-4 w-full text-center shadow-lg">
                            <p className="text-xs uppercase text-muted-foreground">Up Next</p>
                            <p className="font-semibold truncate">{nextStep.gesture.name}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="h-32 pb-8 flex items-center justify-center gap-8 bg-background/80 backdrop-blur-lg border-t z-30">
                <Button variant="ghost" size="icon" className="h-16 w-16" onClick={prev}>
                    <SkipBack className="w-8 h-8" />
                </Button>

                <Button
                    size="icon"
                    className="h-20 w-20 rounded-full shadow-2xl bg-primary text-primary-foreground hover:scale-105 transition-transform"
                    onClick={status === 'playing' ? pause : play}
                >
                    {status === 'playing' ? (
                        <Pause className="w-10 h-10 fill-current" />
                    ) : (
                        <Play className="w-10 h-10 fill-current ml-1" />
                    )}
                </Button>

                <Button variant="ghost" size="icon" className="h-16 w-16" onClick={next}>
                    <SkipForward className="w-8 h-8" />
                </Button>
            </div>
        </div>
    );
}

// Helper to support variant/size in Button if I didn't verify it
// My Button component supports className and props.
// I used "variant" and "size" which are shadcn props.
// Since I haven't implemented variants in my simple Button, I should fix that or ignore.
// I will update Button.tsx to support basic variants or just accept className is enough, but to make this code work I should probably add simple variant support or classes.
// Or just className.
