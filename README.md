<p align="center">
  <img src="public/pwa-512x512.svg" width="120" height="120" alt="Co-Flow" />
</p>

<h1 align="center">Co-Flow</h1>

<p align="center">
  <strong>Your gentle guide to massage & bodywork</strong><br />
  <em>Breathe. Touch. Heal.</em>
</p>

<p align="center">
  <a href="https://github.com/laubsauger/co-flow/actions/workflows/deploy.yml">
    <img src="https://github.com/laubsauger/co-flow/actions/workflows/deploy.yml/badge.svg" alt="Deploy" />
  </a>
  <img src="https://img.shields.io/badge/react-19-blue" alt="React 19" />
  <img src="https://img.shields.io/badge/typescript-strict-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/pwa-ready-green" alt="PWA Ready" />
</p>

---

Co-Flow is a mobile-first, audio-first progressive web app for guided massage therapy sessions. Practitioners and learners explore a gesture library, run guided flows (step-by-step sequences), and build custom routines -- all designed for hands-busy use where the screen is secondary to the work.

## Why Co-Flow

Massage guidance tools today are either video-heavy (requiring constant screen attention) or text-heavy (useless mid-session). Co-Flow takes a different approach:

- **Audio-first.** Clear narration and cue points (start, halfway, 10 seconds left, switch side) let you keep your eyes on your partner, not the screen.
- **Glanceable.** When you do glance, massive countdown typography is readable from 3-4 feet away. No squinting, no scrolling.
- **Composable.** Atomic gestures chain into flows. Curated presets get you started; the builder lets you create your own.
- **Offline-ready.** Full PWA with service worker caching. Install it, use it anywhere -- no network required after first load.

## Core Features

### Gesture Library
Browse 12 massage gestures with fuzzy search, body area filters, and intensity ratings. Each gesture includes audio narration, a poster image, duration defaults, contraindications, and required equipment.

### Guided Player
The heart of Co-Flow. A vertical card stack (Previous / **Current** / Next) with a full-screen countdown timer. Audio chains seamlessly across steps with 50-150ms crossfades. Wake lock keeps the screen alive. Session snapshots persist to localStorage every 3 seconds for resume-on-return.

### Flow Library
Four curated flows ship out of the box -- from a 5-minute Quick Neck Relief to a 10-minute Full Body Relaxation. Drag to reorder steps before playback. Favorite flows for quick access.

### Flow Builder
Create custom flows from the gesture library. Drag-and-drop reordering, per-step duration sliders, side selection (left/right/both), and optional notes. Changes auto-save to localStorage.

### Safety First
Contraindication warnings surface before playback. A pre-session safety check dialog requires acknowledgment when any gesture in the flow carries risk factors.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Build | Vite, React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4 (`@theme` + oklch), shadcn/ui (Radix primitives) |
| Animation | Framer Motion (layoutId, Reorder, AnimatePresence) |
| State | Zustand with `persist` middleware |
| Routing | React Router v7, lazy-loaded via React.lazy + Suspense |
| Search | Fuse.js (weighted fuzzy) |
| Icons | Lucide React |
| PWA | vite-plugin-pwa + Workbox (30-day media caching) |

## Getting Started

```bash
# Prerequisites: Node.js 22+, pnpm 9+

# Install dependencies
pnpm install

# Generate the runtime content index
pnpm content:scan

# Start the dev server
pnpm dev
```

Open [http://localhost:5173/co-flow/](http://localhost:5173/co-flow/) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with HMR |
| `pnpm build` | Production build (TypeScript check + Vite + SW generation) |
| `pnpm preview` | Preview production build locally |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | TypeScript check without emit |
| `pnpm content:scan` | Regenerate runtime index from content JSONs |
| `pnpm content:validate` | Validate content schemas and media references |
| `pnpm content:new-gesture` | Scaffold a new gesture template |

## Content Model

Content lives in `src/content/` as JSON files with co-located media. The `content:scan` CLI generates a typed runtime index at build time.

**Gesture** -- the atomic unit. A massage technique with metadata (body areas, intensity 1-5, duration range), required audio narration, optional video and poster, contraindications, and equipment list.

**Flow** -- a sequence of gestures. Each step specifies a gesture, duration, optional side, and notes. Flows can be curated (shipped with the app) or user-created (persisted in localStorage).

```
src/content/
  gestures/
    neck-glides/
      gesture.json
      audio.mp3
      poster.webp
    ...
  flows/
    full-body-relaxation/
      flow.json
    ...
  generated/
    index.ts          # auto-generated, do not edit
```

## Architecture

```
src/
  app/              App shell, layout, bottom nav, settings, resume prompt
  features/
    gestures/       Gesture list (search, filters, sort) + detail view
    flows/          Flow list (curated/user tabs) + detail with reorder
    builder/        Flow editor with drag-and-drop, gesture picker
    player/         Guided player, card stack, audio chainer, wake lock
  components/       Shared (SafetyCheckDialog, SettingsDrawer)
  components/ui/    shadcn/ui primitives
  lib/
    stores/         Zustand stores (player, user-data, user-flows, session-resume)
    types/          TypeScript interfaces
    hooks/          Shared hooks (useReducedMotion)
  content/          Source content + generated index
  motion/           Animation tokens + motion primitives
```

## Deployment

Co-Flow deploys to GitHub Pages via a CI pipeline that runs on every push to `main`:

1. Install dependencies (`pnpm install --frozen-lockfile`)
2. Validate content schemas (`pnpm content:validate`)
3. Lint (`pnpm lint`)
4. Build (`pnpm build`)
5. Deploy to GitHub Pages at `/co-flow/`

The app includes a `404.html` redirect handler for client-side routing on GitHub Pages.

## Design Principles

**Mobile-first.** Designed for viewports under 450px. Every interaction works with touch.

**Audio-first.** The app must work with the screen off or at arm's length. Audio cues carry the session.

**Reduced motion.** All animations respect `prefers-reduced-motion` and an in-app toggle. Motion primitives handle this automatically.

**Local-first.** No accounts, no cloud sync. All user data stays on-device in localStorage. The service worker makes everything work offline.

**Strict types.** No `any`. Every data structure is typed. Content schemas are validated at build time.

## License

Private project. All rights reserved.
