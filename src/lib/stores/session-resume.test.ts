import {
  saveSnapshot,
  getSnapshot,
  clearSnapshot,
  restoreFromSnapshot,
  startSnapshotLoop,
} from './session-resume';
import type { SessionSnapshot } from './session-resume';
import { usePlayerStore } from './player';
import { testGestures } from '@/test/fixtures';
import type { PlayerStep } from '@/lib/types/player';

vi.mock('@/content/generated', () => import('@/test/__mocks__/content-generated'));

const STORAGE_KEY = 'co-flow-session-resume';

function makeSteps(): PlayerStep[] {
  return testGestures.slice(0, 2).map((g) => ({
    gesture: g,
    durationSec: g.durationDefaults.defaultSec,
  }));
}

function resetStore() {
  usePlayerStore.setState({
    status: 'idle',
    currentStepIndex: 0,
    elapsedTime: 0,
    steps: [],
    glanceMode: false,
    wakeLockEnabled: true,
  });
}

beforeEach(() => {
  resetStore();
  localStorage.clear();
});

describe('saveSnapshot', () => {
  it('stores JSON in localStorage when playing', () => {
    const steps = makeSteps();
    usePlayerStore.setState({ status: 'playing', steps, currentStepIndex: 1, elapsedTime: 10 });
    saveSnapshot();
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const snap = JSON.parse(raw!);
    expect(snap.gestureIds).toEqual(['upper-back-circles', 'neck-glides']);
    expect(snap.stepIndex).toBe(1);
    expect(snap.stepElapsedSec).toBe(10);
  });

  it('stores JSON in localStorage when paused', () => {
    const steps = makeSteps();
    usePlayerStore.setState({ status: 'paused', steps, currentStepIndex: 0, elapsedTime: 5 });
    saveSnapshot();
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('does nothing when idle', () => {
    usePlayerStore.setState({ status: 'idle', steps: makeSteps() });
    saveSnapshot();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('does nothing when completed', () => {
    usePlayerStore.setState({ status: 'completed', steps: makeSteps() });
    saveSnapshot();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('does nothing with empty steps', () => {
    usePlayerStore.setState({ status: 'playing', steps: [] });
    saveSnapshot();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe('getSnapshot', () => {
  it('returns parsed snapshot', () => {
    const snap: SessionSnapshot = {
      flowName: 'Test',
      gestureIds: ['upper-back-circles', 'neck-glides'],
      durations: [60, 45],
      stepIndex: 0,
      stepElapsedSec: 5,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
    const result = getSnapshot();
    expect(result).toEqual(snap);
  });

  it('returns null when expired (> 24h)', () => {
    const snap: SessionSnapshot = {
      flowName: 'Test',
      gestureIds: ['upper-back-circles'],
      durations: [60],
      stepIndex: 0,
      stepElapsedSec: 0,
      lastUpdated: Date.now() - 25 * 60 * 60 * 1000,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
    expect(getSnapshot()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('returns null when gesture IDs are invalid', () => {
    const snap: SessionSnapshot = {
      flowName: 'Test',
      gestureIds: ['nonexistent-gesture'],
      durations: [60],
      stepIndex: 0,
      stepElapsedSec: 0,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
    expect(getSnapshot()).toBeNull();
  });

  it('returns null on missing data', () => {
    expect(getSnapshot()).toBeNull();
  });

  it('returns null on invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not json');
    expect(getSnapshot()).toBeNull();
  });
});

describe('clearSnapshot', () => {
  it('removes from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, '{}');
    clearSnapshot();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe('restoreFromSnapshot', () => {
  it('rebuilds PlayerStep[] and calls resumeSession', () => {
    const snap: SessionSnapshot = {
      flowName: 'Test',
      gestureIds: ['upper-back-circles', 'neck-glides'],
      durations: [60, 45],
      stepIndex: 1,
      stepElapsedSec: 20,
      lastUpdated: Date.now(),
    };
    const result = restoreFromSnapshot(snap);
    expect(result).toBe(true);
    const s = usePlayerStore.getState();
    expect(s.status).toBe('paused');
    expect(s.currentStepIndex).toBe(1);
    expect(s.elapsedTime).toBe(20);
    expect(s.steps).toHaveLength(2);
    expect(s.steps[0].gesture.id).toBe('upper-back-circles');
  });

  it('returns false if gesture is missing', () => {
    const snap: SessionSnapshot = {
      flowName: 'Test',
      gestureIds: ['nonexistent'],
      durations: [60],
      stepIndex: 0,
      stepElapsedSec: 0,
      lastUpdated: Date.now(),
    };
    const result = restoreFromSnapshot(snap);
    expect(result).toBe(false);
  });
});

describe('startSnapshotLoop', () => {
  it('returns a cleanup function', () => {
    vi.useFakeTimers();
    const cleanup = startSnapshotLoop();
    expect(typeof cleanup).toBe('function');
    cleanup();
    vi.useRealTimers();
  });
});
