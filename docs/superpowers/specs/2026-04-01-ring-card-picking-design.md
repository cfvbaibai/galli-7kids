# Ring Card Picking — Design Spec

> **Date**: 2026-04-01
> **Phase**: POC — Card picking interaction on the existing coverflow ring
> **Depends on**: CardRingTest.vue (existing carousel), cardGame store (existing selection logic)

## Overview

Replace the current CardSelection grid phase with a ring-based card picking experience. Users browse the 49-card coverflow carousel, tap the center card to pick/unpick it, and confirm their 1-10 card selection to proceed.

## Decisions

| Decision | Choice |
|----------|--------|
| Card order on ring | Fixed (1-49), no auto-shuffle |
| Shuffle | Manual button only |
| Selection visibility | Counter badge + expandable thumbnail tray |
| Confirm flow | Always-visible confirm button in bottom bar |
| Tap on center card | Toggle pick/unpick (not flip) |

## Screen Layout

### Main Screen

```
+----------------------------------+
|  "选择你的卡牌"                    |  Header: title + subtitle
|   跟随直觉，选择 1-10 张          |
|          [🔀 洗牌]               |  Shuffle button (top-right)
+----------------------------------+
|                                  |
|    ◄  ╔══════════╗  ►           |  Coverflow ring (existing)
|        ║  CENTER   ║              |  Swipe to browse
|        ║   CARD    ║              |  Tap center to pick/unpick
|        ╚══════════╝              |  Selected = checkmark + glow
|                                  |
+----------------------------------+
|  #12 · 说出"我想你了"，我爱你"    |  Current card detail bar
+----------------------------------+
|  [↺ 清除]     3/10    [确认 →]  |  Bottom action bar
+----------------------------------+
```

### Expanded Tray (tapping the counter)

```
+----------------------------------+
|       已选择 3 张卡牌             |
|  +---+ +---+ +---+               |
|  | 12| | 28| | 45|  tappable     |  Navigates ring to that card
|  +---+ +---+ +---+               |
|                                  |
|        [收起]                    |
+----------------------------------+
```

## Interaction Model

| Action | Gesture | Effect |
|--------|---------|--------|
| Browse | Swipe left/right | Scroll ring (existing) |
| Pick card | Tap center card | Add to selection, bounce + glow |
| Unpick card | Tap selected center card | Remove, shake feedback |
| Review picks | Tap counter badge | Expand tray overlay |
| Go to picked card | Tap thumbnail in tray | Close tray, navigate ring |
| Re-shuffle | Tap shuffle button | Re-order cards with animation |
| Clear all | Tap "清除" button | Deselect all |
| Confirm | Tap "确认" button | Transition to viewing phase |

## Visual Feedback

### Pick
- Card scales up briefly (spring bounce), settles with colored glow ring
- Haptic pulse: `navigator.vibrate(10)`
- Small checkmark badge appears on the card

### Unpick
- Subtle shake animation
- Glow ring fades, checkmark disappears

### Max reached (10 selected)
- Tapping unselected card: counter badge shakes briefly, no pick action

## Component Architecture

### New component: `CardPickingRing.vue`
Replaces `CardSelection.vue` as the `selecting` phase view in `App.vue`.

Contains:
- Header with title, subtitle, shuffle button
- The coverflow carousel (logic extracted from CardRingTest)
- Card detail bar below the ring
- Bottom action bar (clear, counter, confirm)
- Expandable tray overlay

### Carousel logic extraction
Move the ring/swipe/gesture logic from `CardRingTest.vue` into a composable `useCardRing.ts` so it can be reused by the picking view and remain testable without DOM.

### Store changes
- Add `shuffleCards()` action to `cardGame.ts` — shuffles `allCards` array order
- Existing selection logic (`toggleCardSelection`, `canSelectMore`, etc.) is sufficient

### What changes in CardRingTest
- CardRingTest remains as a standalone test page (no functional changes)
- The picking feature is a new component, not a modification of the test page

## Files Changed

| File | Action |
|------|--------|
| `src/composables/useCardRing.ts` | NEW — extract ring/swipe/gesture logic |
| `src/components/CardPickingRing.vue` | NEW — main picking view |
| `src/components/SelectionTray.vue` | NEW — expandable tray overlay |
| `src/components/SelectionCounter.vue` | NEW — counter badge with expand action |
| `src/stores/cardGame.ts` | ADD `shuffleCards()` action |
| `src/App.vue` | REPLACE `CardSelection` with `CardPickingRing` for selecting phase |

## Out of Scope

- Flip animation on the ring (happens in viewing phase, not picking)
- Drag-to-slot matching
- The viewing/interpreting phases themselves
