import type { ThemeTokens } from './types'

/**
 * Theater Curtain — Vintage Analog
 * Nostalgic, theatrical — feels like stepping into the Galli Theater itself.
 */
export const theaterCurtain: ThemeTokens = {
  name: 'theaterCurtain',
  nameZh: '剧院幕布',
  description: '复古优雅，像翻开泛黄的老照片',

  colors: {
    primary: '#D4A574',
    secondary: '#F5E6C8',
    accent: '#4A7B7C',
    background: '#FAF0E4',
    surface: '#F0E2D0',
    text: '#2C1810',
    textMuted: '#7A6A5A',
  },

  card: {
    radius: '8px',
    border: 'none',
    shadow:
      '0 2px 8px rgba(100, 60, 20, 0.15), 0 4px 16px rgba(100, 60, 20, 0.1)',
    shadowHover:
      '0 6px 20px rgba(100, 60, 20, 0.25), 0 10px 30px rgba(100, 60, 20, 0.15)',
    frontBg: 'linear-gradient(135deg, #FAF0E4 0%, #F5E6C8 100%)',
    backBg: 'linear-gradient(145deg, #E8D5B8 0%, #FAF0E4 100%)',
    selectionRing: '#7A3B3B',
    selectionGlow: 'rgba(122, 59, 59, 0.4)',
  },

  fonts: {
    heading: "'Playfair Display', '思源黑体', serif",
    body: "'Lora', '思源黑体', serif",
    card: "'Lora', '思源黑体', serif",
  },

  effects: {
    texture: 'grain',
  },

  dark: {
    colors: {
      primary: '#D4A574',
      secondary: '#4A3A28',
      accent: '#6AABA8',
      background: '#12100C',
      surface: '#1C1814',
      text: '#F0E0CC',
      textMuted: '#8A7A68',
    },
    card: {
      shadow:
        '0 2px 8px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3)',
      shadowHover:
        '0 6px 20px rgba(0, 0, 0, 0.5), 0 10px 30px rgba(0, 0, 0, 0.4)',
      frontBg: 'linear-gradient(135deg, #1C1814 0%, #12100C 100%)',
      backBg: 'linear-gradient(145deg, #12100C 0%, #1C1814 100%)',
      border: '1px solid rgba(212, 165, 116, 0.12)',
      selectionGlow: 'rgba(122, 59, 59, 0.35)',
    },
  },
}
