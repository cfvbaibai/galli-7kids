<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { CHARACTER_NAMES, type DarkRoomChild } from '@/types/card'

const highlightSlot = ref<DarkRoomChild | null>(null)

const characters: DarkRoomChild[] = [
  'seductress', 'smallone', 'sleepyhead', 'showoff', 'aggressive', 'miser', 'gossip'
]

// Responsive based on screen size
const isMobile = ref(false)

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

function checkMobile() {
  isMobile.value = window.innerWidth < 640
}

// Slot positions as 3-row grid (percentage-based)
// left column: 吝啬鬼, 自大狂, 暴躁狂 | center: 小不点 | right column: 睡不醒, 包打听, 多情种
const slotPositions: Record<DarkRoomChild, { x: number; y: number }> = {
  miser: { x: 22, y: 5 },
  sleepyhead: { x: 58, y: 5 },
  showoff: { x: 15, y: 42 },
  smallone: { x: 40, y: 42 },
  gossip: { x: 65, y: 42 },
  aggressive: { x: 22, y: 80 },
  seductress: { x: 58, y: 80 },
}

const getSlotStyle = (character: DarkRoomChild) => ({
  left: `${slotPositions[character].x}%`,
  top: `${slotPositions[character].y}%`,
})
</script>

<template>
  <div class="table-surface">
    <!-- Background Image - Subtle -->
    <img
      :src="`${import.meta.env.BASE_URL}images/背景/背景+7个小孩卡槽.jpg`"
      alt="Table Background"
      class="background-image"
    />

    <!-- Warm Vignette Overlay -->
    <div class="vignette-overlay"></div>

    <!-- Character Slots - Subtle Guides -->
    <div class="slots-layer">
      <div
        v-for="character in characters"
        :key="character"
        class="character-slot"
        :class="{ highlighted: highlightSlot === character }"
        :style="getSlotStyle(character)"
      >
        <!-- Character Initial - Decorative -->
        <div class="slot-initial">
          {{ CHARACTER_NAMES[character].charAt(0) }}
        </div>
        <span class="slot-name font-card">
          {{ CHARACTER_NAMES[character] }}
        </span>
      </div>
    </div>

    <!-- Ambient Light Orbs - Creates warmth -->
    <div class="ambient-layer">
      <div class="ambient-orb honey-orb"></div>
      <div class="ambient-orb sage-orb"></div>
      <div class="ambient-orb rose-orb"></div>
    </div>
  </div>
</template>

<style scoped>
.table-surface {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

/* Background Image */
.background-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.12;
  filter: sepia(0.3) saturate(0.8);
}

/* Vignette Overlay */
.vignette-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 30%, var(--cream-100) 100%);
  pointer-events: none;
}

/* Slots Layer */
.slots-layer {
  position: absolute;
  inset: 0;
}

.character-slot {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 4.5rem;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(8px);
  border: 1px dashed var(--cream-300);
  transition: all 0.4s var(--transition-smooth);
}

@media (min-width: 640px) {
  .character-slot {
    width: 4.5rem;
    height: 5.5rem;
    border-width: 1.5px;
  }
}

.character-slot.highlighted {
  background: rgba(212, 168, 83, 0.2);
  border-color: var(--honey);
  border-style: solid;
  box-shadow: var(--shadow-glow);
  transform: translate(-50%, -50%) scale(1.1);
}

.slot-initial {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--cream-200) 0%, var(--cream-300) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 0.9rem;
  color: var(--warm-brown);
  opacity: 0.5;
  margin-bottom: 0.25rem;
}

@media (min-width: 640px) {
  .slot-initial {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }
}

.slot-name {
  font-size: 7px;
  color: var(--warm-brown);
  opacity: 0.4;
  text-align: center;
  line-height: 1.2;
  white-space: nowrap;
}

@media (min-width: 640px) {
  .slot-name {
    font-size: 8px;
  }
}

/* Ambient Layer */
.ambient-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.ambient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: drift 25s ease-in-out infinite;
}

.honey-orb {
  width: 300px;
  height: 300px;
  background: var(--honey-light);
  top: -5%;
  right: -10%;
  opacity: 0.2;
}

.sage-orb {
  width: 250px;
  height: 250px;
  background: var(--sage-light);
  bottom: 15%;
  left: -5%;
  opacity: 0.15;
  animation-delay: -8s;
}

.rose-orb {
  width: 200px;
  height: 200px;
  background: var(--dusty-rose-light);
  top: 40%;
  right: 20%;
  opacity: 0.12;
  animation-delay: -16s;
}

@media (max-width: 640px) {
  .ambient-orb {
    filter: blur(60px);
    opacity: 0.8;
  }

  .honey-orb {
    width: 200px;
    height: 200px;
  }

  .sage-orb {
    width: 150px;
    height: 150px;
  }

  .rose-orb {
    width: 120px;
    height: 120px;
  }
}

@keyframes drift {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(20px, 10px) rotate(5deg); }
  50% { transform: translate(10px, 20px) rotate(-5deg); }
  75% { transform: translate(-10px, 10px) rotate(3deg); }
}
</style>
