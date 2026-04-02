<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useDrag } from '@vueuse/gesture'
import { useEventListener } from '@vueuse/core'
import { useCardGameStore } from '@/stores/cardGame'
import { useThemeStore } from '@/stores/theme'
import { CHARACTER_ORDER, CHARACTER_NAMES, CHARACTER_IMAGES, type DarkRoomChild } from '@/types/card'

const store = useCardGameStore()
const themeStore = useThemeStore()

// --- Constants ---
const CARD_W = 100
const CARD_H = 140
const SLOT_COUNT = 7
const OVERLAP = 70
const CONTROLS_H = 64
const HEADER_H = 70

// --- Card state ---
interface DragCardState {
  id: number
  x: number
  y: number
  z: number
  placed: boolean
  flipped: boolean
}

const dragCards = reactive<DragCardState[]>(
  store.selectedCards.map((card, i) => ({
    id: card.id,
    x: 0,
    y: 0,
    z: i + 1,
    placed: false,
    flipped: false,
  }))
)

const topZ = ref(dragCards.length)
const cardRefs = ref<Map<number, HTMLElement>>(new Map())
const slotRefs = ref<Map<string, HTMLElement>>(new Map())
const cardBasePos = new Map<number, { x: number; y: number }>()
const slotPixelPositions = ref<Array<{ left: number; top: number }>>([])

function setCardRef(el: any, id: number) {
  if (el) cardRefs.value.set(id, el as HTMLElement)
}

function setSlotRef(el: any, char: string) {
  if (el) slotRefs.value.set(char, el as HTMLElement)
}

// --- Layout calculation (viewport-adaptive) ---
function calculateLayout() {
  const vw = window.innerWidth
  const vh = window.innerHeight

  // Layout matching reference image: 小不点 center, 6 others in an elliptical ring
  const n = dragCards.length
  const cardsH = n > 5 ? CARD_H + CARD_H / 2 : CARD_H
  const cx = vw / 2
  const availableH = vh - HEADER_H - CONTROLS_H - cardsH
  const cy = HEADER_H + availableH / 2

  // Ellipse: maximize both axes to fill available space
  const rx = (vw - CARD_W) / 2 - 10            // use most horizontal space
  const ry = availableH / 2 - CARD_H / 2 - 8   // use most vertical space, keep slots on screen

  // Ring: 6 characters clockwise from top (matching reference image)
  const ringLayout: { char: DarkRoomChild; angle: number }[] = [
    { char: 'sleepyhead',  angle: -Math.PI / 2 },                  // top
    { char: 'showoff',     angle: -Math.PI / 2 + Math.PI / 3 },    // top-right
    { char: 'gossip',      angle: -Math.PI / 2 + 2 * Math.PI / 3 },// bottom-right
    { char: 'seductress',  angle: Math.PI / 2 },                    // bottom
    { char: 'aggressive',  angle: Math.PI / 2 + Math.PI / 3 },     // bottom-left
    { char: 'miser',       angle: Math.PI / 2 + 2 * Math.PI / 3 }, // top-left
  ]

  const charPos = new Map<DarkRoomChild, { left: number; top: number }>()
  charPos.set('smallone', { left: cx, top: cy }) // center
  for (const { char, angle } of ringLayout) {
    charPos.set(char, {
      left: cx + Math.cos(angle) * rx,
      top: cy + Math.sin(angle) * ry,
    })
  }

  slotPixelPositions.value = CHARACTER_ORDER.map(char => charPos.get(char)!)

  // Home positions: overlapping row(s) above the controls bar
  const baseY = vh - CARD_H - CONTROLS_H - 12

  if (n <= 5) {
    // Single row
    const totalW = OVERLAP * (n - 1) + CARD_W
    const startX = (vw - totalW) / 2
    dragCards.forEach((card, i) => {
      if (!card.placed) {
        card.x = startX + i * OVERLAP
        card.y = baseY
      }
    })
  } else {
    // Two rows: top row gets ceil(n/2), bottom row gets floor(n/2)
    const topCount = Math.ceil(n / 2)
    const botCount = n - topCount

    const topTotalW = OVERLAP * (topCount - 1) + CARD_W
    const topStartX = (vw - topTotalW) / 2
    const topY = baseY - CARD_H / 2

    const botTotalW = OVERLAP * (botCount - 1) + CARD_W
    const botStartX = (vw - botTotalW) / 2

    dragCards.forEach((card, i) => {
      if (!card.placed) {
        if (i < topCount) {
          card.x = topStartX + i * OVERLAP
          card.y = topY
        } else {
          card.x = botStartX + (i - topCount) * OVERLAP
          card.y = baseY
        }
      }
    })
  }
}

// --- Slots ---
const slots = CHARACTER_ORDER.map((char) => ({
  character: char,
  name: CHARACTER_NAMES[char],
  image: CHARACTER_IMAGES[char],
  hasCard: computed(() =>
    dragCards.some((c) => {
      if (!c.placed) return false
      const data = store.getCardById(c.id)
      return data?.backCharacter === char
    })
  ),
}))

