<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useCardGameStore } from '@/stores/cardGame'
import type { Card } from '@/types/card'

const store = useCardGameStore()

// Current visible card index
const currentIndex = ref(0)
const cards = computed(() => store.allCards)

// Touch/drag state - for detecting swipe gesture only, not moving card
const touchStartX = ref(0)
const touchDeltaX = ref(0)
const isDragging = ref(false)

// Animation state
const isAnimating = ref(false)
const animationDirection = ref<'left' | 'right' | null>(null)

// Selected cards display
const selectedCardsRef = ref<HTMLElement | null>(null)

// Computed
const currentCard = computed(() => cards.value[currentIndex.value])
const progress = computed(() => {
  if (cards.value.length === 0) return 0
  return ((currentIndex.value + 1) / cards.value.length) * 100
})

// Swipe indicator (shows arrow while dragging)
const swipeIndicator = computed(() => {
  if (!isDragging.value || Math.abs(touchDeltaX.value) < 30) return null
  return touchDeltaX.value > 0 ? 'prev' : 'next'
})

// Check if a card is selected
function isSelected(cardId: number): boolean {
  return store.selectedCardIds.includes(cardId)
}

// Toggle card selection
function toggleSelection(card: Card) {
  if (isAnimating.value) return

  if (isSelected(card.id)) {
    store.toggleCardSelection(card.id)
  } else {
    if (store.selectedCount >= 10) {
      return
    }
    store.toggleCardSelection(card.id)
  }
}

// Navigate cards with clean slide animation
function goNext() {
  if (currentIndex.value < cards.value.length - 1 && !isAnimating.value) {
    animationDirection.value = 'left'
    isAnimating.value = true
    setTimeout(() => {
      currentIndex.value++
      isAnimating.value = false
      // Keep direction for enter animation
      setTimeout(() => {
        animationDirection.value = null
      }, 300)
    }, 250)
  }
}

function goPrev() {
  if (currentIndex.value > 0 && !isAnimating.value) {
    animationDirection.value = 'right'
    isAnimating.value = true
    setTimeout(() => {
      currentIndex.value--
      isAnimating.value = false
      setTimeout(() => {
        animationDirection.value = null
      }, 300)
    }, 250)
  }
}

// Jump to specific card
function goToCard(index: number) {
  if (index === currentIndex.value || isAnimating.value) return
  animationDirection.value = index > currentIndex.value ? 'left' : 'right'
  isAnimating.value = true
  setTimeout(() => {
    currentIndex.value = index
    isAnimating.value = false
    setTimeout(() => {
      animationDirection.value = null
    }, 300)
  }, 250)
}

// Track if a swipe was performed (to prevent click event)
const didSwipe = ref(false)

// Touch handlers - detect swipe without moving card
function handleTouchStart(e: TouchEvent) {
  if (isAnimating.value) return
  touchStartX.value = e.touches[0].clientX
  isDragging.value = true
  didSwipe.value = false
}

function handleTouchMove(e: TouchEvent) {
  if (!isDragging.value || isAnimating.value) return
  const currentX = e.touches[0].clientX
  touchDeltaX.value = currentX - touchStartX.value
}

function handleTouchEnd(e: Event) {
  if (!isDragging.value || isAnimating.value) return

  const threshold = 50
  const wasSwipe = Math.abs(touchDeltaX.value) >= threshold

  if (touchDeltaX.value < -threshold) {
    didSwipe.value = true
    goNext()
  } else if (touchDeltaX.value > threshold) {
    didSwipe.value = true
    goPrev()
  }

  // Prevent click event from firing after a swipe
  if (wasSwipe) {
    e.preventDefault()
  }

  isDragging.value = false
  touchDeltaX.value = 0
}

// Handle card click - prevent if just swiped
function handleCardClick(card: Card) {
  if (didSwipe.value) {
    didSwipe.value = false
    return
  }
  if (isAnimating.value) return
  toggleSelection(card)
}

// Handle area click (catch-all for preventing clicks after swipe)
function handleAreaClick(e: Event) {
  if (didSwipe.value) {
    e.preventDefault()
    e.stopPropagation()
    didSwipe.value = false
  }
}

