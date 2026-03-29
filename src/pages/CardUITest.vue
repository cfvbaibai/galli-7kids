<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { themeNames, themes } from '@/themes'
import type { ThemeName, ColorMode } from '@/themes'
import type { DarkRoomChild } from '@/types/card'
import { CHARACTER_ORDER, CHARACTER_NAMES, CHARACTER_IMAGES } from '@/types/card'
import chroma from 'chroma-js'
import { cards } from '@/data/cards'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.init()
})

// Character color map (content-level, not theme-level)
const charColors: Record<DarkRoomChild, string> = {
  seductress: '#ddcb2d',
  smallone: '#dadeda',
  sleepyhead: '#ab2d2f',
  showoff: '#1c97b2',
  aggressive: '#35965c',
  miser: '#235789',
  gossip: '#b35c2f',
}

// One card per character for the showcase
const showcaseCards = CHARACTER_ORDER.map(char => {
  const card = cards.find(c => c.backCharacter === char)!
  return card
})

// Flip & select state
const flippedCards = ref<Set<number>>(new Set())
const selectedCards = ref<Set<number>>(new Set())

// Interactive demo card
const demoFlipped = ref(false)
const demoSelected = ref(false)

const currentTheme = computed(() => themes[themeStore.activeTheme])

function charColor(char: DarkRoomChild) {
  return charColors[char]
}

function textColorFor(bgHex: string): string {
  const needsLightText = chroma.contrast(bgHex, 'white') >= 3
  const lightColor = themeStore.isDark ? 'var(--color-text)' : 'var(--color-background)'
  const darkColor = themeStore.isDark ? 'var(--color-background)' : 'var(--color-text)'
  return needsLightText ? lightColor : darkColor
}

function nameBarStyle(char: DarkRoomChild) {
  const bg = charColors[char]
  return { background: bg, color: textColorFor(bg) }
}

function switchTheme(name: ThemeName) {
  themeStore.applyTheme(name)
}

function setColorMode(mode: ColorMode) {
  themeStore.setColorMode(mode)
}

const colorModes: { value: ColorMode; label: string }[] = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

function toggleFlip(id: number) {
  if (flippedCards.value.has(id)) flippedCards.value.delete(id)
  else flippedCards.value.add(id)
}

function toggleSelect(id: number) {
  if (selectedCards.value.has(id)) selectedCards.value.delete(id)
  else selectedCards.value.add(id)
}
</script>

