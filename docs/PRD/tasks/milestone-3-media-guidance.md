# Milestone 3: Media Guidance, Audio Engine & State Persistence

> **Goal:** Build the audio chaining engine, add video/captions support, implement session resume.
> Blocked by: M2.1 (player cards), M2.2.2 (player controls wired)
>
> **Key insight:** The three sections below are **fully parallelizable workstreams** — no dependencies between them. They share the same M2 prerequisites but don't interact until integration.

---

## 3.1 Audio Chaining Engine

> Blocked by: M2.2.2 (skip/back/repeat wired to store)
> Tasks within this section are **sequential** — each builds on the previous.

- [ ] **3.1.1** Implement audio preloading: when current step starts playing, begin loading next step's audio via a second HTMLAudioElement (double-buffering pattern)
- [ ] **3.1.2** Create `useAudioChainer` hook (`src/features/player/hooks/use-audio-chainer.ts`): manages two audio elements, coordinates sequential playback across step transitions, exposes play/pause/seek interface
- [ ] **3.1.3** Add crossfade between steps: fade out current (50-150ms) while fading in next, using gain control. Start with HTMLAudioElement volume ramp; document upgrade path to Web Audio API if precision needed
- [ ] **3.1.4** Implement audio cue system: fire events at configurable thresholds (Start, Halfway, 10s left, Switch Side, End) based on player clock — cues drive UI emphasis on CurrentStepCard
- [ ] **3.1.5** Handle audio looping: if step duration exceeds clip length, loop audio if designed for it, otherwise play once then continue with silent timer + periodic cues

---

## 3.2 Video & Captions

> Blocked by: M1.4.3 (GestureDetail exists), M2.1.2 (CurrentStepCard exists)
> Tasks are **parallelizable** within this section.

### ∥ Independent features

- [ ] **3.2.1** Optional video overlay in player: show current gesture video clip in CurrentStepCard, loop video for duration of step, crossfade between clips on step change
- [ ] **3.2.2** Lazy video loading: show poster image until user explicitly enables video or enters player — don't auto-load video on gesture detail
- [ ] **3.2.3** Captions display: render `.vtt` captions synced to audio playback, toggle on/off via player controls
- [ ] **3.2.4** Transcript view: expandable transcript panel on GestureDetail using `.md` or `.vtt` transcript content

---

## 3.3 State Persistence & Resume

> Blocked by: M1.5.1 (player store exists)
> **Note:** This does NOT depend on M2 — can start as soon as M1 player store is done.
> Tasks are **sequential**.

- [ ] **3.3.1** Implement resume snapshot: persist to localStorage every 3-5 seconds while playing — save `flowId`, `stepIndex`, `stepElapsedSec`, audio positions, `lastUpdated` timestamp
- [ ] **3.3.2** Create "Resume Session" prompt: on app load, check for active snapshot — if found and < 24h old, show prompt with flow name + step info + "Resume" / "Discard" actions
- [ ] **3.3.3** Resume playback: restore player store state from snapshot, seek audio to saved position, resume from paused state (user hits play to continue)
- [ ] **3.3.4** Cleanup: clear snapshot on flow completion or explicit discard, handle edge case where gesture/flow content has changed since snapshot was taken
