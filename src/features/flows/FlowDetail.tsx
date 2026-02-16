import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { allFlows, gestureMap } from '@/content/generated';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Heart, Clock, Layers, AlertTriangle, GripVertical } from 'lucide-react';
import { ColoredTag } from '@/components/ColoredTag';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { usePlayerStore } from '@/lib/stores/player';
import { useUserData } from '@/lib/stores/user-data';
import { SafetyCheckDialog } from '@/components/SafetyCheckDialog';
import { getBodyAreaColor } from '@/lib/body-area-colors';
import { cn } from '@/lib/utils';
import { springs } from '@/motion/tokens';
import { useState, useMemo } from 'react';
import type { PlayerStep } from '@/lib/types/player';
import type { Gesture, EquipmentItem } from '@/lib/types/gesture';

type ResolvedStep = {
  gestureId: string;
  durationSec: number;
  side?: 'left' | 'right' | 'none';
  notes?: string;
  title?: string;
  gesture: Gesture | undefined;
};

type ReorderStep = ResolvedStep & { _key: string };

let flowDetailKeySeq = 0;

export function FlowDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadFlow, play } = usePlayerStore();
  const { toggleFavoriteFlow, isFlowFavorite } = useUserData();
  const [showSafetyCheck, setShowSafetyCheck] = useState(false);

  const flow = allFlows.find((f) => f.id === id);

  const { totalDuration, contraindications, equipment, resolvedSteps } =
    useMemo(() => {
      if (!flow)
        return {
          totalDuration: 0,
          contraindications: [] as string[],
          equipment: [] as EquipmentItem[],
          resolvedSteps: [] as ResolvedStep[],
        };

      let total = 0;
      const contras = new Set<string>();
      // Track equipment: if any gesture marks it as required, it's required
      const equipMap = new Map<string, boolean>(); // name → optional
      const steps: ResolvedStep[] = flow.steps.map((step) => {
        const gesture = gestureMap.get(step.gestureId);
        total += step.durationSec;
        if (gesture) {
          gesture.contraindications?.forEach((c) => contras.add(c));
          gesture.equipment?.forEach((e) => {
            const existing = equipMap.get(e.name);
            // If any gesture requires it (optional !== true), mark as required
            if (existing === undefined) {
              equipMap.set(e.name, e.optional ?? false);
            } else if (!e.optional) {
              equipMap.set(e.name, false);
            }
          });
        }
        return { ...step, gesture: gesture as Gesture | undefined };
      });

      const equipList: EquipmentItem[] = Array.from(equipMap.entries())
        .sort((a, b) => {
          // Required items first
          if (a[1] !== b[1]) return a[1] ? 1 : -1;
          return a[0].localeCompare(b[0]);
        })
        .map(([name, optional]) => ({ name, optional }));

      return {
        totalDuration: total,
        contraindications: Array.from(contras),
        equipment: equipList,
        resolvedSteps: steps,
      };
    }, [flow]);

  // Local reorderable state with stable keys
  const [localSteps, setLocalSteps] = useState<ReorderStep[]>(() =>
    resolvedSteps.map((s) => ({ ...s, _key: `fs${++flowDetailKeySeq}` }))
  );

  if (!flow) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <h1 className="text-2xl font-bold">Flow Not Found</h1>
        <Link to="/" className="text-primary hover:underline">
          Return to Flows
        </Link>
      </div>
    );
  }

  const startPlayback = () => {
    const playerSteps: PlayerStep[] = [];
    for (const s of localSteps) {
      if (!s.gesture) continue;
      playerSteps.push({ gesture: s.gesture as Gesture, durationSec: s.durationSec });
    }
    if (playerSteps.length > 0) {
      loadFlow(flow.name, playerSteps);
      play();
      navigate('/play');
    }
  };

  const handlePlay = () => {
    if (contraindications.length > 0) {
      setShowSafetyCheck(true);
    } else {
      startPlayback();
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  };

  const isCompiled = !!flow.compiledMedia;
  const isFavorite = isFlowFavorite(flow.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={springs.soft}
      className="min-h-screen bg-background pb-24"
    >
      {/* Hero Image */}
      {(() => {
        const firstGesture = resolvedSteps[0]?.gesture as Gesture | undefined;
        const poster = flow.poster || firstGesture?.media.poster;
        const tintColor = firstGesture ? getBodyAreaColor(firstGesture.bodyAreas) : undefined;
        return (
          <div
            className="w-full relative h-[30vh] sm:h-[40vh] overflow-hidden"
            style={{ backgroundColor: tintColor ?? 'var(--secondary)' }}
          >
            {poster ? (
              <img src={poster} alt={flow.name} className="w-full h-full object-cover" />
            ) : (
              <PlaceholderImage type="flow" />
            )}
            {tintColor && (
              <div
                className="absolute inset-0 mix-blend-color opacity-45 pointer-events-none"
                style={{ backgroundColor: tintColor }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
          </div>
        );
      })()}

      {/* Header */}
      <div className="px-4 pb-6 -mt-16 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/" aria-label="Back to flows">
              <Button
                variant="ghost"
                className="rounded-full w-10 h-10 p-0 bg-background/50 hover:bg-background/80 backdrop-blur-md"
              >
                <ArrowLeft className="w-5 h-5" aria-hidden="true" />
              </Button>
            </Link>
            <div className="flex-1" />
            <Button
              variant="ghost"
              className="rounded-full w-10 h-10 p-0"
              onClick={() => toggleFavoriteFlow(flow.id)}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={cn(
                  'w-5 h-5 transition-colors',
                  isFavorite
                    ? 'text-red-500 fill-red-500'
                    : 'text-muted-foreground'
                )}
              />
            </Button>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {flow.name}
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {flow.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {formatDuration(totalDuration)}
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              {flow.steps.length} steps
            </span>
            {isCompiled && (
              <Badge variant="secondary" className="text-xs">
                Compiled
              </Badge>
            )}
          </div>

          {/* Tags */}
          <div className="flex gap-1.5 flex-wrap">
            {flow.tags.map((tag) => (
              <ColoredTag key={tag} tag={tag} size="md" />
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Contraindications warning — shown before Start */}
        {contraindications.length > 0 && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h3 className="font-medium text-sm text-destructive">
                Contraindications
              </h3>
            </div>
            <ul className="text-sm text-destructive/80 space-y-1">
              {contraindications.map((c) => (
                <li key={c}>- {c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Play button */}
        <Button
          className="w-full h-12 text-base shadow-lg"
          onClick={handlePlay}
          disabled={flow.steps.length === 0 && !isCompiled}
        >
          <Play className="w-5 h-5 mr-2 fill-current" />
          Start Flow
        </Button>

        {/* Equipment */}
        {equipment.length > 0 && (
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">
              Equipment
            </h3>
            <div className="flex gap-1.5 flex-wrap">
              {equipment.map((e) => (
                <Badge
                  key={e.name}
                  variant={e.optional ? 'outline' : 'secondary'}
                  className="capitalize"
                >
                  {e.name}{e.optional ? ' (optional)' : ''}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Step sequence — reorderable */}
        {localSteps.length > 0 && (
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-1">
              Sequence
            </h3>
            <p className="text-xs text-muted-foreground/60 mb-3">
              Drag to reorder before playing
            </p>
            <Reorder.Group
              axis="y"
              values={localSteps}
              onReorder={setLocalSteps}
              className="space-y-2 rounded-xl bg-secondary/20 p-3"
            >
              {localSteps.map((step, i) => (
                <FlowDetailStep key={step._key} step={step} index={i} formatDuration={formatDuration} />
              ))}
            </Reorder.Group>
          </div>
        )}

        {/* Compiled flow info */}
        {isCompiled && flow.steps.length === 0 && (
          <div className="rounded-lg bg-secondary/30 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              This is a compiled audio session. Press play and relax.
            </p>
          </div>
        )}
      </div>

      {contraindications.length > 0 && (
        <SafetyCheckDialog
          open={showSafetyCheck}
          onOpenChange={setShowSafetyCheck}
          contraindications={contraindications}
          onConfirm={startPlayback}
        />
      )}
    </motion.div>
  );
}

function FlowDetailStep({
  step,
  index,
  formatDuration,
}: {
  step: ReorderStep;
  index: number;
  formatDuration: (sec: number) => string;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={step}
      dragListener={false}
      dragControls={controls}
      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
      className="flex items-center gap-3 rounded-lg bg-card/80 p-3"
    >
      <GripVertical
        className="w-4 h-4 text-muted-foreground flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
        aria-hidden="true"
        onPointerDown={(e) => controls.start(e)}
      />

      <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden bg-secondary relative">
        <img
          src={step.gesture?.media.poster || '/media/generic-gesture.png'}
          className="w-full h-full object-cover"
          alt=""
        />
        <div
          className="absolute inset-0 mix-blend-color opacity-30"
          style={{ backgroundColor: step.gesture ? getBodyAreaColor(step.gesture.bodyAreas) : 'var(--secondary)' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-5 h-5 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-white">
            {index + 1}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {step.title || step.gesture?.name || step.gestureId}
        </p>
        {step.notes && (
          <p className="text-xs text-muted-foreground truncate">
            {step.notes}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {step.side && step.side !== 'none' && (
          <Badge
            variant="outline"
            className="text-[10px] uppercase px-1.5"
          >
            {step.side === 'left' ? 'L' : 'R'}
          </Badge>
        )}
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatDuration(step.durationSec)}
        </span>
      </div>
    </Reorder.Item>
  );
}