<template>
  <div class="card-ui-page" :style="{ background: 'var(--app-bg)', fontFamily: 'var(--font-body)' }">

    <!-- Theme Switcher (sticky top) -->
    <header class="ui-header">
      <h1 :style="{ fontFamily: 'var(--font-heading)' }">Card UI</h1>
      <p class="subtitle">卡牌双面设计验证</p>
      <div class="theme-switcher">
        <button
          v-for="name in themeNames"
          :key="name"
          class="theme-btn"
          :class="{ active: themeStore.activeTheme === name }"
          :style="{
            background: themeStore.activeTheme === name ? 'var(--color-primary)' : 'var(--color-surface)',
            color: themeStore.activeTheme === name ? 'white' : 'var(--color-text)',
          }"
          @click="switchTheme(name)"
        >
          {{ themes[name].nameZh }}
        </button>
      </div>
      <div class="mode-switcher">
        <button
          v-for="mode in colorModes"
          :key="mode.value"
          class="mode-btn"
          :class="{ active: themeStore.colorMode === mode.value }"
          :style="{
            background: themeStore.colorMode === mode.value ? 'var(--color-text)' : 'var(--color-surface)',
            color: themeStore.colorMode === mode.value ? 'var(--color-background)' : 'var(--color-text)',
          }"
          @click="setColorMode(mode.value)"
        >
          {{ mode.label }}
        </button>
      </div>
    </header>

    <!-- Section 1: All 7 Characters - Front & Back -->
    <section class="showcase-section">
      <h2 :style="{ fontFamily: 'var(--font-heading)' }">七角色卡牌</h2>
      <p class="section-desc">单击翻面 | 每个角色独特配色</p>

      <div class="card-grid">
        <div
          v-for="card in showcaseCards"
          :key="card.id"
          class="card-slot"
          @click="toggleFlip(card.id)"
        >
          <div class="card-flipper" :class="{ 'is-flipped': flippedCards.has(card.id) }">
            <!-- FRONT -->
            <div class="card-face card-front" :style="{ background: 'var(--card-front-bg)' }">
              <div v-if="currentTheme.effects.texture === 'grain'" class="grain"></div>
              <!-- Character color accent strip -->
              <div class="front-accent" :style="{ background: 'var(--color-primary)' }"></div>
              <!-- Card number -->
              <span class="card-num" :style="{ color: 'var(--color-text-muted)' }">{{ card.id }}</span>
              <!-- Action text -->
              <p class="front-text" :style="{ fontFamily: 'var(--font-card)', color: 'var(--color-text)' }">
                {{ card.frontText }}
              </p>
              <!-- Bottom decoration -->
              <div class="front-deco" :style="{ borderColor: 'var(--color-muted)' }"></div>
            </div>
            <!-- BACK -->
            <div class="card-face card-back" :style="{ background: 'var(--card-back-bg)' }">
              <div v-if="currentTheme.effects.texture === 'grain'" class="grain"></div>
              <!-- Character color border -->
              <div class="back-border" :style="{ borderColor: charColor(card.backCharacter) }"></div>
              <!-- Character image -->
              <img
                :src="card.backImage"
                :alt="card.characterName"
                class="back-image"
                loading="lazy"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
              <!-- Character name bar -->
              <div class="back-name-bar" :style="nameBarStyle(card.backCharacter)">
                <span class="back-name">{{ card.characterName }}</span>
              </div>
            </div>
          </div>
          <p class="card-char-label">{{ card.characterName }}</p>
        </div>
      </div>
    </section>

    <!-- Section 2: Size Variants -->
    <section class="showcase-section">
      <h2 :style="{ fontFamily: 'var(--font-heading)' }">尺寸对比</h2>
      <p class="section-desc">圆环小卡 vs 桌面大卡</p>

      <div class="size-compare">
        <!-- Ring size -->
        <div class="size-group">
          <p class="size-label">Ring 圆环</p>
          <div class="size-cards">
            <div class="card-flipper ring-size">
              <div class="card-face card-front" :style="{ background: 'var(--card-front-bg)' }">
                <div v-if="currentTheme.effects.texture === 'grain'" class="grain"></div>
                <div class="front-accent" :style="{ background: charColor('seductress') }"></div>
                <p class="front-text front-text-sm" :style="{ fontFamily: 'var(--font-card)', color: 'var(--color-text)' }">
                  泡一杯热牛奶
                </p>
              </div>
            </div>
            <div class="card-flipper ring-size">
              <div class="card-face card-back" :style="{ background: 'var(--card-back-bg)' }">
                <div v-if="currentTheme.effects.texture === 'grain'" class="grain"></div>
                <div class="back-border" :style="{ borderColor: charColor('aggressive') }"></div>
                <img src="/images/反面/暴躁狂.jpg" alt="暴躁狂" class="back-image" />
                <div class="back-name-bar" :style="nameBarStyle('aggressive')">
                  <span class="back-name">暴躁狂</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Table size -->
        <div class="size-group">
          <p class="size-label">Table 桌面</p>
          <div class="size-cards">
            <div class="card-flipper table-size">
              <div class="card-face card-front" :style="{ background: 'var(--card-front-bg)' }">
                <div v-if="currentTheme.effects.texture === 'grain'" class="grain"></div>
                <div class="front-accent" :style="{ background: charColor('seductress') }"></div>
                <span class="card-num" :style="{ color: charColor('seductress') }">1</span>
                <p class="front-text front-text-lg" :style="{ fontFamily: 'var(--font-card)', color: 'var(--color-text)' }">
                  泡一杯热牛奶
                </p>
                <div class="front-deco" :style="{ borderColor: charColor('seductress') }"></div>
              </div>
            </div>
            <div class="card-flipper table-size">
              <div class="card-face card-back" :style="{ background: 'var(--card-back-bg)' }">
                <div v-if="currentTheme.effects.texture === 'grain'" class="grain"></div>
                <div class="back-border" :style="{ borderColor: charColor('aggressive') }"></div>
                <img src="/images/反面/暴躁狂.jpg" alt="暴躁狂" class="back-image" />
                <div class="back-name-bar" :style="nameBarStyle('aggressive')">
                  <span class="back-name">暴躁狂</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 3: Interactive Demo -->
    <section class="showcase-section">
      <h2 :style="{ fontFamily: 'var(--font-heading)' }">交互演示</h2>
      <p class="section-desc">点击翻面 | 长按选择</p>

      <div class="demo-area">
        <div
          class="demo-card-outer"
          :class="{ 'is-selected': demoSelected }"
        >
          <div
            class="demo-card card-flipper table-size"
            :class="{ 'is-flipped': demoFlipped }"
            @click="demoFlipped = !demoFlipped"
            @contextmenu.prevent="demoSelected = !demoSelected"
          >
            <!-- Front -->
            <div class="card-face card-front" :style="{ background: 'var(--card-front-bg)' }">
              <div v-if="currentTheme.effects.texture === 'grain'" class="grain"></div>
              <div class="front-accent" :style="{ background: charColor('seductress') }"></div>
              <span class="card-num" :style="{ color: charColor('seductress') }">1</span>
              <p class="front-text front-text-lg" :style="{ fontFamily: 'var(--font-card)', color: 'var(--color-text)' }">
                泡一杯热牛奶
              </p>
              <div class="front-deco" :style="{ borderColor: charColor('seductress') }"></div>
              <!-- Selection indicator -->
              <div class="select-indicator" :class="{ active: demoSelected }">
                <svg v-if="demoSelected" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>
              </div>
            </div>
            <!-- Back -->
            <div class="card-face card-back" :style="{ background: 'var(--card-back-bg)' }">
              <div v-if="currentTheme.effects.texture === 'grain'" class="grain"></div>
              <div class="back-border" :style="{ borderColor: charColor('seductress') }"></div>
              <img src="/images/反面/多情种.jpg" alt="多情种" class="back-image" />
              <div class="back-name-bar" :style="nameBarStyle('seductress')">
                <span class="back-name">多情种</span>
              </div>
            </div>
          </div>
        </div>

        <div class="demo-controls">
          <p>状态: {{ demoFlipped ? '已翻面' : '正面' }} | {{ demoSelected ? '已选择' : '未选择' }}</p>
          <p class="hint">左键 = 翻面 | 右键 = 选择/取消</p>
          <p class="hint">Mobile: 长按 = 选择</p>
        </div>
      </div>
    </section>

    <!-- Section 4: Character Color Palette -->
    <section class="showcase-section">
      <h2 :style="{ fontFamily: 'var(--font-heading)' }">角色配色</h2>
      <div class="palette-row">
        <div
          v-for="char in CHARACTER_ORDER"
          :key="char"
          class="palette-chip"
          :style="{ '--chip-color': charColor(char) }"
        >
          <div class="chip-swatch"></div>
          <span class="chip-name">{{ CHARACTER_NAMES[char] }}</span>
          <span class="chip-hex">{{ charColor(char) }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ╹─ Page ── */
.card-ui-page {
  min-height: 100vh;
  padding: 1.5rem 1rem 3rem;
  transition: background-color 0.4s ease;
}

/* ╹─ Header ── */
.ui-header {
  text-align: center;
  margin-bottom: 2rem;
}

.ui-header h1 {
  font-size: 2rem;
  margin: 0 0 0.25rem;
  color: var(--color-text);
}

.subtitle {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 0 0 1rem;
}

.theme-switcher {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.theme-btn {
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  font-family: inherit;
}

.theme-btn:hover {
  transform: translateY(-1px);
}

.mode-switcher {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.mode-btn {
  padding: 0.3rem 0.8rem;
  border: none;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
}

.mode-btn:hover {
  transform: translateY(-1px);
}

/* ╹─ Sections ── */
.showcase-section {
  margin-bottom: 2.5rem;
}

.showcase-section h2 {
  font-size: 1.3rem;
  color: var(--color-text);
  text-align: center;
  margin: 0 0 0.25rem;
}

.section-desc {
  text-align: center;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin: 0 0 1.25rem;
}

/* ╹─ Card Grid ── */
.card-grid {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.card-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.card-char-label {
  margin-top: 0.4rem;
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

/* ╹─ Card Flipper (shared) ── */
.card-flipper {
  width: 100px;
  height: 140px;
  perspective: 800px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.2s ease;
}

.card-flipper:hover {
  transform: translateY(-3px);
}

.card-flipper.is-flipped {
  /* We animate faces, not the container */
}

.card-face {
  position: absolute;
  inset: 0;
  border-radius: var(--card-radius);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  overflow: hidden;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.card-flipper:hover .card-face {
  box-shadow: var(--card-shadow-hover);
}

/* Back face starts rotated */
.card-back {
  transform: rotateY(180deg);
}

/* Flip animation */
.is-flipped .card-front {
  transform: rotateY(-180deg);
}

.is-flipped .card-back {
  transform: rotateY(0deg);
  z-index: 1;
}

/* ╹─ Front Face ── */
.card-front {
  padding: 0.75rem 0.5rem;
  align-items: center;
  justify-content: center;
}

.front-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0.7;
}

.card-num {
  position: absolute;
  top: 6px;
  left: 8px;
  font-size: 0.65rem;
  font-weight: 700;
  opacity: 0.4;
  font-family: var(--font-card);
}

.front-text {
  font-size: 0.8rem;
  text-align: center;
  line-height: 1.45;
  z-index: 1;
  padding: 0.25rem;
  margin: 0;
}

.front-text-sm {
  font-size: 0.6rem;
}

.front-text-lg {
  font-size: 1rem;
}

.front-deco {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 24px;
  border: 1.5px solid;
  border-radius: 50%;
  opacity: 0.2;
}

/* ╹─ Back Face ── */
.card-back {
  align-items: center;
  justify-content: flex-end;
}

.back-border {
  position: absolute;
  inset: 4px;
  border: 1.5px solid;
  border-radius: calc(var(--card-radius) - 2px);
  opacity: 0.35;
  pointer-events: none;
}

.back-image {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 65%;
  object-fit: cover;
  border-radius: calc(var(--card-radius) - 4px);
}

.back-name-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.3rem 0;
  text-align: center;
}

.back-name {
  font-size: 0.75rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.05em;
}

/* ╹─ Selection ── */
.is-selected .card-face {
  outline: 2.5px solid var(--card-selection-ring);
  outline-offset: 2px;
  box-shadow: 0 0 16px var(--card-selection-glow);
}

.select-indicator {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 3;
}

.select-indicator.active {
  background: var(--card-selection-ring);
  border-color: var(--card-selection-ring);
  box-shadow: 0 0 8px var(--card-selection-glow);
}

/* ╹─ Grain ── */
.grain {
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='1'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  border-radius: inherit;
  opacity: 0.6;
  z-index: 2;
}

/* ╹─ Size Variants ── */
.size-compare {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 3rem;
  flex-wrap: wrap;
}

.size-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.size-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin: 0 0 0.75rem;
  font-weight: 600;
}

.size-cards {
  display: flex;
  gap: 1rem;
}

.ring-size {
  width: 80px;
  height: 112px;
}

.table-size {
  width: 130px;
  height: 182px;
}

/* ╹─ Interactive Demo ── */
.demo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.demo-card-outer {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.demo-card-outer:hover {
  transform: translateY(-4px);
}

.demo-controls {
  text-align: center;
}

.demo-controls p {
  font-size: 0.8rem;
  color: var(--color-text);
  margin: 0.25rem 0;
}

.hint {
  font-size: 0.75rem !important;
  color: var(--color-text-muted) !important;
  opacity: 0.7;
}

/* ╹─ Character Palette ── */
.palette-row {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.palette-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.chip-swatch {
  width: 40px;
  height: 40px;
  border-radius: var(--card-radius);
  background: var(--chip-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.chip-swatch:hover {
  transform: scale(1.1);
}

.chip-name {
  font-size: 0.75rem;
  color: var(--color-text);
  font-weight: 500;
}

.chip-hex {
  font-size: 0.6rem;
  color: var(--color-text-muted);
  font-family: monospace;
}
</style>
