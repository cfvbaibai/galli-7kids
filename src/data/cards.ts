import type { Card, DarkRoomChild } from '@/types/card'
import { CHARACTER_NAMES, CHARACTER_IMAGES, CHARACTER_ORDER } from '@/types/card'

/**
 * Mock action texts for card fronts (49 cards)
 * Each character has 7 unique actions
 */
const mockActions: string[] = [
  // 多情种 Seductress - Love & Connection (7)
  '泡一杯热牛奶',
  '给朋友打个电话',
  '写一封手写信',
  '约喜欢的人见面',
  '说一句"我爱你"',
  '给别人一个拥抱',
  '分享一件开心的事',

  // 小不点 Small One - Humility & Innocence (7)
  '蹲下来看一朵花',
  '承认自己不懂',
  '问一个天真的问题',
  '像孩子一样玩耍',
  '原谅自己的错误',
  '说出自己的害怕',
  '让别人帮自己一次',

  // 睡不醒 Sleepyhead - Rest & Intuition (7)
  '睡个午觉',
  '发呆十分钟',
  '关掉闹钟再睡一会',
  '跟着感觉走',
  '什么都不做',
  '冥想五分钟',
  '相信自己的直觉',

  // 自大狂 Showoff - Confidence & Leadership (7)
  '接受别人的夸奖',
  '展示自己的作品',
  '说一句"我很棒"',
  '承担一个挑战',
  '做一次演讲',
  '领导一个项目',
  '穿上最喜欢的衣服',

  // 暴躁狂 Aggressive - Action & Passion (7)
  '大声喊出来',
  '去跑步发泄',
  '说出自己的不满',
  '做一个快速决定',
  '撕掉一张纸',
  '打破一项规则',
  '尝试一项新运动',

  // 吝啬鬼 Miser - Boundaries & Protection (7)
  '拒绝一个请求',
  '整理自己的房间',
  '丢掉不需要的东西',
  '说一句"不行"',
  '保护自己的时间',
  '检查自己的账单',
  '设定一个界限',

  // 包打听 Gossip - Communication & Curiosity (7)
  '问一个深入的问题',
  '听别人说完话',
  '分享一个小秘密',
  '搜索一个感兴趣的话题',
  '和陌生人聊天',
  '打听一个新消息',
  '学一项新技能',
]

/**
 * Character assignments for 49 cards (7 cards per character)
 */
const characterOrder: DarkRoomChild[] = [
  'seductress', 'seductress', 'seductress', 'seductress', 'seductress', 'seductress', 'seductress',
  'smallone', 'smallone', 'smallone', 'smallone', 'smallone', 'smallone', 'smallone',
  'sleepyhead', 'sleepyhead', 'sleepyhead', 'sleepyhead', 'sleepyhead', 'sleepyhead', 'sleepyhead',
  'showoff', 'showoff', 'showoff', 'showoff', 'showoff', 'showoff', 'showoff',
  'aggressive', 'aggressive', 'aggressive', 'aggressive', 'aggressive', 'aggressive', 'aggressive',
  'miser', 'miser', 'miser', 'miser', 'miser', 'miser', 'miser',
  'gossip', 'gossip', 'gossip', 'gossip', 'gossip', 'gossip', 'gossip',
]

/**
 * All 49 cards
 */
export const cards: Card[] = mockActions.map((action, index) => {
  const id = index + 1
  const character = characterOrder[index]

  return {
    id,
    frontText: action,
    backCharacter: character,
    backImage: CHARACTER_IMAGES[character],
    characterName: CHARACTER_NAMES[character],
  }
})

// Re-export CHARACTER_ORDER for components
export { CHARACTER_ORDER }

/**
 * Get cards grouped by character
 */
export function getCardsByCharacter(): Record<DarkRoomChild, Card[]> {
  const result = {} as Record<DarkRoomChild, Card[]>

  for (const char of CHARACTER_ORDER) {
    result[char] = []
  }

  for (const card of cards) {
    result[card.backCharacter].push(card)
  }

  return result
}

/**
 * Get cards in 7x7 grid format (row-major order)
 * Each row contains one card from each character
 */
export function getCardsGrid(): Card[][] {
  const byCharacter = getCardsByCharacter()
  const grid: Card[][] = []

  for (let row = 0; row < 7; row++) {
    const rowCards: Card[] = []
    for (const char of CHARACTER_ORDER) {
      rowCards.push(byCharacter[char][row])
    }
    grid.push(rowCards)
  }

  return grid
}

/**
 * Get a card by its ID
 */
export function getCardById(id: number): Card | undefined {
  return cards.find(c => c.id === id)
}
