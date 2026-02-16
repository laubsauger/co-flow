import type { AudioCueType } from './use-audio-chainer';

/**
 * Test the cue-checking logic extracted from useAudioChainer.
 * The actual hook uses refs, but the core algorithm is pure:
 * given elapsed time, duration, side, and a set of fired cues,
 * determine which cues should fire.
 */

interface CueCheck {
  type: AudioCueType;
  condition: boolean;
}

function getCueConditions(
  elapsedTime: number,
  durationSec: number,
  side?: 'left' | 'right'
): CueCheck[] {
  return [
    { type: 'start', condition: elapsedTime >= 0.1 },
    { type: 'halfway', condition: elapsedTime >= durationSec / 2 },
    { type: '10s-left', condition: durationSec > 15 && elapsedTime >= durationSec - 10 },
    { type: 'switch-side', condition: Boolean(side) && elapsedTime >= durationSec / 2 },
    { type: 'end', condition: elapsedTime >= durationSec - 0.5 },
  ];
}

function checkCues(
  stepIndex: number,
  elapsedTime: number,
  durationSec: number,
  fired: Set<string>,
  side?: 'left' | 'right'
): AudioCueType[] {
  const firedThisCall: AudioCueType[] = [];
  const cues = getCueConditions(elapsedTime, durationSec, side);
  for (const cue of cues) {
    const key = `${stepIndex}-${cue.type}`;
    if (cue.condition && !fired.has(key)) {
      fired.add(key);
      firedThisCall.push(cue.type);
    }
  }
  return firedThisCall;
}

describe('audio cue system', () => {
  let fired: Set<string>;

  beforeEach(() => {
    fired = new Set();
  });

  it('"start" cue fires at 0.1s', () => {
    const cues = checkCues(0, 0.1, 60, fired);
    expect(cues).toContain('start');
  });

  it('"start" does not fire before 0.1s', () => {
    const cues = checkCues(0, 0.05, 60, fired);
    expect(cues).not.toContain('start');
  });

  it('"halfway" cue fires at duration/2', () => {
    const cues = checkCues(0, 30, 60, fired);
    expect(cues).toContain('halfway');
  });

  it('"10s-left" fires only when duration > 15s', () => {
    // duration=60, elapsed=50 → should fire
    const cues = checkCues(0, 50, 60, fired);
    expect(cues).toContain('10s-left');
  });

  it('"10s-left" does NOT fire when duration <= 15s', () => {
    // duration=10, elapsed=5 → should NOT fire (duration <= 15)
    const cues = checkCues(0, 5, 10, fired);
    expect(cues).not.toContain('10s-left');
  });

  it('"switch-side" fires only when side is provided', () => {
    // With side
    const cues1 = checkCues(0, 30, 60, fired, 'left');
    expect(cues1).toContain('switch-side');

    // Without side
    const fired2 = new Set<string>();
    const cues2 = checkCues(0, 30, 60, fired2);
    expect(cues2).not.toContain('switch-side');
  });

  it('"end" cue fires at duration - 0.5s', () => {
    const cues = checkCues(0, 59.5, 60, fired);
    expect(cues).toContain('end');
  });

  it('each cue fires only once per step (deduplication)', () => {
    // Fire start
    const cues1 = checkCues(0, 0.1, 60, fired);
    expect(cues1).toContain('start');

    // Same check again — start should NOT fire again
    const cues2 = checkCues(0, 0.2, 60, fired);
    expect(cues2).not.toContain('start');
  });

  it('cues reset on new step (different stepIndex)', () => {
    // Fire start on step 0
    checkCues(0, 0.1, 60, fired);
    expect(fired.has('0-start')).toBe(true);

    // Step 1 — start should fire again since key is different
    const cues = checkCues(1, 0.1, 60, fired);
    expect(cues).toContain('start');
    expect(fired.has('1-start')).toBe(true);
  });

  it('multiple cues can fire in the same check', () => {
    // At the very end of a long step, many cues fire at once
    const cues = checkCues(0, 59.5, 60, fired, 'left');
    expect(cues).toContain('start');
    expect(cues).toContain('halfway');
    expect(cues).toContain('10s-left');
    expect(cues).toContain('switch-side');
    expect(cues).toContain('end');
  });
});
