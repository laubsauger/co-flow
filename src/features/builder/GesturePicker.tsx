import { useState, useMemo, useEffect } from 'react';
import { allGestures } from '@/content/generated';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Search, Plus, Clock, Zap, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { springs } from '@/motion/tokens';
import { cn } from '@/lib/utils';
import { ColoredTag } from '@/components/ColoredTag';
import { getBodyAreaColor } from '@/lib/body-area-colors';
import Fuse from 'fuse.js';
import type { Gesture } from '@/lib/types/gesture';

const PICKER_STATE_KEY = 'gesture-picker-state';

interface GesturePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (gesture: Gesture) => void;
  onPreview?: (gesture: Gesture) => void;
  currentStepGestureIds: string[];
}

export function GesturePicker({ open, onClose, onSelect, onPreview, currentStepGestureIds }: GesturePickerProps) {
  const [search, setSearch] = useState(() => {
    try {
      const saved = sessionStorage.getItem(PICKER_STATE_KEY);
      return saved ? (JSON.parse(saved).search ?? '') : '';
    } catch { return ''; }
  });
  const [selectedBodyArea, setSelectedBodyArea] = useState<string | null>(() => {
    try {
      const saved = sessionStorage.getItem(PICKER_STATE_KEY);
      return saved ? (JSON.parse(saved).selectedBodyArea ?? null) : null;
    } catch { return null; }
  });

  const bodyAreas = useMemo(() => {
    const areas = new Set<string>();
    allGestures.forEach(g => g.bodyAreas.forEach((a: string) => areas.add(a)));
    return Array.from(areas).sort();
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(allGestures, {
        keys: [
          { name: 'name', weight: 3 },
          { name: 'summary', weight: 2 },
          { name: 'tags', weight: 1.5 },
          { name: 'bodyAreas', weight: 1 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    []
  );

  const usageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const gid of currentStepGestureIds) {
      counts.set(gid, (counts.get(gid) ?? 0) + 1);
    }
    return counts;
  }, [currentStepGestureIds]);

  const filtered = useMemo(() => {
    let results: Gesture[] = search.trim()
      ? fuse.search(search).map((r) => r.item)
      : [...allGestures];

    if (selectedBodyArea) {
      results = results.filter((g) => g.bodyAreas.includes(selectedBodyArea));
    }

    // Sort: unused gestures first, already-in-flow gestures last
    results.sort((a, b) => {
      const aUsed = usageCounts.has(a.id) ? 1 : 0;
      const bUsed = usageCounts.has(b.id) ? 1 : 0;
      return aUsed - bUsed;
    });

    return results;
  }, [search, selectedBodyArea, fuse, usageCounts]);

  // Persist search/filter state to sessionStorage for restore after preview
  useEffect(() => {
    if (search || selectedBodyArea) {
      sessionStorage.setItem(PICKER_STATE_KEY, JSON.stringify({ search, selectedBodyArea }));
    } else {
      sessionStorage.removeItem(PICKER_STATE_KEY);
    }
  }, [search, selectedBodyArea]);

  const handleSelect = (gesture: Gesture) => {
    onSelect(gesture);
    onClose();
    setSearch('');
    setSelectedBodyArea(null);
    sessionStorage.removeItem(PICKER_STATE_KEY);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] flex flex-col">
        <SheetHeader>
          <SheetTitle>Add Gesture</SheetTitle>
          <SheetDescription>Search and pick a gesture to add to your flow.</SheetDescription>
        </SheetHeader>

        <div className="relative px-4">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search gestures..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Body area filter chips */}
        <div
          role="group"
          aria-label="Filter by body area"
          className="flex gap-1.5 overflow-x-auto px-4 scrollbar-hide"
        >
          <button
            onClick={() => setSelectedBodyArea(null)}
            aria-pressed={selectedBodyArea === null}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
              selectedBodyArea === null
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            All
          </button>
          {bodyAreas.map(area => {
            const color = getBodyAreaColor([area]);
            const isActive = selectedBodyArea === area;
            return (
              <button
                key={area}
                onClick={() => setSelectedBodyArea(area)}
                aria-pressed={isActive}
                className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap capitalize"
                style={isActive
                  ? { backgroundColor: color, color: 'white' }
                  : { backgroundColor: `color-mix(in oklch, ${color} 12%, transparent)`, color }
                }
              >
                {area}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5">
          {filtered.map((gesture, i) => {
            const count = usageCounts.get(gesture.id);
            return (
              <motion.button
                key={gesture.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.soft, delay: i * 0.02 }}
                onClick={() => handleSelect(gesture)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg border bg-card p-3 text-left hover:bg-accent transition-colors",
                  count && "opacity-60"
                )}
              >
                <div className="w-16 h-12 rounded-md overflow-hidden bg-secondary relative flex-shrink-0">
                  <img
                    src={gesture.media.poster || '/media/generic-gesture.png'}
                    className="w-full h-full object-cover"
                    alt=""
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0 mix-blend-color opacity-40"
                    style={{ backgroundColor: getBodyAreaColor(gesture.bodyAreas) }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{gesture.name}</p>
                    {count && (
                      <span className="text-[10px] font-medium bg-secondary text-muted-foreground rounded px-1.5 py-0.5 flex-shrink-0">
                        ×{count}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-[11px] truncate capitalize mt-0.5"
                    style={{ color: getBodyAreaColor(gesture.bodyAreas) }}
                  >
                    {gesture.bodyAreas.join(', ')}
                  </p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {gesture.tags.slice(0, 3).map(tag => (
                      <ColoredTag key={tag} tag={tag} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Zap className="w-3 h-3" />
                    {gesture.intensity}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {gesture.durationDefaults.defaultSec}s
                  </span>
                  {onPreview && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreview(gesture);
                      }}
                      aria-label={`Preview ${gesture.name}`}
                      className="p-1 rounded-md hover:bg-secondary transition-colors"
                    >
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                  <Plus className="w-4 h-4 text-primary" />
                </div>
              </motion.button>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No gestures found
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
