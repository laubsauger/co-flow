# Massage Therapy Coach and Guide App
Implementation Handoff (pnpm + Vite + TypeScript + Tailwind v4 + shadcn/ui + Framer Motion)

## 1) Goal
Build a mobile-first web app that guides massage sessions using reusable **gestures** chained into **flows**.

Users can:
- Explore individual gestures (library mode)
- Run a guided flow uninterrupted (guided mode)
- Create and save custom flows by chaining gestures (builder mode)

Guidance types per gesture or flow:
- Audio
- Video
- Text
- Any combination of the above

Primary UX constraint:
- Guided mode is designed for a phone placed to the side, so the UI must be **glanceable** with **Previous / Current / Next** plus clear **progress**.

---

## 2) Product surfaces

### A) Gesture Library
- Browse gestures
- Search and filter by tags, body area, intensity, duration
- Favorite gestures
- Open gesture detail
- Try a gesture with guidance (mini player)
- Add gesture to a flow (existing or new)

### B) Flow Library
- Curated flows (bundled presets)
- User-created flows (saved locally, optionally synced later)
- Flow detail shows sequence, durations, intensity tags, equipment, contraindications

### C) Guided Flow Player
Designed for hands-busy, glanceable use:
- Always shows **Prev / Now / Next**
- Big “Now” card with minimal text and strong timing cues
- Overall progress overview across all steps
- Audio-first by default, optional video and text overlays
- Controls: pause, skip, back, repeat current
- Optional “glance mode” with larger typography and tap targets
- Keep screen awake option

### D) Flow Builder
- Create and edit custom flows from gestures
- Add, remove, reorder steps
- Configure per-step settings: duration, side, notes, intensity override
- Preview the flow in guided player
- Save locally

---

## 3) UX specifications

### Guided player layout (glanceable)
- Vertical stack:
  - top: “Prev” card (condensed)
  - center: “Current” card (primary)
  - bottom: “Next” card (condensed)

Current card includes:
- Gesture name
- One-line instruction (summary)
- Countdown timer (large digits or ring)
- Side indicator if applicable (left/right)
- Media status indicators (audio playing, video on/off, captions)

Progress overview:
- Horizontal segmented progress bar where each segment represents a gesture step
- Show step index and total steps
- Show remaining time for current step and whole flow

Controls:
- Primary: Play/Pause (big)
- Secondary: Back, Next, Repeat
- Optional quick toggles: Captions, Glance mode, Volume, Wake lock

Guidance modes:
- Audio narration with optional cues (start, halfway, 10 seconds left, switch side, end)
- Video as optional demonstration overlay
- Text: short instruction plus expandable details

Accessibility:
- Reduced motion mode support
- Large typography option
- High contrast theme
- Clear contraindications surfaced per gesture/flow
- Disclaimers kept out of the core loop but present in settings or info drawers

---

## 4) Content model

### Gesture (atomic unit)
Gestures are the building blocks. Each gesture has metadata and short media clips.

Minimum fields:
- id (stable slug)
- name
- tags[]
- bodyAreas[] (domain filters like neck, shoulders, jaw, forearm)
- summary (one-liner for guided player)
- description (longer)
- durationDefaults: { minSec, defaultSec, maxSec }
- media:
  - audio (required)
  - video (optional)
  - poster (optional)
  - captions (optional)
  - transcript (optional)
- intensity (1..5)
- contraindications[] (optional)
- equipment[] (optional)

Likely useful domain fields soon:
- pressureType (light/medium/deep)
- movementType (glide/knead/compress/tap/stretch)
- pace (slow/medium/fast)
- outcome tags (relaxation/mobility/pain relief/warm-up)
- sidePolicy (autoSwitch/manual/none)

### Flow
Two formats:

#### A) Step flow (sequence of gesture steps)
Used for:
- Custom flows
- Interactive player UI with Prev/Now/Next
- Remixing and editing

Fields:
- id, name, description, tags[]
- steps[]:
  - gestureId
  - durationSec
  - side (left/right/none, optional)
  - notes (optional)
  - overrides (optional: custom summary, custom audio/video, cues)

#### B) Compiled flow (single continuous clip, up to 60 minutes)
Used for:
- “Press play and do not touch” sessions
- Best uninterrupted experience

