# Design Verification Checklist

> **状态**: 待验证
> **创建日期**: 2026-03-29
> **说明**: POC 阶段已验证 3D 卡牌圆环和自由拖拽。以下为进入正式开发前需进一步验证的设计点。

---

## 交互 / UX

### 1. Multi-select in card ring

- How does selecting 1-10 cards work? Tap to toggle selection?
- Visual indicator for selected cards?
- Confirm button?

### 2. Card reveal phase

- Transition from ring to display area?
- Animation for moving cards to table?

### 3. Random draw mode

- F-2.7/F-2.8 in PRD, no POC at all
- What's the ceremony animation?

### 4. Card flip in production

- Dual-face design (action text front / character illustration back)
- Proper proportions and animation timing

---

## 技术

### 5. 49-card ring performance

- POC tested 10 cards
- 49 cards may cause layout / rotation / blur issues

### 6. Mobile touch accuracy

- Swipe vs tap disambiguation on real devices
- Finger vs mouse behavior differences

### 7. Responsive ring sizing

- How ring radius adapts across phone / tablet / desktop

---

## 视觉 / 设计

### 8. Design system validation

- Colors, fonts, textures applied to actual card components
- Not just test pages with colored boxes

### 9. Card UI (two sides)

- Front / back layout, proportions, text placement
- Illustration sizing, character color coding

### 10. Table background with slots

- Warm scene atmosphere
- Slot decorations on different screen sizes

---

## 架构

### 11. Page / route structure

- Mode selection → ring → reveal → counseling
- Single page with state transitions or Vue Router?
