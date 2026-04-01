<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useDrag } from '@vueuse/gesture'
import { useCardGameStore } from '@/stores/cardGame'
import { useThemeStore } from '@/stores/theme'
import { CHARACTER_ORDER, CHARACTER_NAMES, type DarkRoomChild } from '@/types/card'

const store = useCardGameStore()

// --- Drag card state (visual positions) ---
interface DragCardState {
  id: number
  x: number
  y: number
  z: number
  placed: boolean
  flipped: boolean
}

// Initialize from store's selected cards
const dragCards = reactive<DragCardState[]>(
  store.selectedCards.map((card) => ({
    id: card.id,
    x: 0,
    y: 0,
    z: 0,
    placed: false,
    flipped: false,
  }))
)

// Keep in sync if selection changes (shouldn't during this phase, but safe)
const cardRefs = ref<Map<number, HTMLElement>>(new Map())

function setCardRef(el: any, id: number) {
  if (el) cardRefs.value.set(id, el as HTMLElement)
}

// --- Slots ---
const slots = CHARACTER_ORDER.map((char) => ({
  character: char,
  name: CHARACTER_NAMES[char],
  ref: ref<HTMLElement | null>(null),
  hasCard: computed(() =>
    dragCards.some((c) => c.placed && c.character === char)
  ),
}))

// --- Z-index counter ---
const topZ = ref(1)

// --- Set up useDrag for each card ---
dragCards.forEach((card) => {
  useDrag(
    (state) => {
      const { movement, active, first, last, tap } = state

      if (tap) {
        card.flipped = !card.flipped
        return
      }

      if (first) {
        card.z = ++topZ.value
      }

      if (active) {
        const base = cardBasePos.get(card.id) ?? { x: card.x, y: card.y }
        card.x = base.x + movement[0]
        card.y = base.y + movement[1]
      }

      if (last) {
        // Check if card was dropped on a matching slot
        checkSlotDrop(card)
        // Save final position as base
        cardBasePos.set(card.id, { x: card.x, y: card.y })
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

// Base position per card — preserves visual position across drags
const cardBasePos = new Map<number, { x: number; y: number }>()

// --- Slot drop detection ---
function checkSlotDrop(card: DragCardState) {
  const cardEl = cardRefs.value.get(card.id)
  if (!cardEl) return

  const cardRect = cardEl.getBoundingClientRect()
  const cardCenterX = cardRect.left + cardRect.width / 2
  const cardCenterY = cardRect.top + cardRect.height / 2

  for (const slot of slots) {
    const el = slot.ref.value
    if (!el) continue

    const slotRect = el.getBoundingClientRect()
    const padding = 20

    if (
      cardCenterX >= slotRect.left - padding &&
      cardCenterX <= slotRect.right + padding &&
      cardCenterY >= slotRect.top - padding &&
      cardCenterY <= slotRect.bottom + padding
    ) {
      // Get the actual card data to check character match
      const cardData = store.getCardById(card.id)
      if (cardData && cardData.backCharacter === slot.character) {
        // Snap card into slot
        card.placed = true
        card.x = 0
        card.y = 0
        cardBasePos.set(card.id, { x: 0, y: 0 })
        return
      }
    }
  }
}

// --- Remove card from slot ---
function removeFromSlot(cardId: number) {
  const card = dragCards.find((c) => c.id === cardId)
  if (card) {
    card.placed = false
    card.x = 0
    card.y = 0
    cardBasePos.set(card.id, { x: 0, y: 0 })
  }
}

// --- Available (unplaced) cards ---
const availableCards = computed(() => dragCards.filter((c) => !c.placed))

// --- Flip all ---
function flipAll(face: 'front' | 'back') {
  for (const card of dragCards) {
    card.flipped = face === 'back'
  }
}

// --- Restart ---
function restart() {
  store.restart()
}

// --- Theme: init on mount ---
const themeStore = useThemeStore()

onMounted(() => {
  themeStore.init()
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

    <!-- Slots area -->
    <section class="slots-area">
      <div class="slots-grid">
        <div
          v-for="slot in slots"
          :key="slot.character"
          :ref="(el: any) => { if (el) slot.ref.value = el as HTMLElement }"
          class="slot"
          :class="{ 'is-filled': slot.hasCard }"
          :style="{
            background: slot.hasCard ? 'var(--color-primary)' : 'var(--color-surface)',
            borderColor: slot.hasCard ? 'var(--color-primary)' : 'var(--color-text-muted)',
          }"
        >
          <span class="slot-name" :style="{ color: slot.hasCard ? 'var(--color-background)' : 'var(--color-text-muted)' }">
            {{ slot.name }}
          </span>
          <!-- Placed card indicator -->
          <div
            v-if="slot.hasCard"
            class="placed-card"
            @click="removeFromSlot(dragCards.find((c) => c.placed && store.getCardById(c.id)?.backCharacter === slot.character)?.id)"
          >
            <span class="placed-name" :style="{ color: 'var(--color-background)' }">{{ slot.name }}</span>
            <span class="remove-hint" :style="{ color: 'var(--color-background)' }">点击移除</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Available cards -->
    <section class="cards-area">
      <div class="cards-grid">
        <div
          v-for="card in availableCards"
          :key="card.id"
          :ref="(el: any) => setCardRef(el, card.id)"
          class="drag-card"
          :class="{
            'is-flipped': card.flipped,
          }"
          :style="{ transform: `translate(${card.x}px, ${card.y}px)`, zIndex: card.z }"
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
}

.drag-title {
  font-size: 1.25rem;
  margin: 0;
}

.drag-subtitle {
  font-size: 0.8rem;
  margin: 0.25rem 0;
}

/* Slots */
.slots-area {
  padding: 0.75rem 1rem;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  max-width: 400px;
  margin: 0 auto;
}

.slot {
  aspect-ratio: 3 / 4;
  border: 2px dashed;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  transition: all 0.2s ease;
  position: relative;
}

.slot:nth-child(7) {
  grid-column: 2 / 4;
}

.slot.is-filled {
  border-style: solid;
}

.slot-name {
  font-size: 0.75rem;
  position: absolute;
  bottom: 4px;
  opacity: 0.5;
}

.placed-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
}

.remove-hint {
  font-size: 0.6rem;
  opacity: 0.5;
  font-weight: 400;
}

/* Cards */
.cards-area {
  flex: 1;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow: auto;
}

.cards-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  padding-bottom: 6rem;
}

.drag-card {
  width: 100px;
  height: 140px;
  border-radius: var(--card-radius);
  cursor: grab;
  position: relative;
  perspective: 600px;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
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

  .card-text {
    font-size: 0.7rem;
  }

  .slots-grid {
    gap: 0.375rem;
  }

  .controls-bar {
    padding: 0.75rem 1rem 1rem;
  }
}
</style>
