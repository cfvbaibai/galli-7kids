<script setup lang="ts">
import { ref, computed } from 'vue'

// --- Test data ---
const testCards = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  text: `Card ${i + 1}`,
}))

// --- State ---
const currentIndex = ref(0)
const selectedIds = ref<Set<number>>(new Set())

// --- Touch tracking (same as CardSelection.vue) ---
const touchStartX = ref(0)
const touchDeltaX = ref(0)
const isDragging = ref(false)
const isAnimating = ref(false)
const animationDirection = ref<'left' | 'right' | null>(null)
const didSwipe = ref(false)
const usePassive = ref(true) // toggle: passive vs non-passive

// --- Debug log ---
interface LogEntry {
  time: number
  event: string
  detail: string
  color: string
}
const logs = ref<LogEntry[]>([])
const maxLogs = 50

function addLog(event: string, detail: string, color = '#3d3629') {
  const now = performance.now()
  logs.value.push({ time: now, event, detail, color })
  if (logs.value.length > maxLogs) logs.value.shift()
}

function clearLogs() {
  logs.value = []
}

// --- Navigation (same as CardSelection.vue) ---
function goNext() {
  if (currentIndex.value < testCards.length - 1 && !isAnimating.value) {
    animationDirection.value = 'left'
    isAnimating.value = true
    setTimeout(() => {
      currentIndex.value++
      isAnimating.value = false
      setTimeout(() => { animationDirection.value = null }, 300)
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
      setTimeout(() => { animationDirection.value = null }, 300)
    }, 250)
  }
}

// --- Touch handlers (exact replica of CardSelection.vue pattern) ---
function handleTouchStart(e: TouchEvent) {
  if (isAnimating.value) return
  touchStartX.value = e.touches[0].clientX
  isDragging.value = true
  didSwipe.value = false
  addLog('touchstart', `x=${e.touches[0].clientX.toFixed(0)}, passive=${usePassive.value}`, '#8fa68a')
}

function handleTouchMove(e: TouchEvent) {
  if (!isDragging.value || isAnimating.value) return
  const currentX = e.touches[0].clientX
  touchDeltaX.value = currentX - touchStartX.value
  addLog('touchmove', `x=${currentX.toFixed(0)}, delta=${touchDeltaX.value.toFixed(0)}`, '#8fa5b5')
}

function handleTouchEnd(e: Event) {
  if (!isDragging.value || isAnimating.value) return

  const threshold = 50
  const wasSwipe = Math.abs(touchDeltaX.value) >= threshold

  if (touchDeltaX.value < -threshold) {
    didSwipe.value = true
    goNext()
    addLog('touchend', `SWIPE LEFT delta=${touchDeltaX.value.toFixed(0)} >= ${threshold} => goNext()`, '#c47a5e')
  } else if (touchDeltaX.value > threshold) {
    didSwipe.value = true
    goPrev()
    addLog('touchend', `SWIPE RIGHT delta=${touchDeltaX.value.toFixed(0)} >= ${threshold} => goPrev()`, '#c47a5e')
  } else {
    addLog('touchend', `NO SWIPE delta=${touchDeltaX.value.toFixed(0)} < ${threshold}`, '#8fa68a')
  }

  if (wasSwipe) {
    const result = e.preventDefault()
    addLog('preventDefault', `called on touchend, returned=${String(result)}`, result === undefined ? '#c47a5e' : '#8fa68a')
  }

  isDragging.value = false
  touchDeltaX.value = 0
}

// --- Click handler (same pattern) ---
function handleCardClick(cardId: number) {
  if (didSwipe.value) {
    addLog('CLICK BLOCKED', `didSwipe=true, preventing selection of card ${cardId}`, '#c47a5e')
    didSwipe.value = false
    return
  }
  addLog('CLICK', `toggling selection of card ${cardId}`, '#8fa68a')
  if (selectedIds.value.has(cardId)) {
    selectedIds.value.delete(cardId)
  } else {
    selectedIds.value.add(cardId)
  }
  // Force reactivity
  selectedIds.value = new Set(selectedIds.value)
}

