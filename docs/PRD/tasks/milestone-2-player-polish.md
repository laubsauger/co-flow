# Milestone 2: Guided Player Polish + Flow Library

> **Status: COMPLETE**

---

## 2.1 Player Card Components (Agent 1)

- [x] **2.1.1** `PrevStepCard.tsx`: condensed card with completed indicator
- [x] **2.1.2** `CurrentStepCard.tsx`: massive countdown, gesture name, summary, side indicator, media status
- [x] **2.1.3** `NextStepCard.tsx`: upcoming gesture name + duration preview
- [x] **2.1.4** `ProgressOverview.tsx`: segmented progress bar, step index, remaining time
- [x] **2.1.5** Refactored `PlayerView.tsx` to use card components
- [x] **2.1.6** Framer Motion layout transitions for card stack

## 2.2 Glance Mode & Controls (Agent 1)

- [x] **2.2.1** Skip/Back/Repeat controls wired to Zustand store
- [x] **2.2.2** Glance Mode toggle with scaled typography
- [x] **2.2.3** Keep Screen Awake toggle (Screen Wake Lock API)
- [x] **2.2.4** MediaStatus indicators on CurrentStepCard

## 2.3 Flow Library Polish (Agent 2)

- [x] **2.3.1** `FlowList.tsx`: browsable list with duration, step count, tags, play button, favorites
- [x] **2.3.2** Flow → Player integration
- [x] **2.3.3** `FlowDetail.tsx`: step sequence, total duration, equipment, aggregated contraindications, "Start Flow" button
- [x] **2.3.4** Route `/flows/:id` wired in App.tsx
- [x] **2.3.5** Favorites toggle for flows in FlowDetail + indicator on FlowList cards
