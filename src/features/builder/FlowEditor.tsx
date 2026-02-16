import { useParams, useNavigate, Link } from 'react-router-dom';
import { Reorder, motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useUserFlows } from '@/lib/stores/user-flows';
import { gestureMap } from '@/content/generated';
import { usePlayerStore } from '@/lib/stores/player';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  Play,
  Trash2,
  Copy,
  GripVertical,
  Check,
} from 'lucide-react';
import { springs } from '@/motion/tokens';
import { GesturePicker } from './GesturePicker';
import type { FlowStep } from '@/lib/types/flow';
import type { PlayerStep } from '@/lib/types/player';
import type { Gesture } from '@/lib/types/gesture';

export function FlowEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getFlow,
    updateFlow,
    addStep,
    removeStep,
    updateStep,
    duplicateStep,
  } = useUserFlows();
  const { loadFlow, play } = usePlayerStore();

  const flow = getFlow(id ?? '');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(flow?.name ?? '');

  // Auto-save indicator
  const [showSaved, setShowSaved] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevStepsRef = useRef(flow?.steps);

  // Keep a local copy of steps for Reorder (it needs a value prop)
  const [localSteps, setLocalSteps] = useState<FlowStep[]>(
    flow?.steps ?? []
  );

  // Sync local steps when store step count changes (additions/removals)
  useEffect(() => {
    if (!id) return;
    const unsub = useUserFlows.subscribe((state) => {
      const current = state.flows.find((f) => f.id === id);
      if (current) setLocalSteps(current.steps);
    });
    return unsub;
  }, [id]);

  // Show "Saved" briefly when flow data changes via store subscription
  useEffect(() => {
    if (!id) return;
    const unsub = useUserFlows.subscribe((state) => {
      const current = state.flows.find((f) => f.id === id);
      if (!current) return;
      if (prevStepsRef.current === current.steps) return;
      prevStepsRef.current = current.steps;

      setShowSaved(true);
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setShowSaved(false), 1500);
    });
    return () => {
      unsub();
      clearTimeout(saveTimerRef.current);
    };
  }, [id]);

  if (!flow || !id) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <h1 className="text-2xl font-bold">Flow Not Found</h1>
        <Link to="/builder" className="text-primary hover:underline">
          Back to Builder
        </Link>
      </div>
    );
  }

  const handleNameSave = () => {
    if (nameValue.trim()) {
      updateFlow(id, { name: nameValue.trim() });
    }
    setEditingName(false);
  };

  const handleAddGesture = (gesture: Gesture) => {
    const step: FlowStep = {
      gestureId: gesture.id,
      durationSec: gesture.durationDefaults.defaultSec,
    };
    addStep(id, step);
  };

  const handleReorder = (newOrder: FlowStep[]) => {
    setLocalSteps(newOrder);
    // Find the permutation and apply to store
    // Since Reorder gives us the new array, we overwrite steps
    // We need to update the store with the new order
    const store = useUserFlows.getState();
    const flowIdx = store.flows.findIndex((f) => f.id === id);
    if (flowIdx >= 0) {
      useUserFlows.setState({
        flows: store.flows.map((f) =>
          f.id === id ? { ...f, steps: newOrder } : f
        ),
      });
    }
  };

  const handlePreview = () => {
    const playerSteps: PlayerStep[] = [];
    for (const s of flow.steps) {
      const gesture = gestureMap.get(s.gestureId);
      if (!gesture) continue;
      playerSteps.push({
        gesture: gesture as Gesture,
        durationSec: s.durationSec,
      });
    }
    if (playerSteps.length > 0) {
      loadFlow(flow.name, playerSteps);
      play();
      navigate('/play');
    }
  };

  const totalDuration = flow.steps.reduce((s, step) => s + step.durationSec, 0);
  const totalMin = Math.floor(totalDuration / 60);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-lg border-b z-20 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link to="/builder">
            <Button variant="ghost" className="rounded-full w-9 h-9 p-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>

          <div className="flex-1 min-w-0">
            {editingName ? (
              <Input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                autoFocus
                className="h-8 text-sm font-semibold"
              />
            ) : (
              <button
                onClick={() => {
                  setNameValue(flow.name);
                  setEditingName(true);
                }}
                className="font-semibold truncate text-sm hover:text-primary transition-colors text-left"
              >
                {flow.name}
              </button>
            )}
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              {flow.steps.length} steps &middot; {totalMin}m
              {showSaved && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-green-500 flex items-center gap-0.5"
                >
                  <Check className="w-3 h-3" /> Saved
                </motion.span>
              )}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            disabled={flow.steps.length === 0}
          >
            <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
            Preview
          </Button>
        </div>
      </div>

      {/* Steps */}
      <div className="p-4 max-w-2xl mx-auto">
        {flow.steps.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-muted-foreground">No steps yet</p>
            <Button onClick={() => setPickerOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add your first gesture
            </Button>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={localSteps}
            onReorder={handleReorder}
            className="space-y-2"
          >
            {localSteps.map((step, i) => (
              <StepItem
                key={`${step.gestureId}-${i}`}
                step={step}
                index={i}
                onRemove={() => removeStep(id, i)}
                onDuplicate={() => duplicateStep(id, i)}
                onUpdate={(updates) => updateStep(id, i, updates)}
              />
            ))}
          </Reorder.Group>
        )}

        {/* Add step button */}
        {flow.steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4"
          >
            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={() => setPickerOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add gesture
            </Button>
          </motion.div>
        )}
      </div>

      <GesturePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddGesture}
      />
    </div>
  );
}

