<script setup lang="ts">
import { computed } from 'vue'
import { useCardGameStore } from '@/stores/cardGame'
import type { Card } from '@/types/card'

const store = useCardGameStore()

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  navigateToCard: [index: number]
}>()

const selectedCards = computed(() => store.selectedCards)
const selectedCount = computed(() => store.selectedCount)

function handleCardClick(card: Card) {
  const idx = store.allCards.findIndex(c => c.id === card.id)
  if (idx >= 0) {
    emit('navigateToCard', idx)
    emit('close')
  }
}
</script>

<template>
  <Transition name="tray">
    <div v-if="isOpen" class="tray-backdrop" @click.self="emit('close')">
      <div class="tray-panel">
        <div class="tray-header">
          <span class="tray-title" :style="{ color: 'var(--color-text)' }">已选择 {{ selectedCount }} 张卡牌</span>
          <button class="tray-close" :style="{ color: 'var(--color-text-muted)' }" @click="emit('close')">
            收起
          </button>
        </div>

        <div v-if="selectedCards.length === 0" class="tray-empty" :style="{ color: 'var(--color-text-muted)' }">
          还没有选择卡牌
        </div>

        <div v-else class="tray-grid">
          <button
            v-for="card in selectedCards"
            :key="card.id"
            class="tray-thumb"
            :style="{ background: 'var(--color-surface)', borderColor: 'var(--color-primary)' }"
            @click="handleCardClick(card)"
          >
            <span class="thumb-number" :style="{ color: 'var(--color-text-muted)' }">#{{ card.id }}</span>
            <span class="thumb-text" :style="{ color: 'var(--color-text)' }">{{ card.frontText }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.tray-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.tray-panel {
  width: 100%;
  max-width: 480px;
  max-height: 60vh;
  background: var(--app-bg);
  border-radius: 1.25rem 1.25rem 0 0;
  padding: 1.25rem;
  overflow-y: auto;
}

.tray-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.tray-title {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 600;
}

.tray-close {
  background: none;
  border: none;
  font-family: var(--font-body);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  transition: background 0.2s ease;
}

.tray-close:hover {
  background: var(--color-surface);
}

.tray-empty {
  text-align: center;
  padding: 2rem;
  font-size: 0.9rem;
}

.tray-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.5rem;
}

.tray-thumb {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 0.75rem;
  border: 1.5px solid;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  text-align: left;
  min-height: 44px;
}

.tray-thumb:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tray-thumb:active {
  transform: scale(0.97);
}

.thumb-number {
  font-size: 0.7rem;
  font-weight: 700;
  opacity: 0.5;
  margin-bottom: 0.25rem;
}

.thumb-text {
  font-family: var(--font-card);
  font-size: 0.75rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Transition */
.tray-enter-active,
.tray-leave-active {
  transition: opacity 0.25s ease;
}

.tray-enter-active .tray-panel,
.tray-leave-active .tray-panel {
  transition: transform 0.25s ease;
}

.tray-enter-from,
.tray-leave-to {
  opacity: 0;
}

.tray-enter-from .tray-panel,
.tray-leave-to .tray-panel {
  transform: translateY(100%);
}
</style>
