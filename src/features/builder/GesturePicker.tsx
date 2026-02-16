import { useState, useMemo } from 'react';
import { allGestures } from '@/content/generated';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Search, Plus, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { springs } from '@/motion/tokens';
import type { Gesture } from '@/lib/types/gesture';

interface GesturePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (gesture: Gesture) => void;
}

export function GesturePicker({ open, onClose, onSelect }: GesturePickerProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return allGestures;
    const q = search.toLowerCase();
    return allGestures.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q) ||
        g.tags.some((t) => t.includes(q)) ||
        g.bodyAreas.some((a) => a.includes(q))
    );
  }, [search]);

  const handleSelect = (gesture: Gesture) => {
    onSelect(gesture);
    onClose();
    setSearch('');
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

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5">
          {filtered.map((gesture, i) => (
            <motion.button
              key={gesture.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.soft, delay: i * 0.02 }}
              onClick={() => handleSelect(gesture)}
              className="w-full flex items-center gap-3 rounded-lg border bg-card p-3 text-left hover:bg-accent transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{gesture.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {gesture.bodyAreas.join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {gesture.durationDefaults.defaultSec}s
                </span>
                <Plus className="w-4 h-4 text-primary" />
              </div>
            </motion.button>
          ))}

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
