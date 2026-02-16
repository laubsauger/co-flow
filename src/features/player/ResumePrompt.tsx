import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, X } from 'lucide-react';
import { springs } from '@/motion/tokens';
import {
  getSnapshot,
  clearSnapshot,
  restoreFromSnapshot,
  type SessionSnapshot,
} from '@/lib/stores/session-resume';

function formatElapsed(ms: number): string {
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

function loadInitialState(): { snapshot: SessionSnapshot; timeLabel: string } | null {
  const saved = getSnapshot();
  if (!saved) return null;
  return {
    snapshot: saved,
    timeLabel: formatElapsed(Date.now() - saved.lastUpdated),
  };
}

export function ResumePrompt() {
  const [state, setState] = useState(loadInitialState);
  const navigate = useNavigate();

  const handleResume = () => {
    if (!state) return;
    const success = restoreFromSnapshot(state.snapshot);
    if (success) {
      navigate('/play');
    }
    setState(null);
  };

  const handleDiscard = () => {
    clearSnapshot();
    setState(null);
  };

  return (
    <AnimatePresence>
      {state && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={springs.snappy}
          className="fixed bottom-20 left-4 right-4 z-40 max-w-lg mx-auto"
        >
          <div className="rounded-xl border bg-card shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Resume session?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Step {state.snapshot.stepIndex + 1} of {state.snapshot.gestureIds.length}
                  {' · '}
                  {state.timeLabel}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 flex-shrink-0"
                onClick={handleDiscard}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="flex-1" onClick={handleResume}>
                <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                Resume
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={handleDiscard}
              >
                Discard
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
