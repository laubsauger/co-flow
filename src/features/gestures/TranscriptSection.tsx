import { useState, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { parseVtt, type VttCue } from '@/lib/utils/parse-vtt';
import { cn } from '@/lib/utils';

// Module-level transcript cache
const transcriptCache = new Map<string, VttCue[]>();
const transcriptListeners = new Set<() => void>();

function fetchTranscript(key: string, gestureId: string, file: string) {
  if (transcriptCache.has(key)) return;
  transcriptCache.set(key, []); // mark as loading

  const url = `/src/content/gestures/${gestureId}/${file}`;
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error('Failed to load transcript');
      return r.text();
    })
    .then((raw) => {
      transcriptCache.set(key, parseVtt(raw));
      transcriptListeners.forEach((l) => l());
    })
    .catch(() => {});
}

function subscribeTranscript(cb: () => void) {
  transcriptListeners.add(cb);
  return () => { transcriptListeners.delete(cb); };
}

interface TranscriptSectionProps {
  gestureId: string;
  transcriptFile: string;
}

function formatTimestamp(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function TranscriptSection({
  gestureId,
  transcriptFile,
}: TranscriptSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const key = `${gestureId}:${transcriptFile}`;

  // Only trigger fetch when expanded
  if (expanded) {
    fetchTranscript(key, gestureId, transcriptFile);
  }

  const cues = useSyncExternalStore(subscribeTranscript, () => transcriptCache.get(key) ?? []);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <h3 className="font-medium text-sm">Transcript</h3>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted-foreground transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t"
        >
          {cues.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No transcript available.
            </div>
          ) : (
            <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
              {cues.map((cue, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-muted-foreground tabular-nums flex-shrink-0 w-10 text-right">
                    {formatTimestamp(cue.startSec)}
                  </span>
                  <p className="text-foreground">{cue.text}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
