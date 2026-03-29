# Galli-7Kids 产品需求文档 (PRD)

> **产品名称**: Galli-7Kids 卡牌抽取工具
> **版本**: v2.0
> **最后更新**: 2026-03-29
> **状态**: POC 验证完成

---

## 1. 产品概述

### 1.1 产品定位

Galli-7Kids 是一款为心理咨询师、关系咨询师设计的辅助工具，基于德国 Galli 戏剧治疗理论中的「七个暗室小孩」原型，通过卡牌抽取的方式帮助来访者在咨询过程中探索内心世界。

### 1.2 目标用户

| 用户角色 | 描述 |
|---------|------|
| 咨询师 | 操作工具，引导卡牌抽取过程，进行专业解读 |
| 来访者 | 在咨询师引导下选择卡牌，探索自我 |

### 1.3 使用场景

> **典型场景**: 咨询师与来访者并排坐在咖啡厅、茶室等轻松环境中，使用 **iPad 或手机** 进行卡牌互动。

因此，产品采用 **Mobile-First** 设计策略：

- 主要设备：手机、平板（而非桌面电脑）
- 交互方式：触控优先（而非鼠标键盘）
- 使用姿态：并排共用一个屏幕，或传递设备

### 1.4 核心价值

- **可视化潜意识**: 将抽象的心理原型具象化为卡牌，便于来访者理解和表达
- **互动式探索**: 通过选牌行为本身反映来访者的心理状态
- **咨询辅助**: 为咨询师提供结构化的对话切入点和解读框架

---

## 2. 理论背景

### 2.1 关于 Galli 戏剧

Galli 戏剧（Galli Theater）由德国人 Johannes Galli 于 1980 年代创立，是一种融合戏剧表演与心理治疗的创新方法。其核心理念包括：

- **身体表达优先**: 通过肢体动作、表情、声音来表达内心
- **即兴戏剧**: 不依赖剧本，强调当下真实的情感流露
- **隐喻与象征**: 使用故事、角色扮演来投射和探索心理议题
- **安全容器**: 戏剧空间提供一个安全的心理探索环境

### 2.2 七个暗室小孩

「七个暗室小孩」是 Galli 戏剧理论的核心人格模型，隐喻表面人格背后被压抑的七个潜层面。每个「小孩」都有其负面表现（被压抑时的扭曲形态）和正面力量（被接纳后的天赋资源）。

| 暗室小孩 | 英文名 | 负面表现 | 正面力量/天赋 | 核心主题 |
|---------|--------|---------|--------------|---------|
| 吝啬鬼 | The Miser | 小气、计较、过度囤积 | 界限感、规则意识、保护能力 | **拥有与守护** |
| 自大狂 | The Show-off | 骄傲、自负、自我中心 | 自信、领导力、智慧、影响力 | **价值与成就** |
| 暴躁狂 | The Aggressive | 愤怒、急躁、冲动 | 行动力、能量、推动力、激情 | **力量与行动** |
| 多情种 | The Seductress | 过度依恋、情感泛滥 | 爱的能力、热情、融合力、共情 | **爱与联结** |
| 包打听 | The Gossip | 爱八卦、窥探隐私 | 沟通力、好奇心、识人能力 | **信息与联结** |
| 睡不醒 | The Sleepyhead | 懒惰、拖延、逃避 | 休息、直觉、灵感、想象力 | **存在与感知** |
| 小不点 | The Small One | 胆小、懦弱、自我贬低 | 谦卑、柔韧、纯真、内在小孩 | **谦逊与真实** |

### 2.3 理论核心

1. **每个人都拥有这七种力量**，有些已被发展，有些被压抑
2. 这些原型构成内在的「家庭系统」，彼此互动影响行为模式
3. 每个「负面」特质背后都蕴含正面力量和天赋，需被看见和整合
4. 接纳而非消灭这些「暗室小孩」，是实现完整自我的关键

---

## 3. 卡牌设计规范

### 3.1 卡牌结构

