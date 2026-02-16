import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { parseVtt, type VttCue } from '@/lib/utils/parse-vtt';
import { cn } from '@/lib/utils';

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
  const [cues, setCues] = useState<VttCue[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!expanded || cues.length > 0) return;

    setLoading(true);
    const url = `/src/content/gestures/${gestureId}/${transcriptFile}`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load transcript');
        return r.text();
      })
      .then((raw) => setCues(parseVtt(raw)))
      .catch(() => setCues([]))
      .finally(() => setLoading(false));
  }, [expanded, gestureId, transcriptFile, cues.length]);

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
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">
              Loading transcript...
            </div>
          ) : cues.length === 0 ? (
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
