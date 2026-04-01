# Ring Card Picking — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat card-swipe selection phase with a coverflow ring carousel where users tap the center card to pick/unpick, with a counter badge, expandable tray, shuffle button, and confirm flow.

**Architecture:** Extract ring/swipe/gesture logic from `CardRingTest.vue` into a headless composable `useCardRing.ts`. Build `CardPickingRing.vue` as the new selecting-phase view, consuming the composable + the existing `cardGame` store. Build `SelectionTray.vue` as an expandable overlay showing picked card thumbnails. Wire everything in `App.vue`.

**Tech Stack:** Vue 3 Composition API, Pinia, lodash-es (`shuffle`), existing theme system

---

### Task 1: Add `shuffleCards()` to cardGame store

**Files:**
- Modify: `src/stores/cardGame.ts`

- [ ] **Step 1: Add shuffle import and action**

Add `shuffle` import from lodash-es at line 3:

```typescript
import { shuffle } from 'lodash-es'
```

Add the `shuffleCards` action after the `restart` function (after line 115):

```typescript
function shuffleCards() {
  const currentIds = allCards.value.map(c => c.id)
  const selectedSet = new Set(selectedCardIds.value)
  const selectedCards = allCards.value.filter(c => selectedSet.has(c.id))
  const unselectedCards = allCards.value.filter(c => !selectedSet.has(c.id))
  const shuffled = shuffle(unselectedCards)
  allCards.value = [...selectedCards, ...shuffled]
}
```

Add `shuffleCards` to the return object:

```typescript
    // Actions
    selectCard,
    deselectCard,
    toggleCardSelection,
    flipCard,
    flipAllCards,
    startDragging,
    stopDragging,
    placeCard,
    removeCardFromSlot,
    confirmSelection,
    startInterpreting,
    resetSelection,
    restart,
    shuffleCards,
```

- [ ] **Step 2: Verify build passes**

Run: `pnpm build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/stores/cardGame.ts
git commit -m "feat(store): add shuffleCards action to cardGame store"
```

---

### Task 2: Extract ring carousel logic into `useCardRing.ts` composable

This is the core extraction — pull the carousel state, animation, gesture, and style computation out of `CardRingTest.vue` into a headless composable. The composable takes a reactive card list and returns everything needed to render the ring.

**Files:**
- Create: `src/composables/useCardRing.ts`

- [ ] **Step 1: Create the composable**

Create `src/composables/useCardRing.ts`:

