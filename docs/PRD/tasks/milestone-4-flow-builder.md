# Milestone 4: Flow Builder & Persistence

> **Goal:** Let users create, edit, save, and preview custom flows.
> **Status:** COMPLETE (Agent 2)
> M4 was started early in parallel with M2/M3 since it only depended on M1.

---

## 4.1 Local Storage & Data Layer

- [x] **4.1.1** Create `useUserFlows` Zustand store (`src/lib/stores/user-flows.ts`): CRUD operations — create/delete/update flow, add/remove/reorder/duplicate/update steps. Persisted to localStorage.
- [x] **4.1.2** Implement `validateFlow()` runtime validation: checks gestureIds exist, durations positive, at least 1 step. Exported from user-flows store.
- [x] **4.1.3** Migration safety: schemaVersion field + zustand persist `version` option for future upgrades.

---

## 4.2 Builder UI (`src/features/builder`)

- [x] **4.2.1** `BuilderHome.tsx`: list of user-created flows with step count + duration, create-new-flow inline form, delete flow action
- [x] **4.2.2** `GesturePicker.tsx`: bottom sheet modal with search, browse all gestures, tap to add as step
- [x] **4.2.3** `FlowEditor.tsx`: full editor view — ordered step list, inline name editing, step count + duration header
- [x] **4.2.4** Drag-to-reorder: Framer Motion `Reorder.Group` + `Reorder.Item` with grip handle
- [x] **4.2.5** Per-step configuration: expandable step panel with duration slider (respects gesture min/max), side selector (Both/Left/Right), notes input
- [x] **4.2.6** Step actions: remove step, duplicate step
- [x] **4.2.7** Preview mode: "Preview" button launches current flow in player
- [x] **4.2.8** Auto-save indicator: brief "Saved" flash with checkmark in editor header after changes (Agent 2)
- [x] **4.2.9** Empty state: CTA with "Add your first gesture" when flow has no steps, "No custom flows yet" on builder home
- [x] **4.2.10** User flows shown alongside curated flows in FlowList via tabbed view (Curated / My Flows) (Agent 2)