**卡牌采用双面设计**

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
│                                     │
└─────────────────────────────────────┘
                   ↕
┌─────────────────────────────────────┐
│                                     │
│          【反面 - 角色面】            │
│                                     │
│         ┌───────────────┐           │
│         │               │           │
│         │ [暗室小孩插画] │           │
│         │               │           │
│         │   如：多情种   │           │
│         │               │           │
│         └───────────────┘           │
│                                     │
│         "多情种" (角色名称)          │
│                                     │
│     (翻面后可自由拖拽)                │
│                                     │
└─────────────────────────────────────┘
```

**设计要点**:
- 正面：**纯文字**行动描述 (POC 阶段)
- 反面：暗室小孩角色插画 + 角色名称
- 风格：手绘插画、温暖色调、情感化表达
- 每个角色有专属背景色，便于视觉区分

> **注**: 生产版本正面可能改为插画+文字。

### 3.5 桌面槽位设计

桌面背景图包含 7 个槽位，每个槽位对应一个暗室小孩，作为视觉参考和场景氛围元素：

```
┌─────────────────────────────────────────────────────────┐
│                        桌面                              │
│                                                         │
│    ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                  │
│    │吝啬鬼│  │自大狂│  │暴躁狂│  │多情种│   ← 槽位       │
│    │ 🪙  │  │ 👑  │  │ 🔥  │  │ 💗  │                  │
│    └─────┘  └─────┘  └─────┘  └─────┘                  │
│                                                         │
│              ┌─────┐  ┌─────┐  ┌─────┐                  │
│              │包打听│  │睡不醒│  │小不点│                 │
│              │ 🗣️  │  │ 💤  │  │ 🌱  │                  │
│              └─────┘  └─────┘  └─────┘                  │
│                                                         │
│         [ 已选卡牌自由放置区域 ]                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**设计原则**:
- 槽位视觉风格与暗室小孩性格呼应（颜色/图标）
- 布局自然融入桌面，不破坏沉浸感
- 槽位仅作为视觉装饰，不做槽位吸附或匹配判断

### 3.2 卡牌数据结构

```typescript
interface Card {
  id: number;                      // 1-49
  frontImage: string;              // 正面行动插画路径
  frontText: string;               // 正面行动描述文字
  backImage: string;               // 反面角色插画路径
  backCharacter: DarkRoomChild;    // 反面对应的暗室小孩
  backCharacterName: string;       // 角色中文名 (如 "多情种")
}

type DarkRoomChild =
  | 'miser'       // 吝啬鬼
  | 'showoff'     // 自大狂
  | 'aggressive'  // 暴躁狂
  | 'seductress'  // 多情种
  | 'gossip'      // 包打听
  | 'sleepyhead'  // 睡不醒
  | 'smallone';   // 小不点
```

### 3.3 角色专属配色

| 暗室小孩 | 主题色 | 用途 |
|---------|--------|------|
| 吝啬鬼 | (待从素材提取) | 卡牌背景、槽位标识 |
| 自大狂 | (待从素材提取) | 卡牌背景、槽位标识 |
| 暴躁狂 | (待从素材提取) | 卡牌背景、槽位标识 |
| 多情种 | (待从素材提取) | 卡牌背景、槽位标识 |
| 包打听 | (待从素材提取) | 卡牌背景、槽位标识 |
| 睡不醒 | (待从素材提取) | 卡牌背景、槽位标识 |
| 小不点 | (待从素材提取) | 卡牌背景、槽位标识 |

### 3.3 卡牌分布规则

- **总数**: 49 张
- **分布**: 每个暗室小孩对应 7 张卡牌 (7 × 7 = 49)
- **设计原则**: 正面文字应具有模糊性和多义性，让来访者产生个人化的联想

### 3.4 卡牌内容示例

**参考素材** (位于 `src/assets/images/samples/`):

> ⚠️ **注意**: 现有素材为手机拍摄的参考照片，POC 阶段可直接使用，生产环境需替换。