Fields:
- everything in step flow plus:
- compiledMedia:
  - audio (required for compiled)
  - video (optional)
  - poster (optional)
  - chapters (optional timestamps mapping to steps for UI syncing)

Recommended strategy:
- Custom flows are always step flows.
- Curated flows can exist as both step flow (for UI and remixing) and compiled flow (for uninterrupted sessions).

---

## 5) Repository content structure

### Gestures
Store gestures as versioned content in repo.

`src/content/gestures/<gestureId>/`
- gesture.json
- audio.mp3 (or .m4a)
- video.mp4 (optional)
- poster.webp (optional)
- captions.vtt (optional)
- transcript.md (optional)

### Flows
`src/content/flows/<flowId>/`
- flow.json
- compiled-audio.mp3 (optional)
- compiled-video.mp4 (optional)
- poster.webp (optional)

---

## 6) Adding new gestures (content pipeline)

Goal: a clean, repeatable workflow for adding gestures without manual fiddling.

### A) CLI generator
Add repo scripts:
- `pnpm content:new-gesture`
  - prompts for name, tags, body areas, intensity, default duration
  - generates new folder with gesture.json template
  - creates placeholders for media files
  - auto-slugs id and ensures uniqueness
  - optionally updates a central index

### B) Content validation
- `pnpm content:validate`
  - validates JSON schema
  - verifies referenced media files exist
  - checks tag normalization (lowercase, canonical)
  - checks durations are within bounds
  - emits actionable errors

### C) Content index generation
- `pnpm content:scan`
  - scans `src/content/**`
  - generates `src/content/generated/index.ts` for runtime usage
  - includes derived fields like total flow duration, filter facets, etc.

CI gate:
- Validation must pass in CI before merge.

---

## 7) Favorites, search, and filtering

### Favorites
- Stored locally per user:
  - localStorage initially
  - IndexedDB later if needed
- Store as:
  - favoriteGestureIds[]
  - favoriteFlowIds[]
- UI supports favorite toggles everywhere with optimistic update

### Search
- Search over:
  - name, summary, description, tags, bodyAreas
- Implementation options:
  - simple: substring match with scoring
  - better: Fuse.js or MiniSearch with tuned weights

### Filters
- tags (multi-select)
- bodyAreas (multi-select)
- intensity range
- duration range
- sort options: favorites-first, recently used, recently viewed

---

## 8) Media strategy and chaining

### A) Chaining gesture clips for step flows (custom flows)
Audio-first.
- Preload next step audio while current plays
- Transition with short fade out and fade in (50 to 150 ms)
- Support cue overlays (start, halfway, 10s left, switch side)
- Persist player state snapshot for robust resume

Video for step flows:
- Optional enhancement only
- Show current gesture video clip or loop
- Crossfade between clips
- Small gaps acceptable as long as audio remains continuous

### B) Compiled flows (up to 60 minutes)
- Single audio file (required)
- Optional single long video
- Optional chapter metadata to sync UI progress and highlight current step

Looping strategy for gestures:
- If a gesture step duration exceeds its clip:
  - loop audio if designed for looping
  - or play once then continue with silent timer plus periodic cues
  - video can loop as a demonstration background

---

## 9) Player engine specification

### State machine
- idle -> loading -> playing -> paused -> completed
Step transitions:
- stepStart -> stepTick -> stepCue -> stepEnd -> next step

### Timing
- One authoritative player clock (tick 200 to 300 ms)
- Cues fire based on:
  - explicit timestamps
  - thresholds like “10 seconds left”
- Prefetch:
  - load next step audio early
  - load next step video poster early (if used)

### Controls
- Play/Pause: affects clock and media
- Next/Back: step index changes, timer reset, side policy applied
- Repeat: restart current step
- Resume reliability:
  - persist snapshot to local storage every few seconds:
    - flowId, stepIndex, stepElapsedSec, media positions, lastUpdated

Audio system:
- Start with HTMLAudio (simpler)
- If needed, upgrade to Web Audio for more precise mixing and crossfades

---

## 10) Animation requirements (state of the art)

### Target
- Smooth 60 fps micro-interactions and page transitions on mid-range phones
- Cohesive motion language across the app
- Reduced motion support

### Motion architecture
Create a centralized motion system:

1) Motion tokens
- `src/motion/tokens.ts`
  - springs: soft, snappy, heavy, bouncy
  - durations: micro, short, medium
  - eases: standard, emphasized, decelerate