// Keyboard navigation
function handleKeydown(e: KeyboardEvent) {
  if (isAnimating.value) return
  if (e.key === 'ArrowLeft') goPrev()
  if (e.key === 'ArrowRight') goNext()
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault()
    if (currentCard.value) toggleSelection(currentCard.value)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Scroll selected cards into view
watch(() => store.selectedCardIds, () => {
  if (selectedCardsRef.value) {
    selectedCardsRef.value.scrollLeft = selectedCardsRef.value.scrollWidth
  }
}, { deep: true })
</script>

<template>
  <div class="selection-view">
    <!-- Ambient Header -->
    <header class="header-sanctuary">
      <h1 class="font-display text-xl sm:text-2xl text-warm-brown">
        选择你的卡牌
      </h1>
      <p class="font-body text-sm text-warm-brown-60 mt-1">
        浏览卡牌，选择 1-10 张与你共鸣的
      </p>

      <!-- Progress indicator -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="font-card text-xs text-warm-brown-40 mt-2">
        {{ currentIndex + 1 }} / {{ cards.length }}
      </p>
    </header>

    <!-- Selected Cards Tray -->
    <section v-if="store.selectedCount > 0" class="selected-tray">
      <div class="tray-header">
        <span class="font-card text-xs text-warm-brown-60">已选择</span>
        <span class="count-badge">{{ store.selectedCount }} / 10</span>
      </div>
      <div ref="selectedCardsRef" class="selected-cards-scroll">
        <div
          v-for="card in store.selectedCards"
          :key="card.id"
          class="selected-card-chip"
          @click="toggleSelection(card)"
        >
          <span class="chip-text font-card">{{ card.frontText.slice(0, 6) }}...</span>
          <span class="chip-remove">×</span>
        </div>
      </div>
    </section>

    <!-- Card Display Area -->
    <section
      class="card-display-area"
      @touchstart.passive="handleTouchStart"
      @touchmove.passive="handleTouchMove"
      @touchend="handleTouchEnd"
      @click.capture="handleAreaClick"
    >
      <!-- Current card (main) -->
      <Transition :name="animationDirection ? 'slide-' + animationDirection : 'fade-scale'">
        <div
          v-if="currentCard && !isAnimating"
          :key="currentCard.id"
          class="current-card"
          :class="{ 'selected': isSelected(currentCard.id) }"
          @click.stop="handleCardClick(currentCard)"
        >
          <!-- Card content -->
          <div class="card-face">
            <div class="paper-texture"></div>
            <div class="card-content">
              <p class="font-card text-center leading-relaxed">
                {{ currentCard.frontText }}
              </p>
            </div>

            <!-- Selection indicator -->
            <div class="selection-toggle" :class="{ 'is-selected': isSelected(currentCard.id) }">
              <svg v-if="isSelected(currentCard.id)" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span v-else class="plus-icon">+</span>
            </div>

            <!-- Card number -->
            <div class="card-number font-display">
              {{ currentCard.id }}
            </div>
          </div>
        </div>
      </Transition>

      <!-- Animating card (exiting) -->
      <Transition :name="'slide-' + animationDirection + '-out'">
        <div
          v-if="isAnimating"
          :key="'exiting'"
          class="current-card exiting"
          :class="{ 'selected': isSelected(cards[currentIndex - (animationDirection === 'left' ? 1 : -1)]?.id) }"
        >
          <div class="card-face">
            <div class="paper-texture"></div>
            <div class="card-content">
              <p class="font-card text-center leading-relaxed">
                {{ cards[currentIndex - (animationDirection === 'left' ? 1 : -1)]?.frontText }}
              </p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Swipe indicator arrows -->
      <Transition name="fade">
        <div v-if="swipeIndicator === 'prev'" class="swipe-indicator prev">
          <span class="arrow">‹</span>
          <span class="label font-body">上一张</span>
        </div>
        <div v-else-if="swipeIndicator === 'next'" class="swipe-indicator next">
          <span class="label font-body">下一张</span>
          <span class="arrow">›</span>
        </div>
      </Transition>

      <!-- Navigation arrows (desktop) -->
      <button
        v-if="currentIndex > 0"
        class="nav-arrow prev"
        @click="goPrev"
        :disabled="isAnimating"
      >
        <span>‹</span>
      </button>
      <button
        v-if="currentIndex < cards.length - 1"
        class="nav-arrow next"
        @click="goNext"
        :disabled="isAnimating"
      >
        <span>›</span>
      </button>

      <!-- Swipe hint (first card only) -->
      <div v-if="currentIndex === 0 && !isDragging && !swipeIndicator" class="swipe-hint">
        <span class="hint-icon">→</span>
        <span class="hint-text font-body text-xs">左右滑动浏览</span>
      </div>
    </section>

    <!-- Navigation Dots -->
    <nav class="nav-dots">
      <button
        class="nav-dot"
        :class="{ 'active': currentIndex === i }"
        v-for="(_, i) in cards"
        :key="i"
        @click="goToCard(i)"
      ></button>
    </nav>

    <!-- Action Altar -->
    <footer class="action-altar">
      <button
        class="btn-sanctuary outline"
        :disabled="store.selectedCount === 0"
        @click="store.resetSelection"
      >
        <span class="font-card">清空选择</span>
      </button>

      <button
        class="btn-sanctuary glow-pulse"
        :disabled="store.selectedCount < 1"
        @click="store.confirmSelection"
      >
        <span class="font-card">确认选择 ({{ store.selectedCount }})</span>
      </button>
    </footer>
  </div>
</template>

<style scoped>
.selection-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 1rem 1.5rem 7rem;
}

