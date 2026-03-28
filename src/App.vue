<script setup lang="ts">
import { useCardGameStore } from '@/stores/cardGame'
import CardSelection from '@/components/CardSelection.vue'
import TableBackground from '@/components/TableBackground.vue'
import SelectedCardsView from '@/components/SelectedCardsView.vue'
import SwipeTest from '@/pages/SwipeTest.vue'
import CardRingTest from '@/pages/CardRingTest.vue'
import DragSlotTest from '@/pages/DragSlotTest.vue'

const store = useCardGameStore()

const testPage = new URLSearchParams(window.location.search).get('test')
</script>

<template>
  <SwipeTest v-if="testPage === 'swipe'" />
  <CardRingTest v-else-if="testPage === 'ring'" />
  <DragSlotTest v-else-if="testPage === 'drag'" />
  <div v-else class="app-surface">
    <!-- Table Background with Character Slots -->
    <TableBackground class="absolute inset-0 z-0" />

    <!-- Main Content Layer -->
    <div class="relative z-10 min-h-screen">
      <!-- Phase: Selecting Cards (swipeable card fan) -->
      <CardSelection v-if="store.gamePhase === 'selecting'" />

      <!-- Phase: Viewing / Interpreting Selected Cards -->
      <SelectedCardsView v-else />
    </div>
  </div>
</template>
