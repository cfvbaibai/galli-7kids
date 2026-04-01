<script setup lang="ts">
import { useCardGameStore } from '@/stores/cardGame'
import CardPickingRing from '@/components/CardPickingRing.vue'
import SelectedCardsView from '@/components/SelectedCardsView.vue'
import SwipeTest from '@/pages/SwipeTest.vue'
import CardRingTest from '@/pages/CardRingTest.vue'
import DragSlotTest from '@/pages/DragSlotTest.vue'
import ThemeTest from '@/pages/ThemeTest.vue'
import CardUITest from '@/pages/CardUITest.vue'

const store = useCardGameStore()

const testPage = new URLSearchParams(window.location.search).get('test')
</script>

<template>
  <SwipeTest v-if="testPage === 'swipe'" />
  <CardRingTest v-else-if="testPage === 'ring'" />
  <DragSlotTest v-else-if="testPage === 'drag'" />
  <ThemeTest v-else-if="testPage === 'theme'" />
  <CardUITest v-else-if="testPage === 'cardui'" />
  <div v-else class="app-surface">
    <!-- Main Content Layer -->
    <div class="relative z-10 min-h-screen">
      <!-- Phase: Selecting Cards -->
      <CardPickingRing v-if="store.gamePhase === 'selecting'" />

      <!-- Phase: Dragging / Interpreting -->
      <SelectedCardsView v-else-if="store.gamePhase === 'interpreting'" />
    </div>
  </div>
</template>
