import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Reorder, motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useUserFlows } from '@/lib/stores/user-flows';
import { gestureMap, allGestures, allFlows } from '@/content/generated';
import { usePlayerStore } from '@/lib/stores/player';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
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
import { cn } from '@/lib/utils';
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

// All unique tags from content (gestures + flows), computed once
const ALL_CONTENT_TAGS = Array.from(
  new Set([
    ...allGestures.flatMap((g) => g.tags),
    ...allFlows.flatMap((f) => f.tags),
  ])
).sort();

export function FlowEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [pickerOpen, setPickerOpen] = useState(
    () => !!(location.state as Record<string, unknown> | null)?.restorePicker
  );
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

  // Infer equipment from gestures in the flow
  const inferredEquipment = useMemo(() => {
    const steps = flow?.steps ?? [];
    const equipMap = new Map<string, boolean>(); // name → optional
    for (const step of steps) {
      const gesture = gestureMap.get(step.gestureId);
      gesture?.equipment?.forEach((e) => {
        const existing = equipMap.get(e.name);
        if (existing === undefined) {
          equipMap.set(e.name, e.optional ?? false);
        } else if (!e.optional) {
          equipMap.set(e.name, false); // if any gesture requires it, it's required
        }
      });
    }
    return Array.from(equipMap.entries())
      .sort((a, b) => {
        if (a[1] !== b[1]) return a[1] ? 1 : -1; // required first
        return a[0].localeCompare(b[0]);
      })
      .map(([name, optional]) => ({ name, optional }));
  }, [flow?.steps]);

  // Infer body areas from gestures in the flow
  const bodyAreas = useMemo(() => {
    const steps = flow?.steps ?? [];
    const areas = new Set<string>();
    for (const step of steps) {
      const gesture = gestureMap.get(step.gestureId);
      gesture?.bodyAreas?.forEach((a) => areas.add(a));
    }
    return Array.from(areas).sort();
  }, [flow?.steps]);

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

  const handlePreviewGesture = (gesture: Gesture) => {
    setPickerOpen(false);
    navigate(`/gestures/${gesture.id}`, { state: { returnTo: `/builder/${id}` } });
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
        side: s.side && s.side !== 'none' ? s.side : undefined,
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

      {/* Description, Tags, Focus & Gear */}
      <div className="px-4 pt-3 pb-1 max-w-2xl mx-auto space-y-2">
        <Input
          value={flow.description}
          onChange={(e) => updateFlow(id, { description: e.target.value })}
          placeholder="Add a description..."
          className="h-8 text-xs"
        />

        {/* Tags */}
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
          <TagCombobox
            selectedTags={flow.tags}
            onAdd={(tag) => updateFlow(id, { tags: [...flow.tags, tag] })}
          />
        </div>

        {/* Focus & Gear row */}
        {(bodyAreas.length > 0 || inferredEquipment.length > 0) && (
          <div className="flex items-center gap-4 text-sm flex-wrap">
            {/* Focus — body area circles */}
            {bodyAreas.length > 0 && (
              <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-full">
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Focus</span>
                <div className="flex -space-x-1.5 hover:space-x-0.5 transition-all">
                  {bodyAreas.map((area) => (
                    <div
                      key={area}
                      className="w-5 h-5 rounded-full ring-2 ring-background relative group"
                      style={{ backgroundColor: getBodyAreaColor([area]) }}
                      title={area}
                    >
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 bg-popover text-popover-foreground text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm z-50 capitalize">
                        {area}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gear — read-only from gestures */}
            {inferredEquipment.length > 0 && (
              <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-full">
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Gear</span>
                <div className="flex gap-1.5">
                  {inferredEquipment.map((e) => (
                    <span
                      key={e.name}
                      className={cn(
                        "text-xs capitalize",
                        e.optional ? "text-muted-foreground" : "font-medium text-foreground"
                      )}
                    >
                      {e.name}{e.optional ? '*' : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
        onPreview={handlePreviewGesture}
        currentStepGestureIds={flow.steps.map(s => s.gestureId)}
      />
    </div>
  );
}

function TagCombobox({
  selectedTags,
  onAdd,
}: {
  selectedTags: string[];
  onAdd: (tag: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedSet = useMemo(() => new Set(selectedTags), [selectedTags]);

  const availableTags = useMemo(
    () => ALL_CONTENT_TAGS.filter((t) => !selectedSet.has(t)),
    [selectedSet]
  );

  const trimmed = search.trim().toLowerCase();
  const isNewTag = trimmed.length > 0
    && !ALL_CONTENT_TAGS.includes(trimmed)
    && !selectedSet.has(trimmed);

  const handleSelect = (tag: string) => {
    onAdd(tag);
    setSearch('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          + tag
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search tags..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {trimmed.length > 0
                ? 'No matching tags'
                : 'Type to search or create'}
            </CommandEmpty>
            <CommandGroup>
              {availableTags
                .filter((t) => !trimmed || t.includes(trimmed))
                .map((tag) => (
                  <CommandItem
                    key={tag}
                    value={tag}
                    onSelect={() => handleSelect(tag)}
                  >
                    <ColoredTag tag={tag} />
                  </CommandItem>
                ))}
              {isNewTag && (
                <CommandItem
                  value={`create-${trimmed}`}
                  onSelect={() => handleSelect(trimmed)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Create &ldquo;{trimmed}&rdquo;
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
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
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [grabbing, setGrabbing] = useState(false);

  useEffect(() => {
    return () => clearTimeout(longPressTimer.current);
  }, []);

  const handleGripPointerDown = (e: React.PointerEvent) => {
    const startY = e.clientY;
    const storedEvent = e;

    const cancel = () => {
      clearTimeout(longPressTimer.current);
      setGrabbing(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    const onMove = (moveE: PointerEvent) => {
      if (Math.abs(moveE.clientY - startY) > 5) cancel();
    };

    const onUp = () => cancel();

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    longPressTimer.current = setTimeout(() => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      setGrabbing(true);
      controls.start(storedEvent);
    }, 200);
  };

  return (
    <Reorder.Item
      value={item}
      layout="position"
      dragListener={false}
      dragControls={controls}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        "rounded-lg border bg-card shadow-sm will-change-transform",
        grabbing && "shadow-lg ring-2 ring-primary/20 z-10"
      )}
      onDragEnd={() => setGrabbing(false)}
    >
      <div className="flex items-center gap-2 p-3">
        <div
          className="flex-shrink-0 p-1.5 -m-1.5 cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={handleGripPointerDown}
        >
          <GripVertical
            className={cn(
              "w-4 h-4 transition-colors",
              grabbing ? "text-primary" : "text-muted-foreground"
            )}
            aria-hidden="true"
          />
        </div>

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
            <span
              className={cn(
                "text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full border",
                item.side === 'left'
                  ? "bg-blue-500/15 text-blue-500 border-blue-500/25"
                  : "bg-amber-500/15 text-amber-500 border-amber-500/25"
              )}
            >
              {item.side === 'left' ? 'L' : 'R'}
            </span>
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
