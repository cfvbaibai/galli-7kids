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
    heading: "'Fredoka', '思源黑体', sans-serif",
    body: "'Nunito', '思源黑体', sans-serif",
    card: "'Nunito', '思源黑体', sans-serif",
  },

  effects: {
    texture: 'none',
  },

  dark: {
    colors: {
      primary: '#FFB4A8',
      secondary: '#3A3545',
      accent: '#B4FFB4',
      background: '#1A1520',
      surface: '#251F2D',
      text: '#F0E8F5',
      textMuted: '#9A8AA0',
    },
    card: {
      border: '3px solid rgba(255, 255, 255, 0.1)',
      shadow:
        'inset -2px -2px 8px rgba(0, 0, 0, 0.25), 4px 4px 8px rgba(0, 0, 0, 0.3)',
      shadowHover:
        'inset -2px -2px 12px rgba(0, 0, 0, 0.3), 6px 6px 16px rgba(0, 0, 0, 0.4)',
      frontBg: 'linear-gradient(145deg, #251F2D 0%, #1A1520 100%)',
      backBg: 'linear-gradient(145deg, #1A1520 0%, #251F2D 100%)',
      selectionGlow: 'rgba(255, 158, 205, 0.4)',
    },
  },
}
