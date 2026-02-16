# Milestone 5: Polish, Accessibility & Deployment

> **Goal:** Production readiness — safety, accessibility, search upgrade, performance, deployment.
> **Status:** COMPLETE (except 5.2.5 high contrast + 5.4.1 device performance audit)

---

## 5.1 Safety & Contraindications

- [x] **5.1.1** Contraindication warnings on GestureDetail: prominent banner before "Try" action (Agent 2)
- [x] **5.1.2** Aggregated contraindication warnings on FlowDetail: merged from all gestures, displayed above "Start Flow" (Agent 2)
- [x] **5.1.3** Pre-session safety check: `SafetyCheckDialog` shows contraindications before play, wired into GestureDetail and FlowDetail (Agent 2)
- [x] **5.1.4** Disclaimers in settings drawer: general safety info, reduced motion toggle, about section — accessible via Settings tab in bottom nav (Agent 2)

---

## 5.2 Accessibility & Reduced Motion

- [x] **5.2.1** `useReducedMotion` hook: merges OS `prefers-reduced-motion` + in-app toggle (Agent 2)
- [x] **5.2.2** Reduced motion applied across all Framer Motion primitives (Agent 2)
- [x] **5.2.3** Keyboard navigation: all interactive elements focusable, proper `aria-label` on nav links, back buttons, filter toggles (Agent 2)
- [x] **5.2.4** ARIA labels: screen reader labels on all controls, `aria-live` region for player step changes, `role="tablist"` on flow tabs, `aria-pressed` on filters, `aria-expanded` on sort toggle (Agent 2)
- [ ] **5.2.5** High contrast support: manual testing needed on real devices

---

## 5.3 Search Upgrade

- [x] **5.3.1** Fuse.js fuzzy search: weighted keys (name:3, summary:2, tags:1.5, bodyAreas:1, description:0.5) (Agent 2)
- [x] **5.3.2** Extended filters: sort options (default, favorites-first, A-Z, intensity) with collapsible panel (Agent 2)
- [x] **5.3.3** FlowList search: Fuse.js with weighted keys (name:3, description:2, tags:1.5) (Agent 2)

---

## 5.4 Performance & PWA

- [ ] **5.4.1** Performance audit: requires real device testing
- [x] **5.4.2** Lazy load routes: React.lazy + Suspense for all feature routes. Main bundle: 440KB (143KB gzip). Route chunks: 2-15KB each (Agent 2)
- [x] **5.4.3** PWA: vite-plugin-pwa with autoUpdate, manifest.webmanifest, service worker precaching 31 entries, CacheFirst for media files, SVG app icons (Agent 2)

---

## 5.5 Deployment

- [x] **5.5.1** `pnpm content:validate` passes: 12 gestures, 4 flows validated
- [x] **5.5.2** Production build verified: `tsc -b` clean, optimized Vite output, no dev leaks, meta tags (theme-color, description, apple-touch-icon), GitHub Pages 404.html SPA handler, `base: '/co-flow/'` configured
- [ ] **5.5.3** Deploy to hosting: configured for GitHub Pages (`base: '/co-flow/'`, 404.html redirect). Awaiting push.
