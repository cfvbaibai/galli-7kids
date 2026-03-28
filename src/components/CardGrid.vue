<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import Card from './Card.vue'
import { useCardGameStore } from '@/stores/cardGame'

const store = useCardGameStore()

const grid = computed(() => store.cardsGrid)

const canConfirm = computed(() => store.selectedCount >= 1 && store.selectedCount <= 10)

// Responsive card size based on screen width
// Use 'md' for better text readability
const cardSize = ref<'sm' | 'md'>('md')

function updateCardSize() {
  const width = window.innerWidth
  cardSize.value = width < 400 ? 'sm' : 'md'
}

onMounted(() => {
  updateCardSize()
  window.addEventListener('resize', updateCardSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateCardSize)
})
</script>

<template>
  <div class="card-grid-container">
    <!-- Ambient Header -->
    <header class="header-sanctuary">
      <h1 class="font-display text-2xl sm:text-3xl text-warm-brown mb-2">
        选择你的卡牌
      </h1>
      <p class="font-body text-sm sm:text-base text-warm-brown/60">
        请选择 1-10 张卡牌 · 跟随直觉
      </p>
      <div class="selection-counter floating">
        <span class="count-number">{{ store.selectedCount }}</span>
        <span class="count-label">/ 10</span>
      </div>
    </header>

    <!-- 7x7 Card Grid - Sacred Geometry -->
    <div class="grid-wrapper">
      <div class="grid-inner">
        <template v-for="(row, rowIndex) in grid" :key="rowIndex">
          <Card
            v-for="card in row"
            :key="card.id"
            :card="card"
            :size="cardSize"
            interactive
          />
        </template>
      </div>
    </div>

    <!-- Action Altar - Fixed at bottom -->
    <footer class="action-altar">
      <button
        class="btn-sanctuary outline"
        :class="{ 'opacity-50': store.selectedCount === 0 }"
        @click="store.resetSelection"
        :disabled="store.selectedCount === 0"
      >
        <span class="font-card">↺ 清置选择</span>
      </button>

      <button
        class="btn-sanctuary glow-pulse"
        :class="{ 'opacity-50 cursor-not-allowed': !canConfirm }"
        @click="store.confirmSelection"
        :disabled="!canConfirm"
      >
        <span class="font-card">确认选择</span>
      </button>
    </footer>
  </div>
</template>

<style scoped>
.card-grid-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 1rem 1.5rem 6rem;
}

/* Header Styles */
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
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%, 0);
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--honey), transparent);
  opacity: 0.3;
}

/* Selection Counter */
.selection-counter {
  display: inline-flex;
  align-items: baseline;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: var(--cream-200);
  border-radius: var(--radius-full);
  margin-top: 0.5rem;
  box-shadow: inset 0 1px 2px rgba(92, 72, 54, 0.1);
}

.count-number {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--terracotta);
}

.count-label {
  font-family: var(--font-card);
  font-size: 0.875rem;
  color: var(--warm-brown);
  opacity: 0.6;
}

/* Grid Wrapper - Sacred Geometry */
.grid-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 0.5rem;
}

.grid-wrapper::-webkit-scrollbar {
  display: none;
}

.grid-inner {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.75rem;
  justify-content: center;
  padding: 0.75rem;
}

/* Action Altar */
.action-altar {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(to top, var(--cream-100), transparent);
  backdrop-filter: blur(8px);
}

/* Responsive adjustments */
@media (max-width: 400px) {
  .card-grid-container {
    padding: 0.75rem 1rem 5rem;
  }

  .grid-inner {
    gap: 0.375rem;
  }

  .action-altar {
    padding: 1rem;
    gap: 0.75rem;
  }
}

/* Text utilities */
.text-warm-brown {
  color: var(--warm-brown);
}

.text-warm-brown\/60 {
  color: var(--warm-brown);
  opacity: 0.6;
}

.text-warm-brown\/40 {
  color: var(--warm-brown);
  opacity: 0.4;
}
</style>
