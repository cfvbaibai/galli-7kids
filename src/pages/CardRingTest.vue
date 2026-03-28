<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDrag } from '@vueuse/gesture'
import { useEventListener } from '@vueuse/core'

// --- Test data ---
const CARD_COUNT = 10
const RADIUS = 220
const CARD_ANGLE = 360 / CARD_COUNT

const testCards = Array.from({ length: CARD_COUNT }, (_, i) => ({
  id: i + 1,
  text: `Card ${i + 1}`,
  color: `hsl(${i * 36}, 60%, 80%)`,
}))

// --- Ring state ---
const ringRotation = ref(0)
const baseRotation = ref(0)
let inertiaRaf = 0

const activeIndex = computed(() => {
  const r = ringRotation.value
  if (typeof r !== 'number' || isNaN(r)) return 0
  const normalized = (((-r) % 360) + 360) % 360
  const idx = Math.round(normalized / CARD_ANGLE) % CARD_COUNT
  return Math.max(0, Math.min(CARD_COUNT - 1, idx))
})

// --- Inertia animation via rAF ---
function startInertia(from: number, velocity: number) {
  cancelAnimationFrame(inertiaRaf)

  const friction = 0.94 // deceleration per frame (0-1, higher = more coast)
  let currentRotation = from
  let currentVelocity = velocity // degrees per frame

  function tick() {
    currentVelocity *= friction
    currentRotation += currentVelocity

    ringRotation.value = currentRotation

    // Stop when velocity is negligible
    if (Math.abs(currentVelocity) < 0.3) {
      // Snap to nearest card
      const nearest = Math.round(currentRotation / CARD_ANGLE) * CARD_ANGLE
      snapTo(nearest)
      return
    }

    inertiaRaf = requestAnimationFrame(tick)
  }

  inertiaRaf = requestAnimationFrame(tick)
}

// Smooth snap to target using ease-out
function snapTo(target: number) {
  const start = ringRotation.value
  const distance = target - start
  const duration = 300 // ms
  const startTime = performance.now()

  function tick(now: number) {
    const elapsed = now - startTime
    const t = Math.min(elapsed / duration, 1)
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - t, 3)

    ringRotation.value = start + distance * eased

    if (t < 1) {
      inertiaRaf = requestAnimationFrame(tick)
    }
  }

  inertiaRaf = requestAnimationFrame(tick)
}

// --- Stop inertia on any touch/pointer press (before useDrag threshold) ---
const ringRef = ref<HTMLElement | null>(null)
useEventListener(ringRef, 'pointerdown', () => {
  cancelAnimationFrame(inertiaRaf)
})

// --- Gesture ---
const lastPositions: number[] = []
const lastTimes: number[] = []

useDrag(
  (state) => {
    const { movement, active, first, last, xy } = state

    if (first) {
      cancelAnimationFrame(inertiaRaf)
      baseRotation.value = ringRotation.value
      lastPositions.length = 0
      lastTimes.length = 0
    }

    if (active) {
      ringRotation.value = baseRotation.value + movement[0] * 0.5

      // Track recent positions for velocity calculation
      lastPositions.push(xy[0])
      lastTimes.push(performance.now())
      // Keep only last 5 samples
      if (lastPositions.length > 5) {
        lastPositions.shift()
        lastTimes.shift()
      }
    }

    if (last) {
      // Try library velocity first (vxvy = per-axis velocity in px/ms)
      // Fall back to manual calculation
      let velocity = 0
      const vxvy = (state as any).vxvy as number[] | undefined
      if (vxvy && typeof vxvy[0] === 'number' && !isNaN(vxvy[0])) {
        velocity = vxvy[0] * 0.5 * 16 // px/ms → deg/frame
        console.log('[ring] using library vxvy:', vxvy[0], '→ velocity:', velocity)
      } else if (lastPositions.length >= 2) {
        const n = lastPositions.length
        const dx = lastPositions[n - 1] - lastPositions[0]
        const dt = lastTimes[n - 1] - lastTimes[0]
        if (dt > 0) {
          velocity = (dx / dt) * 16 * 0.5 // px/ms → deg/frame
        }
        console.log('[ring] using manual velocity:', velocity, 'from', n, 'samples')
      }

      console.log('[ring] state keys:', Object.keys(state).filter(k => {
        const v = (state as any)[k]
        return typeof v === 'number' || (Array.isArray(v) && v.length > 0 && typeof v[0] === 'number')
      }))

      console.log('[ring] release:', {
        currentRotation: ringRotation.value,
        velocity,
        samples: lastPositions.length,
      })

      if (Math.abs(velocity) > 0.5) {
        startInertia(ringRotation.value, velocity)
      } else {
        // Just snap to nearest card
        const nearest = Math.round(ringRotation.value / CARD_ANGLE) * CARD_ANGLE
        snapTo(nearest)
      }
    }
  },
  {
    domTarget: ringRef,
    axis: 'x',
    eventOptions: { passive: false },
  }
)