// --- Drag handlers ---
dragCards.forEach((card) => {
  useDrag(
    (state) => {
      const { movement, active, first, last, tap } = state

      if (tap) {
        card.flipped = !card.flipped
        return
      }

      if (first) {
        card.placed = false
        cardBasePos.set(card.id, { x: card.x, y: card.y })
        card.z = ++topZ.value
      }

      if (active) {
        const base = cardBasePos.get(card.id) ?? { x: 0, y: 0 }
        let newX = base.x + movement[0]
        let newY = base.y + movement[1]

        // Boundary clamp — keep card on screen, above controls bar
        const vw = window.innerWidth
        const vh = window.innerHeight
        newX = Math.max(-CARD_W * 0.7, Math.min(vw - CARD_W * 0.3, newX))
        newY = Math.max(HEADER_H - CARD_H * 0.3, Math.min(vh - CONTROLS_H - CARD_H, newY))

        card.x = newX
        card.y = newY
      }

      if (last) {
        checkSlotDrop(card)
      }
    },
    {
      domTarget: computed(() => cardRefs.value.get(card.id) || null),
      filterTaps: true,
      threshold: 5,
      eventOptions: { passive: false },
    }
  )
})

// --- Slot drop detection ---
function checkSlotDrop(card: DragCardState) {
  const cardEl = cardRefs.value.get(card.id)
  if (!cardEl) return

  const cardRect = cardEl.getBoundingClientRect()
  const cx = cardRect.left + cardRect.width / 2
  const cy = cardRect.top + cardRect.height / 2

  for (const slot of slots) {
    const el = slotRefs.value.get(slot.character)
    if (!el) continue

    const sr = el.getBoundingClientRect()
    const pad = 25

    if (
      cx >= sr.left - pad &&
      cx <= sr.right + pad &&
      cy >= sr.top - pad &&
      cy <= sr.bottom + pad
    ) {
      const data = store.getCardById(card.id)
      if (data && data.backCharacter === slot.character) {
        // Prevent double-occupancy
        const occupied = dragCards.some((c) => {
          if (c.id === card.id || !c.placed) return false
          const cd = store.getCardById(c.id)
          return cd?.backCharacter === slot.character
        })
        if (occupied) return

        // Snap card to slot center
        card.x = sr.left + sr.width / 2 - CARD_W / 2
        card.y = sr.top + sr.height / 2 - CARD_H / 2
        card.placed = true
        cardBasePos.set(card.id, { x: card.x, y: card.y })
        return
      }
    }
  }
}

// --- Controls ---
function flipAll(face: 'front' | 'back') {
  for (const card of dragCards) {
    card.flipped = face === 'back'
  }
}

function restart() {
  store.restart()
}

// --- Init ---
onMounted(() => {
  themeStore.init()
  nextTick(calculateLayout)
  useEventListener(window, 'resize', calculateLayout)
})
</script>

<template>
  <div class="drag-phase" :style="{ background: 'var(--app-bg)', fontFamily: 'var(--font-body)' }">
    <!-- Header -->
    <header class="drag-header">
      <h1 class="drag-title" :style="{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }">
        拖放卡牌到对应角色
      </h1>
      <p class="drag-subtitle" :style="{ color: 'var(--color-text-muted)' }">
        拖动卡牌 · 点击翻转 · 放到匹配的槽位
      </p>
    </header>

    <!-- Slots — fixed overlay, subtle background targets -->
    <section class="slots-overlay">
      <div
        v-for="(slot, i) in slots"
        :key="slot.character"
        :ref="(el: any) => setSlotRef(el, slot.character)"
        class="slot"
        :class="{ 'is-filled': slot.hasCard }"
        :style="{
          left: `${slotPixelPositions[i]?.left ?? 50}px`,
          top: `${slotPixelPositions[i]?.top ?? 50}px`,
        }"
      >
        <img
          :src="slot.image"
          :alt="slot.name"
          class="slot-preview"
          loading="lazy"
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        />
        <span class="slot-name">{{ slot.name }}</span>
      </div>
    </section>

    <!-- Cards overlay — all cards, absolutely positioned -->
    <section class="cards-area">
      <div
        v-for="card in dragCards"
        :key="card.id"
        :ref="(el: any) => setCardRef(el, card.id)"
        class="drag-card"
        :class="{ 'is-flipped': card.flipped }"
        :style="{
          left: `${card.x}px`,
          top: `${card.y}px`,
          zIndex: card.z,
        }"
      >
        <!-- Front -->
        <div class="card-front" :style="{ background: 'var(--card-front-bg)' }">
          <span class="card-id" :style="{ color: 'var(--color-text-muted)' }">#{{ card.id }}</span>
          <span class="card-text" :style="{ color: 'var(--color-text)', fontFamily: 'var(--font-card)' }">
            {{ store.getCardById(card.id)?.frontText }}
          </span>
          <span class="card-hint" :style="{ color: 'var(--color-text-muted)' }">拖动或点击</span>
        </div>
        <!-- Back -->
        <div class="card-back" :style="{ background: 'var(--card-back-bg)' }">
          <img
            :src="store.getCardById(card.id)?.backImage"
            :alt="store.getCardById(card.id)?.characterName"
            class="card-image"
            loading="lazy"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
          <div class="card-name-bar" :style="{ background: 'var(--color-primary)', color: 'var(--color-background)' }">
            {{ store.getCardById(card.id)?.characterName }}
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom controls -->
    <footer class="controls-bar">
      <div class="flip-controls">
        <button
          class="ctrl-btn"
          :style="{ color: 'var(--color-text-muted)', background: 'var(--color-surface)' }"
          @click="flipAll('front')"
        >
          全部正面
        </button>
        <button
          class="ctrl-btn"
          :style="{ color: 'var(--color-text-muted)', background: 'var(--color-surface)' }"
          @click="flipAll('back')"
        >
          全部反面
        </button>
      </div>
      <button
        class="ctrl-btn restart-btn"
        :style="{ color: 'var(--color-text-muted)', background: 'var(--color-surface)' }"
        @click="restart"
      >
        重新开始
      </button>
    </footer>
  </div>
