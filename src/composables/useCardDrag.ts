import { ref, computed, onUnmounted, type Ref } from 'vue'
import type { DarkRoomChild } from '@/types/card'

export interface DropZone {
  id: DarkRoomChild
  element: HTMLElement | null
}

export interface UseCardDragOptions {
  /** Callback when card is dropped on a valid zone */
  onDrop?: (cardId: number, zoneId: DarkRoomChild) => void
  /** Callback when drag starts */
  onDragStart?: (cardId: number) => void
  /** Callback when drag ends without drop */
  onDragEnd?: (cardId: number) => void
  /** Get drop zones to detect */
  getDropZones: () => DropZone[]
}

/**
 * Mobile-first drag and drop composable using Pointer Events.
 * Works uniformly across mouse, touch, and pen inputs.
 */
export function useCardDrag(options: UseCardDragOptions) {
  const { onDrop, onDragStart, onDragEnd, getDropZones } = options

  // Reactive drag state
  const isDragging = ref(false)
  const draggedCardId = ref<number | null>(null)
  const dragPosition = ref({ x: 0, y: 0 })
  const dragOffset = ref({ x: 0, y: 0 })
  const overDropZone = ref<DarkRoomChild | null>(null)

  // Check if pointer is over a drop zone
  function checkDropZoneHit(x: number, y: number): DarkRoomChild | null {
    const zones = getDropZones()

    for (const zone of zones) {
      const el = zone.element
      if (!el) continue

      const rect = el.getBoundingClientRect()
      const padding = 30 // Extra padding for easier drop targeting on mobile

      if (
        x >= rect.left - padding &&
        x <= rect.right + padding &&
        y >= rect.top - padding &&
        y <= rect.bottom + padding
      ) {
        return zone.id
      }
    }

    return null
  }

  /**
   * Call this when pointerdown starts on a card
   * Returns event handlers that should be bound to the card element
   */
  function createDragHandlers(cardId: number) {
    return {
      onPointerdown: (event: PointerEvent) => {
        // Prevent text selection and default touch behaviors
        event.preventDefault()

        const target = event.currentTarget as HTMLElement

        // Capture this pointer for reliable move/end events
        target.setPointerCapture(event.pointerId)

        // Calculate offset from pointer position to element center
        const rect = target.getBoundingClientRect()
        const offsetX = rect.width / 2
        const offsetY = rect.height / 2

        // Set drag state
        isDragging.value = true
        draggedCardId.value = cardId
        dragPosition.value = { x: event.clientX, y: event.clientY }
        dragOffset.value = { x: offsetX, y: offsetY }
        overDropZone.value = null

        // Callback
        onDragStart?.(cardId)
      },
    }
  }

  /**
   * Call this on global pointermove to update drag position
   */
  function handlePointerMove(event: PointerEvent) {
    if (!isDragging.value) return

    dragPosition.value = { x: event.clientX, y: event.clientY }

    // Check if over a drop zone
    overDropZone.value = checkDropZoneHit(event.clientX, event.clientY)
  }

  /**
   * Call this on global pointerup/pointercancel to end drag
   */
  function handlePointerUp(_event: PointerEvent) {
    if (!isDragging.value) return

    const cardId = draggedCardId.value
    const zone = overDropZone.value

    if (cardId !== null) {
      if (zone) {
        // Successful drop
        onDrop?.(cardId, zone)
      } else {
        // Dropped outside valid zone
        onDragEnd?.(cardId)
      }
    }

    // Reset state
    isDragging.value = false
    draggedCardId.value = null
    dragPosition.value = { x: 0, y: 0 }
    dragOffset.value = { x: 0, y: 0 }
    overDropZone.value = null
  }

  // Computed style for the dragged card preview
  const dragPreviewStyle = computed(() => {
    if (!isDragging.value) return {}

    return {
      position: 'fixed' as const,
      left: `${dragPosition.value.x - dragOffset.value.x}px`,
      top: `${dragPosition.value.y - dragOffset.value.y}px`,
      zIndex: 9999,
      pointerEvents: 'none' as const,
      transform: 'scale(1.15)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
    }
  })

  // Cleanup on unmount
  onUnmounted(() => {
    isDragging.value = false
    draggedCardId.value = null
  })

  return {
    // State
    isDragging,
    draggedCardId: computed(() => draggedCardId.value),
    dragPosition: computed(() => dragPosition.value),
    overDropZone: computed(() => overDropZone.value),

    // Styles
    dragPreviewStyle,

    // Methods
    createDragHandlers,
    handlePointerMove,
    handlePointerUp,
  }
}
