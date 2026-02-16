export interface VttCue {
  startSec: number;
  endSec: number;
  text: string;
}

/** Parse a timestamp like "00:01:23.456" or "01:23.456" to seconds */
function parseTimestamp(ts: string): number {
  const parts = ts.trim().split(':');
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s);
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return parseInt(m) * 60 + parseFloat(s);
  }
  return parseFloat(parts[0]);
}

/** Parse raw VTT text into an array of cues */
export function parseVtt(raw: string): VttCue[] {
  const cues: VttCue[] = [];
  // Split on double newlines to get blocks
  const blocks = raw.replace(/\r\n/g, '\n').split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    // Find the line with the timestamp arrow
    const timeLine = lines.find((l) => l.includes('-->'));
    if (!timeLine) continue;

    const [startStr, endStr] = timeLine.split('-->');
    const startSec = parseTimestamp(startStr);
    const endSec = parseTimestamp(endStr);

    // Everything after the timestamp line is the cue text
    const timeLineIdx = lines.indexOf(timeLine);
    const text = lines
      .slice(timeLineIdx + 1)
      .join('\n')
      .trim();

    if (text) {
      cues.push({ startSec, endSec, text });
    }
  }

  return cues;
}

/** Find the active cue for a given time */
export function getActiveCue(cues: VttCue[], timeSec: number): VttCue | null {
  return cues.find((c) => timeSec >= c.startSec && timeSec < c.endSec) ?? null;
}