| 类型 | 数量 | 描述 |
|------|------|------|
| 反面-角色 | 7 张 | 七个暗室小孩角色插画 |
| 正面-行动 | 3 张 | 行动场景插画 (参考) |
| 背景 | 1 张 | 桌面背景含 7 个槽位 |

> **POC 实施细节见**: [POC.md](./POC.md)

### 3.5 生产级素材获取方案

**经搜索，Galli官方未公开销售卡牌产品**，需通过以下方式获取生产级素材：

| 方案 | 描述 | 优缺点 |
|------|------|--------|
| **A. 委托设计** | 聘请插画师按参考风格创作49张卡牌 | 成本较高，但风格统一、版权清晰 |
| **B. AI生成** | 使用 Midjourney/DALL-E 生成插画 | 成本低，需人工筛选和后期调整 |
| **C. 素材库** | 使用 [Freepik](https://www.freepik.com)、[Adobe Stock](https://stock.adobe.com) 等平台素材 | 需注意授权范围，风格可能不统一 |
| **D. 联系官方** | 联系 Galli 德国/中国官方获取授权 | 版权最清晰，但需谈判和费用 |

**推荐**: 方案 B + 后期人工精修，或方案 A 以确保品牌调性。

### 3.6 AI 生成提示词 (Gemini Pro)

基于参考素材的风格分析：手绘插画、温暖色调、情感化角色表达。

#### 3.6.1 角色卡提示词 (反面 - 7张)

**基础风格提示词模板**:
```
A whimsical hand-drawn illustration of [CHARACTER DESCRIPTION],
soft pastel colors with [COLOR THEME] dominant,
simple textured background,
expressive pose showing [EMOTION],
warm and gentle art style,
children's book illustration aesthetic,
centered composition with character name space at bottom
```

**各角色具体提示词**:

| 角色 | 提示词 |
|------|--------|
| **多情种** | A whimsical hand-drawn illustration of a loving romantic character with hearts floating around, soft pink and rose colors dominant, simple textured background, expressive pose showing warmth and affection, warm and gentle art style, children's book illustration aesthetic, centered composition |
| **小不点** | A whimsical hand-drawn illustration of a tiny humble character looking up with big eyes, soft green and earth tones dominant, simple textured background, expressive pose showing shyness and innocence, warm and gentle art style, children's book illustration aesthetic, centered composition |
| **睡不醒** | A whimsical hand-drawn illustration of a sleepy dreamy character with closed eyes and zzz bubbles, soft blue and lavender colors dominant, simple textured background, expressive pose showing relaxation and intuition, warm and gentle art style, children's book illustration aesthetic, centered composition |
| **自大狂** | A whimsical hand-drawn illustration of a proud confident character with crown or star, soft gold and purple colors dominant, simple textured background, expressive pose showing confidence and leadership, warm and gentle art style, children's book illustration aesthetic, centered composition |
| **暴躁狂** | A whimsical hand-drawn illustration of an energetic passionate character with fire sparks, soft red and orange colors dominant, simple textured background, expressive pose showing dynamic energy and action, warm and gentle art style, children's book illustration aesthetic, centered composition |
| **吝啬鬼** | A whimsical hand-drawn illustration of a careful protective character holding treasures, soft brown and amber colors dominant, simple textured background, expressive pose showing boundaries and protection, warm and gentle art style, children's book illustration aesthetic, centered composition |
| **包打听** | A whimsical hand-drawn illustration of a curious chatty character with speech bubbles, soft yellow and teal colors dominant, simple textured background, expressive pose showing curiosity and communication, warm and gentle art style, children's book illustration aesthetic, centered composition |

#### 3.6.2 行动卡提示词 (正面 - 49张)

**基础模板**:
```
A whimsical hand-drawn illustration of [ACTION DESCRIPTION],
soft warm pastel colors,
simple cozy background setting,
peaceful daily life scene,
children's book illustration aesthetic,
warm and gentle art style,
centered composition with action text space at bottom
```

**示例提示词**:

| 行动 | 提示词 |
|------|--------|
| 泡牛奶 | A whimsical hand-drawn illustration of a person making warm milk in a cozy kitchen, soft warm pastel colors, steam rising from a mug, peaceful morning scene, children's book illustration aesthetic, warm and gentle art style, centered composition |
| 听音乐 | A whimsical hand-drawn illustration of a person relaxing with headphones enjoying music, soft warm pastel colors, floating musical notes, peaceful cozy room, children's book illustration aesthetic, warm and gentle art style, centered composition |
| 清空购物车 | A whimsical hand-drawn illustration of a person happily clearing an online shopping cart on phone, soft warm pastel colors, satisfied expression, modern daily life scene, children's book illustration aesthetic, warm and gentle art style, centered composition |

#### 3.6.3 生成建议

- **一致性**: 使用相同的基础风格描述词确保49张卡牌视觉统一
- **迭代**: 生成后选择最佳结果，可微调提示词重新生成
- **尺寸**: 建议生成方形图 (1:1) 便于卡牌裁切
- **后期**: 生成后可用 PS/Figma 添加文字、调整色调

**Sources**:
- [Google Developers: Gemini Image Generation Guide](https://developers.googleblog.com/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/)
- [Vertex AI Prompt Guide](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-guide)
- [OpenArt: 25 Midjourney Tarot Prompts](https://openart.ai/blog/post/midjourney-prompts-for-tarot-card)

**卡牌关联示例**:

| ID | 正面行动 | 反面角色 |
|----|---------|---------|
| 1 | 泡牛奶 | (待关联) |
| 2 | 听音乐 | (待关联) |
| 3 | 清空购物车 | (待关联) |
| ... | ... | ... |
| 49 | (待设计) | (待关联) |

> **注**:
> - 行动插画需设计至49张
> - 需由专业咨询师团队完成行动与角色的对应关系

---

## 4. 功能需求

### 4.1 核心流程

```
┌──────────────────────────────────────────────────────────────────┐
│                          应用启动                                 │
└───────────────────────────┬──────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│  场景展示: 俯视视角，桌面占据视野                                  │
│  咨询师示意来访者可以开始选卡                                      │
└───────────────────────────┬──────────────────────────────────────┘
                            ▼
              ┌─────────────┴─────────────┐
              ▼                           ▼
    ┌─────────────────┐         ┌─────────────────┐
    │   明牌选卡模式   │         │   随机选卡模式   │
    │   (A线)         │         │   (B线)         │
    └────────┬────────┘         └────────┬────────┘
             ▼                           ▼
    ┌─────────────────┐         ┌─────────────────┐
    │ 3D卡牌圆环      │         │ 从49张中随机    │
    │ 滑动旋转浏览    │         │ 抽取1张         │
    │ 点击看详情      │         └────────┬────────┘
    │ 选择1-10张      │                  │
    └────────┬────────┘                  │
             │                           │
             └───────────┬───────────────┘
                         ▼
    ┌──────────────────────────────────────────────────────────────┐
    │  展示已选卡牌                                                │
    │  - 可单张翻面查看                                            │
    │  - 可一键全部正面                                            │
    │  - 可一键全部反面                                            │
    └───────────────────────────┬──────────────────────────────────┘
                                ▼
    ┌──────────────────────────────────────────────────────────────┐
    │  咨询师解读环节                                              │
    │  (工具提供卡牌信息，解读由咨询师主导)                          │
    └───────────────────────────┬──────────────────────────────────┘
                                ▼
              ┌─────────────────┴─────────────────┐
              ▼                                   ▼
    ┌─────────────────┐               ┌─────────────────┐
    │  继续选卡        │               │  结束本次咨询    │
    │  (返回选卡模式)  │               │                 │
    └─────────────────┘               └─────────────────┘
```

### 4.2 功能模块

#### 4.2.1 场景展示模块

| 需求ID | 描述 | 优先级 |
|--------|------|--------|
| F-1.1 | 俯视视角展示桌面场景 | P0 |
| F-1.2 | 桌面占据视野主要区域 | P0 |
| F-1.3 | 桌面背景图包含 7 个槽位，代表 7 个暗室小孩 | P1 |
| F-1.4 | 场景具有沉浸感和氛围感 | P1 |

**槽位设计**:
- 槽位以视觉化的方式呈现 7 个暗室小孩（图标/颜色/名称）
- 槽位分布应自然融入桌面背景，不显突兀
- 作为场景视觉元素，而非拖拽目标

#### 4.2.2 选卡模式模块

| 需求ID | 描述 | 优先级 |
|--------|------|--------|
| F-2.1 | 提供两种选卡模式入口：「明牌选卡」「随机选卡」 | P0 |
| F-2.2 | 明牌模式：49张卡牌以3D圆环排列展示 | P0 |
| F-2.3 | 明牌模式：滑动旋转圆环浏览卡牌 | P0 |
| F-2.4 | 明牌模式：正面朝上显示文字，点击查看详情 | P0 |
| F-2.5 | 明牌模式：前方卡牌清晰突出，后方渐隐 | P1 |
| F-2.6 | 明牌模式：支持选择1-10张卡牌 | P0 |
| F-2.7 | 随机模式：从49张卡牌中随机抽取1张 | P0 |
| F-2.8 | 随机模式：抽取过程具有仪式感动画 | P1 |

#### 4.2.3 卡牌展示模块

| 需求ID | 描述 | 优先级 |
|--------|------|--------|
| F-3.1 | 展示已选卡牌的完整信息 | P0 |
| F-3.2 | 单张卡牌可点击翻面 | P0 |
| F-3.3 | 一键全部翻至正面 | P0 |
| F-3.4 | 一键全部翻至反面 | P0 |
| F-3.5 | 翻牌动画流畅自然 | P1 |
| F-3.6 | 已翻面的卡牌可自由拖拽 | P1 |
| F-3.7 | 拖拽为自由放置，卡牌停留在释放位置 | P1 |

**拖拽交互设计**:

> **目的**: 增加互动趣味性，让来访者更主动地参与。

- 拖拽为**自由放置**：卡牌停留在释放位置，不做槽位吸附
- 视觉反馈：拖拽时卡牌轻微放大、提升阴影；最近操作的卡牌始终在最上层
- 不做对错判断：这是一个开放探索过程，由咨询师引导解读

#### 4.2.4 辅助功能

| 需求ID | 描述 | 优先级 |
|--------|------|--------|
| F-4.1 | 咨询师可查看所有卡牌对照表 | P2 |
| F-4.2 | 支持重置/重新开始选卡 | P1 |
| F-4.3 | 支持查看七个暗室小孩的说明 | P2 |

---

## 5. 非功能需求

### 5.1 性能要求

| 指标 | 要求 |
|------|------|
| 首屏加载时间 | < 2秒 |
| 卡牌翻面动画 | < 300ms |
| 交互响应时间 | < 100ms |

### 5.2 兼容性要求（Mobile-First）

| 优先级 | 平台 | 要求 |
|--------|------|------|
| **P0** | 手机端 | iOS Safari 14+, Chrome Mobile 90+ |
| **P0** | 平板端 | iPadOS 14+, Android Tablet |
| P1 | 桌面端 | Chrome 90+, Safari 14+, Firefox 88+ |

**响应式断点**:

| 断点 | 设备 | 布局策略 |
|------|------|---------|
| < 640px | 手机 | 卡牌圆环居中，卡牌缩小 |
| 640px - 1024px | 平板 | 卡牌圆环适配，触控友好 |
| > 1024px | 桌面 | 居中显示，最大宽度限制 |

### 5.3 可访问性

- **触控友好**: 卡牌最小点击区域 44×44px (iOS HIG 标准)
- 支持手势：tap (选卡)、swipe (滚动)、long-press + drag (拖拽)
- 拖拽交互：触控拖拽流畅，释放后有视觉反馈
- 色彩对比度符合 WCAG AA 标准
- 关键操作有触觉/视觉反馈
- 桌面端支持键盘导航（降级支持）

---

## 6. 技术约束

### 6.1 技术栈

```
Frontend: Vue 3 + TypeScript + Vite
Styling: Tailwind CSS (mobile-first 断点)
Gesture:  @vueuse/gesture (useDrag — 触控拖拽、滑动旋转)
Animation: CSS 3D Transforms + rAF 惯性动画
State:    Pinia / Composables
Utilities: @vueuse/core + lodash-es
```

**工具库使用原则**:

| 库 | 用途 | 使用原则 |
|---|------|---------|
| [Pinia](https://pinia.vuejs.org/) | 全局状态管理 | 跨组件共享状态（卡牌选择、游戏阶段等） |
| [@vueuse/gesture](https://gesture.vueuse.org/) | 触控手势识别 | **拖拽和滑动的首选** — `useDrag` 处理触控/鼠标拖拽、tap 识别、运动追踪 |
| [@vueuse/core](https://vueuse.org/) | Vue 组合式工具函数 | `useEventListener`, `useWindowSize` 等通用 composables |
| [lodash-es](https://lodash.com/) | 通用工具函数 | `shuffle`, `chunk`, `sample` 等 (tree-shaking) |

**Mobile-First 开发策略**:
- 从最小屏幕开始设计和开发，逐步增强到大屏
- 触控交互优先测试，鼠标交互作为降级

### 6.2 渲染方案

**v1.0 决策：采用 DOM 渲染，保持未来灵活性**

| 方案 | 适用场景 |
|------|---------|
| DOM (v1.0) | 49张卡牌、交互以hover/click为主、需要键盘可访问性 |
| Canvas (未来) | 复杂动画、物理效果、3D场景 |

**架构原则：状态与UI分离 (Headless Pattern)**

- **状态层 (Composables)**: 纯逻辑，不依赖 DOM，可独立测试
- **渲染层 (Components)**: 薄视图层，仅负责 DOM 渲染和事件绑定

**收益**:
- 可测试性：状态逻辑无需挂载组件即可测试
- 可替换性：未来切换到 Canvas 只需重写渲染层
- 调试友好：状态可独立 inspect

### 6.3 数据存储

- 卡牌数据：静态 JSON 文件
- 用户选择：会话级状态（可选：本地存储历史记录）

---

## 7. 验收标准

### 7.1 功能验收

- [ ] 可正常进入明牌/随机选卡模式
- [ ] 明牌模式：3D圆环展示49张卡牌，滑动旋转浏览
- [ ] 可选择1-10张卡牌并确认
- [ ] 随机模式可抽取1张卡牌
- [ ] 已选卡牌可翻面查看
- [ ] 一键翻面功能正常
- [ ] 卡牌可自由拖拽放置
- [ ] 可重新开始选卡流程

### 7.2 体验验收

- [ ] 动画流畅不卡顿
- [ ] 交互反馈清晰
- [ ] 视觉风格符合心理咨询场景的专业感和温暖感

---

## 8. 里程碑规划

| 阶段 | 内容 | 状态 |
|------|------|------|
| Phase 0 | **POC**: 核心交互验证 (3D圆环、自由拖拽) | ✅ 完成 |
| Phase 1 | 随机选卡模式 | 待开发 |
| Phase 2 | 视觉优化：场景氛围、动画效果 | 待开发 |
| Phase 3 | 辅助功能：卡牌对照表、角色说明 | 待开发 |
| Phase 4 | 生产级素材替换 | 待开发 |
| Phase 5 | 数据完善：49张卡牌内容定义 | 待开发 |

---

## 8.1 POC 验证成果

> Phase 0 技术验证已完成，确认了以下技术方案可行：

### 已验证技术

| 技术 | 验证内容 | 结论 |
|------|---------|------|
| `@vueuse/gesture` useDrag | 触控拖拽、滑动旋转、tap 识别 | **推荐** — 完美处理触控手势 |
| CSS 3D Transforms | 3D卡牌圆环（透视、旋转、深度衰减） | **推荐** — 流畅、视觉效果好 |
| rAF-based inertia | 滑动旋转惯性动画（摩擦衰减） | **推荐** — 手感自然，易于控制 |
| Base position tracking | 多次拖拽间保持视觉位置 | **必须** — useDrag movement 从[0,0]开始 |

### 测试页面

| 页面 | URL | 说明 |
|------|-----|------|
| 3D 卡牌圆环 | `?test=ring` | 卡牌3D旋转环，滑动浏览、惯性动画 |
| 自由拖拽 | `?test=drag` | 卡牌自由拖拽、翻牌、z-index 层叠 |

### 关键实现细节

**3D 圆环**:
- `perspective: 800px` + `rotateX(-15deg)` 俯视视角
- 深度衰减：前方卡牌清晰/大，后方模糊/小/半透明
- `pointerdown` 事件立即停止惯性动画
- 滑动释放后自动吸附到最近卡牌位置

**自由拖拽**:
- `useDrag` + base position tracking 避免二次拖拽位置跳变
- z-index 递增计数器：最新拖拽的卡牌始终在最上层
- 无槽位吸附/匹配：纯自由放置

---

## 9. 设计系统

> Use `/frontend-design` skill for all UI work

### 9.1 色彩系统

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

### 9.2 字体

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

### 9.3 设计要点

| 元素 | 方向 |
|------|------|
| **Colors** | 暖色中性 (cream, sand, terracotta) - 忌冷灰 |
| **Typography** | 圆润友好字体 - 避免通用字体如 Inter, Roboto |
| **Shapes** | 有机、圆润、略不规则 - 手工感 |
| **Shadows** | 暖色调、柔和、漫射 |
| **Animation** | 轻柔、呼吸感、缓动 - 忌突兀 |
| **Texture** | 细腻噪点、纸质感、柔和晕影 |
| **Feedback** | 柔和光晕、轻柔脉动 - 安全感 |

---

## 10. 附录

### 9.1 参考资源

- [知乎：每个人心中都住着7个「暗室小孩」](https://zhuanlan.zhihu.com/p/411306362)
- [豆瓣：七个暗室小孩笔记](https://m.douban.com/note/333670876/)
- [Galli戏剧官方资源](https://www.galli.de/)

### 9.2 术语表

| 术语 | 定义 |
|------|------|
| 暗室小孩 | Galli理论中的人格原型，代表被压抑的潜意识层面 |
| 明牌选卡 | 来访者可以看到所有卡牌内容后进行选择 |
| 随机选卡 | 系统随机抽取一张卡牌给来访者 |

---

## 11. 变更记录

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|---------|------|
| 2026-03-21 | v1.0 | 初稿完成 | Claude |
| 2026-03-21 | v1.1 | 新增渲染方案决策：DOM + 状态/UI分离架构 | Claude |
| 2026-03-21 | v1.2 | 明确 Mobile-First 设计策略，更新使用场景 | Claude |
| 2026-03-21 | v1.3 | 新增桌面槽位设计和卡牌拖拽交互功能 | Claude |
| 2026-03-21 | v1.4 | 根据真实素材更新卡牌设计：双面插画、数据结构、素材获取方案 | Claude |
| 2026-03-21 | v1.5 | 新增 3.6 AI生成提示词：Gemini Pro 角色卡/行动卡提示词模板 | Claude |
| 2026-03-21 | v1.6 | 拆分 POC 文档为独立的 POC.md，精简 PRD 内容 | Claude |
| 2026-03-21 | v1.7 | 明确 Pinia + VueUse + Lodash-ES 为推荐工具库，应主动使用 | Claude |
| 2026-03-29 | v2.0 | POC 验证完成：3D圆环取代7×7网格、自由拖拽取代槽位吸附、新增 @vueuse/gesture、合并 POC.md 内容、新增设计系统 | Claude |
