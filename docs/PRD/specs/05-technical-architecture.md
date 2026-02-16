# Technical Architecture

## Stack
- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind v4 + shadcn/ui
- **Animation**: Framer Motion
- **Routing**: React Router or TanStack Router
- **State**: Zustand (local/player state)
- **Persistence**: localStorage (favorites, resume state)
- **Folder Structure**: Feature-based (`src/features/...`)

## Decisions
- **Mobile-First**: Design primarily for <450px viewport.
- **Audio-First**: The core loop doesn't require visual focus.
- **Offline**: No cloud sync initially; all data lives on user device (PWA ready).
