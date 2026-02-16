import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { allFlows, gestureMap } from '@/content/generated';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Heart, Clock, Layers, AlertTriangle, GripVertical, ChevronLeft, ChevronRight, Droplets, RectangleHorizontal, Share2 } from 'lucide-react';
import { ColoredTag } from '@/components/ColoredTag';
import { DetailHero } from '@/components/DetailHero';
import { usePlayerStore } from '@/lib/stores/player';
import { useUserData } from '@/lib/stores/user-data';
import { SafetyCheckDialog } from '@/components/SafetyCheckDialog';
import { getBodyAreaColor } from '@/lib/body-area-colors';
import { cn } from '@/lib/utils';
import { springs } from '@/motion/tokens';
import { useSwipeNavigation } from '@/lib/hooks/use-swipe-navigation';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useScrollTop } from '@/lib/hooks/use-scroll-restore';
import type { PlayerStep } from '@/lib/types/player';
import type { Gesture, EquipmentItem } from '@/lib/types/gesture';
import { shareOrCopy } from '@/lib/share';
import { toast } from 'sonner';

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
  useScrollTop();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadFlow, play } = usePlayerStore();
  const { toggleFavoriteFlow, isFlowFavorite } = useUserData();
  const [showSafetyCheck, setShowSafetyCheck] = useState(false);

  const flow = allFlows.find((f) => f.id === id);
  const currentIndex = allFlows.findIndex((f) => f.id === id);
  const prevFlow = currentIndex > 0 ? allFlows[currentIndex - 1] : undefined;
  const nextFlow = currentIndex < allFlows.length - 1 ? allFlows[currentIndex + 1] : undefined;
  const { ref: swipeRef } = useSwipeNavigation({
    prevUrl: prevFlow ? `/flows/${prevFlow.id}` : undefined,
    nextUrl: nextFlow ? `/flows/${nextFlow.id}` : undefined,
  });

  const { totalDuration, contraindications, equipment, bodyAreas, resolvedSteps } =
    useMemo(() => {
      if (!flow)
        return {
          totalDuration: 0,
          contraindications: [] as string[],
          equipment: [] as EquipmentItem[],
          bodyAreas: [] as string[],
          resolvedSteps: [] as ResolvedStep[],
        };

      let total = 0;
      const contras = new Set<string>();
      const areas = new Set<string>();
      // Track equipment: if any gesture marks it as required, it's required
      const equipMap = new Map<string, boolean>(); // name → optional
      const steps: ResolvedStep[] = flow.steps.map((step) => {
        const gesture = gestureMap.get(step.gestureId);
        total += step.durationSec;
        if (gesture) {
          gesture.contraindications?.forEach((c) => contras.add(c));
          gesture.bodyAreas?.forEach((a) => areas.add(a));
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
        bodyAreas: Array.from(areas),
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
      playerSteps.push({
        gesture: s.gesture as Gesture,
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
      ref={swipeRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={springs.snappy}
      className="min-h-screen bg-background pb-40 relative"
    >
      {/* Hero */}
      {(() => {
        const firstGesture = resolvedSteps[0]?.gesture as Gesture | undefined;
        const poster = flow.poster || firstGesture?.media.poster;
        const heroBodyAreas = firstGesture?.bodyAreas ?? [];
        return (
          <DetailHero
            poster={poster}
            alt={flow.name}
            bodyAreas={heroBodyAreas}
            backTo="/"
            backLabel="Back to flows"
            placeholderType="flow"
            actions={
              <Button
                variant="ghost"
                className="bg-background/50 hover:bg-background/80 text-foreground backdrop-blur-md rounded-full w-10 h-10 p-0 shadow-sm"
                aria-label="Share flow"
                onClick={async () => {
                  const result = await shareOrCopy({
                    title: flow.name,
                    text: flow.description,
                    url: window.location.href,
                  });
                  if (result === 'copied') {
                    toast('Link copied to clipboard');
                  }
                }}
              >
                <Share2 className="w-5 h-5" />
              </Button>
            }
          >
            <h1 className="text-3xl font-bold tracking-tight text-foreground drop-shadow-sm mb-2">
              {flow.name}
            </h1>
            {flow.description && (
              <p className="text-foreground/70 leading-relaxed mb-3 line-clamp-2 text-sm">
                {flow.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm font-medium text-foreground/70">
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
          </DetailHero>
        );
      })()}

      {/* Prev / Next navigation */}
      {(prevFlow || nextFlow) && (
        <div className="flex justify-between items-center px-4 pt-3 max-w-2xl mx-auto">
          {prevFlow ? (
            <Link to={`/flows/${prevFlow.id}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors min-w-0">
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs truncate max-w-[120px]">{prevFlow.name}</span>
            </Link>
          ) : <div />}
          {nextFlow ? (
            <Link to={`/flows/${nextFlow.id}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors min-w-0">
              <span className="text-xs truncate max-w-[120px]">{nextFlow.name}</span>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </Link>
          ) : <div />}
        </div>
      )}

      {/* Meta Content Row */}
      <div className="px-4 pt-4 max-w-2xl mx-auto space-y-4">
        {/* Tags */}
        {flow.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {flow.tags.map((tag) => (
              <ColoredTag key={tag} tag={tag} size="md" />
            ))}
          </div>
        )}

        {/* Body Areas & Equipment Row */}
        <div className="flex items-center gap-4 text-sm flex-wrap">
          {/* Body Areas - Circles */}
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

          {/* Equipment */}
          {equipment.length > 0 && (
            <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-full">
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Gear</span>
              <div className="flex gap-1.5 items-center">
                {equipment.map((e) => (
                  <div key={e.name} className="flex items-center gap-1">
                    {e.name === 'massage oil' ? (
                      <Droplets className="w-3 h-3 text-muted-foreground" />
                    ) : e.name === 'mat' ? (
                      <RectangleHorizontal className="w-3 h-3 text-muted-foreground" />
                    ) : null}
                    <span
                      className={cn(
                        "text-xs capitalize",
                        e.optional ? "text-muted-foreground" : "font-medium text-foreground"
                      )}
                    >
                      {e.name}{e.optional ? '*' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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

        {/* Play + Share + Favorite */}
        <div className="flex gap-4">
          <Button
            className="flex-1 h-12 text-base shadow-lg"
            onClick={handlePlay}
            disabled={flow.steps.length === 0 && !isCompiled}
          >
            <Play className="w-5 h-5 mr-2 fill-current" />
            Start Flow
          </Button>
          <Button
            variant="secondary"
            className="w-12 h-12 px-0"
            onClick={async () => {
              const result = await shareOrCopy({
                title: flow.name,
                text: flow.description,
                url: window.location.href,
              });
              if (result === 'copied') {
                toast('Link copied to clipboard');
              }
            }}
            aria-label="Share flow"
          >
            <Share2 className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Button
            variant="secondary"
            className="w-12 h-12 px-0"
            onClick={() => toggleFavoriteFlow(flow.id)}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={cn(
                'w-6 h-6 transition-colors',
                isFavorite
                  ? 'text-red-500 fill-red-500'
                  : 'text-muted-foreground hover:text-red-500'
              )}
            />
          </Button>
        </div>



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
              className="space-y-2 rounded-xl bg-secondary/20 p-3 overscroll-contain"
            >
              {localSteps.map((step, i) => (
                <FlowDetailStep key={step._key} step={step} index={i} formatDuration={formatDuration} flowId={flow.id} />
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
  flowId,
}: {
  step: ReorderStep;
  index: number;
  formatDuration: (sec: number) => string;
  flowId: string;
}) {
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
      value={step}
      layout="position"
      dragListener={false}
      dragControls={controls}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        "flex items-center gap-3 rounded-lg bg-card/80 p-3 will-change-transform",
        grabbing && "shadow-lg ring-2 ring-primary/20 z-10"
      )}
      onDragEnd={() => setGrabbing(false)}
    >
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

      <Link
        to={`/gestures/${step.gestureId}`}
        state={{ returnTo: `/flows/${flowId}` }}
        className="flex items-center gap-3 flex-1 min-w-0"
        onClick={(e) => { if (grabbing) e.preventDefault(); }}
      >
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
      </Link>
      <div className="flex items-center gap-2 flex-shrink-0">
        {step.side && step.side !== 'none' && (
          <span
            className={cn(
              "text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full border",
              step.side === 'left'
                ? "bg-blue-500/15 text-blue-500 border-blue-500/25"
                : "bg-amber-500/15 text-amber-500 border-amber-500/25"
            )}
          >
            {step.side === 'left' ? 'L' : 'R'}
          </span>
        )}
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatDuration(step.durationSec)}
        </span>
      </div>
    </Reorder.Item>
  );
}
