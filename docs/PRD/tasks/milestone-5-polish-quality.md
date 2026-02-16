# Milestone 5: Polish, Accessibility & Deployment

> **Goal:** Production readiness — safety, accessibility, search upgrade, performance, deployment.
> Blocked by: M1-M4 feature-complete

---

## 5.1 Safety & Contraindications

> Blocked by: M2.3.2 (FlowDetail), M1.4.3 (GestureDetail)
> Tasks are **parallelizable**.

### ∥ Independent features

- [ ] **5.1.1** Contraindication warnings on GestureDetail: prominent banner when gesture has contraindications, shown before "Try" action
- [ ] **5.1.2** Aggregated contraindication warnings on FlowDetail: merge contraindications from all gestures in the flow, display before "Start Flow"
- [ ] **5.1.3** Pre-session safety check: when launching player, show one-time confirmation if flow contains gestures with contraindications — "This flow includes gestures with the following considerations: [list]"
- [ ] **5.1.4** Disclaimers in settings/info drawer: general safety information accessible from app settings, kept out of the core loop

---

## 5.2 Accessibility & Reduced Motion

> Blocked by: M1.2.7 (motion tokens exist)
> Tasks are **parallelizable**.

### ∥ Independent features

- [ ] **5.2.1** Create `useReducedMotion` hook: merges OS `prefers-reduced-motion` media query with in-app toggle preference, provides boolean for components
- [ ] **5.2.2** Apply reduced motion across all Framer Motion components: disable layout animations and large transforms, keep minimal opacity fades, apply to motion primitives globally
- [ ] **5.2.3** Keyboard navigation audit: ensure all interactive elements are focusable and operable via keyboard, proper focus management on route changes and modal open/close
- [ ] **5.2.4** ARIA labels audit: screen reader labels on all controls (player buttons, filter toggles, cards), live regions for timer updates and step changes
- [ ] **5.2.5** High contrast support: ensure critical UI (timer, controls, progress) meets WCAG AA contrast ratios in both normal and glance mode

---

## 5.3 Search Upgrade

> Blocked by: M1.4.1 (GestureList with basic search)
> Can start **in parallel with 5.1 and 5.2**.

- [ ] **5.3.1** Integrate Fuse.js or MiniSearch: weighted fuzzy search over name, summary, description, tags, bodyAreas — tune weights so name matches rank highest
- [ ] **5.3.2** Extend filters: add duration range filter, sort options (favorites-first, alphabetical, intensity), persist active filters to session
- [ ] **5.3.3** Apply same search/filter system to flow library (FlowList)

---

## 5.4 Performance & PWA

> Tasks are **parallelizable**.

- [ ] **5.4.1** Performance audit: test on mid-range Android device, ensure 60fps page transitions and player animations, profile and fix jank
- [ ] **5.4.2** Lazy load routes: code-split feature routes (gestures, flows, builder, player) with React.lazy + Suspense
- [ ] **5.4.3** PWA manifest + service worker: add `manifest.json`, configure Vite PWA plugin for offline asset caching, app installability

---

## 5.5 Deployment

> Blocked by: 5.1-5.4 complete
> Tasks are **sequential**.

- [ ] **5.5.1** Final `pnpm content:validate` run — all content passes
- [ ] **5.5.2** Production build configuration: verify `pnpm build` produces optimized output, check bundle size, ensure no dev-only code leaks
- [ ] **5.5.3** Deploy to Vercel or Netlify: configure build command, environment, preview deployments for PRs
