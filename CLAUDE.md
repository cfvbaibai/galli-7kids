# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Galli-7Kids is a card-based counseling tool for therapists, based on the German Galli Theater's "7 Dark Room Children" personality archetypes. Users select 1-10 cards from a 7×7 grid, flip them to reveal hidden character associations, then drag cards to matching character slots.

**Key Context**: Mobile-first, designed for counselor-client sessions in casual settings (coffee shops, etc.). Touch interaction is primary.

## Skills to Use

| Skill | When to Use |
|-------|-------------|
| `/frontend-design` | **ALWAYS use for any UI/component work** - This project requires warm, cozy, emotionally-safe design. The skill provides guidance on typography, colors, animations, and avoiding generic AI aesthetics. |
| `/vue-best-practices` | Vue 3 Composition API, `<script setup>`, TypeScript patterns |
| `/vue-pinia-best-practices` | Pinia stores, state management patterns, reactivity |
| `/vueuse-functions` | Apply VueUse composables (useDraggable, usePointer, etc.) |

## Documentation

- `docs/PRD.md` - Full product requirements
- `docs/POC.md` - Current implementation scope and technical details

## Tech Stack

```
Vue 3 + TypeScript + Vite
Tailwind CSS (mobile-first breakpoints)
Pinia (global state)
VueUse + Lodash-ES (utilities)
```

**Package Manager**: Use `pnpm` (not npm or yarn)

## Architecture

**Headless Pattern**: State/logic in composables + stores, rendering in components. This enables:
- Unit testing without DOM mounting
- Future switch to Canvas rendering if needed
- Clean separation of concerns

```
src/
├── composables/     # Pure state logic (no DOM refs)
├── stores/          # Pinia stores (cardGame.ts)
├── components/      # Thin renderers
├── types/           # TypeScript definitions
└── data/            # Static JSON (cards.json)
```

## Required Libraries

Use these proactively:

| Library | Use For |
|---------|---------|
| `pinia` | Global state: card selection, game phase |
| `@vueuse/core` | `useDraggable`, `useEventListener`, `useWindowSize` |
| `lodash-es` | `shuffle`, `chunk`, `sample`, `debounce` (tree-shakable) |

```typescript
// Preferred imports
import { useDraggable } from '@vueuse/core'
import { shuffle, chunk } from 'lodash-es'
import { useCardGameStore } from '@/stores/cardGame'
```

## Card Data Model

```typescript
interface Card {
  id: number                      // 1-49
  frontText: string               // Action description (e.g., "泡一杯热牛奶")
  backCharacter: DarkRoomChild    // Character key
  backImage: string               // Path to character image
}

type DarkRoomChild = 'miser' | 'showoff' | 'aggressive' | 'seductress' | 'gossip' | 'sleepyhead' | 'smallone'
```

## 49 Cards Distribution

7 cards per character × 7 characters = 49 total. IDs 1-7 → 多情种, 8-14 → 小不点, etc. (see POC.md for full mapping).

## Sample Assets

Located in `src/assets/images/samples/`:
- `反面/*.jpg` - 7 character card images (back side)
- `背景/背景+7个小孩卡槽.jpg` - Table background with 7 slots

## Mobile-First Guidelines

- Touch targets ≥ 44×44px
- Test on actual devices, not just browser devtools
- Use touch events, not hover states
- 7×7 grid must scroll/zoom on small screens
