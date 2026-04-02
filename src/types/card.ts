/**
 * Dark Room Children character types
 * 7 characters based on Galli Theater theory
 */
export type DarkRoomChild =
  | 'seductress'  // 多情种
  | 'smallone'    // 小不点
  | 'sleepyhead'  // 睡不醒
  | 'showoff'     // 自大狂
  | 'aggressive'  // 暴躁狂
  | 'miser'       // 吝啬鬼
  | 'gossip'      // 包打听

/**
 * Character display order for grid and slots
 */
export const CHARACTER_ORDER: DarkRoomChild[] = [
  'seductress',
  'smallone',
  'sleepyhead',
  'showoff',
  'aggressive',
  'miser',
  'gossip',
]

/**
 * Character display names in Chinese (matching image filenames)
 */
export const CHARACTER_NAMES: Record<DarkRoomChild, string> = {
  seductress: '多情种',
  smallone: '小不点',
  sleepyhead: '睡不醒',
  showoff: '自大狂',
  aggressive: '暴躁狂',
  miser: '吝啬鬼',
  gossip: '包打听',
}

const base = import.meta.env.BASE_URL

/**
 * Character image paths (matching actual file names)
 */
export const CHARACTER_IMAGES: Record<DarkRoomChild, string> = {
  seductress: `${base}images/反面/多情种.jpg`,
  smallone: `${base}images/反面/小不点.jpg`,
  sleepyhead: `${base}images/反面/睡不醒.jpg`,
  showoff: `${base}images/反面/自大狂.jpg`,
  aggressive: `${base}images/反面/暴躁狂.jpg`,
  miser: `${base}images/反面/吝啬鬼.jpg`,
  gossip: `${base}images/反面/包打听.jpg`,
}

/**
 * Card structure
 */
export interface Card {
  id: number                      // 1-49
  frontText: string               // Action description (正面文字)
  backCharacter: DarkRoomChild    // Character key (反面角色)
  backImage: string               // Path to character image
  characterName: string           // Chinese character name
}

/**
 * Game phases
 */
export type GamePhase = 'selecting' | 'viewing' | 'interpreting'

/**
 * Slot position on the table (for drag target)
 */
export interface SlotPosition {
  character: DarkRoomChild
  x: number       // percentage 0-100
  y: number       // percentage 0-100
  width: number   // percentage
  height: number  // percentage
}
