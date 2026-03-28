<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useDrag } from '@vueuse/gesture'
import { Motion, animate } from 'motion-v'
import { CHARACTER_ORDER, CHARACTER_NAMES } from '@/types/card'

// --- Card data (7 cards, one per character) ---
interface DragCard {
  id: number
  character: string
  name: string
  x: number
  y: number
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
    placed: false,
    flipped: false,
  }))
)

// --- Slots ---
const slots = CHARACTER_ORDER.map((char, i) => ({
  character: char,
  name: CHARACTER_NAMES[char],
  ref: ref<HTMLElement | null>(null),
  hasCard: computed(() => cards.some((c) => c.placed && c.character === char)),
}))

// --- Drag state ---
const draggingId = ref<number | null>(null)
const hoverSlot = ref<string | null>(null)

// --- Set up drag for each card ---
const cardRefs = ref<Map<number, HTMLElement>>(new Map())

function setCardRef(el: any, id: number) {
  if (el) cardRefs.value.set(id, el as HTMLElement)
}

cards.forEach((card) => {
  useDrag(
    (state) => {
      const { movement, active, last, tap } = state

      if (tap) {
        // Tap = flip card
        card.flipped = !card.flipped
        return
      }

      if (active) {
        draggingId.value = card.id
        card.x = movement[0]
        card.y = movement[1]

        // Check slot hover
        const cardEl = cardRefs.value.get(card.id)
        if (cardEl) {
          hoverSlot.value = findOverlappingSlot(cardEl, card.x, card.y)
        }
      }

      if (last) {
        draggingId.value = null

        // Check drop
        const cardEl = cardRefs.value.get(card.id)
        if (cardEl) {
          const slotChar = findOverlappingSlot(cardEl, card.x, card.y)
          if (slotChar) {
            // Snap to slot
            card.placed = true
            card.x = 0
            card.y = 0
          } else {
            // Spring back to origin
            animate(
              { x: card.x, y: card.y },
              { x: 0, y: 0 },
              {
                type: 'spring',
                stiffness: 400,
                damping: 25,
                onUpdate: (v: any) => {
                  card.x = v.x
                  card.y = v.y
                },
              }
            )
          }
        }

        hoverSlot.value = null
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

// --- Find overlapping slot ---
function findOverlappingSlot(cardEl: HTMLElement, offsetX: number, offsetY: number): string | null {
  const cardRect = cardEl.getBoundingClientRect()
  const cardCenter = {
    x: cardRect.left + cardRect.width / 2 + offsetX,
    y: cardRect.top + cardRect.height / 2 + offsetY,
  }

  for (const slot of slots) {
    if (slot.ref.value && !slot.hasCard.value) {
      const slotRect = slot.ref.value.getBoundingClientRect()
      // Expanded hit area (30px padding)
      const expanded = {
        left: slotRect.left - 30,
        right: slotRect.right + 30,
        top: slotRect.top - 30,
        bottom: slotRect.bottom + 30,
      }
      if (
        cardCenter.x >= expanded.left &&
        cardCenter.x <= expanded.right &&
        cardCenter.y >= expanded.top &&
        cardCenter.y <= expanded.bottom
      ) {
        return slot.character
      }
    }
  }
  return null
}

// --- Remove card from slot ---
function removeFromSlot(card: DragCard) {
  card.placed = false
  card.x = 0
  card.y = 0
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
          :ref="(el: any) => { if (el) slot.ref = ref(el as HTMLElement) }"
          class="slot"
          :class="{
            'is-hover': hoverSlot === slot.character,
            'is-filled': slot.hasCard,
          }"
        >
          <span class="slot-name">{{ slot.name }}</span>
          <!-- Placed card indicator -->
          <div
            v-if="slot.hasCard"
            class="placed-card"
            @click="removeFromSlot(cards.find((c) => c.character === slot.character)!)"
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
          :style="{ transform: `translate(${card.x}px, ${card.y}px)` }"
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
