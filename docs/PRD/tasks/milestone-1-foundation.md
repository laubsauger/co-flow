# Milestone 1: Foundation Vertical Slice

## 1.1 Repo Init
- [x] Initialize repository: `pnpm create vite` (React + TypeScript).
- [x] Install dependencies: `tailwindcss@4`, `shadcn/ui`, `framer-motion`, `lucide-react`, `zustand`, `react-router-dom`.
- [x] Configure `index.css` with core design tokens (colors, typography).
- [x] Create folder structure: `src/features`, `src/components`, `src/lib`, `src/content`, `src/motion`.

## 1.2 Content Pipeline
- [x] Define TS interfaces: `Gesture.ts`, `Flow.ts`.
- [x] Create CLI `pnpm content:new-gesture`: Scaffolds `content/gestures/<slug>/gesture.json`.
- [x] Create CLI `pnpm content:scan`: Reads JSON files, generates `content/generated/index.ts`.
- [x] Create CLI `pnpm content:validate`: Checks schema and required media files.
- [x] **Seed Content**: Create 12 diverse gestures with placeholder audio/images.

## 1.3 Gesture Library MVP (`src/features/gestures`)
- [x] `GestureList.tsx`: Show grid of gestures with basic filtering/search.
- [x] `GestureDetail.tsx`: Show gesture details (name, summary, media controls).
- [x] **Shared Element Transition**: Use `layoutId` for hero images.

## 1.4 Simple Player MVP (`src/features/player`)
- [x] Create `PlayerState.ts` (Zustand store).
- [x] `PlayerView.tsx`: Basic Prev/Now/Next layout (no fancy transitions yet).
- [x] `MediaControl.tsx`: Simple Play/Pause logic.
- [x] Validate core loop: Selecting a gesture -> Playing it -> Seeing timer -> Moving to next.
