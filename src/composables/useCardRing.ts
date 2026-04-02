import { ref, computed, onUnmounted, type Ref, type ComputedRef } from 'vue'
import type { Card } from '@/types/card'

export interface UseCardRingOptions {
  /** Reactive list of cards (supports reordering via shuffle) */
  cards: Ref<Card[]>
  /** Number of visible cards on each side of center */
  visibleSide?: number
  /** Horizontal offset between adjacent cards (px) */
  baseOffset?: number
}

export interface UseCardRingReturn {
  // State
  activeIndex: Ref<number>
  animatedIndex: Ref<number>
  isDragging: Ref<boolean>

  // Computed
  cardCount: ComputedRef<number>
  visibleIndices: ComputedRef<number[]>
  activeCard: ComputedRef<Card | undefined>

  // Navigation
  goTo: (index: number) => void
  prev: () => void
  next: () => void

  // Gesture handlers (bind to viewport element)
  onPointerDown: (e: PointerEvent) => void
  onPointerMove: (e: PointerEvent) => void
  onPointerUp: () => void

  // Style computation (bind to each visible card)
  cardStyle: (index: number) => { transform: string; opacity: number; zIndex: number }
  shadowCardStyle: (index: number) => { transform: string; opacity: number; zIndex: number }
}

export function useCardRing(options: UseCardRingOptions): UseCardRingReturn {
  const { cards, visibleSide = 4, baseOffset = 170 } = options

  const cardCount = computed(() => cards.value.length)
  const activeIndex = ref(0)
  const animatedIndex = ref(0)
  const isDragging = ref(false)
  let animRaf = 0

  // --- Animation ---
  function animateTo(target: number) {
    cancelAnimationFrame(animRaf)
    const count = cardCount.value
    if (count === 0) return
    const start = animatedIndex.value
    let distance = target - start
    if (distance > count / 2) distance -= count
    if (distance < -count / 2) distance += count
    const duration = 350
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      animatedIndex.value = start + distance * eased
      if (t < 1) animRaf = requestAnimationFrame(tick)
    }
    animRaf = requestAnimationFrame(tick)
  }

  function goTo(index: number) {
    const count = cardCount.value
    if (count === 0) return
    activeIndex.value = ((index % count) + count) % count
    animateTo(activeIndex.value)
  }

  function prev() { goTo(activeIndex.value - 1) }
  function next() { goTo(activeIndex.value + 1) }

  // --- Gesture ---
  const MAX_FLICK_DISTANCE = 4 // Max cards a single flick can travel (tunable)
  let dragStartX = 0
  let dragStartIndex = 0
  let dragStartTime = 0
  let carryDistance = 0 // Remaining momentum from previous animation
  const lastPositions: number[] = []
  const lastTimes: number[] = []

  function onPointerDown(e: PointerEvent) {
    // Capture remaining animation distance as carry momentum
    const count = cardCount.value
    if (count > 0) {
      carryDistance = activeIndex.value - animatedIndex.value
      if (carryDistance > count / 2) carryDistance -= count
      if (carryDistance < -count / 2) carryDistance += count
    } else {
      carryDistance = 0
    }

    cancelAnimationFrame(animRaf)
    isDragging.value = true
    dragStartX = e.clientX
    dragStartIndex = animatedIndex.value
    dragStartTime = performance.now()
    lastPositions.length = 0
    lastTimes.length = 0
    lastPositions.push(e.clientX)
    lastTimes.push(performance.now())
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: PointerEvent) {
    if (!isDragging.value) return
    const dx = e.clientX - dragStartX
    animatedIndex.value = dragStartIndex - dx / baseOffset

    lastPositions.push(e.clientX)
    lastTimes.push(performance.now())
    if (lastPositions.length > 5) {
      lastPositions.shift()
      lastTimes.shift()
    }
  }

  function onPointerUp() {
    if (!isDragging.value) return
    isDragging.value = false

    const count = cardCount.value
    if (count === 0) return

    let velocity = 0
    if (lastPositions.length >= 2) {
      const n = lastPositions.length
      const recency = performance.now() - lastTimes[n - 1]
      if (recency < 150) {
        const dx = lastPositions[n - 1] - lastPositions[0]
        const dt = lastTimes[n - 1] - lastTimes[0]
        if (dt > 0) velocity = -dx / dt * 16 / baseOffset * 16
      }
    }

    // Cap single flick distance (iOS-style speed limit per gesture)
    const flickDistance = Math.max(
      -MAX_FLICK_DISTANCE,
      Math.min(MAX_FLICK_DISTANCE, velocity * 8),
    )

    // Kill carry momentum if drag was held too long (user intentionally stopped)
    if (performance.now() - dragStartTime > 300) carryDistance = 0

    // Combine carried momentum with new flick (can exceed cap via accumulation)
    const totalDistance = carryDistance + flickDistance
    carryDistance = 0

    const projected = animatedIndex.value + totalDistance
    const nearest = Math.round(projected)
    activeIndex.value = ((nearest % count) + count) % count
    animateTo(activeIndex.value)
  }

  // --- Visible cards ---
  const visibleIndices = computed(() => {
    const count = cardCount.value
    if (count === 0) return []
    const center = Math.round(animatedIndex.value)
    const indices: number[] = []
    for (let offset = -visibleSide; offset <= visibleSide; offset++) {
      indices.push(((center + offset) % count + count) % count)
    }
    return indices
  })

  // --- Card style ---
  function cardStyle(index: number) {
    const count = cardCount.value
    let offset = index - animatedIndex.value
    if (offset > count / 2) offset -= count
    if (offset < -count / 2) offset += count
    const absOffset = Math.abs(offset)

    const x = offset * baseOffset
    const rotateY = offset * -8
    const scale = 1 - Math.min(absOffset, 4) * 0.08
    const opacity = 1 - Math.min(absOffset, 4) * 0.22
    const zIndex = 100 - Math.round(absOffset * 10)

    return {
      transform: `translateX(${x}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity: Math.max(0, opacity),
      zIndex,
    }
  }

  // --- Shadow (far-side) cards ---
  function shadowCardStyle(index: number) {
    const count = cardCount.value
    let offset = index - animatedIndex.value
    if (offset > count / 2) offset -= count
    if (offset < -count / 2) offset += count

    const ro = -offset
    const absRo = Math.abs(ro)

    const x = ro * baseOffset
    const rotateY = ro * 8
    const scale = (1 - Math.min(absRo, 4) * 0.06) * 0.88
    const opacity = (1 - Math.min(absRo, 4) * 0.15) * 0.7
    const zIndex = 50 - Math.round(absRo * 10)

    return {
      transform: `translateY(-180px) translateZ(-80px) translateX(${x}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity: Math.max(0, opacity),
      zIndex,
    }
  }

  const activeCard = computed(() => {
    const count = cardCount.value
    if (count === 0) return undefined
    return cards.value[activeIndex.value]
  })

  onUnmounted(() => {
    cancelAnimationFrame(animRaf)
  })

  return {
    activeIndex,
    animatedIndex,
    isDragging,
    cardCount,
    visibleIndices,
    activeCard,
    goTo,
    prev,
    next,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    cardStyle,
    shadowCardStyle,
  }
}
