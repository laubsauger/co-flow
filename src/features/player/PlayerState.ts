import { create } from 'zustand';
import type { Gesture } from '@/lib/types/content';
import { allGestures } from '@/content/generated';

// Define the step runtime state (e.g. from a Flow or ad-hoc gesture)
export interface PlayerStep {
    gesture: Gesture;
    durationSec: number;
    // side?: 'left' | 'right';
    // notes?: string;
    // overrides?
}

export type PlayerStatus = 'idle' | 'playing' | 'paused' | 'completed';

interface PlayerState {
    status: PlayerStatus;
    currentStepIndex: number;
    elapsedTime: number; // in current step
    steps: PlayerStep[];

    // Actions
    loadFlow: (flowName: string, steps: PlayerStep[]) => void;
    loadGesture: (gestureId: string) => void;
    play: () => void;
    pause: () => void;
    next: () => void;
    prev: () => void;
    tick: (dt: number) => void; // call from loop
    reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
    status: 'idle',
    currentStepIndex: 0,
    elapsedTime: 0,
    steps: [],

    loadFlow: (_flowName, steps) => {
        set({
            steps,
            currentStepIndex: 0,
            elapsedTime: 0,
            status: 'idle'
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
}));
