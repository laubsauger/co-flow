# Milestone 1: Foundation Vertical Slice

> **Goal:** Scaffold repo, build content pipeline, deliver gesture library + simple player MVP.
> All subsequent milestones depend on M1 completion.

---

## 1.1 Repo Init

> No blockers. Everything else depends on this.

- [ ] **1.1.1** Initialize repository: `pnpm create vite` (React + TypeScript)
- [ ] **1.1.2** Install dependencies: `tailwindcss@4`, `shadcn/ui`, `framer-motion`, `lucide-react`, `zustand`, `react-router-dom`
- [ ] **1.1.3** Configure `index.css` with core design tokens (colors, typography, Tailwind `@theme`)
- [ ] **1.1.4** Create folder structure: `src/features`, `src/components/ui`, `src/lib`, `src/content`, `src/motion`, `src/app`

---

## 1.2 Core Setup ← blocks everything below

> Blocked by: 1.1 complete
> These three workstreams are **parallelizable** — no dependencies between them.

### ∥ Track A: TypeScript Interfaces

- [ ] **1.2.1** Define `Gesture` interface (`src/lib/types/gesture.ts`): id, name, tags, bodyAreas, intensity, durationDefaults, media (audio required), summary, description, contraindications, equipment
- [ ] **1.2.2** Define `Flow` + `Step` interfaces (`src/lib/types/flow.ts`): step flow (steps[] with gestureId, durationSec, side, notes, overrides) and compiled flow (compiledMedia with audio, video, poster, chapters)
- [ ] **1.2.3** Define `PlayerState` interface (`src/lib/types/player.ts`): activeFlowId, currentStepIndex, elapsedTime, isPaused, state machine enum (idle/loading/playing/paused/completed)

### ∥ Track B: App Shell & Routing

- [ ] **1.2.4** Set up React Router with route config (`src/app/router.tsx`): routes for `/gestures`, `/gestures/:id`, `/flows`, `/flows/:id`, `/player`, `/builder`
- [ ] **1.2.5** Create root layout component (`src/app/layout.tsx`): mobile-first shell with bottom nav
- [ ] **1.2.6** Wrap app with providers (`src/app/providers.tsx`): AnimatePresence for page transitions

### ∥ Track C: Motion Foundation

- [ ] **1.2.7** Create motion tokens (`src/motion/tokens.ts`): springs (soft, snappy, heavy, bouncy), durations (micro, short, medium), eases (standard, emphasized, decelerate)
- [ ] **1.2.8** Create base motion primitives (`src/motion/primitives.tsx`): MotionButton (press feedback), MotionCard (lift/compress), MotionList + MotionListItem (stagger entry)

---

## 1.3 Content Pipeline

> Blocked by: 1.2.1 + 1.2.2 (TS interfaces)
> CLI tools are **parallelizable** — each is independent.

### ∥ CLI Tools (independent of each other)

- [ ] **1.3.1** Create `pnpm content:new-gesture` CLI: prompts for name/tags/bodyAreas/intensity/duration, scaffolds `src/content/gestures/<slug>/gesture.json` with template + media placeholders, ensures slug uniqueness
- [ ] **1.3.2** Create `pnpm content:scan` CLI: reads all gesture/flow JSON files, generates `src/content/generated/index.ts` with typed exports, derives filter facets (all tags, all bodyAreas, intensity range)
- [ ] **1.3.3** Create `pnpm content:validate` CLI: validates JSON against TS schemas, verifies required media files exist (audio.mp3), checks tag normalization (lowercase), checks duration bounds, emits actionable errors

### Seed Content (sequential after CLI tools)

> Blocked by: 1.3.1 (scaffolding tool)

- [ ] **1.3.4** Create 12 diverse seed gestures with placeholder audio files — cover multiple bodyAreas (neck, shoulders, jaw, forearm, back, scalp), varied intensity (1-5), varied durations
- [ ] **1.3.5** Create 3 curated step flows referencing seed gestures (e.g. "Neck & Shoulders 15min", "Quick Jaw Release", "Full Upper Body")
- [ ] **1.3.6** Create 1 compiled flow example (audio-only acceptable) with chapter metadata
- [ ] **1.3.7** Run `content:validate` + `content:scan` to generate the runtime index

---

## 1.4 Gesture Library MVP (`src/features/gestures`)

> Blocked by: 1.3.7 (generated index with seed content)
> Also uses: 1.2.7-8 (motion primitives), 1.2.4 (routing)

- [ ] **1.4.1** `GestureList.tsx`: grid of gesture cards using MotionCard + MotionList, basic text search (substring match on name/summary/tags)
- [ ] **1.4.2** Filter panel: multi-select for tags and bodyAreas, intensity range — use derived facets from generated index
- [ ] **1.4.3** `GestureDetail.tsx`: gesture detail view with name, summary, description, media controls, contraindications, equipment
- [ ] **1.4.4** Shared element transition: `layoutId` on card image + title for list → detail morph
- [ ] **1.4.5** Favorites: create `useUserData` Zustand store (`src/lib/stores/user-data.ts`) with `favoriteGestureIds[]` persisted to localStorage, toggle UI on cards and detail

---

## 1.5 Simple Player MVP (`src/features/player`)

> Blocked by: 1.2.3 (player types), 1.3.7 (seed content)
> **Parallelizable with 1.4** — both only need types + content

- [ ] **1.5.1** Create `usePlayerStore` (Zustand, `src/lib/stores/player.ts`): state machine (idle/loading/playing/paused/completed), activeFlowId, currentStepIndex, elapsed, play/pause/next/back/repeat actions
- [ ] **1.5.2** `PlayerView.tsx`: basic Prev/Now/Next vertical layout — show gesture name, one-line summary, countdown timer (large digits)
- [ ] **1.5.3** `MediaControl.tsx`: simple play/pause with HTMLAudioElement, timer tick (200-300ms interval)
- [ ] **1.5.4** Wire entry point: "Try" button on GestureDetail and flow selection launch player with correct data
- [ ] **1.5.5** Validate core loop end-to-end: select gesture/flow → play → see timer counting → step advances → reaches completed state
