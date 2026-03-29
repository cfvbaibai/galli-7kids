<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { themes } from '@/themes'
import type { ColorMode } from '@/themes'
import type { DarkRoomChild } from '@/types/card'
import { cards } from '@/data/cards'
import chroma from 'chroma-js'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.init()
})

// Character colors
const charColors: Record<DarkRoomChild, string> = {
  seductress: '#ddcb2d',
  smallone: '#dadeda',
  sleepyhead: '#ab2d2f',
  showoff: '#1c97b2',
  aggressive: '#35965c',
  miser: '#235789',
  gossip: '#b35c2f',
}

function charColor(char: DarkRoomChild) {
  return charColors[char]
}

function textColorFor(bgHex: string): string {
  const needsLightText = chroma.contrast(bgHex, 'white') >= 3
  const lightColor = themeStore.isDark ? 'var(--color-text)' : 'var(--color-background)'
  const darkColor = themeStore.isDark ? 'var(--color-background)' : 'var(--color-text)'
  return needsLightText ? lightColor : darkColor
}

function nameBarStyle(char: DarkRoomChild) {
  const bg = charColors[char]
  return { background: bg, color: textColorFor(bg) }
}

function setColorMode(mode: ColorMode) {
  themeStore.setColorMode(mode)
}

const colorModes: { value: ColorMode; label: string }[] = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

// --- Carousel state ---
const CARD_COUNT = 49
const activeIndex = ref(0)
const BASE_OFFSET = 170

const animatedIndex = ref(0)
let animRaf = 0

function animateTo(target: number) {
  cancelAnimationFrame(animRaf)
  const start = animatedIndex.value
  // Shortest path around the cycle
  let distance = target - start
  if (distance > CARD_COUNT / 2) distance -= CARD_COUNT
  if (distance < -CARD_COUNT / 2) distance += CARD_COUNT
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
  activeIndex.value = ((index % CARD_COUNT) + CARD_COUNT) % CARD_COUNT
  animateTo(activeIndex.value)
}

function prev() { goTo(activeIndex.value - 1) }
function next() { goTo(activeIndex.value + 1) }

// --- Gesture ---
let dragStartX = 0
let dragStartIndex = 0
let isDragging = false
const lastPositions: number[] = []
const lastTimes: number[] = []

function onPointerDown(e: PointerEvent) {
  cancelAnimationFrame(animRaf)
  isDragging = true
  dragStartX = e.clientX
  dragStartIndex = animatedIndex.value
  lastPositions.length = 0
  lastTimes.length = 0
  lastPositions.push(e.clientX)
  lastTimes.push(performance.now())
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging) return
  const dx = e.clientX - dragStartX
  animatedIndex.value = dragStartIndex - dx / BASE_OFFSET

  lastPositions.push(e.clientX)
  lastTimes.push(performance.now())
  if (lastPositions.length > 5) {
    lastPositions.shift()
    lastTimes.shift()
  }
}

function onPointerUp() {
  if (!isDragging) return
  isDragging = false

  let velocity = 0
  if (lastPositions.length >= 2) {
    const n = lastPositions.length
    const recency = performance.now() - lastTimes[n - 1]
    if (recency < 150) {
      const dx = lastPositions[n - 1] - lastPositions[0]
      const dt = lastTimes[n - 1] - lastTimes[0]
      if (dt > 0) velocity = -dx / dt * 16 / BASE_OFFSET * 16
    }
  }

  const projected = animatedIndex.value + velocity * 8
  const nearest = Math.round(projected)
  activeIndex.value = ((nearest % CARD_COUNT) + CARD_COUNT) % CARD_COUNT
  animateTo(activeIndex.value)
}

// --- Flip state ---
const flippedCards = ref<Set<number>>(new Set())

function toggleFlip(id: number) {
  if (flippedCards.value.has(id)) flippedCards.value.delete(id)
  else flippedCards.value.add(id)
}

// --- Visible cards ---
const VISIBLE_SIDE = 4
const visibleIndices = computed(() => {
  const center = Math.round(animatedIndex.value)
  const indices: number[] = []
  for (let offset = -VISIBLE_SIDE; offset <= VISIBLE_SIDE; offset++) {
    indices.push(((center + offset) % CARD_COUNT + CARD_COUNT) % CARD_COUNT)
  }
  return indices
})

