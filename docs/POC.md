# Galli-7Kids POC 实施文档

> **版本**: v1.3
> **最后更新**: 2026-03-21
> **状态**: 待开发

---

## 1. POC 目标

验证核心交互流程的可行性，为后续开发奠定技术基础。

---

## 2. POC 范围

### 2.1 设计方向

> **Use `/frontend-design` skill for all UI work**

**Aesthetic**: "Woven Warmth" - 溫暖、舒適、情感安全的視覺設計

#### 色彩系统

```css
:root {
  /* Base - warm cream & linen */
  --base-100: #faf6f1;      /* cream paper */
  --base-200: #f5ede4;      /* warm linen */
  --base-300: #e8ddd1;      /* soft sand */
  --base-content: #3d3629;  /* warm brown text */

  /* Accent - terracotta & sage */
  --accent-warm: #c4846c;   /* terracotta */
  --accent-sage: #8fa68a;   /* sage green */
  --accent-gold: #d4a853;   /* honey gold */
  --accent-rose: #d4a5a5;   /* dusty rose */

  /* Character colors */
  --char-miser: #b8956e;    /* warm bronze */
  --char-showoff: #c9a85c;  /* antique gold */
  --char-aggressive: #c47a5e; /* terracotta */
  --char-seductress: #c48b8b; /* dusty rose */
  --char-gossip: #9db09d;   /* sage */
  --char-sleepyhead: #8fa5b5; /* dusty blue */
  --char-smallone: #a5a08b; /* warm sage */
}
```

#### 字体

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600&display=swap');

:root {
  --font-display: 'Fraunces', serif;  /* headlines */
  --font-body: 'Nunito', sans-serif;  /* body text */
  --font-card: 'Quicksand', sans-serif; /* card text */
}
```

#### DaisyUI 自定义主题

```json
{
  "daisyui": {
    "themes": [{
      "galliWarm": {
        "primary": "#c4846c",
        "secondary": "#8fa68a",
        "accent": "#d4a853",
        "neutral": "#3d3629",
        "base-100": "#faf6f1",
        "base-200": "#f5ede4",
        "base-300": "#e8ddd1"
      }
    }]
  }
}
```

#### 设计要点

| 元素 | 方向 |
|------|------|
| **Colors** | 暖色中性 (cream, sand, terracotta) - 忌冷灰 |
| **Typography** | 圆润友好字体 - 避免通用字体如 Inter, Roboto |
| **Shapes** | 有机、圆润、略不规则 - 手工感 |
| **Shadows** | 暖色调、柔和、漫射 |
| **Animation** | 轻柔、呼吸感、缓动 - 忌突兀 |
| **Texture** | 细腻噪点、纸质感、柔和晕影 |
| **Feedback** | 柔和光晕、轻柔脉动 - 安全感 |

### 2.2 功能范围

| 功能 | 包含 | 说明 |
|------|:----:|------|
| 选卡模式 | 仅明牌 | 不含随机选卡 |
| 卡牌数量 | 49 张 | 完整 7×7 网格 |
| 选择数量 | 1~10 张 | - |
| 卡牌翻面 | ✓ | CSS 3D 动画 |
| 拖拽至槽位 | ✓ | 触控友好 |
| Reset/Restart | ✓ | - |
| 随机选卡 | ✗ | 后续版本 |
| 角色说明 | ✗ | 后续版本 |
| 卡牌对照表 | ✗ | 后续版本 |

### 2.2 技术方案

| 项目 | 决策 |
|------|------|
| 框架 | Vue 3 + TypeScript + Vite |
| 样式 | Tailwind CSS |
| 渲染 | DOM (CSS 3D flip) |
| 状态管理 | **Pinia** |
| 架构 | Headless (状态/UI 分离) |
| 适配 | Mobile-First |
| 工具库 | **VueUse + Lodash-ES** |

**工具库使用**:

```typescript
// Pinia - 全局状态管理
import { defineStore } from 'pinia'
import { useCardGameStore } from '@/stores/cardGame'

// VueUse - 拖拽、事件、响应式等
import { useDraggable, usePointer, useEventListener } from '@vueuse/core'

// Lodash-ES - 支持 tree-shaking
import { shuffle, chunk, sample, debounce } from 'lodash-es'
```

| 场景 | 使用 |
|------|------|
| 全局状态 | `pinia → defineStore` (卡牌选择、游戏阶段) |
| 拖拽追踪 | `@vueuse/core → useDraggable` |
| 事件监听 | `@vueuse/core → useEventListener` |
| 窗口尺寸 | `@vueuse/core → useWindowSize` |
| 随机选卡 | `lodash-es → shuffle, sample` |
| 数组分组 | `lodash-es → chunk` (7×7 网格) |
| 防抖节流 | `lodash-es → debounce, throttle` |

---

## 3. 卡牌设计

### 3.1 卡面实现

```
┌─────────────────────────────────────┐
│                                     │
│           【正面 - 行动面】           │
│                                     │
│                                     │
│         "泡一杯热牛奶"                │
│         (纯文字展示)                  │
│                                     │
│                                     │
└─────────────────────────────────────┘
                   ↕
