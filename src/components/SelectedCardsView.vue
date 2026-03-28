<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useCardGameStore } from '@/stores/cardGame'
import { useCardDrag } from '@/composables/useCardDrag'
import Card from './Card.vue'
import { CHARACTER_NAMES, CHARACTER_ORDER, type DarkRoomChild } from '@/types/card'
import type { Card as CardType } from '@/types/card'

const store = useCardGameStore()

// Responsive card size
const cardSize = ref<'sm' | 'md' | 'lg'>('md')

// Drop zone refs
const dropZoneRefs = ref<Map<DarkRoomChild, HTMLElement | null>>(new Map())

function setDropZoneRef(character: DarkRoomChild, el: any) {
  if (el) {
    dropZoneRefs.value.set(character, el as HTMLElement)
  }
}

// Get drop zones for the composable
function getDropZones() {
  return CHARACTER_ORDER.map((character) => ({
      id: character,
      element: dropZoneRefs.value.get(character) || null,
    }))
  }

const isViewing = computed(() => store.gamePhase === 'viewing')
const isInterpreting = computed(() => store.gamePhase === 'interpreting')
const canDrag = computed(() => isViewing.value || isInterpreting.value)

// Use the drag composable
const {
  isDragging,
  draggedCardId,
  overDropZone,
  dragPreviewStyle,
  createDragHandlers,
  handlePointerMove,
  handlePointerUp,
} = useCardDrag({
  getDropZones,
  onDragStart: (cardId) => {
    store.startDragging(cardId)
  },
  onDrop: (cardId, zoneId) => {
    store.placeCard(cardId, zoneId)
  },
  onDragEnd: () => {
    store.stopDragging()
  },
})

// Get the card being dragged for preview
const draggedCard = computed(() => {
  if (draggedCardId.value === null) return null
  return store.getCardById(draggedCardId.value)
})

// Lifecycle hooks
onMounted(() => {
  updateCardSize()
  window.addEventListener('resize', updateCardSize)

  // Global drag tracking
  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', handlePointerUp)
  window.addEventListener('pointercancel', handlePointerUp)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateCardSize)
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', handlePointerUp)
  window.removeEventListener('pointercancel', handlePointerUp)
})

function updateCardSize() {
  const width = window.innerWidth
  if (width < 400) {
    cardSize.value = 'sm'
  } else if (width < 640) {
    cardSize.value = 'md'
  } else {
    cardSize.value = 'lg'
  }
}

// Handle card click (flip)
function handleCardClick(card: CardType) {
  store.flipCard(card.id)
}

// Get placed card count for a slot
function getPlacedCount(character: DarkRoomChild): number {
  return Array.from(store.placedCards.values()).filter(c => c === character).length
}
</script>

