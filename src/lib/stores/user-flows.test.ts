import { useUserFlows, slugify, generateId, validateFlow } from './user-flows';
import type { Flow } from '@/lib/types/flow';

vi.mock('@/content/generated', () => import('@/test/__mocks__/content-generated'));

function resetStore() {
  useUserFlows.setState({ flows: [], schemaVersion: 1 });
}

beforeEach(resetStore);

describe('slugify', () => {
  it('converts spaces to dashes', () => {
    expect(slugify('my cool flow')).toBe('my-cool-flow');
  });

  it('removes special characters', () => {
    expect(slugify('hello!@#world')).toBe('helloworld');
  });

  it('strips leading and trailing dashes', () => {
    expect(slugify('--hello--')).toBe('hello');
  });

  it('collapses multiple dashes', () => {
    expect(slugify('a---b')).toBe('a-b');
  });

  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('');
  });

  it('lowercases text', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });
});

describe('generateId', () => {
  it('returns slug when no conflict', () => {
    expect(generateId('My Flow', [])).toBe('my-flow');
  });

  it('appends -2 on first conflict', () => {
    const existing = [{ id: 'my-flow' }] as Flow[];
    expect(generateId('My Flow', existing)).toBe('my-flow-2');
  });

  it('increments suffix on multiple conflicts', () => {
    const existing = [
      { id: 'my-flow' },
      { id: 'my-flow-2' },
    ] as Flow[];
    expect(generateId('My Flow', existing)).toBe('my-flow-3');
  });

  it('falls back to "flow" for empty name', () => {
    expect(generateId('', [])).toBe('flow');
  });

  it('falls back to "flow" for special-chars-only name', () => {
    expect(generateId('!!!', [])).toBe('flow');
  });
});

describe('validateFlow', () => {
  it('returns error for empty name', () => {
    const flow: Flow = { id: 'x', name: '  ', description: '', tags: [], steps: [{ gestureId: 'upper-back-circles', durationSec: 30 }] };
    expect(validateFlow(flow)).toContain('Flow name is required');
  });

  it('returns error for empty steps', () => {
    const flow: Flow = { id: 'x', name: 'Test', description: '', tags: [], steps: [] };
    expect(validateFlow(flow)).toContain('Flow must have at least one step');
  });

  it('returns error for invalid gestureId', () => {
    const flow: Flow = { id: 'x', name: 'Test', description: '', tags: [], steps: [{ gestureId: 'nonexistent', durationSec: 30 }] };
    const errors = validateFlow(flow);
    expect(errors.some((e) => e.includes('not found'))).toBe(true);
  });

  it('returns error for non-positive duration', () => {
    const flow: Flow = { id: 'x', name: 'Test', description: '', tags: [], steps: [{ gestureId: 'upper-back-circles', durationSec: -5 }] };
    const errors = validateFlow(flow);
    expect(errors.some((e) => e.includes('duration must be positive'))).toBe(true);
  });

  it('returns empty array for valid flow', () => {
    const flow: Flow = {
      id: 'x',
      name: 'Valid',
      description: '',
      tags: [],
      steps: [{ gestureId: 'upper-back-circles', durationSec: 30 }],
    };
    expect(validateFlow(flow)).toEqual([]);
  });
});

