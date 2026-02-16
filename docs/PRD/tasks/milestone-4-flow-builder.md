# Milestone 4: Flow Builder & Persistence

> **Goal:** Let users create, edit, save, and preview custom flows.
> Blocked by: M1.4 (gesture library — users pick gestures to add), M1.5 (player — preview mode)
>
> **Note:** M4.1 does NOT depend on M2 or M3. It only needs M1 types and stores. This workstream can start as soon as M1 is complete, **in parallel with M2/M3 work**.

---

## 4.1 Local Storage & Data Layer

> Blocked by: M1.2.1-2 (TS interfaces for Flow/Step)
> Tasks are **sequential**.

- [ ] **4.1.1** Create `useUserFlows` hook (`src/lib/stores/user-flows.ts`): Zustand store with CRUD operations — create flow, add/remove/reorder steps, update step config, delete flow. Persist to localStorage
- [ ] **4.1.2** Implement `FlowSchema` runtime validation: validate user-created flows before save — ensure all gestureIds reference existing gestures, durations within bounds, at least 1 step
- [ ] **4.1.3** Migration safety: version the localStorage schema, handle graceful upgrade if data shape changes between releases

---

## 4.2 Builder UI (`src/features/builder`)

> Blocked by: 4.1.1 (useUserFlows hook), M1.4 (gesture library for gesture picker)

### ∥ Parallelizable components

- [ ] **4.2.1** `FlowList.tsx` — unified view: tabbed display of "My Flows" (user-created) vs "Curated" (bundled presets), with create-new-flow action
- [ ] **4.2.2** Gesture picker modal: browse/search gesture library within builder context, add selected gesture as new step to flow

### Sequential (depends on above)

> Blocked by: 4.2.1, 4.2.2

- [ ] **4.2.3** `FlowEditor.tsx`: main builder view showing ordered step list, each step displays gesture name + duration + side + notes
- [ ] **4.2.4** Drag-to-reorder steps: use Framer Motion `Reorder.Group` + `Reorder.Item` with tuned springs and stable layout animations
- [ ] **4.2.5** Per-step configuration: inline edit duration (slider or input within min/max bounds), side selector (L/R/none), notes text field, optional intensity override
- [ ] **4.2.6** Step actions: remove step (with confirmation), duplicate step, insert step above/below

### Preview & Polish

> Blocked by: 4.2.3, M1.5 (player)

- [ ] **4.2.7** Preview mode: "Preview" button launches current draft flow in guided player (read-only, does not save), return to builder on completion/exit
- [ ] **4.2.8** Auto-save: debounced save to localStorage on every edit (500ms), visual indicator showing save status
- [ ] **4.2.9** Empty state: clear CTA when user has no custom flows — "Create your first flow" with guided entry point