function handleAreaClick(e: Event) {
  if (didSwipe.value) {
    addLog('AREA CLICK BLOCKED', `didSwipe=true, stopping propagation`, '#c47a5e')
    e.preventDefault()
    e.stopPropagation()
    didSwipe.value = false
  }
}

// --- Computed display ---
const currentCard = computed(() => testCards[currentIndex.value])
const currentSelected = computed(() => selectedIds.value.has(currentCard.value.id))
const logDisplay = computed(() => logs.value.map(l => ({
  ...l,
  relativeTime: l.time - (logs.value[0]?.time ?? l.time),
})))
</script>

<template>
  <div class="swipe-test">
    <!-- Header -->
    <header class="test-header">
      <h1>Swipe Gesture Test</h1>
      <p>Debug page for swipe vs click conflict</p>

      <!-- Controls -->
      <div class="controls">
        <label class="toggle">
          <input type="checkbox" v-model="usePassive" />
          <span>Passive listeners (.passive)</span>
        </label>
        <button class="btn-clear" @click="clearLogs">Clear Log</button>
      </div>

      <!-- State display -->
      <div class="state-panel">
        <div class="state-item">
          <span class="state-label">Index:</span>
          <span class="state-value">{{ currentIndex }}</span>
        </div>
        <div class="state-item">
          <span class="state-label">Card:</span>
          <span class="state-value">{{ currentCard.text }}</span>
        </div>
        <div class="state-item">
          <span class="state-label">Selected:</span>
          <span class="state-value" :class="{ 'is-true': currentSelected }">{{ currentSelected }}</span>
        </div>
        <div class="state-item">
          <span class="state-label">didSwipe:</span>
          <span class="state-value" :class="{ 'is-true': didSwipe }">{{ didSwipe }}</span>
        </div>
        <div class="state-item">
          <span class="state-label">isDragging:</span>
          <span class="state-value">{{ isDragging }}</span>
        </div>
        <div class="state-item">
          <span class="state-label">isAnimating:</span>
          <span class="state-value">{{ isAnimating }}</span>
        </div>
      </div>
    </header>

    <!-- Card Area -->
    <section
      class="card-area"
      v-bind="usePassive
        ? { onTouchstartPassive: handleTouchStart, onTouchmovePassive: handleTouchMove }
        : { onTouchstart: handleTouchStart, onTouchmove: handleTouchMove }
      "
      @touchend="handleTouchEnd"
      @click.capture="handleAreaClick"
    >
      <Transition :name="animationDirection ? 'slide-' + animationDirection : 'fade-scale'">
        <div
          v-if="!isAnimating"
          :key="currentCard.id"
          class="test-card"
          :class="{ selected: currentSelected }"
          :style="{ transform: isDragging ? `translateX(${touchDeltaX}px) rotate(${touchDeltaX * 0.05}deg)` : undefined, transition: isDragging ? 'none' : undefined }"
          @click.stop="handleCardClick(currentCard.id)"
        >
          <div class="card-id">#{{ currentCard.id }}</div>
          <div class="card-text">{{ currentCard.text }}</div>
          <div class="card-select-hint">{{ currentSelected ? 'Selected' : 'Tap to select' }}</div>
        </div>
      </Transition>

      <p class="swipe-hint-text">Swipe left/right to navigate. Tap to select.</p>
    </section>

    <!-- Navigation dots -->
    <nav class="nav-dots">
      <button
        v-for="(_, i) in testCards"
        :key="i"
        class="dot"
        :class="{ active: currentIndex === i }"
        @click="currentIndex = i"
      >{{ i + 1 }}</button>
    </nav>

    <!-- Debug Log -->
    <section class="debug-log">
      <h2>Event Log</h2>
      <div class="log-container" ref="logContainer">
        <div
          v-for="(entry, i) in logDisplay"
          :key="i"
          class="log-entry"
          :style="{ borderLeftColor: entry.color }"
        >
          <span class="log-time">{{ entry.relativeTime.toFixed(1) }}ms</span>
          <span class="log-event" :style="{ color: entry.color }">{{ entry.event }}</span>
          <span class="log-detail">{{ entry.detail }}</span>
        </div>
        <div v-if="logs.length === 0" class="log-empty">
          Touch or click the card area to see events here
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.swipe-test {
  font-family: 'Nunito', sans-serif;
  min-height: 100vh;
  background: #faf6f1;
  color: #3d3629;
  padding: 1rem;
  box-sizing: border-box;
}

