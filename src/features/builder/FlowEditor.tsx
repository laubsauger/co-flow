import { useParams, useNavigate, Link } from 'react-router-dom';
import { Reorder, motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useUserFlows } from '@/lib/stores/user-flows';
import { gestureMap } from '@/content/generated';
import { usePlayerStore } from '@/lib/stores/player';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  ArrowLeft,
  Plus,
  Play,
  Trash2,
  Copy,
  GripVertical,
  Check,
  X,
} from 'lucide-react';
import { ColoredTag } from '@/components/ColoredTag';
import { getBodyAreaColor } from '@/lib/body-area-colors';
import { GesturePicker } from './GesturePicker';
import type { FlowStep } from '@/lib/types/flow';
import type { PlayerStep } from '@/lib/types/player';
import type { Gesture } from '@/lib/types/gesture';

// Stable drag keys — monotonic counter ensures uniqueness across re-keys
let dragKeySeq = 0;
type KeyedStep = FlowStep & { _key: string };
function keySteps(steps: FlowStep[]): KeyedStep[] {
  return steps.map((s) => ({ ...s, _key: `s${++dragKeySeq}` }));
}

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

  // Local keyed steps for Reorder — stable keys prevent unmount/remount on swap
  const [items, setItems] = useState<KeyedStep[]>(() =>
    keySteps(flow?.steps ?? [])
  );

  // Guard: skip next subscription update after our own reorder
  const reorderingRef = useRef(false);

  // Single merged subscription: sync local items + show saved indicator
  useEffect(() => {
    if (!id) return;
    const unsub = useUserFlows.subscribe((state) => {
      const current = state.flows.find((f) => f.id === id);
      if (!current) return;

      // Skip when we just did a reorder — our own setState is sufficient
      if (reorderingRef.current) {
        reorderingRef.current = false;
        return;
      }

      // Sync drag items
      setItems((prev) => {
        if (current.steps.length !== prev.length) {
          // Structural change (add/remove) — re-key everything
          return keySteps(current.steps);
        }
        // Same length — preserve keys, update step data
        return prev.map((item, i) => ({ ...current.steps[i], _key: item._key }));
      });

      // Show saved indicator
      if (prevStepsRef.current !== current.steps) {
        prevStepsRef.current = current.steps;
        setShowSaved(true);
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => setShowSaved(false), 1500);
      }
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

  const handleReorder = (newOrder: KeyedStep[]) => {
    reorderingRef.current = true;
    setItems(newOrder);
    // Strip _key before persisting to store
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const stripped: FlowStep[] = newOrder.map(({ _key, ...step }) => step);
    useUserFlows.setState((state) => ({
      flows: state.flows.map((f) =>
        f.id === id ? { ...f, steps: stripped } : f
      ),
    }));
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

      {/* Description & Tags */}
      <div className="px-4 pt-3 pb-1 max-w-2xl mx-auto space-y-2">
        <Input
          value={flow.description}
          onChange={(e) => updateFlow(id, { description: e.target.value })}
          placeholder="Add a description..."
          className="h-8 text-xs"
        />
        <div className="flex flex-wrap items-center gap-1.5">
          {flow.tags.map(tag => (
            <button
              key={tag}
              onClick={() => updateFlow(id, { tags: flow.tags.filter(t => t !== tag) })}
              className="group flex items-center gap-0.5"
            >
              <ColoredTag tag={tag} />
              <X className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
          <TagInput
            existingTags={flow.tags}
            onAdd={(tag) => updateFlow(id, { tags: [...flow.tags, tag] })}
          />
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
            values={items}
            onReorder={handleReorder}
            className="space-y-2"
          >
            {items.map((item, i) => (
              <StepItem
                key={item._key}
                item={item}
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
        currentStepGestureIds={flow.steps.map(s => s.gestureId)}
      />
    </div>
  );
}

function StepItem({
  item,
  index,
  onRemove,
  onDuplicate,
  onUpdate,
}: {
  item: KeyedStep;
  index: number;
  onRemove: () => void;
  onDuplicate: () => void;
  onUpdate: (updates: Partial<FlowStep>) => void;
}) {
  const gesture = gestureMap.get(item.gestureId);
  const [expanded, setExpanded] = useState(false);
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
      className="rounded-lg border bg-card shadow-sm"
    >
      <div className="flex items-center gap-2 p-3">
        <GripVertical
          className="w-4 h-4 text-muted-foreground flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
          aria-hidden="true"
          onPointerDown={(e) => controls.start(e)}
        />

        <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden bg-secondary relative">
          <img
            src={gesture?.media.poster || '/media/generic-gesture.png'}
            className="w-full h-full object-cover"
            alt=""
          />
          <div
            className="absolute inset-0 mix-blend-color opacity-30"
            style={{ backgroundColor: gesture ? getBodyAreaColor(gesture.bodyAreas) : 'var(--secondary)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-5 h-5 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-white">
              {index + 1}
            </span>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 min-w-0 text-left"
        >
          <p className="font-medium text-sm truncate">
            {item.title || gesture?.name || item.gestureId}
          </p>
          {gesture && (
            <p
              className="text-[11px] truncate capitalize"
              style={{ color: getBodyAreaColor(gesture.bodyAreas) }}
            >
              {gesture.bodyAreas.join(', ')}
            </p>
          )}
        </button>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {item.side && item.side !== 'none' && (
            <Badge variant="outline" className="text-[10px] uppercase px-1.5">
              {item.side === 'left' ? 'L' : 'R'}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground tabular-nums">
            {item.durationSec}s
          </span>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t px-3 py-3 space-y-3">
              {/* Duration */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground w-16">Duration</label>
                <Slider
                  min={gesture?.durationDefaults.minSec ?? 10}
                  max={gesture?.durationDefaults.maxSec ?? 300}
                  step={5}
                  value={[item.durationSec]}
                  onValueChange={([val]) =>
                    onUpdate({ durationSec: val })
                  }
                  className="flex-1"
                />
                <span className="text-xs tabular-nums w-10 text-right">
                  {item.durationSec}s
                </span>
              </div>

              {/* Side */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground w-16">Side</label>
                <div className="flex gap-1">
                  {(['none', 'left', 'right'] as const).map((side) => (
                    <Button
                      key={side}
                      variant={item.side === side || (!item.side && side === 'none') ? 'default' : 'outline'}
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
                  value={item.notes ?? ''}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}

function TagInput({ existingTags, onAdd }: { existingTags: string[]; onAdd: (tag: string) => void }) {
  const [value, setValue] = useState('');
  const [editing, setEditing] = useState(false);

  const handleSubmit = () => {
    const tag = value.trim().toLowerCase();
    if (tag && !existingTags.includes(tag)) {
      onAdd(tag);
    }
    setValue('');
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground hover:text-foreground transition-colors"
      >
        + tag
      </button>
    );
  }

  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleSubmit();
        if (e.key === 'Escape') { setValue(''); setEditing(false); }
      }}
      placeholder="tag name"
      className="w-20 px-1.5 py-0.5 rounded text-[10px] bg-secondary border border-input outline-none focus:ring-1 focus:ring-ring"
    />
  );
}
