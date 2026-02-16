# Milestone 2: Guided Player Polish + Flow Library

> **Goal:** Elevate the player to the glanceable spec, add flow browsing UI.
> Blocked by: M1 complete (player MVP + gesture library + motion system)

---

## 2.1 Player Card Components

> Blocked by: M1.5.2 (PlayerView exists)
> Card components are **parallelizable** — each is independent.

### ∥ Cards (independent)

- [ ] **2.1.1** `PrevStepCard.tsx`: condensed card showing previous gesture name + completed indicator, fade/slide-up entry
- [ ] **2.1.2** `CurrentStepCard.tsx`: primary card with massive countdown timer (large digits), gesture name, one-line summary, side indicator (L/R badge), media status indicators (audio playing, video on/off)
- [ ] **2.1.3** `NextStepCard.tsx`: condensed card showing upcoming gesture name + duration preview, slide-up entry
- [ ] **2.1.4** `ProgressOverview.tsx`: horizontal segmented progress bar (one segment per step), step index / total, remaining time for current step and entire flow

### Integration

> Blocked by: 2.1.1-2.1.4

- [ ] **2.1.5** Integrate cards into `PlayerView.tsx`, replace basic layout with Prev/Current/Next stack
- [ ] **2.1.6** Add Framer Motion layout transitions for card stack (calm enter/exit, AnimatePresence mode="wait")

---

## 2.2 Glance Mode & Controls

> Blocked by: M1.5.1 (player store)
> These are **parallelizable** — each is independent.

### ∥ Independent features

- [ ] **2.2.1** Implement "Glance Mode" toggle: scales typography up (~1.5x), increases tap target sizes, reduces visual detail — store preference in user data
- [ ] **2.2.2** Hook up Skip/Back/Repeat controls to player store: Next advances stepIndex + resets timer, Back decrements, Repeat resets elapsed to 0
- [ ] **2.2.3** Implement `Keep Screen Awake` toggle using Screen Wake Lock API (`navigator.wakeLock.request('screen')`) with proper release on unmount/pause
- [ ] **2.2.4** `MediaStatus.tsx`: indicators showing audio state (playing/paused/loading), video state (on/off), captions state — displayed on CurrentStepCard

---

## 2.3 Flow Library UI (`src/features/flows`)

> Blocked by: M1.3.5-6 (seed flows exist), M1.2.4 (routing)
> **Parallelizable with 2.1 and 2.2** — independent workstream.

- [ ] **2.3.1** `FlowList.tsx`: browsable list of curated flows with duration, step count, intensity, tags — uses MotionList for stagger entry
- [ ] **2.3.2** `FlowDetail.tsx`: flow detail showing step sequence with gesture thumbnails, total duration, equipment needed, contraindications aggregated from gestures
- [ ] **2.3.3** "Start Flow" button on FlowDetail → launches player with selected flow
- [ ] **2.3.4** Shared element transition: `layoutId` on flow card → detail header
- [ ] **2.3.5** Favorites toggle for flows: extend `useUserData` store with `favoriteFlowIds[]`