function StepItem({
  step,
  index,
  onRemove,
  onDuplicate,
  onUpdate,
}: {
  step: FlowStep;
  index: number;
  onRemove: () => void;
  onDuplicate: () => void;
  onUpdate: (updates: Partial<FlowStep>) => void;
}) {
  const gesture = gestureMap.get(step.gestureId);
  const [expanded, setExpanded] = useState(false);

  return (
    <Reorder.Item
      value={step}
      transition={springs.snappy}
      className="rounded-lg border bg-card shadow-sm"
    >
      <div className="flex items-center gap-2 p-3">
        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 cursor-grab active:cursor-grabbing" aria-hidden="true" />

        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground flex-shrink-0">
          {index + 1}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 min-w-0 text-left"
        >
          <p className="font-medium text-sm truncate">
            {step.title || gesture?.name || step.gestureId}
          </p>
        </button>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {step.side && step.side !== 'none' && (
            <Badge variant="outline" className="text-[10px] uppercase px-1.5">
              {step.side === 'left' ? 'L' : 'R'}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground tabular-nums">
            {step.durationSec}s
          </span>
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={springs.soft}
          className="border-t px-3 py-3 space-y-3"
        >
          {/* Duration */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground w-16">Duration</label>
            <input
              type="range"
              min={gesture?.durationDefaults.minSec ?? 10}
              max={gesture?.durationDefaults.maxSec ?? 300}
              value={step.durationSec}
              onChange={(e) =>
                onUpdate({ durationSec: parseInt(e.target.value, 10) })
              }
              className="flex-1"
            />
            <span className="text-xs tabular-nums w-10 text-right">
              {step.durationSec}s
            </span>
          </div>

          {/* Side */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground w-16">Side</label>
            <div className="flex gap-1">
              {(['none', 'left', 'right'] as const).map((side) => (
                <Button
                  key={side}
                  variant={step.side === side || (!step.side && side === 'none') ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs px-3"
                  onClick={() => onUpdate({ side })}
                >
                  {side === 'none' ? 'Both' : side === 'left' ? 'Left' : 'Right'}
                </Button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="flex items-start gap-3">
            <label className="text-xs text-muted-foreground w-16 pt-2">Notes</label>
            <Input
              value={step.notes ?? ''}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Optional notes..."
              className="flex-1 h-8 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={onDuplicate}
            >
              <Copy className="w-3 h-3 mr-1" />
              Duplicate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive hover:text-destructive"
              onClick={onRemove}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Remove
            </Button>
          </div>
        </motion.div>
      )}
    </Reorder.Item>
  );
}
