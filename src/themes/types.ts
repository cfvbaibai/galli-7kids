/**
 * Theme system types for Galli-7Kids skin switching
 */

export type ThemeName = 'warmHearth' | 'playfulCards' | 'theaterCurtain'

export interface ThemeTokens {
  name: string
  nameZh: string
  description: string

  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textMuted: string
  }

  card: {
    radius: string
    border: string
    shadow: string
    shadowHover: string
    frontBg: string
    backBg: string
    selectionRing: string
    selectionGlow: string
  }

  fonts: {
    heading: string
    body: string
    card: string
  }

  effects: {
    texture: 'grain' | 'none'
  }
}
