# Milestone 5: Polish, Accessibility & Deployment

> **Goal:** Production readiness — safety, accessibility, search upgrade, performance, deployment.
> **Status:** MOSTLY COMPLETE

---

## 5.1 Safety & Contraindications

> Tasks are **parallelizable**.

### ∥ Independent features

- [x] **5.1.1** Contraindication warnings on GestureDetail: prominent banner when gesture has contraindications, shown before "Try" action (Agent 2)
- [x] **5.1.2** Aggregated contraindication warnings on FlowDetail: merge contraindications from all gestures in the flow, display before "Start Flow" — reordered to appear above the button (Agent 2)
- [x] **5.1.3** Pre-session safety check: `SafetyCheckDialog.tsx` component shows aggregated contraindications before play. Wired into both GestureDetail and FlowDetail entry points (Agent 2)
- [ ] **5.1.4** Disclaimers in settings/info drawer: general safety information accessible from app settings, kept out of the core loop

---

## 5.2 Accessibility & Reduced Motion

> Tasks are **parallelizable**.

### ∥ Independent features

- [x] **5.2.1** Create `useReducedMotion` hook: merges OS `prefers-reduced-motion` media query with in-app toggle preference, provides boolean for components (Agent 2)
- [x] **5.2.2** Apply reduced motion across all Framer Motion components: disable layout animations and large transforms, keep minimal opacity fades, apply to motion primitives globally (Agent 2)
- [x] **5.2.3** Keyboard navigation audit: all interactive elements focusable, `aria-label` on nav links, back buttons, filter toggles (Agent 2)
- [x] **5.2.4** ARIA labels audit: screen reader labels on all controls (player buttons, filter toggles, play buttons, favorite toggles), `aria-live` region for timer/step changes, `role="tablist"` on flow tabs, `aria-pressed` on body area filters, `aria-expanded` on sort toggle (Agent 2)
- [ ] **5.2.5** High contrast support: ensure critical UI (timer, controls, progress) meets WCAG AA contrast ratios in both normal and glance mode

---

## 5.3 Search Upgrade

- [x] **5.3.1** Integrate Fuse.js: weighted fuzzy search over name, summary, description, tags, bodyAreas — name matches rank highest (Agent 2)
- [x] **5.3.2** Extend filters: sort options (favorites-first, alphabetical, intensity) with collapsible filter panel, body area filter chips with `aria-pressed` (Agent 2)
- [x] **5.3.3** Apply same search/filter system to flow library (FlowList) — Fuse.js with weighted keys (Agent 2)

---

## 5.4 Performance & PWA

> Tasks are **parallelizable**.

- [ ] **5.4.1** Performance audit: test on mid-range Android device, ensure 60fps page transitions and player animations, profile and fix jank
- [x] **5.4.2** Lazy load routes: code-split all feature routes (gestures, flows, builder, player) with React.lazy + Suspense — main bundle dropped from 510KB to 401KB (Agent 2)
- [ ] **5.4.3** PWA manifest + service worker: add `manifest.json`, configure Vite PWA plugin for offline asset caching, app installability

---

## 5.5 Deployment

> Blocked by: 5.1-5.4 complete
> Tasks are **sequential**.

- [ ] **5.5.1** Final `pnpm content:validate` run — all content passes
- [ ] **5.5.2** Production build configuration: verify `pnpm build` produces optimized output, check bundle size, ensure no dev-only code leaks
- [ ] **5.5.3** Deploy to Vercel or Netlify: configure build command, environment, preview deployments for PRs
