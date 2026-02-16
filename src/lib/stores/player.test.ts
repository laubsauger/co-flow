import { usePlayerStore } from './player';
import { testGestures } from '@/test/fixtures';
import type { PlayerStep } from '@/lib/types/player';

vi.mock('@/content/generated', () => import('@/test/__mocks__/content-generated'));

function makeSteps(count = 3): PlayerStep[] {
  return testGestures.slice(0, count).map((g) => ({
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

beforeEach(resetStore);

describe('usePlayerStore', () => {
  describe('initial state', () => {
    it('starts idle with empty steps', () => {
      const s = usePlayerStore.getState();
      expect(s.status).toBe('idle');
      expect(s.steps).toEqual([]);
      expect(s.currentStepIndex).toBe(0);
      expect(s.elapsedTime).toBe(0);
    });
  });

  describe('loadFlow', () => {
    it('sets steps and resets to idle', () => {
      const steps = makeSteps();
      usePlayerStore.getState().loadFlow('Test Flow', steps);
      const s = usePlayerStore.getState();
      expect(s.steps).toEqual(steps);
      expect(s.status).toBe('idle');
      expect(s.currentStepIndex).toBe(0);
      expect(s.elapsedTime).toBe(0);
    });
  });

  describe('loadGesture', () => {
    it('creates a single-step flow for a valid gesture ID', () => {
      usePlayerStore.getState().loadGesture('upper-back-circles');
      const s = usePlayerStore.getState();
      expect(s.steps).toHaveLength(1);
      expect(s.steps[0].gesture.id).toBe('upper-back-circles');
      expect(s.steps[0].durationSec).toBe(60);
      expect(s.status).toBe('idle');
    });

    it('logs error and does not change state for invalid ID', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const before = usePlayerStore.getState();
      usePlayerStore.getState().loadGesture('nonexistent');
      const after = usePlayerStore.getState();
      expect(spy).toHaveBeenCalledWith('Gesture nonexistent not found');
      expect(after.steps).toEqual(before.steps);
      spy.mockRestore();
    });
  });

  describe('play / pause', () => {
    it('toggles between playing and paused', () => {
      usePlayerStore.getState().play();
      expect(usePlayerStore.getState().status).toBe('playing');
      usePlayerStore.getState().pause();
      expect(usePlayerStore.getState().status).toBe('paused');
    });
  });

  describe('next', () => {
    it('advances step index and resets elapsed time', () => {
      usePlayerStore.getState().loadFlow('f', makeSteps());
      usePlayerStore.setState({ elapsedTime: 10 });
      usePlayerStore.getState().next();
      const s = usePlayerStore.getState();
      expect(s.currentStepIndex).toBe(1);
      expect(s.elapsedTime).toBe(0);
    });

    it('sets status to completed on last step', () => {
      usePlayerStore.getState().loadFlow('f', makeSteps(2));
      usePlayerStore.setState({ currentStepIndex: 1 });
      usePlayerStore.getState().next();
      expect(usePlayerStore.getState().status).toBe('completed');
    });
  });

  describe('prev', () => {
    it('goes back and resets elapsed time', () => {
      usePlayerStore.getState().loadFlow('f', makeSteps());
      usePlayerStore.setState({ currentStepIndex: 2, elapsedTime: 15 });
      usePlayerStore.getState().prev();
      const s = usePlayerStore.getState();
      expect(s.currentStepIndex).toBe(1);
      expect(s.elapsedTime).toBe(0);
    });

    it('resets elapsed to 0 on first step (restart)', () => {
      usePlayerStore.getState().loadFlow('f', makeSteps());
      usePlayerStore.setState({ elapsedTime: 20 });
      usePlayerStore.getState().prev();
      const s = usePlayerStore.getState();
      expect(s.currentStepIndex).toBe(0);
      expect(s.elapsedTime).toBe(0);
    });
  });

  describe('tick', () => {
    it('accumulates elapsed time when playing', () => {
      usePlayerStore.getState().loadFlow('f', makeSteps());
      usePlayerStore.getState().play();
      usePlayerStore.getState().tick(1);
      expect(usePlayerStore.getState().elapsedTime).toBe(1);
      usePlayerStore.getState().tick(0.5);
      expect(usePlayerStore.getState().elapsedTime).toBe(1.5);
    });

    it('auto-advances when elapsed >= duration', () => {
      usePlayerStore.getState().loadFlow('f', makeSteps());
      usePlayerStore.getState().play();
      // First step duration is 60s, tick past it
      usePlayerStore.getState().tick(60);
      expect(usePlayerStore.getState().currentStepIndex).toBe(1);
    });

    it('does nothing when not playing', () => {
      usePlayerStore.getState().loadFlow('f', makeSteps());
      usePlayerStore.getState().tick(5);
      expect(usePlayerStore.getState().elapsedTime).toBe(0);
    });
  });

  describe('resumeSession', () => {
    it('sets paused state at the correct position', () => {
      const steps = makeSteps();
      usePlayerStore.getState().resumeSession(steps, 1, 25);
      const s = usePlayerStore.getState();
      expect(s.status).toBe('paused');
      expect(s.steps).toEqual(steps);
      expect(s.currentStepIndex).toBe(1);
      expect(s.elapsedTime).toBe(25);
    });
  });

  describe('toggleGlanceMode / toggleWakeLock', () => {
    it('flips glanceMode', () => {
      expect(usePlayerStore.getState().glanceMode).toBe(false);
      usePlayerStore.getState().toggleGlanceMode();
      expect(usePlayerStore.getState().glanceMode).toBe(true);
      usePlayerStore.getState().toggleGlanceMode();
      expect(usePlayerStore.getState().glanceMode).toBe(false);
    });

    it('flips wakeLockEnabled', () => {
      expect(usePlayerStore.getState().wakeLockEnabled).toBe(true);
      usePlayerStore.getState().toggleWakeLock();
      expect(usePlayerStore.getState().wakeLockEnabled).toBe(false);
    });
  });

  describe('reset', () => {
    it('returns to idle', () => {
      usePlayerStore.getState().loadFlow('f', makeSteps());
      usePlayerStore.getState().play();
      usePlayerStore.setState({ currentStepIndex: 2, elapsedTime: 30 });
      usePlayerStore.getState().reset();
      const s = usePlayerStore.getState();
      expect(s.status).toBe('idle');
      expect(s.currentStepIndex).toBe(0);
      expect(s.elapsedTime).toBe(0);
    });
  });
});