/* Header */
.header-sanctuary {
  text-align: center;
  padding: 1.5rem 1rem 1rem;
}

.progress-bar {
  width: 100%;
  max-width: 200px;
  height: 4px;
  background: var(--cream-300);
  border-radius: var(--radius-full);
  margin: 1rem auto 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--terracotta-light), var(--honey));
  border-radius: var(--radius-full);
  transition: width 0.3s var(--transition-smooth);
}

/* Selected Cards Tray */
.selected-tray {
  background: linear-gradient(180deg, var(--cream-200) 0%, transparent 100%);
  border-radius: var(--radius-lg);
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.tray-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.count-badge {
  background: var(--terracotta);
  color: white;
  font-size: 10px;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-full);
  font-weight: 600;
}

.selected-cards-scroll {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 0.25rem;
}

.selected-cards-scroll::-webkit-scrollbar {
  display: none;
}

.selected-card-chip {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: white;
  border: 1px solid var(--cream-300);
  border-radius: var(--radius-full);
  padding: 0.375rem 0.625rem;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}

.selected-card-chip:hover {
  background: var(--cream-200);
  border-color: var(--terracotta-light);
}

.chip-text {
  font-size: 11px;
  color: var(--warm-brown);
}

.chip-remove {
  color: var(--warm-brown-light);
  font-size: 14px;
  font-weight: 300;
}

/* Card Display Area */
.card-display-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  touch-action: pan-y;
  min-height: 320px;
  padding: 0 3rem;
}

/* Current Card */
.current-card {
  position: absolute;
  cursor: pointer;
  transition: transform 0.3s var(--transition-smooth);
}

.current-card:hover {
  transform: translateY(-4px);
}

.current-card.exiting {
  z-index: 5;
}

.current-card:not(.exiting) {
  z-index: 10;
}

/* Card Face */
.card-face {
  width: 240px;
  height: 300px;
  background: linear-gradient(145deg, var(--cream-100) 0%, #ffffff 100%);
  border-radius: var(--radius-lg);
  border: 1px solid var(--cream-300);
  box-shadow:
    0 8px 32px rgba(92, 72, 54, 0.15),
    0 2px 8px rgba(92, 72, 54, 0.1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.current-card.selected .card-face {
  border-color: var(--terracotta);
  box-shadow:
    0 8px 32px rgba(196, 133, 108, 0.25),
    0 0 0 3px var(--terracotta-light);
}

.card-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
}

.card-content p {
  font-size: 1.125rem;
  color: var(--warm-brown);
  line-height: 1.6;
}

/* Paper texture */
.paper-texture {
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='1'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
}

/* Selection toggle button */
.selection-toggle {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--cream-200);
  border: 2px solid var(--cream-300);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s var(--transition-smooth);
}

.selection-toggle:hover {
  transform: scale(1.1);
}

.selection-toggle.is-selected {
  background: var(--terracotta);
  border-color: var(--terracotta-dark);
}

.check-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: white;
}

