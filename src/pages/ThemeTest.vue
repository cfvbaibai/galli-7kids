<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { themeNames, themes } from '@/themes'
import type { ThemeName } from '@/themes'
import { cards } from '@/data/cards'

const themeStore = useThemeStore()

// Pick 3 sample cards from different characters
const sampleCards = [cards[0], cards[7], cards[14]] // seductress, smallone, sleepyhead

const flipped = ref<Set<number>>(new Set())
const selected = ref<Set<number>>(new Set([sampleCards[1].id]))

onMounted(() => {
  themeStore.init()
})

function switchTheme(name: ThemeName) {
  themeStore.applyTheme(name)
}

function toggleFlip(cardId: number) {
  if (flipped.value.has(cardId)) flipped.value.delete(cardId)
  else flipped.value.add(cardId)
}

function toggleSelect(cardId: number) {
  if (selected.value.has(cardId)) selected.value.delete(cardId)
  else selected.value.add(cardId)
}

const currentTheme = computed(() => themes[themeStore.activeTheme])
</script>

<template>
  <div class="theme-test-page" :style="{ background: 'var(--app-bg)', fontFamily: 'var(--font-body)' }">
    <!-- Header -->
    <header class="test-header">
      <h1 :style="{ fontFamily: 'var(--font-heading)' }">Theme POC</h1>
      <p class="subtitle">设计皮肤切换验证</p>

      <!-- Theme Switcher -->
      <div class="theme-switcher">
        <button
          v-for="name in themeNames"
          :key="name"
          class="theme-btn"
          :class="{ active: themeStore.activeTheme === name }"
          :style="{
            fontFamily: 'var(--font-body)',
            background: themeStore.activeTheme === name ? 'var(--color-primary)' : 'var(--color-surface)',
            color: themeStore.activeTheme === name ? 'white' : 'var(--color-text)',
          }"
          @click="switchTheme(name)"
        >
          {{ themes[name].nameZh }}
        </button>
      </div>

      <p class="theme-desc">{{ currentTheme.description }}</p>
    </header>

    <!-- Card Preview Area -->
    <section class="card-preview">
      <h2 :style="{ fontFamily: 'var(--font-heading)' }">Card 预览</h2>

      <div class="card-row">
        <div
          v-for="card in sampleCards"
          :key="card.id"
          class="themed-card-wrapper"
          :class="{ 'is-selected': selected.has(card.id) }"
          @click="toggleSelect(card.id)"
        >
          <!-- Flip on double-click -->
          <div
            class="themed-card"
            :class="{ 'is-flipped': flipped.has(card.id) }"
            @dblclick.prevent="toggleFlip(card.id)"
          >
            <!-- Front -->
            <div class="themed-card-face themed-card-front" :style="{ background: 'var(--card-front-bg)' }">
              <div v-if="currentTheme.effects.texture === 'grain'" class="grain-overlay"></div>
              <p class="card-front-text" :style="{ fontFamily: 'var(--font-card)', color: 'var(--color-text)' }">
                {{ card.frontText }}
              </p>
              <div class="select-dot" :class="{ selected: selected.has(card.id) }"></div>
            </div>
            <!-- Back -->
            <div class="themed-card-face themed-card-back" :style="{ background: 'var(--card-back-bg)' }">
              <div v-if="currentTheme.effects.texture === 'grain'" class="grain-overlay"></div>
              <div class="card-back-content">
                <div class="char-image-placeholder" :style="{ background: 'var(--color-primary)', opacity: 0.2 }"></div>
                <p class="card-back-name" :style="{ fontFamily: 'var(--font-card)', color: 'var(--color-text)' }">
                  {{ card.characterName }}
                </p>
              </div>
            </div>
          </div>
          <p class="card-label">{{ flipped.has(card.id) ? '翻面' : '正面' }} | {{ selected.has(card.id) ? '已选' : '未选' }}</p>
        </div>
      </div>

      <p class="hint">单击 = 选择/取消 | 双击 = 翻面</p>
    </section>

    <!-- Token Inspector -->
    <section class="token-inspector">
      <h2 :style="{ fontFamily: 'var(--font-heading)' }">Design Tokens</h2>

      <div class="token-grid">
        <div class="token-group">
          <h3>Colors</h3>
          <div class="token-item">
            <span class="swatch" :style="{ background: 'var(--color-primary)' }"></span>
            <span>Primary: <code>{{ currentTheme.colors.primary }}</code></span>
          </div>
          <div class="token-item">
            <span class="swatch" :style="{ background: 'var(--color-secondary)' }"></span>
            <span>Secondary: <code>{{ currentTheme.colors.secondary }}</code></span>
          </div>
          <div class="token-item">
            <span class="swatch" :style="{ background: 'var(--color-accent)' }"></span>
            <span>Accent: <code>{{ currentTheme.colors.accent }}</code></span>
          </div>
          <div class="token-item">
            <span class="swatch" :style="{ background: 'var(--color-background)' }"></span>
            <span>Background: <code>{{ currentTheme.colors.background }}</code></span>
          </div>
          <div class="token-item">
            <span class="swatch" :style="{ background: 'var(--color-text)' }"></span>
            <span>Text: <code>{{ currentTheme.colors.text }}</code></span>
          </div>
        </div>

        <div class="token-group">
          <h3>Card</h3>
          <div class="token-item">
            <span>Radius: <code>{{ currentTheme.card.radius }}</code></span>
          </div>
          <div class="token-item">
            <span>Border: <code>{{ currentTheme.card.border || 'none' }}</code></span>
          </div>
          <div class="token-item">
            <span>Texture: <code>{{ currentTheme.effects.texture }}</code></span>
          </div>
        </div>

        <div class="token-group">
          <h3>Typography</h3>
          <div class="token-item">
            <span>Heading: <code>{{ currentTheme.fonts.heading }}</code></span>
          </div>
          <div class="token-item">
            <span>Body: <code>{{ currentTheme.fonts.body }}</code></span>
          </div>
          <div class="token-item">
            <span>Card: <code>{{ currentTheme.fonts.card }}</code></span>
          </div>
        </div>
      </div>

      <!-- Font Samples -->
      <div class="font-samples">
        <h2 :style="{ fontFamily: 'var(--font-heading)' }">Font Sample 字体样例</h2>
        <p :style="{ fontFamily: 'var(--font-heading)', fontSize: '2rem', margin: 0 }">Heading 标题</p>
        <p :style="{ fontFamily: 'var(--font-body)', fontSize: '1rem', margin: '0.5rem 0' }">Body text 正文 — 七个暗室小孩心理咨询工具</p>
        <p :style="{ fontFamily: 'var(--font-card)', fontSize: '1.1rem', margin: 0, fontStyle: 'italic' }">Card text 卡片文字 — 泡一杯热牛奶</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.theme-test-page {
  min-height: 100vh;
  padding: 1.5rem 1rem;
  transition: background-color 0.4s ease;
}

