import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/lib/stores/player';
import { resolveGestureMediaUrl } from './resolve-media-url';
import type { PlayerStep } from '@/lib/types/player';

/** Cue events fired during playback */
export type AudioCueType = 'start' | 'halfway' | '10s-left' | 'switch-side' | 'end';

interface AudioCueEvent {
  type: AudioCueType;
  stepIndex: number;
}

interface UseAudioChainerOptions {
  crossfadeDurationMs?: number;
  onCue?: (event: AudioCueEvent) => void;
}

const DEFAULT_CROSSFADE_MS = 100;

/**
 * Double-buffered audio chainer.
 * Manages two HTMLAudioElements — one playing, one preloading next.
 * Handles crossfade, cue events, and looping.
 */
export function useAudioChainer(options: UseAudioChainerOptions = {}) {
  const { crossfadeDurationMs = DEFAULT_CROSSFADE_MS, onCue } = options;

  const audioA = useRef<HTMLAudioElement | null>(null);
  const audioB = useRef<HTMLAudioElement | null>(null);
  const activeRef = useRef<'a' | 'b'>('a');
  const firedCuesRef = useRef<Set<string>>(new Set());
  const onCueRef = useRef(onCue);
  onCueRef.current = onCue;

  // Initialize audio elements
  useEffect(() => {
    audioA.current = new Audio();
    audioB.current = new Audio();
    audioA.current.preload = 'auto';
    audioB.current.preload = 'auto';

    return () => {
      audioA.current?.pause();
      audioB.current?.pause();
      audioA.current = null;
      audioB.current = null;
    };
  }, []);

  const getActive = useCallback(() => {
    return activeRef.current === 'a' ? audioA.current : audioB.current;
  }, []);

  const getInactive = useCallback(() => {
    return activeRef.current === 'a' ? audioB.current : audioA.current;
  }, []);

  /** Load audio for a step into the given element */
  const loadStepAudio = useCallback((audio: HTMLAudioElement, step: PlayerStep) => {
    const url = resolveGestureMediaUrl(step.gesture.id, step.gesture.media.audio);
    if (audio.src !== url) {
      audio.src = url;
      audio.load();
    }
  }, []);

  /** Preload next step's audio into the inactive buffer */
  const preloadNext = useCallback((nextStep: PlayerStep | undefined) => {
    if (!nextStep) return;
    const inactive = getInactive();
    if (!inactive) return;
    loadStepAudio(inactive, nextStep);
  }, [getInactive, loadStepAudio]);

  /** Start playing the current step */
  const playStep = useCallback((step: PlayerStep, nextStep: PlayerStep | undefined) => {
    const active = getActive();
    if (!active) return;

    loadStepAudio(active, step);
    active.volume = 1;
    active.currentTime = 0;
    active.play().catch(() => {
      // Autoplay blocked or file missing — silent failure, timer still runs
    });

    // Handle looping: if audio is shorter than step duration
    active.loop = true;

    // Reset cue tracking
    firedCuesRef.current.clear();

    // Preload next
    preloadNext(nextStep);
  }, [getActive, loadStepAudio, preloadNext]);

  /** Crossfade to next step */
  const crossfadeTo = useCallback((nextStep: PlayerStep, afterNextStep: PlayerStep | undefined) => {
    const current = getActive();
    const next = getInactive();
    if (!current || !next) return;

    // Load and start next at volume 0
    loadStepAudio(next, nextStep);
    next.volume = 0;
    next.currentTime = 0;
    next.loop = true;
    next.play().catch(() => {});

    // Fade volumes over crossfadeDurationMs
    const steps = 10;
    const intervalMs = crossfadeDurationMs / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const t = step / steps;
      current.volume = Math.max(0, 1 - t);
      next.volume = Math.min(1, t);

      if (step >= steps) {
        clearInterval(interval);
        current.pause();
        current.volume = 1;
        activeRef.current = activeRef.current === 'a' ? 'b' : 'a';
        firedCuesRef.current.clear();

        // Preload the one after next
        preloadNext(afterNextStep);
      }
    }, intervalMs);
  }, [getActive, getInactive, loadStepAudio, crossfadeDurationMs, preloadNext]);

  /** Pause current audio */
  const pauseAudio = useCallback(() => {
    getActive()?.pause();
  }, [getActive]);

  /** Resume current audio */
  const resumeAudio = useCallback(() => {
    const active = getActive();
    if (active && active.src) {
      active.play().catch(() => {});
    }
  }, [getActive]);

  /** Seek to a specific time in current audio */
  const seekTo = useCallback((timeSec: number) => {
    const active = getActive();
    if (active) {
      active.currentTime = timeSec;
    }
  }, [getActive]);

  /** Check and fire cue events based on elapsed time */
  const checkCues = useCallback((stepIndex: number, elapsedTime: number, durationSec: number, side?: 'left' | 'right') => {
    if (!onCueRef.current) return;
    const fired = firedCuesRef.current;

    const cues: Array<{ type: AudioCueType; condition: boolean }> = [
      { type: 'start', condition: elapsedTime >= 0.1 },
      { type: 'halfway', condition: elapsedTime >= durationSec / 2 },
      { type: '10s-left', condition: durationSec > 15 && elapsedTime >= durationSec - 10 },
      { type: 'switch-side', condition: Boolean(side) && elapsedTime >= durationSec / 2 },
      { type: 'end', condition: elapsedTime >= durationSec - 0.5 },
    ];

    for (const cue of cues) {
      const key = `${stepIndex}-${cue.type}`;
      if (cue.condition && !fired.has(key)) {
        fired.add(key);
        onCueRef.current({ type: cue.type, stepIndex });
      }
    }
  }, []);

  /** Stop and reset everything */
  const stopAll = useCallback(() => {
    audioA.current?.pause();
    audioB.current?.pause();
    if (audioA.current) {
      audioA.current.currentTime = 0;
      audioA.current.src = '';
    }
    if (audioB.current) {
      audioB.current.currentTime = 0;
      audioB.current.src = '';
    }
    activeRef.current = 'a';
    firedCuesRef.current.clear();
  }, []);

  // Wire to player store status changes
  const status = usePlayerStore((s) => s.status);
  const currentStepIndex = usePlayerStore((s) => s.currentStepIndex);
  const steps = usePlayerStore((s) => s.steps);
  const elapsedTime = usePlayerStore((s) => s.elapsedTime);

  // Play/pause in sync with player status
  useEffect(() => {
    if (steps.length === 0) return;
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return;

    if (status === 'playing') {
      resumeAudio();
    } else if (status === 'paused' || status === 'idle') {
      pauseAudio();
    } else if (status === 'completed') {
      stopAll();
    }
  }, [status, currentStepIndex, steps, resumeAudio, pauseAudio, stopAll]);

  // Load audio on step change
  const prevStepIndexRef = useRef(currentStepIndex);
  useEffect(() => {
    if (steps.length === 0) return;
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return;
    const nextStep = steps[currentStepIndex + 1];

    if (prevStepIndexRef.current !== currentStepIndex) {
      const isForward = currentStepIndex > prevStepIndexRef.current;
      if (isForward) {
        crossfadeTo(currentStep, nextStep);
      } else {
        // Going backward: just load directly
        playStep(currentStep, nextStep);
      }
      prevStepIndexRef.current = currentStepIndex;
    } else if (status === 'playing' && elapsedTime < 0.2) {
      // Initial play
      playStep(currentStep, nextStep);
    }
  }, [currentStepIndex, steps, status, elapsedTime, crossfadeTo, playStep]);

  // Fire cue events
  useEffect(() => {
    if (status !== 'playing' || steps.length === 0) return;
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return;
    checkCues(currentStepIndex, elapsedTime, currentStep.durationSec, currentStep.side);
  }, [status, currentStepIndex, elapsedTime, steps, checkCues]);

  return {
    playStep,
    pauseAudio,
    resumeAudio,
    crossfadeTo,
    seekTo,
    stopAll,
    checkCues,
  };
}