</template>

<style scoped>
.drag-phase {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  transition: background-color 0.4s ease;
}

/* Header */
.drag-header {
  text-align: center;
  padding: 1rem 1rem 0.5rem;
  position: relative;
  z-index: 4;
}

.drag-title {
  font-size: 1.25rem;
  margin: 0;
}

.drag-subtitle {
  font-size: 0.8rem;
  margin: 0.25rem 0;
}

/* Slots — fixed overlay, subtle background */
.slots-overlay {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.slot {
  position: absolute;
  width: 100px;
  height: 140px;
  border: 1.5px dashed;
  border-color: var(--color-text-muted);
  border-radius: var(--card-radius);
  transform: translate(-50%, -50%);
  overflow: hidden;
  opacity: 0.3;
  transition: all 0.3s ease;
}

.slot.is-filled {
  border-style: solid;
  border-color: var(--color-primary);
  opacity: 0.45;
}

.slot-preview {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
  opacity: 0.18;
  pointer-events: none;
}

.slot-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px 4px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
  background: linear-gradient(to top, var(--app-bg) 30%, transparent);
  pointer-events: none;
  user-select: none;
  letter-spacing: 0.05em;
}

/* Cards — fixed overlay */
.cards-area {
  position: fixed;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.drag-card {
  position: absolute;
  width: 100px;
  height: 140px;
  border-radius: var(--card-radius);
  cursor: grab;
  perspective: 600px;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  pointer-events: auto;
  transition: box-shadow 0.2s ease;
  box-shadow: var(--card-shadow);
}

.drag-card:active {
  cursor: grabbing;
  box-shadow: var(--card-shadow-hover);
}

/* Flip */
.card-front,
.card-back {
  position: absolute;
  inset: 0;
  border-radius: var(--card-radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transition: transform 0.4s ease;
  border: var(--card-border);
  overflow: hidden;
}

.card-front {
  background: var(--card-front-bg);
}

.card-back {
  background: var(--card-back-bg);
  transform: rotateY(180deg);
}

.drag-card.is-flipped .card-front {
  transform: rotateY(-180deg);
}

.drag-card.is-flipped .card-back {
  transform: rotateY(0deg);
}

.card-id {
  font-size: 0.65rem;
  opacity: 0.3;
  position: absolute;
  top: 6px;
  left: 8px;
}

.card-text {
  font-size: 0.75rem;
  text-align: center;
  line-height: 1.4;
  padding: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-hint {
  font-size: 0.55rem;
  opacity: 0.3;
  position: absolute;
  bottom: 6px;
}

.card-image {
  position: absolute;
  inset: 4px;
  width: calc(100% - 8px);
  height: calc(100% - 30px);
  object-fit: cover;
  border-radius: calc(var(--card-radius) - 4px);
}

.card-name-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.25rem 0;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.03em;
}

/* Controls */
.controls-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem 1.25rem;
  background: linear-gradient(to top, var(--app-bg) 60%, transparent);
  backdrop-filter: blur(8px);
}

.flip-controls {
  display: flex;
  gap: 0.5rem;
}

.ctrl-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
}

.ctrl-btn:active {
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 380px) {
  .drag-card {
    width: 85px;
    height: 120px;
  }

  .slot {
    width: 85px;
    height: 120px;
  }

  .card-text {
    font-size: 0.7rem;
  }

  .slot-name {
    font-size: 0.75rem;
  }

  .controls-bar {
    padding: 0.75rem 1rem 1rem;
  }
}
</style>