// --- Card style ---
function cardStyle(index: number) {
  let offset = index - animatedIndex.value
  // Shortest path around the cycle for visual offset
  if (offset > CARD_COUNT / 2) offset -= CARD_COUNT
  if (offset < -CARD_COUNT / 2) offset += CARD_COUNT
  const absOffset = Math.abs(offset)

  const x = offset * BASE_OFFSET
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
  let offset = index - animatedIndex.value
  if (offset > CARD_COUNT / 2) offset -= CARD_COUNT
  if (offset < -CARD_COUNT / 2) offset += CARD_COUNT

  const ro = -offset // reversed direction
  const absRo = Math.abs(ro)

  const x = ro * BASE_OFFSET
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

const currentTheme = computed(() => themes[themeStore.activeTheme])
const activeCard = computed(() => cards[activeIndex.value])
</script>

<template>
  <div class="ring-test" :style="{ background: 'var(--app-bg)', fontFamily: 'var(--font-body)' }">
    <header class="test-header">
      <h1 :style="{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }">Card Carousel</h1>
      <p class="subtitle" :style="{ color: 'var(--color-text-muted)' }">49 Cards · Swipe to browse · Click to flip · Cycles endlessly</p>
      <div class="mode-switcher">
        <button
          v-for="mode in colorModes"
          :key="mode.value"
          class="mode-btn"
          :class="{ active: themeStore.colorMode === mode.value }"
          :style="{
            background: themeStore.colorMode === mode.value ? 'var(--color-text)' : 'var(--color-surface)',
            color: themeStore.colorMode === mode.value ? 'var(--color-background)' : 'var(--color-text)',
          }"
          @click="setColorMode(mode.value)"
        >
          {{ mode.label }}
        </button>
      </div>
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
          :key="cards[i].id"
          class="carousel-card"
          :class="{ 'is-active': activeIndex === i }"
          :style="cardStyle(i)"
          @click.stop="toggleFlip(cards[i].id)"
        >
          <div class="card-flipper" :class="{ 'is-flipped': flippedCards.has(cards[i].id) }">
            <!-- FRONT -->
            <div class="card-face card-front" :style="{ background: 'var(--card-front-bg)' }">
              <div v-if="currentTheme.effects.texture === 'grain'" class="grain"></div>
              <div class="front-accent" :style="{ background: 'var(--color-primary)' }"></div>
              <span class="card-num" :style="{ color: 'var(--color-text-muted)' }">{{ cards[i].id }}</span>
              <p class="front-text" :style="{ fontFamily: 'var(--font-card)', color: 'var(--color-text)' }">
                {{ cards[i].frontText }}
              </p>
              <div class="front-deco" :style="{ borderColor: 'var(--color-text-muted)' }"></div>
            </div>
            <!-- BACK -->
            <div class="card-face card-back" :style="{ background: 'var(--card-back-bg)' }">
              <div v-if="currentTheme.effects.texture === 'grain'" class="grain"></div>
              <div class="back-border" :style="{ borderColor: charColor(cards[i].backCharacter) }"></div>
              <img
                :src="cards[i].backImage"
                :alt="cards[i].characterName"
                class="back-image"
                loading="lazy"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
              <div class="back-name-bar" :style="nameBarStyle(cards[i].backCharacter)">
                <span class="back-name">{{ cards[i].characterName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Nav + detail -->
    <div class="bottom-bar">
      <button class="nav-btn" :style="{ color: 'var(--color-text)' }" @click="prev">
        &#9664;
      </button>
      <div class="detail-card" :style="{ background: 'var(--color-surface)', color: 'var(--color-text)' }">
        <span class="detail-number">#{{ activeCard?.id }}</span>
        <span class="detail-text">{{ activeCard?.frontText }}</span>
      </div>
      <button class="nav-btn" :style="{ color: 'var(--color-text)' }" @click="next">
        &#9654;
      </button>
    </div>

    <!-- Progress -->
    <div class="progress-track" :style="{ background: 'var(--color-surface)' }">
      <div class="progress-fill" :style="{ width: `${((activeIndex + 1) / CARD_COUNT) * 100}%`, background: 'var(--color-primary)' }"></div>
    </div>
  </div>
</template>

<style scoped>
.ring-test {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: background-color 0.4s ease;
}

.test-header {
  text-align: center;
  padding: 1rem 1rem 0.5rem;
}

.test-header h1 {
  font-size: 1.25rem;
  margin: 0;
}

.subtitle {
  font-size: 0.8rem;
  margin: 0.25rem 0;
}

.mode-switcher {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  margin: 0.5rem 0;
}

.mode-btn {
  padding: 0.3rem 0.8rem;
  border: none;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
}

.mode-btn:hover {
  transform: translateY(-1px);
}

/* Carousel viewport */
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

/* Card flipper */
.card-flipper {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
}

.card-face {
  position: absolute;
  inset: 0;
  border-radius: var(--card-radius);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  overflow: hidden;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.is-active .card-face {
  box-shadow: var(--card-shadow-hover);
}

.card-back {
  transform: rotateY(180deg);
}

.is-flipped .card-front {
  transform: rotateY(-180deg);
}

.is-flipped .card-back {
  transform: rotateY(0deg);
  z-index: 1;
}

/* Front face */
.card-front {
  padding: 0.75rem 0.6rem;
  align-items: center;
  justify-content: center;
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

.front-deco {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 22px;
  height: 22px;
  border: 1.5px solid;
  border-radius: 50%;
  opacity: 0.2;
}

/* Back face */
.card-back {
  align-items: center;
  justify-content: flex-end;
}

.back-border {
  position: absolute;
  inset: 4px;
  border: 1.5px solid;
  border-radius: calc(var(--card-radius) - 2px);
  opacity: 0.35;
  pointer-events: none;
}

.back-image {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 60%;
  object-fit: cover;
  border-radius: calc(var(--card-radius) - 4px);
}

.back-name-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.3rem 0;
  text-align: center;
}

.back-name {
  font-size: 0.75rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.05em;
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

/* Bottom bar */
.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
}

.nav-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: transparent;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}

.nav-btn:hover {
  transform: scale(1.1);
}

.detail-card {
  flex: 1;
  max-width: 300px;
  padding: 0.6rem 1rem;
  border-radius: var(--card-radius);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  box-shadow: var(--card-shadow);
  text-align: left;
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

/* Progress bar */
.progress-track {
  height: 3px;
  margin: 0 1rem 1rem;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}
</style>