.test-header {
  text-align: center;
  margin-bottom: 1rem;
}

.test-header h1 {
  font-size: 1.25rem;
  margin: 0;
  font-weight: 600;
}

.test-header p {
  font-size: 0.8rem;
  opacity: 0.6;
  margin: 0.25rem 0;
}

/* Controls */
.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.75rem;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
}

.toggle input {
  accent-color: #c4846c;
}

.btn-clear {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border: 1px solid #e8ddd1;
  border-radius: 9999px;
  background: white;
  cursor: pointer;
  color: #3d3629;
}

.btn-clear:active {
  background: #e8ddd1;
}

/* State panel */
.state-panel {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e8ddd1;
}

.state-item {
  font-size: 0.75rem;
  font-family: monospace;
}

.state-label {
  opacity: 0.5;
}

.state-value {
  font-weight: 600;
}

.state-value.is-true {
  color: #c47a5e;
}

/* Card area */
.card-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  position: relative;
  touch-action: pan-y;
  padding: 1rem;
}

.test-card {
  width: 180px;
  height: 220px;
  background: linear-gradient(145deg, #faf6f1, white);
  border-radius: 12px;
  border: 2px solid #e8ddd1;
  box-shadow: 0 4px 16px rgba(92, 72, 54, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.3s ease;
  user-select: none;
  -webkit-user-select: none;
}

.test-card.selected {
  border-color: #c4846c;
  box-shadow: 0 4px 16px rgba(196, 133, 108, 0.25), 0 0 0 3px rgba(196, 133, 108, 0.2);
}

.card-id {
  font-size: 2rem;
  font-weight: 600;
  opacity: 0.3;
}

.card-text {
  font-size: 1.1rem;
  font-weight: 500;
}

.card-select-hint {
  font-size: 0.7rem;
  opacity: 0.4;
}

.swipe-hint-text {
  font-size: 0.75rem;
  opacity: 0.3;
  margin-top: 1rem;
}

/* Nav dots */
.nav-dots {
  display: flex;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.75rem;
  flex-wrap: wrap;
}

.dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #e8ddd1;
  background: white;
  font-size: 0.65rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.dot.active {
  background: #c4846c;
  color: white;
  border-color: #c4846c;
}

/* Debug log */
.debug-log {
  margin-top: 1rem;
}

.debug-log h2 {
  font-size: 0.9rem;
  margin: 0 0 0.5rem;
  font-weight: 600;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e8ddd1;
  border-radius: 8px;
  padding: 0.5rem;
}

.log-entry {
  display: flex;
  gap: 0.5rem;
  padding: 0.25rem 0;
  border-left: 3px solid #e8ddd1;
  padding-left: 0.5rem;
  font-family: monospace;
  font-size: 0.7rem;
  line-height: 1.4;
}

.log-time {
  color: #999;
  min-width: 50px;
}

.log-event {
  font-weight: 600;
  min-width: 120px;
}

.log-detail {
  color: #666;
  word-break: break-all;
}

.log-empty {
  text-align: center;
  padding: 2rem;
  font-size: 0.8rem;
  opacity: 0.4;
}

/* Animations */
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

.slide-left-enter-active {
  transition: all 0.25s ease-out;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-right-enter-active {
  transition: all 0.25s ease-out;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}
</style>
