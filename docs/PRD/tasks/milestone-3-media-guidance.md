# Milestone 3: Media Guidance & Audio Engine

## 3.1 Audio Chaining
- [ ] Implement audio preloading for next step.
- [ ] Create `useAudioChainer` hook managing sequential playback.
- [ ] Add crossfade (50-150ms) between steps explicitly.
- [ ] Handle cues: Start, Halfway, 10s left, Switch Side.

## 3.2 Video & Captions
- [ ] Add optional video overlay with loop support.
- [ ] Display captions/transcript if available.
- [ ] Optimize loading: only load video poster until played.

## 3.3 State Persistence
- [ ] Implement snapshotting to `localStorage`: `flowId`, `stepIndex`, `elapsedTime`.
- [ ] Create "Resume Session" prompt on app load if active session found.
