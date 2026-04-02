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
} = useCardRing({
  cards: computed(() => store.allCards),
})

// --- Selection ---
const trayOpen = ref(false)
const maxReachedShake = ref(false)
const showMaxToast = ref(false)
let maxToastTimer = 0

function triggerMaxReached() {
  maxReachedShake.value = true
  showMaxToast.value = true
  clearTimeout(maxToastTimer)
  maxToastTimer = window.setTimeout(() => {
    maxReachedShake.value = false
    showMaxToast.value = false
  }, 1500)
}

function handleCardTap(index: number) {
  // Always bring tapped card to front
  goTo(index)

  // Select/deselect the tapped card
  const card = store.allCards[index]
  if (!card) return

  if (store.isCardSelected(card.id)) {
    store.toggleCardSelection(card.id)
    return
  }

  if (!store.canSelectMore) {
    triggerMaxReached()
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

    <!-- Max-selection toast -->
    <Transition name="toast">
      <div v-if="showMaxToast" class="max-toast" :style="{ background: 'var(--color-primary)', color: 'var(--color-background)' }">
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>已选满 10 张卡牌</span>
      </div>
    </Transition>

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
          @click.stop="handleCardTap(i)"
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

      <!-- Step navigation -->
      <div class="step-nav">
        <button
          class="step-btn"
          :style="{ color: 'var(--color-text-muted)', background: 'var(--color-surface)' }"
          @click.stop="next()"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          class="step-btn"
          :style="{ color: 'var(--color-text-muted)', background: 'var(--color-surface)' }"
          @click.stop="prev()"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
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

/* Carousel viewport */
.carousel-viewport {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 10vh;
  perspective: 700px;
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

/* Step navigation */
.step-nav {
  display: flex;
  justify-content: center;
  gap: 12rem;
  padding: 1.5rem 1rem 0;
  pointer-events: auto;
}

.step-btn {
  width: 64px;
  height: 64px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: var(--card-shadow);
}

.step-btn svg {
  width: 32px;
  height: 32px;
}

.step-btn:active {
  transform: scale(0.9);
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

/* Max-selection toast */
.max-toast {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  padding-top: calc(env(safe-area-inset-top, 0px) + 1rem);
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.toast-enter-active {
  animation: toast-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  animation: toast-out 0.25s ease-in forwards;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(-100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes toast-out {
  to {
    opacity: 0;
    transform: translateY(-100%);
  }
}
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
