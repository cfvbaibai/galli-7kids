import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { themes, type ThemeName, type ThemeTokens, type ColorMode } from '@/themes'

const STORAGE_KEY_THEME = 'galli-theme'
const STORAGE_KEY_MODE = 'galli-color-mode'

export const useThemeStore = defineStore('theme', () => {
  const activeTheme = ref<ThemeName>('warmHearth')
  const colorMode = ref<ColorMode>('system')

  const currentTokens = computed<ThemeTokens>(() => themes[activeTheme.value])

  const isDark = computed(() => {
    if (colorMode.value === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return colorMode.value === 'dark'
  })

  function resolveTokens(name: ThemeName) {
    const t = themes[name]
    if (!isDark.value || !t.dark) return t

    return {
      ...t,
      colors: t.dark.colors,
      card: { ...t.card, ...t.dark.card },
    }
  }

  /**
   * Apply a theme by writing all tokens as CSS custom properties to :root
   */
  function applyTheme(name: ThemeName) {
    if (!themes[name]) return

    activeTheme.value = name
    const t = resolveTokens(name)
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

    // Dark class on html for any CSS selectors that need it
    document.documentElement.classList.toggle('dark', isDark.value)

    // Persist
    localStorage.setItem(STORAGE_KEY_THEME, name)
    localStorage.setItem(STORAGE_KEY_MODE, colorMode.value)
  }

  function setColorMode(mode: ColorMode) {
    colorMode.value = mode
    applyTheme(activeTheme.value)
  }

  /**
   * Initialize theme from localStorage or default
   */
  function init() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as ThemeName | null
    const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as ColorMode | null

    if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
      colorMode.value = savedMode
    }

    applyTheme(savedTheme && themes[savedTheme] ? savedTheme : 'warmHearth')

    // Listen for system dark mode changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (colorMode.value === 'system') {
        applyTheme(activeTheme.value)
      }
    })
  }

  return {
    activeTheme,
    colorMode,
    isDark,
    currentTokens,
    applyTheme,
    setColorMode,
    init,
  }
})
