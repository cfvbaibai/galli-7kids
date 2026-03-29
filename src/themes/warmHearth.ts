import type { ThemeTokens } from './types'

/**
 * Warm Hearth — Nature Distilled
 * Earthy, grounding — feels like sitting at a wooden table in a cozy room.
 */
export const warmHearth: ThemeTokens = {
  name: 'warmHearth',
  nameZh: '温暖壁炉',
  description: '自然质朴，像坐在温暖的木质桌前',

  colors: {
    primary: '#C67B5C',
    secondary: '#D4C4A8',
    accent: '#B5651D',
    background: '#F5F0E1',
    surface: '#EFE8E0',
    text: '#3D2B1F',
    textMuted: '#8a7a6a',
  },

  card: {
    radius: '12px',
    border: 'none',
    shadow:
      '0 2px 4px rgba(92, 72, 54, 0.1), 0 4px 12px rgba(92, 72, 54, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
    shadowHover:
      '0 8px 20px rgba(92, 72, 54, 0.2), 0 12px 30px rgba(92, 72, 54, 0.25), inset 0 2px 0 rgba(0, 0, 0, 0.1)',
    frontBg: 'linear-gradient(135deg, #f7f0eb 0%, #ffffff 100%)',
    backBg: 'linear-gradient(145deg, #efe8e0 0%, #f7f0eb 100%)',
    selectionRing: '#C67B5C',
    selectionGlow: 'rgba(196, 123, 92, 0.4)',
  },

  fonts: {
    heading: "'Caveat', cursive",
    body: "'Quicksand', sans-serif",
    card: "'Crimson Pro', serif",
  },

  effects: {
    texture: 'grain',
  },
}
