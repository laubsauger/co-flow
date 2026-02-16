import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { gestureMap } from '@/content/generated';
import type { Flow, FlowStep } from '@/lib/types/flow';

interface UserFlowsState {
  flows: Flow[];
  schemaVersion: number;

  // CRUD
  createFlow: (name: string, description?: string) => string;
  deleteFlow: (id: string) => void;
  updateFlow: (id: string, updates: Partial<Pick<Flow, 'name' | 'description' | 'tags'>>) => void;

  // Step operations
  addStep: (flowId: string, step: FlowStep) => void;
  removeStep: (flowId: string, stepIndex: number) => void;
  updateStep: (flowId: string, stepIndex: number, updates: Partial<FlowStep>) => void;
  reorderSteps: (flowId: string, fromIndex: number, toIndex: number) => void;
  duplicateStep: (flowId: string, stepIndex: number) => void;

  // Queries
  getFlow: (id: string) => Flow | undefined;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateId(name: string, existing: Flow[]): string {
  const base = slugify(name) || 'flow';
  const ids = new Set(existing.map((f) => f.id));
  if (!ids.has(base)) return base;

  let i = 2;
  while (ids.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

/** Validate that a flow is structurally sound */
export function validateFlow(flow: Flow): string[] {
  const errors: string[] = [];

  if (!flow.name.trim()) {
    errors.push('Flow name is required');
  }

  if (flow.steps.length === 0) {
    errors.push('Flow must have at least one step');
  }

  for (let i = 0; i < flow.steps.length; i++) {
    const step = flow.steps[i];
    if (!gestureMap.has(step.gestureId)) {
      errors.push(`Step ${i + 1}: gesture "${step.gestureId}" not found`);
    }
    if (step.durationSec <= 0) {
      errors.push(`Step ${i + 1}: duration must be positive`);
    }
  }

  return errors;
}

export const useUserFlows = create<UserFlowsState>()(
  persist(
    (set, get) => ({
      flows: [],
      schemaVersion: 1,

      createFlow: (name, description = '') => {
        const { flows } = get();
        const id = generateId(name, flows);
        const newFlow: Flow = {
          id,
          name: name.trim(),
          description: description.trim(),
          tags: [],
          steps: [],
        };
        set({ flows: [...flows, newFlow] });
        return id;
      },

      deleteFlow: (id) => {
        set({ flows: get().flows.filter((f) => f.id !== id) });
      },

      updateFlow: (id, updates) => {
        set({
          flows: get().flows.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        });
      },

      addStep: (flowId, step) => {
        set({
          flows: get().flows.map((f) =>
            f.id === flowId ? { ...f, steps: [...f.steps, step] } : f
          ),
        });
      },

      removeStep: (flowId, stepIndex) => {
        set({
          flows: get().flows.map((f) =>
            f.id === flowId
              ? { ...f, steps: f.steps.filter((_, i) => i !== stepIndex) }
              : f
          ),
        });
      },

      updateStep: (flowId, stepIndex, updates) => {
        set({
          flows: get().flows.map((f) =>
            f.id === flowId
              ? {
                  ...f,
                  steps: f.steps.map((s, i) =>
                    i === stepIndex ? { ...s, ...updates } : s
                  ),
                }
              : f
          ),
        });
      },

      reorderSteps: (flowId, fromIndex, toIndex) => {
        set({
          flows: get().flows.map((f) => {
            if (f.id !== flowId) return f;
            const steps = [...f.steps];
            const [moved] = steps.splice(fromIndex, 1);
            steps.splice(toIndex, 0, moved);
            return { ...f, steps };
          }),
        });
      },

      duplicateStep: (flowId, stepIndex) => {
        set({
          flows: get().flows.map((f) => {
            if (f.id !== flowId) return f;
            const steps = [...f.steps];
            const copy = { ...steps[stepIndex] };
            steps.splice(stepIndex + 1, 0, copy);
            return { ...f, steps };
          }),
        });
      },

      getFlow: (id) => get().flows.find((f) => f.id === id),
    }),
    {
      name: 'co-flow-user-flows',
      version: 1,
    }
  )
);
