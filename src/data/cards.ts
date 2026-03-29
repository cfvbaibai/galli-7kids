import type { Card, DarkRoomChild } from '@/types/card'
import { CHARACTER_NAMES, CHARACTER_IMAGES, CHARACTER_ORDER } from '@/types/card'

/**
 * Mock action texts for card fronts (49 cards)
 * Each character has 7 unique actions
 */
const mockActions: string[] = [
  // 多情种 Seductress - Love & Connection (7)
  '说出“我想你了”，“我爱你”',
  '并肩走路时手拉手',
  '享受身体亲密时光',
  '制造浪漫氛围',
  '知道和相信自己的美',
  '一个温柔的拥抱胜过千言万语',
  '靠在对方肩上小憩',

  // 小不点 Small One - Humility & Innocence (7)
  '把没用的样子展现出来',
  '记住自己可以不开心',
  '撒娇求安慰，表达“我需要你”',
  '坦白说“我害怕”',
  '在对方面前睡着，像个孩子',
  '在对方面前安心哭泣',
  '寻找生活中，美好的小细节',

  // 睡不醒 Sleepyhead - Rest & Intuition (7)
  '让自己舒舒服服最重要',
  '让身体暖和和的，不让自己受凉',
  '早点躺下休息，困了就睡',
  '深呼吸，提醒自己慢慢来不着急',
  '做开心的吃货，不用考虑减肥',
  '一起泡温泉，吃吃喝喝躺着',
  '随身携带喜欢的小零食',

  // 自大狂 Showoff - Confidence & Leadership (7)
  '深信自己值得被爱',
  '满足对方的需求',
  '无条件地说一句：“我在”',
  '把时间分给对方',
  '舍得花钱给自己/对方买礼物',
  '在关键时刻提供支持',
  '分享自己的知识与经验',

  // 暴躁狂 Aggressive - Action & Passion (7)
  '冷战时做打破僵局的那个人',
  '坚信幸福要靠自己去争取',
  '勇于做出选择',
  '直球表白：“我喜欢你”',
  '敢于道歉，说出“我错了对不起”',
  '敢于争吵，表达我的不满',
  '想Ta就去找Ta',

  // 吝啬鬼 Miser - Boundaries & Protection (7)
  '保留独处时间',
  '尊重对方的私人空间',
  '不窥探隐私',
  '在亲密中保持清晰分寸',
  '制定相处规则123',
  '明确告诉对方自己的需求',
  '对于不想做的事，勇敢说“不”',

  // 包打听 Gossip - Communication & Curiosity (7)
  '用心记住对方讲的小细节',
  '了解对方的所有历史也坦白自己的所有历史',
  '找到他/她特别喜欢的东西',
  '发现对方的关心方式并回应',
  '观察对方的小习惯，也告诉对方自己的小习惯',
  '在琐碎日常里找到爱的线索',
  '告诉他/她让自己开心的方式',
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
