/**
 * Theme system types for Galli-7Kids skin switching
 */

export type ThemeName = 'warmHearth' | 'playfulCards' | 'theaterCurtain'
export type ColorMode = 'light' | 'dark' | 'system'

export interface ThemeColorTokens {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textMuted: string
}

export interface ThemeCardTokens {
  radius: string
  border: string
  shadow: string
  shadowHover: string
  frontBg: string
  backBg: string
  selectionRing: string
  selectionGlow: string
}

export interface ThemeTokens {
  name: string
  nameZh: string
  description: string

  colors: ThemeColorTokens
  card: ThemeCardTokens

  fonts: {
    heading: string
    body: string
    card: string
  }

  effects: {
    texture: 'grain' | 'none'
  }

  dark?: {
    colors: ThemeColorTokens
    card?: Partial<ThemeCardTokens>
  }
}