// --- Card transform for position in ring ---
function cardStyle(index: number) {
  const angle = index * CARD_ANGLE
  return {
    transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
    transformStyle: 'preserve-3d' as const,
    backfaceVisibility: 'hidden' as const,
  }
}

// --- Card visual prominence based on distance from front ---
function cardClasses(index: number) {
  return {
    'is-active': activeIndex.value === index,
  }
}
</script>

<template>
  <div class="ring-test">
    <header class="test-header">
      <h1>3D Card Ring Test</h1>
      <p>Drag left/right to rotate the ring</p>
      <div class="state-panel">
        <span>Rotation: {{ ringRotation.toFixed(1) }}°</span>
        <span>Active: Card {{ activeIndex + 1 }}</span>
      </div>
    </header>

    <!-- 3D Ring -->
    <div class="ring-viewport">
      <div ref="ringRef" class="ring-container" :style="{ transform: `rotateY(${ringRotation}deg)` }">
        <div
          v-for="(card, i) in testCards"
          :key="card.id"
          class="ring-card"
          :class="cardClasses(i)"
          :style="cardStyle(i)"
        >
          <div class="card-inner" :style="{ background: card.color }">
            <span class="card-number">{{ card.id }}</span>
            <span class="card-label">{{ card.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Active card detail -->
    <div class="active-detail">
      <div class="detail-card" :style="{ background: testCards[activeIndex]?.color ?? '#eee' }">
        <span class="detail-number">#{{ testCards[activeIndex]?.id ?? '?' }}</span>
        <span class="detail-text">{{ testCards[activeIndex]?.text ?? '...' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ring-test {
  font-family: 'Nunito', sans-serif;
  min-height: 100vh;
  background: #faf6f1;
  color: #3d3629;
  display: flex;
  flex-direction: column;
}

.test-header {
  text-align: center;
  padding: 1.5rem 1rem 0.5rem;
}

.test-header h1 {
  font-size: 1.25rem;
  margin: 0;
}

.test-header p {
  font-size: 0.8rem;
  opacity: 0.5;
  margin: 0.25rem 0;
}

.state-panel {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  font-family: monospace;
}

/* Ring viewport */
.ring-viewport {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  min-height: 400px;
  overflow: hidden;
  touch-action: pan-y;
}

.ring-container {
  position: relative;
  width: 160px;
  height: 200px;
  transform-style: preserve-3d;
  transition: none;
}

/* Individual card in ring */
.ring-card {
  position: absolute;
  width: 160px;
  height: 200px;
  left: 0;
  top: 0;
  cursor: grab;
}

.ring-card:active {
  cursor: grabbing;
}

.card-inner {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.6);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.ring-card.is-active .card-inner {
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.25);
  border-color: #c4846c;
}

.card-number {
  font-size: 2rem;
  font-weight: 700;
  opacity: 0.6;
}

.card-label {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Active card detail */
.active-detail {
  padding: 1.5rem;
  display: flex;
  justify-content: center;
}

.detail-card {
  padding: 1rem 2rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  justify-content: center;
}

.detail-number {
  font-weight: 700;
  font-size: 1.1rem;
}

.detail-text {
  font-size: 1rem;
}
</style>
