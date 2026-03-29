import type { ThemeName, ThemeTokens } from './types'
import { warmHearth } from './warmHearth'
import { playfulCards } from './playfulCards'
import { theaterCurtain } from './theaterCurtain'

export type { ThemeName, ThemeTokens }

export const themes: Record<ThemeName, ThemeTokens> = {
  warmHearth,
  playfulCards,
  theaterCurtain,
}

export const themeNames: ThemeName[] = ['warmHearth', 'playfulCards', 'theaterCurtain']
