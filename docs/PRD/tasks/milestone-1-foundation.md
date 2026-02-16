# Milestone 1: Foundation Vertical Slice

> **Status: COMPLETE**

## 1.1 Repo Init (Agent 1)
- [x] Initialize repository: `pnpm create vite` (React + TypeScript)
- [x] Install dependencies: `tailwindcss@4`, `shadcn/ui`, `framer-motion`, `lucide-react`, `zustand`, `react-router-dom`
- [x] Configure `index.css` with core design tokens (colors, typography)
- [x] Create folder structure: `src/features`, `src/components`, `src/lib`, `src/content`, `src/motion`

## 1.2 Core Setup

### TypeScript Interfaces (Agent 1)
- [x] Define `Gesture` interface (`src/lib/types/gesture.ts`)
- [x] Define `Flow` + `FlowStep` interfaces (`src/lib/types/flow.ts`)
- [x] Define `PlayerState` + `PlayerStep` interfaces (`src/lib/types/player.ts`)

### App Shell & Routing (Agent 2)
- [x] Set up React Router with route config (gestures, flows, player, builder)
- [x] Create root layout with bottom nav (`src/app/layout.tsx`) — hides on player
- [x] Wrap routes with AnimatePresence for page transitions
- [x] Initialize `components.json` for shadcn CLI
- [x] Install shadcn components: Button, Badge, Card, Input, Slider, Sheet

### Motion Foundation (Agent 2)
- [x] Create motion tokens (`src/motion/tokens.ts`): springs, durations, eases, animation variants
- [x] Create motion primitives (`src/motion/primitives.tsx`): MotionButton, MotionCard, MotionList, MotionListItem, MotionPage

## 1.3 Content Pipeline (Agent 1)
- [x] Create CLI `pnpm content:new-gesture`: scaffolds gesture.json with prompts
- [x] Create CLI `pnpm content:scan`: generates `content/generated/index.ts`
- [x] Create CLI `pnpm content:validate`: checks schema + media file presence
- [x] Create 12 seed gestures with placeholder media
- [x] Create 4 seed flows (quick-neck-relief, hand-arm-care, full-body-relaxation, deep-sleep-guide)
- [x] Run validate + scan to generate runtime index

## 1.4 Gesture Library MVP (Agent 1 + Agent 2)
- [x] `GestureList.tsx`: grid of gesture cards with text search + body area filter
- [x] `GestureDetail.tsx`: full detail view with hero image, tags, instructions, contraindications
- [x] Shared element transition: `layoutId` on card image + title
- [x] Favorites store (`src/lib/stores/user-data.ts`): Zustand + localStorage persistence (Agent 2)
- [x] Favorites toggle on GestureDetail + indicator on GestureList cards (Agent 2)

## 1.5 Simple Player MVP (Agent 1)
- [x] Create `usePlayerStore` Zustand store (`src/lib/stores/player.ts`)
- [x] `PlayerView.tsx`: Prev/Now/Next layout with massive countdown timer
- [x] Play/Pause/Skip/Back controls with auto-advance on timer expiry
- [x] Core loop validated: gesture/flow → play → timer → step advance → completed

## 1.6 Flow Library (Agent 1)
- [x] `FlowList.tsx`: browsable list of curated flows with play button
- [x] Flow → Player integration: converts flow steps to player steps
