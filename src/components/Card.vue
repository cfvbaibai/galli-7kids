<script setup lang="ts">
import { computed } from 'vue'
import type { Card as CardType } from '@/types/card'
import { useCardGameStore } from '@/stores/cardGame'

const props = defineProps<{
  card: CardType
  size?: 'xs' | 'sm' | 'md' | 'lg'
  interactive?: boolean
}>()

const store = useCardGameStore()

const isSelected = computed(() => store.isCardSelected(props.card.id))
const isFlipped = computed(() => store.isCardFlipped(props.card.id))
const canInteract = computed(() => props.interactive !== false)

// Size classes - responsive (larger for better readability)
const sizeConfig = {
  xs: { w: '4rem', h: '5rem', text: '10px' },        // ~64px × 80px
  sm: { w: '4.5rem', h: '5.5rem', text: '11px' },    // ~72px × 88px
  md: { w: '5.5rem', h: '7rem', text: '12px' },       // ~88px × 112px
  lg: { w: '8rem', h: '10rem', text: '14px' },       // ~128px × 160px
}

const sizeStyle = computed(() => sizeConfig[props.size ?? 'sm'])

function handleTap() {
  if (!canInteract.value) return

  if (store.gamePhase === 'selecting') {
    store.toggleCardSelection(props.card.id)
  } else if (store.gamePhase === 'viewing' || store.gamePhase === 'interpreting') {
    store.flipCard(props.card.id)
  }
}
</script>

<template>
  <div
    class="card-sanctuary"
    :style="{ width: sizeStyle.w, height: sizeStyle.h }"
    :class="{
      'cursor-pointer': canInteract,
      'breathing': isSelected,
      'ring-2': isSelected,
      'ring-terracotta': isSelected,
    }"
    @click="handleTap"
  >
    <div
      class="card-inner relative w-full h-full"
      :class="{ flipped: isFlipped }"
    >
      <!-- Front Face - Action Text -->
      <div class="card-face card-front absolute inset-0 flex flex-col">
        <!-- Paper texture overlay -->
        <div class="paper-texture"></div>

        <!-- Content -->
        <div class="flex-1 flex items-center justify-center p-1">
          <p
            class="font-card text-center leading-tight line-clamp-2"
            :style="{ fontSize: sizeStyle.text }"
          >
            {{ card.frontText }}
          </p>
        </div>

        <!-- Selection indicator -->
        <div
          v-if="canInteract && store.gamePhase === 'selecting'"
          class="selection-indicator"
          :class="{
            'selected': isSelected,
            'unselected': !isSelected
          }"
        >
          <svg
            v-if="isSelected"
            class="w-2 h-2 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <!-- Back Face - Character Image -->
      <div class="card-face card-back absolute inset-0">
        <div class="paper-texture"></div>
        <img
          :src="card.backImage"
          :alt="card.characterName"
          class="w-full h-full object-cover"
          loading="lazy"
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        />
        <div class="character-label">
          <p class="font-card text-center font-medium" :style="{ fontSize: sizeStyle.text }">
            {{ card.characterName }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Card Container */
.card-sanctuary {
  perspective: 600px;
  border-radius: var(--radius-lg);
}

.card-inner {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  border-radius: var(--radius-lg);
}

.card-inner.flipped {
  transform: rotateY(180deg);
}

.card-face {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow:
    0 2px 4px rgba(92, 72, 54, 0.1),
    0 4px 8px rgba(92, 72, 54, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  transition: all 0.3s var(--transition-smooth);
}

/* Front Face */
.card-front {
  background: linear-gradient(145deg, var(--cream-100) 0%, #ffffff 100%);
  border: 1px solid var(--cream-300);
}

/* Back Face */
.card-back {
  background: linear-gradient(145deg, var(--cream-200) 0%, var(--cream-100) 100%);
  border: 1px solid var(--cream-300);
  transform: rotateY(180deg);
}

/* Selection State */
.ring-terracotta {
  --tw-ring-color: var(--terracotta);
}

.card-sanctuary:has(.card-front):hover {
  transform: translateY(-2px) rotate(-1deg);
}

.card-sanctuary:active .card-inner {
  transform: scale(0.98);
}

.card-sanctuary:active .card-inner.flipped {
  transform: rotateY(180deg) scale(0.98);
}

/* Paper Texture Overlay */
.paper-texture {
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='1'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  border-radius: var(--radius-lg);
}

/* Selection Indicator */
.selection-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.selection-indicator.unselected {
  border-color: var(--cream-300);
  background: var(--cream-100);
}

.selection-indicator.selected {
  border-color: var(--terracotta);
  background: var(--terracotta);
  box-shadow: 0 0 8px rgba(196, 133, 108, 0.4);
}

/* Character Label */
.character-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%);
  padding: 0.375rem 0.25rem 0.25rem;
}

.character-label p {
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Mobile touch feedback */
@media (hover: none) {
  .card-sanctuary:active .card-inner:not(.flipped) {
    transform: scale(0.95);
  }
}
</style>