describe('useUserFlows store', () => {
  describe('createFlow', () => {
    it('generates unique ID and appends to flows', () => {
      const id = useUserFlows.getState().createFlow('My Flow');
      expect(id).toBe('my-flow');
      expect(useUserFlows.getState().flows).toHaveLength(1);
      expect(useUserFlows.getState().flows[0].name).toBe('My Flow');
    });

    it('suffixes ID for duplicate names', () => {
      useUserFlows.getState().createFlow('My Flow');
      const id2 = useUserFlows.getState().createFlow('My Flow');
      expect(id2).toBe('my-flow-2');
      expect(useUserFlows.getState().flows).toHaveLength(2);
    });
  });

  describe('deleteFlow', () => {
    it('removes flow by ID', () => {
      useUserFlows.getState().createFlow('To Delete');
      expect(useUserFlows.getState().flows).toHaveLength(1);
      useUserFlows.getState().deleteFlow('to-delete');
      expect(useUserFlows.getState().flows).toHaveLength(0);
    });
  });

  describe('updateFlow', () => {
    it('merges partial updates', () => {
      useUserFlows.getState().createFlow('Original');
      useUserFlows.getState().updateFlow('original', { name: 'Updated' });
      expect(useUserFlows.getState().flows[0].name).toBe('Updated');
    });
  });

  describe('addStep', () => {
    it('appends step to the correct flow', () => {
      useUserFlows.getState().createFlow('Flow A');
      useUserFlows.getState().addStep('flow-a', { gestureId: 'upper-back-circles', durationSec: 30 });
      const flow = useUserFlows.getState().getFlow('flow-a');
      expect(flow?.steps).toHaveLength(1);
      expect(flow?.steps[0].gestureId).toBe('upper-back-circles');
    });
  });

  describe('removeStep', () => {
    it('removes step by index', () => {
      useUserFlows.getState().createFlow('Flow A');
      useUserFlows.getState().addStep('flow-a', { gestureId: 'upper-back-circles', durationSec: 30 });
      useUserFlows.getState().addStep('flow-a', { gestureId: 'neck-glides', durationSec: 45 });
      useUserFlows.getState().removeStep('flow-a', 0);
      const flow = useUserFlows.getState().getFlow('flow-a');
      expect(flow?.steps).toHaveLength(1);
      expect(flow?.steps[0].gestureId).toBe('neck-glides');
    });
  });

  describe('updateStep', () => {
    it('merges updates into the correct step', () => {
      useUserFlows.getState().createFlow('Flow A');
      useUserFlows.getState().addStep('flow-a', { gestureId: 'upper-back-circles', durationSec: 30 });
      useUserFlows.getState().updateStep('flow-a', 0, { durationSec: 90 });
      const flow = useUserFlows.getState().getFlow('flow-a');
      expect(flow?.steps[0].durationSec).toBe(90);
    });
  });

  describe('reorderSteps', () => {
    beforeEach(() => {
      useUserFlows.getState().createFlow('Flow A');
      useUserFlows.getState().addStep('flow-a', { gestureId: 'upper-back-circles', durationSec: 30 });
      useUserFlows.getState().addStep('flow-a', { gestureId: 'neck-glides', durationSec: 45 });
      useUserFlows.getState().addStep('flow-a', { gestureId: 'hand-massage', durationSec: 60 });
    });

    it('moves forward (0 → 2)', () => {
      useUserFlows.getState().reorderSteps('flow-a', 0, 2);
      const ids = useUserFlows.getState().getFlow('flow-a')!.steps.map((s) => s.gestureId);
      expect(ids).toEqual(['neck-glides', 'hand-massage', 'upper-back-circles']);
    });

    it('moves backward (2 → 0)', () => {
      useUserFlows.getState().reorderSteps('flow-a', 2, 0);
      const ids = useUserFlows.getState().getFlow('flow-a')!.steps.map((s) => s.gestureId);
      expect(ids).toEqual(['hand-massage', 'upper-back-circles', 'neck-glides']);
    });
  });

  describe('duplicateStep', () => {
    it('inserts copy at index+1', () => {
      useUserFlows.getState().createFlow('Flow A');
      useUserFlows.getState().addStep('flow-a', { gestureId: 'upper-back-circles', durationSec: 30 });
      useUserFlows.getState().addStep('flow-a', { gestureId: 'neck-glides', durationSec: 45 });
      useUserFlows.getState().duplicateStep('flow-a', 0);
      const flow = useUserFlows.getState().getFlow('flow-a')!;
      expect(flow.steps).toHaveLength(3);
      expect(flow.steps[0].gestureId).toBe('upper-back-circles');
      expect(flow.steps[1].gestureId).toBe('upper-back-circles');
      expect(flow.steps[2].gestureId).toBe('neck-glides');
    });
  });

  describe('non-existent flowId', () => {
    it('operations are no-ops', () => {
      useUserFlows.getState().createFlow('Real');
      const before = useUserFlows.getState().flows;
      useUserFlows.getState().addStep('fake', { gestureId: 'x', durationSec: 1 });
      useUserFlows.getState().removeStep('fake', 0);
      useUserFlows.getState().updateStep('fake', 0, { durationSec: 99 });
      useUserFlows.getState().reorderSteps('fake', 0, 1);
      useUserFlows.getState().duplicateStep('fake', 0);
      // Real flow unchanged
      expect(useUserFlows.getState().flows[0]).toEqual(before[0]);
    });
  });
});