```typescript
import { ref, computed, onUnmounted, type Ref, type ComputedRef } from 'vue'
import type { Card } from '@/types/card'

export interface UseCardRingOptions {
  /** Reactive list of cards (supports reordering via shuffle) */
  cards: Ref<Card[]>
  /** Number of visible cards on each side of center */
  visibleSide?: number
  /** Horizontal offset between adjacent cards (px) */
  baseOffset?: number
}

export interface UseCardRingReturn {
  // State
  activeIndex: Ref<number>
  animatedIndex: Ref<number>
  isDragging: Ref<boolean>

  // Computed
  cardCount: ComputedRef<number>
  visibleIndices: ComputedRef<number[]>
  activeCard: ComputedRef<Card | undefined>

  // Navigation
  goTo: (index: number) => void
  prev: () => void
  next: () => void

  // Gesture handlers (bind to viewport element)
  onPointerDown: (e: PointerEvent) => void
  onPointerMove: (e: PointerEvent) => void
  onPointerUp: () => void

  // Style computation (bind to each visible card)
  cardStyle: (index: number) => { transform: string; opacity: number; zIndex: number }
  shadowCardStyle: (index: number) => { transform: string; opacity: number; zIndex: number }
}

export function useCardRing(options: UseCardRingOptions): UseCardRingReturn {
  const { cards, visibleSide = 4, baseOffset = 170 } = options

  const cardCount = computed(() => cards.value.length)
  const activeIndex = ref(0)
  const animatedIndex = ref(0)
  const isDragging = ref(false)
  let animRaf = 0

  // --- Animation ---
  function animateTo(target: number) {
    cancelAnimationFrame(animRaf)
    const count = cardCount.value
    if (count === 0) return
    const start = animatedIndex.value
    let distance = target - start
    if (distance > count / 2) distance -= count
    if (distance < -count / 2) distance += count
    const duration = 350
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      animatedIndex.value = start + distance * eased
      if (t < 1) animRaf = requestAnimationFrame(tick)
    }
    animRaf = requestAnimationFrame(tick)
  }

  function goTo(index: number) {
    const count = cardCount.value
    if (count === 0) return
    activeIndex.value = ((index % count) + count) % count
    animateTo(activeIndex.value)
  }

  function prev() { goTo(activeIndex.value - 1) }
  function next() { goTo(activeIndex.value + 1) }

  // --- Gesture ---
  let dragStartX = 0
  let dragStartIndex = 0
  const lastPositions: number[] = []
  const lastTimes: number[] = []

  function onPointerDown(e: PointerEvent) {
    cancelAnimationFrame(animRaf)
    isDragging.value = true
    dragStartX = e.clientX
    dragStartIndex = animatedIndex.value
    lastPositions.length = 0
    lastTimes.length = 0
    lastPositions.push(e.clientX)
    lastTimes.push(performance.now())
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: PointerEvent) {
    if (!isDragging.value) return
    const dx = e.clientX - dragStartX
    animatedIndex.value = dragStartIndex - dx / baseOffset

    lastPositions.push(e.clientX)
    lastTimes.push(performance.now())
    if (lastPositions.length > 5) {
      lastPositions.shift()
      lastTimes.shift()
    }
  }

  function onPointerUp() {
    if (!isDragging.value) return
    isDragging.value = false

    const count = cardCount.value
    if (count === 0) return

    let velocity = 0
    if (lastPositions.length >= 2) {
      const n = lastPositions.length
      const recency = performance.now() - lastTimes[n - 1]
      if (recency < 150) {
        const dx = lastPositions[n - 1] - lastPositions[0]
        const dt = lastTimes[n - 1] - lastTimes[0]
        if (dt > 0) velocity = -dx / dt * 16 / baseOffset * 16
      }
    }

    const projected = animatedIndex.value + velocity * 8
    const nearest = Math.round(projected)
    activeIndex.value = ((nearest % count) + count) % count
    animateTo(activeIndex.value)
  }

  // --- Visible cards ---
  const visibleIndices = computed(() => {
    const count = cardCount.value
    if (count === 0) return []
    const center = Math.round(animatedIndex.value)
    const indices: number[] = []
    for (let offset = -visibleSide; offset <= visibleSide; offset++) {
      indices.push(((center + offset) % count + count) % count)
    }
    return indices
  })

  // --- Card style ---
  function cardStyle(index: number) {
    const count = cardCount.value
    let offset = index - animatedIndex.value
    if (offset > count / 2) offset -= count
    if (offset < -count / 2) offset += count
    const absOffset = Math.abs(offset)

    const x = offset * baseOffset
    const rotateY = offset * -8
    const scale = 1 - Math.min(absOffset, 4) * 0.08
    const opacity = 1 - Math.min(absOffset, 4) * 0.22
    const zIndex = 100 - Math.round(absOffset * 10)

    return {
      transform: `translateX(${x}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity: Math.max(0, opacity),
      zIndex,
    }
  }

  // --- Shadow (far-side) cards ---
  function shadowCardStyle(index: number) {
    const count = cardCount.value
    let offset = index - animatedIndex.value
    if (offset > count / 2) offset -= count
    if (offset < -count / 2) offset += count

    const ro = -offset
    const absRo = Math.abs(ro)

    const x = ro * baseOffset
    const rotateY = ro * 8
    const scale = (1 - Math.min(absRo, 4) * 0.06) * 0.88
    const opacity = (1 - Math.min(absRo, 4) * 0.15) * 0.7
    const zIndex = 50 - Math.round(absRo * 10)

    return {
      transform: `translateY(-180px) translateZ(-80px) translateX(${x}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity: Math.max(0, opacity),
      zIndex,
    }
  }

  const activeCard = computed(() => {
    const count = cardCount.value
    if (count === 0) return undefined
    return cards.value[activeIndex.value]
  })

  onUnmounted(() => {
    cancelAnimationFrame(animRaf)
  })

  return {
    activeIndex,
    animatedIndex,
    isDragging,
    cardCount,
    visibleIndices,
    activeCard,
    goTo,
    prev,
    next,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    cardStyle,
    shadowCardStyle,
  }
}
```

- [ ] **Step 2: Verify build passes**

Run: `pnpm build`
Expected: Build succeeds (new file is unused but valid TS).

- [ ] **Step 3: Commit**

```bash
git add src/composables/useCardRing.ts
git commit -m "feat(composable): extract useCardRing from CardRingTest"
```

---

### Task 3: Build the `SelectionTray.vue` component

An expandable overlay showing thumbnails of picked cards. Tapping a thumbnail navigates the ring to that card.

**Files:**
- Create: `src/components/SelectionTray.vue`

- [ ] **Step 1: Create the component**

Create `src/components/SelectionTray.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useCardGameStore } from '@/stores/cardGame'
import type { Card } from '@/types/card'

const store = useCardGameStore()

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  navigateToCard: [index: number]
}>()

const selectedCards = computed(() => store.selectedCards)
const selectedCount = computed(() => store.selectedCount)

function handleCardClick(card: Card) {
  // Find this card's position in allCards to navigate the ring
  const idx = store.allCards.findIndex(c => c.id === card.id)
  if (idx >= 0) {
    emit('navigateToCard', idx)
    emit('close')
  }
}
</script>

<template>
  <Transition name="tray">
    <div v-if="isOpen" class="tray-backdrop" @click.self="emit('close')">
      <div class="tray-panel">
        <div class="tray-header">
          <span class="tray-title" :style="{ color: 'var(--color-text)' }">已选择 {{ selectedCount }} 张卡牌</span>
          <button class="tray-close" :style="{ color: 'var(--color-text-muted)' }" @click="emit('close')">
            收起
          </button>
        </div>

        <div v-if="selectedCards.length === 0" class="tray-empty" :style="{ color: 'var(--color-text-muted)' }">
          还没有选择卡牌
        </div>

        <div v-else class="tray-grid">
          <button
            v-for="card in selectedCards"
            :key="card.id"
            class="tray-thumb"
            :style="{ background: 'var(--color-surface)', borderColor: 'var(--color-primary)' }"
            @click="handleCardClick(card)"
          >
            <span class="thumb-number" :style="{ color: 'var(--color-text-muted)' }">#{{ card.id }}</span>
            <span class="thumb-text" :style="{ color: 'var(--color-text)' }">{{ card.frontText }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.tray-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.tray-panel {
  width: 100%;
  max-width: 480px;
  max-height: 60vh;
  background: var(--app-bg);
  border-radius: 1.25rem 1.25rem 0 0;
  padding: 1.25rem;
  overflow-y: auto;
}

.tray-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.tray-title {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 600;
}

.tray-close {
  background: none;
  border: none;
  font-family: var(--font-body);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  transition: background 0.2s ease;
}

.tray-close:hover {
  background: var(--color-surface);
}

.tray-empty {
  text-align: center;
  padding: 2rem;
  font-size: 0.9rem;
}

.tray-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.5rem;
}

.tray-thumb {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 0.75rem;
  border: 1.5px solid;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  text-align: left;
  min-height: 44px;
}

.tray-thumb:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tray-thumb:active {
  transform: scale(0.97);
}

.thumb-number {
  font-size: 0.7rem;
  font-weight: 700;
  opacity: 0.5;
  margin-bottom: 0.25rem;
}

.thumb-text {
  font-family: var(--font-card);
  font-size: 0.75rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Transition */
.tray-enter-active,
.tray-leave-active {
  transition: opacity 0.25s ease;
}

.tray-enter-active .tray-panel,
.tray-leave-active .tray-panel {
  transition: transform 0.25s ease;
}

.tray-enter-from,
.tray-leave-to {
  opacity: 0;
}

.tray-enter-from .tray-panel,
.tray-leave-to .tray-panel {
  transform: translateY(100%);
}
</style>
```

- [ ] **Step 2: Verify build passes**

Run: `pnpm build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/SelectionTray.vue
git commit -m "feat(component): add SelectionTray expandable overlay"
```

---

### Task 4: Build the `CardPickingRing.vue` main view

This is the main component — combines the ring composable, store, selection counter, and tray into the full picking experience.

**Files:**
- Create: `src/components/CardPickingRing.vue`

- [ ] **Step 1: Create the component**

Create `src/components/CardPickingRing.vue`. This is a large component — it assembles the ring, header, detail bar, bottom action bar, and selection tray.

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCardGameStore } from '@/stores/cardGame'
import { useThemeStore } from '@/stores/theme'
import { themes } from '@/themes'
import { useCardRing } from '@/composables/useCardRing'
import SelectionTray from '@/components/SelectionTray.vue'

const store = useCardGameStore()
const themeStore = useThemeStore()

onMounted(() => {
  themeStore.init()
})

// --- Ring carousel ---
const {
  activeIndex,
  isDragging,
  visibleIndices,
  activeCard,
  goTo,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  cardStyle,
  shadowCardStyle,
} = useCardRing({
  cards: computed(() => store.allCards),
})

// --- Selection ---
const trayOpen = ref(false)
const maxReachedShake = ref(false)

function handleCenterTap() {
  const card = activeCard.value
  if (!card) return

  if (store.isCardSelected(card.id)) {
    store.toggleCardSelection(card.id)
    return
  }

  if (!store.canSelectMore) {
    // Max reached — shake the counter
    maxReachedShake.value = true
    setTimeout(() => { maxReachedShake.value = false }, 400)
    return
  }

  store.toggleCardSelection(card.id)
  tryHaptic()
}

function tryHaptic() {
  try { navigator.vibrate(10) } catch {}
}

function handleNavigateToCard(index: number) {
  goTo(index)
}

function handleShuffle() {
  store.shuffleCards()
}

// --- Theme helpers ---
const currentTheme = computed(() => themes[themeStore.activeTheme])

const canConfirm = computed(() => store.selectedCount >= 1)
</script>

<template>
  <div class="picking-ring" :style="{ background: 'var(--app-bg)', fontFamily: 'var(--font-body)' }">
    <!-- Header -->
    <header class="picking-header">
      <h1 class="picking-title" :style="{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }">
        选择你的卡牌
      </h1>
      <p class="picking-subtitle" :style="{ color: 'var(--color-text-muted)' }">
        跟随直觉，选择 1-10 张
      </p>
      <button
        class="shuffle-btn"
        :style="{ color: 'var(--color-text-muted)', background: 'var(--color-surface)' }"
        @click="handleShuffle"
      >
        <svg class="shuffle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
          <line x1="4" y1="4" x2="9" y2="9" />
        </svg>
        洗牌
      </button>
    </header>

    <!-- Carousel -->
    <div
      class="carousel-viewport"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <div class="carousel-stage">
        <!-- Far-side shadow cards -->
        <div
          v-for="i in visibleIndices"
          :key="'s-' + i"
          class="carousel-card carousel-card--shadow"
          :style="shadowCardStyle(i)"
        >
          <div class="shadow-stub"></div>
        </div>

        <!-- Near-side main cards -->
        <div
          v-for="i in visibleIndices"
          :key="store.allCards[i].id"
          class="carousel-card"
          :class="{
            'is-active': activeIndex === i,
            'is-selected': store.isCardSelected(store.allCards[i].id),
          }"
          :style="cardStyle(i)"
          @click.stop="activeIndex === i && handleCenterTap()"
        >
          <div class="card-flipper">
            <!-- FRONT (only face shown during picking) -->
            <div class="card-face card-front" :style="{ background: 'var(--card-front-bg)' }">
              <div v-if="currentTheme.effects.texture === 'grain'" class="grain"></div>
              <div class="front-accent" :style="{ background: 'var(--color-primary)' }"></div>
              <span class="card-num" :style="{ color: 'var(--color-text-muted)' }">
                {{ store.allCards[i].id }}
              </span>
              <p class="front-text" :style="{ fontFamily: 'var(--font-card)', color: 'var(--color-text)' }">
                {{ store.allCards[i].frontText }}
              </p>
              <!-- Selection checkmark -->
              <div
                v-if="store.isCardSelected(store.allCards[i].id)"
                class="pick-badge"
                :style="{ background: 'var(--color-primary)' }"
              >
                <svg class="pick-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail bar -->
    <div class="detail-bar" :style="{ background: 'var(--color-surface)' }">
      <span class="detail-number" :style="{ color: 'var(--color-text)' }">#{{ activeCard?.id }}</span>
      <span class="detail-text" :style="{ color: 'var(--color-text-muted)' }">{{ activeCard?.frontText }}</span>
    </div>

    <!-- Bottom action bar -->
    <div class="action-bar">
      <button
        class="action-btn clear-btn"
        :style="{ color: 'var(--color-text-muted)' }"
        :disabled="store.selectedCount === 0"
        @click="store.resetSelection"
      >
        清除
      </button>

      <button
        class="counter-badge"
        :class="{ 'shake': maxReachedShake, 'has-items': store.selectedCount > 0 }"
        :style="{
          color: store.selectedCount > 0 ? 'var(--color-background)' : 'var(--color-text-muted)',
          background: store.selectedCount > 0 ? 'var(--color-primary)' : 'var(--color-surface)',
        }"
        @click="trayOpen = true"
      >
        {{ store.selectedCount }} / 10
      </button>

      <button
        class="action-btn confirm-btn"
        :style="{
          color: canConfirm ? 'var(--color-background)' : 'var(--color-text-muted)',
          background: canConfirm ? 'var(--color-primary)' : 'var(--color-surface)',
        }"
        :disabled="!canConfirm"
        @click="store.confirmSelection"
      >
        确认
      </button>
    </div>

    <!-- Selection tray -->
    <SelectionTray
      :is-open="trayOpen"
      @close="trayOpen = false"
      @navigate-to-card="handleNavigateToCard"
    />
  </div>