.plus-icon {
  font-size: 1.5rem;
  color: var(--warm-brown-light);
  font-weight: 300;
}

/* Card number */
.card-number {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: var(--cream-300);
  opacity: 0.6;
}

/* Swipe Indicator */
.swipe-indicator {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-full);
  box-shadow: 0 4px 12px rgba(92, 72, 54, 0.15);
  z-index: 20;
}

.swipe-indicator.prev {
  left: 0;
}

.swipe-indicator.next {
  right: 0;
}

.swipe-indicator .arrow {
  font-size: 1.5rem;
  color: var(--terracotta);
  font-weight: 300;
}

.swipe-indicator .label {
  font-size: 0.75rem;
  color: var(--warm-brown);
}

/* Navigation Arrows (Desktop) */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: white;
  border: 1px solid var(--cream-300);
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--warm-brown);
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 15;
}

.nav-arrow:hover {
  background: var(--cream-200);
  border-color: var(--terracotta);
  color: var(--terracotta);
}

.nav-arrow.prev {
  left: 0.5rem;
}

.nav-arrow.next {
  right: 0.5rem;
}

@media (min-width: 640px) {
  .nav-arrow {
    display: flex;
  }
}

/* Swipe hint */
.swipe-hint {
  position: absolute;
  bottom: -2.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: hint-bounce 1.5s ease-in-out infinite;
}

.hint-icon {
  font-size: 1rem;
  color: var(--terracotta);
}

.hint-text {
  color: var(--warm-brown-light);
}

@keyframes hint-bounce {
  0%, 100% { transform: translateX(-50%) translateX(0); }
  50% { transform: translateX(-50%) translateX(10px); }
}

/* Navigation dots */
.nav-dots {
  display: flex;
  justify-content: center;
  gap: 0.375rem;
  padding: 1rem;
  flex-wrap: wrap;
  max-width: 320px;
  margin: 0 auto;
}

.nav-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cream-300);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-dot.active {
  background: var(--terracotta);
  transform: scale(1.5);
}

.nav-dot:hover:not(.active) {
  background: var(--cream-200);
}

/* Action Altar */
.action-altar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.5rem;
  background: linear-gradient(to top, var(--cream-100) 70%, transparent);
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.25s ease;
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

/* Slide left animation (going to next card) */
.slide-left-enter-active {
  transition: all 0.25s ease-out;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-left-out-leave-active {
  transition: all 0.25s ease-in;
}

.slide-left-out-leave-to {
  opacity: 0;
  transform: translateX(-80px);
}

/* Slide right animation (going to prev card) */
.slide-right-enter-active {
  transition: all 0.25s ease-out;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-out-leave-active {
  transition: all 0.25s ease-in;
}

.slide-right-out-leave-to {
  opacity: 0;
  transform: translateX(80px);
}

/* Text utilities */
.text-warm-brown {
  color: var(--warm-brown);
}

.text-warm-brown-40 {
  color: var(--warm-brown);
  opacity: 0.4;
}

.text-warm-brown-60 {
  color: var(--warm-brown);
  opacity: 0.6;
}

/* Responsive */
@media (max-width: 380px) {
  .card-face {
    width: 200px;
    height: 260px;
  }

  .card-content p {
    font-size: 1rem;
  }

  .card-display-area {
    padding: 0 1rem;
  }
}

@media (min-width: 640px) {
  .card-face {
    width: 280px;
    height: 350px;
  }

  .card-content p {
    font-size: 1.25rem;
  }
}
</style>