┌─────────────────────────────────────┐
│                                     │
│          【反面 - 角色面】            │
│                                     │
│         ┌───────────────┐           │
│         │               │           │
│         │ [角色插画图片] │           │
│         │               │           │
│         └───────────────┘           │
│                                     │
└─────────────────────────────────────┘
```

| 卡面 | POC 实现 |
|------|---------|
| **正面** | 纯文字 (mock 行动描述) |
| **反面** | Sample photos (7 张角色卡图片循环使用) |

### 3.2 49 张卡牌分配

每个角色对应 7 张卡牌：

| 角色 | 卡牌 ID | 反面图片 |
|------|---------|---------|
| 多情种 | 1-7 | 多情种.jpg |
| 小不点 | 8-14 | 小不点.jpg |
| 睡不醒 | 15-21 | 睡不醒.jpg |
| 自大狂 | 22-28 | 自大狂.jpg |
| 暴躁狂 | 29-35 | 暴躁狂.jpg |
| 吝啬鬼 | 36-42 | 吝啬鬼.jpg |
| 包打听 | 43-49 | 包打听.jpg |

### 3.3 Mock 正面文字

```json
[
  "泡一杯热牛奶",
  "独自看电影",
  "整理房间",
  "听喜欢的音乐",
  "清空购物车",
  "点香薰蜡烛",
  "写日记",
  "散步",
  "晒太阳",
  "给朋友打电话",
  "做一顿美食",
  "泡澡",
  "发呆",
  "睡个午觉",
  "看书",
  "运动",
  "逛超市",
  "喝咖啡",
  "画画",
  "唱歌",
  "跳舞",
  "整理照片",
  "学新技能",
  "冥想",
  "做手工",
  "玩游戏",
  "看综艺",
  "吃零食",
  "网购",
  "刷手机",
  "撸猫/狗",
  "养植物",
  "换发型",
  "买新衣服",
  "去咖啡厅",
  "约朋友",
  "写计划",
  "复盘",
  "设目标",
  "断舍离",
  "修东西",
  "学做菜",
  "听播客",
  "看展览",
  "去公园",
  "拍照",
  "录视频",
  "尝试新路",
  "早睡"
]
```

---

## 4. 素材清单

### 4.1 可用素材

路径: `src/assets/images/samples/`

| 类型 | 文件名 | 用途 |
|------|--------|------|
| 角色 | 反面/多情种.jpg | ✓ 卡牌反面 |
| 角色 | 反面/小不点.jpg | ✓ 卡牌反面 |
| 角色 | 反面/睡不醒.jpg | ✓ 卡牌反面 |
| 角色 | 反面/自大狂.jpg | ✓ 卡牌反面 |
| 角色 | 反面/暴躁狂.jpg | ✓ 卡牌反面 |
| 角色 | 反面/吝啬鬼.jpg | ✓ 卡牌反面 |
| 角色 | 反面/包打听.jpg | ✓ 卡牌反面 |
| 背景 | 背景/背景+7个小孩卡槽.jpg | ✓ 桌面背景 |
| 行动 | 正面/*.jpg | ✗ POC 不使用 |

### 4.2 背景槽位

背景图包含 7 个槽位，呈拱形排列。需测量每个槽位的：

- 中心坐标 (x, y)
- 尺寸 (width, height)

用于拖拽放置的目标区域判定。

---

## 5. 开发任务

### 5.1 任务清单

| # | 任务 | 状态 |
|---|------|:----:|
| 1 | 项目脚手架 (Vite + Vue 3 + TS) | ⬜ |
| 2 | Tailwind CSS 配置 | ⬜ |
| 3 | 类型定义 (`types/card.ts`) | ⬜ |
| 4 | 卡牌数据 JSON | ⬜ |
| 5 | `useCardDeck` composable | ⬜ |
| 6 | `useCardGame` composable | ⬜ |
| 7 | `Card.vue` 组件 | ⬜ |
| 8 | `CardGrid.vue` 组件 (7×7) | ⬜ |
| 9 | `TableBackground.vue` 组件 | ⬜ |
| 10 | 拖拽功能实现 | ⬜ |
| 11 | 翻牌动画 (CSS 3D) | ⬜ |
| 12 | Reset/Restart 功能 | ⬜ |
| 13 | Mobile 响应式适配 | ⬜ |
| 14 | POC 验收测试 | ⬜ |

### 5.2 文件结构

```
src/
├── assets/
│   └── images/
│       └── samples/
│           ├── 反面/
│           │   ├── 多情种.jpg
│           │   ├── 小不点.jpg
│           │   ├── 睡不醒.jpg
│           │   ├── 自大狂.jpg
│           │   ├── 暴躁狂.jpg
│           │   ├── 吝啬鬼.jpg
│           │   └── 包打听.jpg
│           └── 背景/
│               └── 背景+7个小孩卡槽.jpg
├── components/
│   ├── Card.vue
│   ├── CardGrid.vue
│   └── TableBackground.vue
├── composables/
│   └── useCardDeck.ts          # 卡牌数据逻辑
├── stores/
│   └── cardGame.ts             # Pinia: 游戏状态管理
├── data/
│   └── cards.json
├── types/
│   └── card.ts
├── App.vue
└── main.ts
```

---

## 6. 验收标准

### 6.1 功能验收

- [ ] 49 张卡牌以 7×7 网格正确展示
- [ ] 可选择 1~10 张卡牌
- [ ] 选中卡牌有视觉反馈
- [ ] 卡牌可翻面 (正面文字 / 反面图片)
- [ ] 翻面动画流畅
- [ ] 可拖拽卡牌至槽位
- [ ] Reset 可清空选择
- [ ] Restart 可重新开始

### 6.2 移动端验收

- [ ] 手机端 7×7 网格可滚动查看
- [ ] 触控选择卡牌正常
- [ ] 触控拖拽正常
- [ ] 卡牌尺寸适合手指操作

---

## 7. 后续迭代

POC 完成后，后续版本计划：

| 版本 | 内容 |
|------|------|
| v0.2 | 随机选卡模式 |
| v0.3 | 角色说明弹窗 |
| v0.4 | 卡牌对照表 |
| v0.5 | 生产级素材替换 |
| v1.0 | 正式发布版本 |