</template>

<style scoped>
.picking-ring {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  transition: background-color 0.4s ease;
}

/* Header */
.picking-header {
  text-align: center;
  padding: 1rem 1rem 0.5rem;
  position: relative;
}

.picking-title {
  font-size: 1.25rem;
  margin: 0;
}

.picking-subtitle {
  font-size: 0.8rem;
  margin: 0.25rem 0;
}

.shuffle-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border: none;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.shuffle-btn:hover {
  transform: translateY(-1px);
}

.shuffle-btn:active {
  transform: scale(0.95);
}

.shuffle-icon {
  width: 14px;
  height: 14px;
}

/* Carousel viewport (same as CardRingTest) */
.carousel-viewport {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1200px;
  min-height: 400px;
  overflow: hidden;
  touch-action: pan-y;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
}

.carousel-viewport:active {
  cursor: grabbing;
}

.carousel-stage {
  position: relative;
  width: 160px;
  height: 220px;
  transform-style: preserve-3d;
}

/* Individual card */
.carousel-card {
  position: absolute;
  width: 160px;
  height: 220px;
  left: 0;
  top: 0;
  cursor: pointer;
  transition: transform 0.08s ease-out, opacity 0.15s ease;
  transform-style: preserve-3d;
}

.carousel-card--shadow {
  pointer-events: none;
  cursor: default;
}

