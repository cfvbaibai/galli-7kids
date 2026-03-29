import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { themes, type ThemeName, type ThemeTokens } from '@/themes'

const STORAGE_KEY = 'galli-theme'

export const useThemeStore = defineStore('theme', () => {
  const activeTheme = ref<ThemeName>('warmHearth')

  const currentTokens = computed<ThemeTokens>(() => themes[activeTheme.value])

  /**
   * Apply a theme by writing all tokens as CSS custom properties to :root
   */
  function applyTheme(name: ThemeName) {
    if (!themes[name]) return

    activeTheme.value = name
    const t = themes[name]
    const root = document.documentElement.style

    // Colors
    root.setProperty('--color-primary', t.colors.primary)
    root.setProperty('--color-secondary', t.colors.secondary)
    root.setProperty('--color-accent', t.colors.accent)
    root.setProperty('--color-background', t.colors.background)
    root.setProperty('--color-surface', t.colors.surface)
    root.setProperty('--color-text', t.colors.text)
    root.setProperty('--color-text-muted', t.colors.textMuted)

    // Card
    root.setProperty('--card-radius', t.card.radius)
    root.setProperty('--card-border', t.card.border)
    root.setProperty('--card-shadow', t.card.shadow)
    root.setProperty('--card-shadow-hover', t.card.shadowHover)
    root.setProperty('--card-front-bg', t.card.frontBg)
    root.setProperty('--card-back-bg', t.card.backBg)
    root.setProperty('--card-selection-ring', t.card.selectionRing)
    root.setProperty('--card-selection-glow', t.card.selectionGlow)

    // Fonts
    root.setProperty('--font-heading', t.fonts.heading)
    root.setProperty('--font-body', t.fonts.body)
    root.setProperty('--font-card', t.fonts.card)

    // Effects
    root.setProperty('--effect-texture', t.effects.texture)

    // Background
    root.setProperty('--app-bg', t.colors.background)

    // Persist
    localStorage.setItem(STORAGE_KEY, name)
  }

  /**
   * Initialize theme from localStorage or default
   */
  function init() {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeName | null
    applyTheme(saved && themes[saved] ? saved : 'warmHearth')
  }

  return {
    activeTheme,
    currentTokens,
    applyTheme,
    init,
  }
})