/* Header */
.test-header {
  text-align: center;
  margin-bottom: 2rem;
}

.test-header h1 {
  font-size: 2rem;
  margin: 0 0 0.25rem;
  color: var(--color-text);
}

.subtitle {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 0 0 1.25rem;
}

/* Theme Switcher */
.theme-switcher {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.theme-btn {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.theme-btn.active {
  box-shadow: 0 2px 12px var(--card-selection-glow);
}

.theme-desc {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin: 0;
}

/* Card Preview */
.card-preview {
  margin-bottom: 2rem;
}

.card-preview h2 {
  font-size: 1.25rem;
  color: var(--color-text);
  text-align: center;
  margin-bottom: 1rem;
}

.card-row {
  display: flex;
  justify-content: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.card-label {
  text-align: center;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 0.5rem;
}

.hint {
  text-align: center;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 1rem;
  opacity: 0.7;
}

/* Themed Card */
.themed-card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.themed-card-wrapper:hover {
  transform: translateY(-2px);
}

.themed-card {
  width: 120px;
  height: 160px;
  perspective: 600px;
}

.themed-card-face {
  position: absolute;
  inset: 0;
  border-radius: var(--card-radius);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  overflow: hidden;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.themed-card:hover .themed-card-face {
  box-shadow: var(--card-shadow-hover);
}

.themed-card-back {
  transform: rotateY(180deg);
}

/* Flip animation */
.themed-card.is-flipped .themed-card-front {
  transform: rotateY(-180deg);
}

.themed-card.is-flipped .themed-card-back {
  transform: rotateY(0deg);
  z-index: 1;
}

/* Selection ring */
.themed-card-wrapper.is-selected .themed-card-face {
  outline: 2px solid var(--card-selection-ring);
  outline-offset: 2px;
  box-shadow: 0 0 12px var(--card-selection-glow);
}

/* Front face content */
.card-front-text {
  font-size: 0.85rem;
  text-align: center;
  padding: 0.5rem;
  line-height: 1.4;
  z-index: 1;
}

/* Select dot */
.select-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid var(--color-text-muted);
  background: var(--color-background);
  transition: all 0.2s ease;
  z-index: 2;
}

.select-dot.selected {
  background: var(--card-selection-ring);
  border-color: var(--card-selection-ring);
  box-shadow: 0 0 6px var(--card-selection-glow);
}

/* Back face content */
.card-back-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  z-index: 1;
}

.char-image-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

.card-back-name {
  font-size: 0.95rem;
  font-weight: 600;
  text-align: center;
}

/* Grain overlay */
.grain-overlay {
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='1'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  border-radius: inherit;
  opacity: 0.6;
}

/* Token Inspector */
.token-inspector {
  max-width: 600px;
  margin: 0 auto;
}

.token-inspector h2 {
  font-size: 1.25rem;
  color: var(--color-text);
  text-align: center;
  margin-bottom: 1rem;
}

.token-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.token-group h3 {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--color-surface);
}

.token-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--color-text);
  margin-bottom: 0.4rem;
}

.swatch {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

code {
  font-family: monospace;
  font-size: 0.75rem;
  background: var(--color-surface);
  padding: 1px 4px;
  border-radius: 3px;
}

/* Font Samples */
.font-samples {
  text-align: center;
  padding: 1.5rem;
  border-radius: var(--card-radius);
  background: var(--color-surface);
}

.font-samples h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.font-samples p {
  color: var(--color-text);
}
</style>