.shadow-stub {
  width: 100%;
  height: 100%;
  border-radius: var(--card-radius);
  background: var(--card-back-bg);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
}

/* Card flipper (single face, no flip during picking) */
.card-flipper {
  width: 100%;
  height: 100%;
  position: relative;
}

.card-face {
  position: absolute;
  inset: 0;
  border-radius: var(--card-radius);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.is-active .card-face {
  box-shadow: var(--card-shadow-hover);
}

/* Selected state — glow ring */
.is-selected .card-face {
  box-shadow:
    0 0 0 3px var(--color-primary),
    var(--card-shadow-hover);
}

/* Front face */
.card-front {
  padding: 0.75rem 0.6rem;
  align-items: center;
  justify-content: center;
  background: var(--card-front-bg);
}

.front-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0.7;
}

.card-num {
  position: absolute;
  top: 8px;
  left: 10px;
  font-size: 0.7rem;
  font-weight: 700;
  opacity: 0.4;
}

.front-text {
  font-size: 0.85rem;
  text-align: center;
  line-height: 1.5;
  z-index: 1;
  padding: 0.3rem;
  margin: 0;
}

/* Pick badge (checkmark) */
.pick-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  animation: pick-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pick-check {
  width: 14px;
  height: 14px;
  color: white;
}

