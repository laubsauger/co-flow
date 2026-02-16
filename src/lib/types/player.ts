import type { Gesture } from './gesture';

// Define the step runtime state (e.g. from a Flow or ad-hoc gesture)
export interface PlayerStep {
    gesture: Gesture;
    durationSec: number;
    side?: 'left' | 'right';
    notes?: string;
}

export type PlayerStatus = 'idle' | 'playing' | 'paused' | 'completed';

export interface PlayerState {
    status: PlayerStatus;
    currentStepIndex: number;
    elapsedTime: number; // in current step
    steps: PlayerStep[];

    // UI preferences
    glanceMode: boolean;
    wakeLockEnabled: boolean;

    // Actions
    loadFlow: (flowName: string, steps: PlayerStep[]) => void;
    loadGesture: (gestureId: string) => void;
    resumeSession: (steps: PlayerStep[], stepIndex: number, elapsedTime: number) => void;
    play: () => void;
    pause: () => void;
    next: () => void;
    prev: () => void;
    tick: (dt: number) => void; // call from loop
    reset: () => void;
    toggleGlanceMode: () => void;
    toggleWakeLock: () => void;
}
