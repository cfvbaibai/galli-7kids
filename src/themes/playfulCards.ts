import type { ThemeTokens } from './types'

/**
 * Playful Cards — Claymorphism
 * Toy-like, approachable — feels like a storybook game with physical cards.
 */
export const playfulCards: ThemeTokens = {
  name: 'playfulCards',
  nameZh: '趣味卡片',
  description: '柔和立体，像拿起真实的玩具卡牌',

  colors: {
    primary: '#FDBCB4',
    secondary: '#ADD8E6',
    accent: '#98FF98',
    background: '#FFF8F0',
    surface: '#FFF0E6',
    text: '#4A3728',
    textMuted: '#9A8A7A',
  },

  card: {
    radius: '20px',
    border: '3px solid rgba(255, 255, 255, 0.6)',
    shadow:
      'inset -2px -2px 8px rgba(0, 0, 0, 0.08), 4px 4px 8px rgba(0, 0, 0, 0.1)',
    shadowHover:
      'inset -2px -2px 12px rgba(0, 0, 0, 0.1), 6px 6px 16px rgba(0, 0, 0, 0.15)',
    frontBg: 'linear-gradient(145deg, #FFF8F0 0%, #FFE8D6 100%)',
    backBg: 'linear-gradient(145deg, #E8F4FD 0%, #FFF0E6 100%)',
    selectionRing: '#FF9ECD',
    selectionGlow: 'rgba(255, 158, 205, 0.5)',
  },

  fonts: {
    heading: "'Fredoka', sans-serif",
    body: "'Nunito', sans-serif",
    card: "'Nunito', sans-serif",
  },

  effects: {
    texture: 'none',
  },
}