<template>
  <div class="view-container">
    <!-- Ambient Header -->
    <header class="header-sanctuary">
      <h1 class="font-display text-xl sm:text-2xl text-warm-brown mb-2">
        {{ isViewing ? '你的卡牌' : '开始解读' }}
      </h1>
      <p class="font-body text-sm text-warm-brown/60 mb-4">
        {{ isViewing
          ? '点击翻看卡牌背面 · 长按拖放到对应槽位'
          : '将卡牌拖到角色槽位 · 感受每个角色的能量'
        }}
      </p>
    </header>

    <!-- Character Slots - Altar of Slots -->
    <section class="slots-altar">
      <p class="font-card text-xs text-warm-brown/50 mb-3 uppercase tracking-wider">
        角色槽位
      </p>
      <div class="slots-container">
        <div
          v-for="character in CHARACTER_ORDER"
          :key="character"
          :ref="(el) => setDropZoneRef(character, el)"
          class="slot-sanctuary"
          :class="{
            'active-drop': overDropZone === character && isDragging,
            'has-card': getPlacedCount(character) > 0
          }"
        >
          <span class="font-card text-[9px] sm:text-xs text-warm-brown/70 text-center leading-tight">
            {{ CHARACTER_NAMES[character] }}
          </span>
          <!-- Placed card count badge -->
          <div
            v-if="getPlacedCount(character) > 0"
            class="count-badge glow-pulse"
          >
            {{ getPlacedCount(character) }}
          </div>
        </div>
      </div>
    </section>

    <!-- Selected Cards - Flow Layout -->
    <section class="cards-flow">
      <div
        v-for="card in store.selectedCards"
        :key="card.id"
        class="card-wrapper"
        :class="{ 'dragging-away': isDragging && draggedCardId === card.id }"
        v-bind="canDrag ? createDragHandlers(card.id) : {}"
        @click.stop="handleCardClick(card)"
      >
        <Card
          :card="card"
          :size="cardSize"
          interactive
        />
      </div>
    </section>

    <!-- Drag Preview - Floating Card -->
    <Teleport to="body">
      <Transition name="drag-preview">
        <div
          v-if="isDragging && draggedCard"
          class="drag-preview floating"
          :style="dragPreviewStyle"
        >
          <Card
            :card="draggedCard"
            size="md"
            :interactive="false"
          />
        </div>
      </Transition>
    </Teleport>

    <!-- Control Altar - Fixed at bottom -->
    <footer class="control-altar">
      <!-- Flip Controls -->
      <div class="flip-controls">
        <button
          class="btn-sanctuary outline"
          @click="store.flipAllCards('front')"
        >
          <span class="font-card">全部正面</span>
        </button>
        <button
          class="btn-sanctuary outline"
          @click="store.flipAllCards('back')"
        >
          <span class="font-card">全部反面</span>
        </button>
      </div>

      <!-- Main Actions -->
      <div class="main-actions">
        <button
          class="btn-sanctuary outline"
          @click="store.restart"
        >
          <span class="font-card">重新开始</span>
        </button>
        <button
          v-if="isViewing"
          class="btn-sanctuary glow-pulse"
          @click="store.startInterpreting"
        >
          <span class="font-card">开始解读</span>
        </button>
        <button
          v-if="isInterpreting"
          class="btn-sanctuary secondary"
          @click="store.gamePhase = 'viewing'"
        >
          <span class="font-card">返回查看</span>
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.view-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 1rem 1.5rem 8rem;
}

/* Header */
.header-sanctuary {
  text-align: center;
  padding: 1.5rem 1rem;
  position: relative;
}

.header-sanctuary h1 {
  letter-spacing: -0.02em;
}

.header-sanctuary h1::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--honey), transparent);
  opacity: 0.4;
}

/* Slots Altar */
.slots-altar {
  padding: 0rem 1rem;
}

.slots-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.slot-sanctuary {
  position: relative;
  width: 4rem;
  height: 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  transition: all 0.3s var(--transition-smooth);
}

.slot-sanctuary.active-drop {
  background: linear-gradient(180deg, var(--honey-light) 0%, var(--honey) 100%);
  transform: scale(1.08);
  box-shadow: var(--shadow-glow);
}

.slot-sanctuary.has-card {
  background: linear-gradient(180deg, var(--sage-light) 0%, var(--sage) 100%);
}

.count-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: var(--radius-full);
  background: var(--terracotta);
  color: white;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(196, 122, 94, 0.3);
}

/* Cards Flow */
.cards-flow {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
}

.card-wrapper {
  transition: all 0.2s ease;
}

.card-wrapper.dragging-away {
  opacity: 0.4;
  transform: scale(0.9);
}

/* Drag Preview */
.drag-preview {
  pointer-events: none;
  z-index: 9999;
}

/* Control Altar */
.control-altar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.5rem;
  background: linear-gradient(to top, var(--cream-100) 60%, transparent);
  backdrop-filter: blur(8px);
}

.flip-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.main-actions {
  display: flex;
  gap: 0.75rem;
}

/* Responsive */
@media (max-width: 400px) {
  .view-container {
    padding: 0.75rem 1rem 6rem;
  }

  .slot-sanctuary {
    width: 3.5rem;
    height: 4.5rem;
  }

  .cards-flow {
    gap: 0.75rem;
  }

  .control-altar {
    padding: 0.75rem 1rem 1rem;
  }
}

/* Text utilities */
.text-warm-brown {
  color: var(--warm-brown);
}

.text-warm-brown-50 {
  color: var(--warm-brown);
  opacity: 0.5;
}

.text-warm-brown-60 {
  color: var(--warm-brown);
  opacity: 0.6;
}

.text-warm-brown-70 {
  color: var(--warm-brown);
  opacity: 0.7;
}
</style>
