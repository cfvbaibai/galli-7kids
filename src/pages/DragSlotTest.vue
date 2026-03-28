<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useDrag } from '@vueuse/gesture'
import { CHARACTER_ORDER, CHARACTER_NAMES, type DarkRoomChild } from '@/types/card'

// --- Card data (7 cards, one per character) ---
interface DragCard {
  id: number
  character: DarkRoomChild
  name: string
  x: number
  y: number
  z: number
  placed: boolean
  flipped: boolean
}

const cards = reactive<DragCard[]>(
  CHARACTER_ORDER.map((char, i) => ({
    id: i + 1,
    character: char,
    name: CHARACTER_NAMES[char],
    x: 0,
    y: 0,
    z: 0,
    placed: false,
    flipped: false,
  }))
)

// --- Slots ---
const slots = CHARACTER_ORDER.map((char) => ({
  character: char,
  name: CHARACTER_NAMES[char],
  ref: ref<HTMLElement | null>(null),
  hasCard: computed(() => cards.some((c) => c.placed && c.character === char)),
}))

// --- Drag state ---
const draggingId = ref<number | null>(null)
const cardRefs = ref<Map<number, HTMLElement>>(new Map())

// Base position per card — preserves visual position across drags
const cardBasePos = new Map<number, { x: number; y: number }>()
// Z-index counter — last dropped card is always on top
const topZ = ref(1)

function setCardRef(el: any, id: number) {
  if (el) cardRefs.value.set(id, el as HTMLElement)
}

cards.forEach((card) => {
  useDrag(
    (state) => {
      const { movement, active, first, last, tap } = state

      if (tap) {
        card.flipped = !card.flipped
        return
      }

      if (first) {
        cardBasePos.set(card.id, { x: card.x, y: card.y })
        card.z = ++topZ.value
      }

      if (active) {
        draggingId.value = card.id
        const base = cardBasePos.get(card.id) ?? { x: 0, y: 0 }
        card.x = base.x + movement[0]
        card.y = base.y + movement[1]
      }

      if (last) {
        draggingId.value = null
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

// --- Remove card from slot ---
function removeFromSlot(card: DragCard | undefined) {
  if (!card) return
  card.placed = false
}

// --- Available (unplaced) cards ---
const availableCards = computed(() => cards.filter((c) => !c.placed))
</script>

<template>
  <div class="drag-test">
    <header class="test-header">
      <h1>Drag to Slot Test</h1>
      <p>Drag cards to matching slots. Tap to flip.</p>
    </header>

    <!-- Slots area -->
    <section class="slots-area">
      <div class="slots-grid">
        <div
          v-for="slot in slots"
          :key="slot.character"
          :ref="(el: any) => { if (el) slot.ref.value = el as HTMLElement }"
          class="slot"
          :class="{
            'is-filled': slot.hasCard,
          }"
        >
          <span class="slot-name">{{ slot.name }}</span>
          <!-- Placed card indicator -->
          <div
            v-if="slot.hasCard"
            class="placed-card"
            @click="removeFromSlot(cards.find((c) => c.character === slot.character))"
          >
            <span>{{ slot.name }}</span>
            <span class="remove-hint">tap to remove</span>
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
            'is-dragging': draggingId === card.id,
            'is-flipped': card.flipped,
          }"
          :style="{ transform: `translate(${card.x}px, ${card.y}px)`, zIndex: card.z }"
        >
          <!-- Front -->
          <div class="card-front">
            <span class="card-id">#{{ card.id }}</span>
            <span class="card-name">{{ card.name }}</span>
            <span class="card-hint">drag or tap</span>
          </div>
          <!-- Back -->
          <div class="card-back">
            <span class="card-id">#{{ card.id }}</span>
            <span class="card-name">{{ card.name }}</span>
            <span class="card-hint">flipped!</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.drag-test {
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

/* Slots */
.slots-area {
  padding: 1rem;
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
  border: 2px dashed #e8ddd1;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  transition: all 0.2s ease;
  position: relative;
  background: rgba(255, 255, 255, 0.5);
}

.slot:nth-child(7) {
  grid-column: 2 / 4;
}

.slot.is-hover {
  border-color: #c4846c;
  background: rgba(196, 132, 108, 0.1);
  box-shadow: 0 0 20px rgba(196, 132, 108, 0.2);
}

.slot.is-filled {
  border-style: solid;
  border-color: #8fa68a;
  background: rgba(143, 166, 138, 0.1);
}

.slot-name {
  font-size: 0.75rem;
  opacity: 0.4;
  position: absolute;
  bottom: 4px;
}

.placed-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: #8fa68a;
}

.remove-hint {
  font-size: 0.6rem;
  opacity: 0.5;
  font-weight: 400;
}

/* Cards */
.cards-area {
  padding: 1rem;
  margin-top: auto;
}

.cards-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.drag-card {
  width: 90px;
  height: 120px;
  border-radius: 10px;
  cursor: grab;
  position: relative;
  perspective: 600px;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  transition: box-shadow 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.drag-card.is-dragging {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.drag-card:active {
  cursor: grabbing;
}

/* Flip card */
.card-front,
.card-back {
  position: absolute;
  inset: 0;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  backface-visibility: hidden;
  transition: transform 0.4s ease;
  border: 1px solid #e8ddd1;
}

.card-front {
  background: linear-gradient(145deg, #faf6f1, white);
}

.card-back {
  background: linear-gradient(145deg, #f5ede4, #e8ddd1);
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
}

.card-name {
  font-size: 0.85rem;
  font-weight: 600;
}

.card-hint {
  font-size: 0.55rem;
  opacity: 0.3;
}
</style>
