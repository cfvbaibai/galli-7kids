import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cards } from '@/data/cards'
import { shuffle } from 'lodash-es'
import type { Card, DarkRoomChild } from '@/types/card'

export const useCardGameStore = defineStore('cardGame', () => {
  // State
  const gamePhase = ref<GamePhase>('selecting')
  const selectedCardIds = ref<number[]>([])
  const flippedCardIds = ref<Set<number>>(new Set())
  const placedCards = ref<Map<number, DarkRoomChild>>(new Map())
  const draggingCardId = ref<number | null>(null)

  // Card data
  const allCards = ref<Card[]>(cards)

  // Computed
  const selectedCards = computed(() =>
    allCards.value.filter(card => selectedCardIds.value.includes(card.id))
  )

  const selectedCount = computed(() => selectedCardIds.value.length)

  const canSelectMore = computed(() => selectedCardIds.value.length < 10)

    const isCardSelected = (cardId: number) => selectedCardIds.value.includes(cardId)

  const isCardFlipped = (cardId: number) => flippedCardIds.value.has(cardId)

  const isCardPlaced = (cardId: number) => placedCards.value.has(cardId)

  const getCardSlot = (cardId: number) => placedCards.value.get(cardId)

  const getCardById = (cardId: number) => allCards.value.find(c => c.id === cardId)

  const isDragging = (cardId: number) => draggingCardId.value === cardId

  // Actions
  function selectCard(cardId: number) {
    if (!isCardSelected(cardId) && canSelectMore.value) {
      selectedCardIds.value.push(cardId)
    }
  }

  function deselectCard(cardId: number) {
    const index = selectedCardIds.value.indexOf(cardId)
    if (index > -1) {
      selectedCardIds.value.splice(index, 1)
    }
  }

  function toggleCardSelection(cardId: number) {
    if (isCardSelected(cardId)) {
      deselectCard(cardId)
    } else {
      selectCard(cardId)
    }
  }

  function flipCard(cardId: number) {
    if (flippedCardIds.value.has(cardId)) {
      flippedCardIds.value.delete(cardId)
    } else {
      flippedCardIds.value.add(cardId)
    }
  }

  function flipAllCards(face: 'front' | 'back') {
    if (face === 'back') {
      selectedCardIds.value.forEach(id => flippedCardIds.value.add(id))
    } else {
      flippedCardIds.value.clear()
    }
  }

  function startDragging(cardId: number) {
    draggingCardId.value = cardId
  }

  function stopDragging() {
    draggingCardId.value = null
  }

  function placeCard(cardId: number, character: DarkRoomChild) {
    placedCards.value.set(cardId, character)
    stopDragging()
  }

  function removeCardFromSlot(cardId: number) {
    placedCards.value.delete(cardId)
  }

  function confirmSelection() {
    if (selectedCardIds.value.length >= 1) {
      gamePhase.value = 'interpreting'
    }
  }

  function resetSelection() {
    selectedCardIds.value = []
    flippedCardIds.value.clear()
    placedCards.value.clear()
    draggingCardId.value = null
    gamePhase.value = 'selecting'
  }

  function restart() {
    resetSelection()
  }

  function shuffleCards() {
    const selectedSet = new Set(selectedCardIds.value)
    const selectedCards = allCards.value.filter(c => selectedSet.has(c.id))
    const unselectedCards = allCards.value.filter(c => !selectedSet.has(c.id))
    const shuffled = shuffle(unselectedCards)
    allCards.value = [...selectedCards, ...shuffled]
  }

  return {
    // State
    gamePhase,
    selectedCardIds,
    flippedCardIds,
    placedCards,
    draggingCardId,
    allCards,

    // Computed
    selectedCards,
    selectedCount,
    canSelectMore,
    isCardSelected,
    isCardFlipped,
    isCardPlaced,
    isDragging,
    getCardById,
    getCardSlot,

    // Actions
    selectCard,
    deselectCard,
    toggleCardSelection,
    flipCard,
    flipAllCards,
    startDragging,
    stopDragging,
    placeCard,
    removeCardFromSlot,
    confirmSelection,
    resetSelection,
    restart,
    shuffleCards,
  }
})

// Import GamePhase type
type GamePhase = 'selecting' | 'interpreting'