@keyframes pick-pop {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

/* Grain */
.grain {
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='1'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  border-radius: inherit;
  opacity: 0.6;
  z-index: 2;
}

/* Detail bar */
.detail-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1rem;
  margin: 0 1rem;
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
}

.detail-number {
  font-weight: 700;
  font-size: 0.85rem;
  white-space: nowrap;
}

.detail-text {
  font-size: 0.8rem;
  line-height: 1.4;
}

/* Bottom action bar */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem 1.25rem;
}

.action-btn {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-btn:not(:disabled):active {
  transform: scale(0.95);
}

.confirm-btn:not(:disabled) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Counter badge */
.counter-badge {
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 999px;
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  min-width: 64px;
}

.counter-badge:active {
  transform: scale(0.95);
}

.counter-badge.has-items {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Shake animation for max-reached feedback */
.shake {
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

/* Responsive */
@media (max-width: 380px) {
  .picking-header {
    padding: 0.75rem 0.75rem 0.5rem;
  }

  .action-bar {
    padding: 0.75rem 1rem 1rem;
  }
}
</style>
```

- [ ] **Step 2: Verify build passes**

Run: `pnpm build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/CardPickingRing.vue
git commit -m "feat(component): add CardPickingRing with tap-to-pick carousel"
```

---

### Task 5: Wire `CardPickingRing` into `App.vue`

Replace `CardSelection` with `CardPickingRing` as the selecting-phase view.

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: Update App.vue imports and template**

Replace the import of `CardSelection` with `CardPickingRing`:

```typescript
import CardPickingRing from '@/components/CardPickingRing.vue'
```

Remove the old import line:
```typescript
import CardSelection from '@/components/CardSelection.vue'
```

In the template, replace:
```html
<CardSelection v-if="store.gamePhase === 'selecting'" />
```
with:
```html
<CardPickingRing v-if="store.gamePhase === 'selecting'" />
```

- [ ] **Step 2: Verify build passes**

Run: `pnpm build`
Expected: Build succeeds.

- [ ] **Step 3: Visual smoke test**

Run: `pnpm dev`
Open in browser, verify:
- The ring carousel renders with 49 cards
- Swipe gestures work to browse cards
- Tapping the center card toggles selection (checkmark appears, glow ring)
- Counter badge shows "N / 10"
- Tapping counter opens the tray overlay
- Tapping a tray thumbnail closes tray and navigates ring to that card
- Shuffle button reorders cards
- Clear button deselects all
- Confirm button transitions to viewing phase

- [ ] **Step 4: Commit**

```bash
git add src/App.vue
git commit -m "feat: replace CardSelection with CardPickingRing for selecting phase"
```

---

### Task 6: Clean up unused `CardSelection.vue`

The old component is no longer imported anywhere.

**Files:**
- Delete: `src/components/CardSelection.vue`

- [ ] **Step 1: Delete the file**

Run: `rm src/components/CardSelection.vue`

- [ ] **Step 2: Verify build still passes**

Run: `pnpm build`
Expected: Build succeeds (no other files reference CardSelection).

- [ ] **Step 3: Commit**

```bash
git add -A src/components/CardSelection.vue
git commit -m "chore: remove unused CardSelection component"
```
