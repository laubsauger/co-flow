# Milestone 3: Media Guidance, Audio Engine & State Persistence

> **Goal:** Build the audio chaining engine, add video/captions support, implement session resume.
> **Status:** MOSTLY COMPLETE

---

## 3.1 Audio Chaining Engine (Agent 1)

> **Complete**

- [x] **3.1.1** Implement audio preloading: when current step starts playing, begin loading next step's audio via a second HTMLAudioElement (double-buffering pattern)
- [x] **3.1.2** Create `useAudioChainer` hook (`src/features/player/hooks/use-audio-chainer.ts`): manages two audio elements, coordinates sequential playback, exposes play/pause/seek
- [x] **3.1.3** Add crossfade between steps: fade out current (50-150ms) while fading in next. Start with HTMLAudioElement volume ramp; document upgrade path to Web Audio API
- [x] **3.1.4** Implement audio cue system: fire events at thresholds (Start, Halfway, 10s left, Switch Side, End) based on player clock
- [x] **3.1.5** Handle audio looping: if step duration exceeds clip length, loop audio or play once then continue with silent timer + periodic cues

---

## 3.2 Video & Captions

### ∥ Independent features

- [x] **3.2.1** Optional video overlay in player: show gesture video in CurrentStepCard, loop for step duration, crossfade on step change (Agent 1)
- [x] **3.2.2** Lazy video loading: poster image until user enables video — don't auto-load on detail (Agent 1)
- [ ] **3.2.3** Captions display: render `.vtt` synced to audio, toggle on/off via player controls
- [ ] **3.2.4** Transcript view: expandable panel on GestureDetail from `.vtt` content

---

## 3.3 State Persistence & Resume

> **Complete**

- [x] **3.3.1** Implement resume snapshot: persist to localStorage every 3-5s while playing — save `flowId`, `stepIndex`, `stepElapsedSec`, audio positions, `lastUpdated` (Agent 2)
- [x] **3.3.2** Create "Resume Session" prompt: on app load, check for snapshot < 24h old — show flow name + "Resume" / "Discard" (Agent 2)
- [x] **3.3.3** Resume playback: restore player store from snapshot, seek audio, resume paused (Agent 1 + Agent 2)
- [x] **3.3.4** Cleanup: clear snapshot on completion or discard, handle stale content edge case (Agent 2)

---

### Agent assignments

| Task | Owner | Notes |
|------|-------|-------|
| 3.1 Audio Chaining | Agent 1 | Complete |
| 3.2.1-3.2.2 Video in player | Agent 1 | Complete |
| 3.2.3-3.2.4 Captions/Transcript | Agent 2 | Blocked on VTT content availability |
| 3.3 State Persistence | Agent 1 + 2 | Complete |