2) Motion primitives
Reusable animated wrappers:
- MotionButton (press, hover, focus, loading states)
- MotionCard (lift on hover, compress on tap)
- MotionSheet (bottom sheet open/close, drag-to-dismiss)
- MotionModal (scale + fade + backdrop)
- MotionToast (slide + fade)
- MotionTabs (shared underline indicator)
- MotionList + MotionListItem (stagger, layout transitions)
- MotionProgress (segment fill, pulse on step change)

3) Page transitions
- Wrap routes with AnimatePresence
- Use consistent enter/exit transitions
- Use mode="wait" to avoid overlap artifacts

4) Shared element transitions
For gesture list -> detail:
- Use layoutId for card image and title so they morph smoothly into detail header.

### Micro-interactions by surface
Gesture Library:
- Filter panel slides with spring, content shifts smoothly
- Cards lift, compress, and animate in with stagger
Gesture Detail:
- Media controls morph play/pause and progress smoothly
Flow Builder:
- Drag reorder uses Reorder.Group with tuned springs and stable layout animations
Guided Player:
- Prev/Now/Next stack animates with calm layout transitions
- Progress segments fill smoothly
- Cue events cause subtle, readable emphasis on current card

Performance guardrails:
- Avoid expensive blur animations on low-end devices
- Prefer transforms over heavy box-shadow animation
- Keep video paused unless visible
- Use will-change sparingly

Reduced motion:
- Create a hook that merges OS preference and in-app toggle
- Disable large movement transitions, keep minimal fades

Definition of done for motion:
- Every navigation has a page transition
- Every tappable element has press feedback
- No pop-in, lists use smooth entry
- Sheets/modals consistent spring transitions
- Shared element transitions implemented for list -> detail
- Reorder feels stable and premium
- Guided player motion is calm and glanceable

---

## 11) Tech stack and app architecture

### Stack
- Vite + React + TypeScript
- pnpm
- Tailwind v4
- shadcn/ui (Radix primitives)
- Framer Motion
- Routing: react-router-dom (or TanStack Router)
- State:
  - Zustand for player and local data
  - Optional React Query only when remote data exists
- Persistence:
  - localStorage for favorites, custom flows, resume state
  - Optional IndexedDB later for larger caches

### Suggested folder structure
- src/app (routing, layout, shell)
- src/features/gestures (library, detail)
- src/features/flows (flow library, flow detail)
- src/features/builder (flow builder)
- src/features/player (guided player, engine, media hooks)
- src/components/ui (shadcn)
- src/components (shared components)
- src/lib (types, utils, persistence)
- src/motion (tokens and motion primitives)
- src/content (gestures and flows content)
- src/content/generated (generated index)

---

## 12) Milestones

Milestone 1: Foundation vertical slice
- Scaffold repo, Tailwind v4 + shadcn + Framer Motion
- Content pipeline skeleton: schemas, validate, scan, generated index
- Gesture library list + detail
- Minimal guided player with text + timer and a single step flow

Milestone 2: Guided player polish
- Prev/Now/Next layout
- Progress overview
- Controls: pause, skip, back, repeat
- Glance mode
- Motion polish

Milestone 3: Media guidance
- Audio playback per gesture with prefetch and crossfade
- Optional video overlay per gesture
- Captions and transcript
- Robust resume snapshot

Milestone 4: Flow builder and persistence
- Create/edit/save flows locally
- Reorder steps, edit durations and sides
- Preview in player
- Favorites and recent flows

Milestone 5: Quality, accessibility, safety
- Contraindications surfaced appropriately
- Reduced motion and accessibility pass
- Packaging and deployment

---

## 13) Required deliverables
1) Repo scaffold with the stack installed and running dev build
2) Content pipeline:
   - GestureSchema and FlowSchema
   - content:new-gesture generator
   - content:validate and content:scan
   - generated index for app runtime
3) Seed content:
   - at least 12 gestures
   - at least 3 curated flows (step flows)
   - at least 1 compiled flow example (audio only is acceptable)
4) Gesture library with search, filters, and favorites
5) Guided player MVP meeting the glanceable spec and chaining audio for step flows
6) Flow builder MVP with local persistence
7) Motion system:
   - tokens, primitives, page transitions, shared element transitions
   - reduced motion support
