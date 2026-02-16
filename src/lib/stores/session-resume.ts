import { usePlayerStore } from './player';
import { gestureMap } from '@/content/generated';
import type { PlayerStep } from '@/lib/types/player';
import type { Gesture } from '@/lib/types/gesture';

const STORAGE_KEY = 'co-flow-session-resume';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const SAVE_INTERVAL_MS = 3000;

export interface SessionSnapshot {
  flowName: string;
  gestureIds: string[];
  durations: number[];
  stepIndex: number;
  stepElapsedSec: number;
  lastUpdated: number;
}

export function saveSnapshot(): void {
  const { status, steps, currentStepIndex, elapsedTime } =
    usePlayerStore.getState();

  // Only save while actively playing or paused with steps loaded
  if ((status !== 'playing' && status !== 'paused') || steps.length === 0) {
    return;
  }

  const snapshot: SessionSnapshot = {
    flowName: steps[0]?.gesture.name ?? 'Session',
    gestureIds: steps.map((s) => s.gesture.id),
    durations: steps.map((s) => s.durationSec),
    stepIndex: currentStepIndex,
    stepElapsedSec: elapsedTime,
    lastUpdated: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function getSnapshot(): SessionSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const snapshot: SessionSnapshot = JSON.parse(raw);

    // Expired?
    if (Date.now() - snapshot.lastUpdated > MAX_AGE_MS) {
      clearSnapshot();
      return null;
    }

    // Validate gestureIds still exist
    const allExist = snapshot.gestureIds.every((id) => gestureMap.has(id));
    if (!allExist) {
      clearSnapshot();
      return null;
    }

    return snapshot;
  } catch {
    clearSnapshot();
    return null;
  }
}

export function clearSnapshot(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function restoreFromSnapshot(snapshot: SessionSnapshot): boolean {
  const steps: PlayerStep[] = [];
  for (let i = 0; i < snapshot.gestureIds.length; i++) {
    const gesture = gestureMap.get(snapshot.gestureIds[i]);
    if (!gesture) return false;
    steps.push({
      gesture: gesture as Gesture,
      durationSec: snapshot.durations[i],
    });
  }

  const store = usePlayerStore.getState();
  store.resumeSession(steps, snapshot.stepIndex, snapshot.stepElapsedSec);

  return true;
}

/** Start periodic snapshot saving. Returns cleanup function. */
export function startSnapshotLoop(): () => void {
  const interval = setInterval(saveSnapshot, SAVE_INTERVAL_MS);

  // Also clear snapshot when player reaches completed
  const unsub = usePlayerStore.subscribe((state) => {
    if (state.status === 'completed') {
      clearSnapshot();
    }
  });

  return () => {
    clearInterval(interval);
    unsub();
  };
}
