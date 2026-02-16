import { create } from 'zustand';
import type { PlayerState, PlayerStep } from '@/lib/types/player';
import { allGestures } from '@/content/generated';

export const usePlayerStore = create<PlayerState>((set, get) => ({
    status: 'idle',
    currentStepIndex: 0,
    elapsedTime: 0,
    steps: [],
    glanceMode: false,
    wakeLockEnabled: true,

    loadFlow: (_flowName, steps) => {
        set({
            steps,
            currentStepIndex: 0,
            elapsedTime: 0,
            status: 'idle'
        });
    },

    resumeSession: (steps, stepIndex, elapsedTime) => {
        set({
            steps,
            currentStepIndex: stepIndex,
            elapsedTime,
            status: 'paused',
        });
    },

    loadGesture: (gestureId) => {
        const gesture = allGestures.find(g => g.id === gestureId);
        if (!gesture) {
            console.error(`Gesture ${gestureId} not found`);
            return;
        }
        const step: PlayerStep = {
            gesture,
            durationSec: gesture.durationDefaults.defaultSec,
        };
        set({
            steps: [step],
            currentStepIndex: 0,
            elapsedTime: 0,
            status: 'idle',
        });
    },

    play: () => set({ status: 'playing' }),
    pause: () => set({ status: 'paused' }),

    next: () => {
        const { steps, currentStepIndex } = get();
        if (currentStepIndex < steps.length - 1) {
            set({
                currentStepIndex: currentStepIndex + 1,
                elapsedTime: 0
            });
        } else {
            set({ status: 'completed' });
        }
    },

    prev: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex > 0) {
            set({
                currentStepIndex: currentStepIndex - 1,
                elapsedTime: 0
            });
        } else {
            set({ elapsedTime: 0 }); // restart first step
        }
    },

    tick: (dt) => {
        const { status, elapsedTime, currentStepIndex, steps, next } = get();
        if (status !== 'playing') return;

        const currentStep = steps[currentStepIndex];
        if (!currentStep) return;

        const newTime = elapsedTime + dt;
        if (newTime >= currentStep.durationSec) {
            // Auto advance? Or wait for cue?
            // For now, auto advance to keep it simple
            next();
        } else {
            set({ elapsedTime: newTime });
        }
    },

    reset: () => set({ status: 'idle', currentStepIndex: 0, elapsedTime: 0 }),
    toggleGlanceMode: () => set((s) => ({ glanceMode: !s.glanceMode })),
    toggleWakeLock: () => set((s) => ({ wakeLockEnabled: !s.wakeLockEnabled })),
}));
