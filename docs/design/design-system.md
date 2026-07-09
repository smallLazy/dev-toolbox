---
status: deprecated
last_reviewed: 2026-07-08
owner: dev-tools
replaced_by: docs/design/design-system-v2.md
reason: Superseded by Design System v2.0 — v1 is kept for historical reference only
---
# Dev Toolbox Design System

> 基于 Microsoft Fluent Design System，为 macOS 开发者工具适配的暗色主题设计规范。

---

## 1. 设计原则

| 原则 | 说明 |
|------|------|
| **轻量** | 低视觉重量，让内容成为焦点 |
| **层次** | 通过颜色深度（非阴影）建立 Z 轴层次 |
| **流畅** | 150-250ms 的微交互，cubic-bezier 缓动 |
| **一致** | 全部 Token 化，零硬编码颜色/间距/字号 |
| **可访问** | WCAG AA 对比度（正文 ≥ 4.5:1，大文本 ≥ 3:1） |

---

## 2. Design Token

### 2.1 Color

#### Neutral（中性色）

| Token | Value | 用途 |
|-------|-------|------|
| `--color-neutral-0` | `#000000` | 最深底色 |
| `--color-neutral-10` | `#111111` | 输出区域背景 |
| `--color-neutral-20` | `#1A1A1A` | Input 背景 |
| `--color-neutral-30` | `#1E1E1E` | App 主背景 |
| `--color-neutral-40` | `#252525` | Surface / Card 背景 |
| `--color-neutral-50` | `#2D2D2D` | Hover 状态 / 分割线 |
| `--color-neutral-60` | `#3D3D3D` | Border 默认 |
| `--color-neutral-70` | `#555555` | Placeholder 文字 |
| `--color-neutral-80` | `#6E6E6E` | 辅助文字 (caption) |
| `--color-neutral-90` | `#9D9D9D` | 次要文字 (secondary) |
| `--color-neutral-100` | `#E8E8E8` | 主要文字 (primary) |
| `--color-neutral-110` | `#F5F5F5` | 高亮文字 |
| `--color-neutral-120` | `#FFFFFF` | 最高对比度文字 |

#### Accent（品牌色）

| Token | Value | 用途 |
|-------|-------|------|
| `--color-accent-primary` | `#0078D4` | 主按钮、选中态、链接 |
| `--color-accent-hover` | `#1A8FE3` | 主按钮 Hover |
| `--color-accent-pressed` | `#005A9E` | 主按钮 Pressed |
| `--color-accent-dim` | `rgba(0, 120, 212, 0.12)` | 选中背景 (subtle) |
| `--color-accent-moderate` | `rgba(0, 120, 212, 0.30)` | Focus ring |

#### Semantic（语义色）

| Token | Value | 用途 |
|-------|-------|------|
| `--color-danger-text` | `#CF6679` | 错误文字 |
| `--color-danger-bg` | `#3D1F1F` | 错误背景 |
| `--color-danger-border` | `#CF6679` | 错误边框 |
| `--color-success-text` | `#4CAF50` | 成功文字 |
| `--color-success-bg` | `#1F3D1F` | 成功背景 |
| `--color-warning-text` | `#D4A843` | 警告文字 |
| `--color-warning-bg` | `#2D2210` | 警告背景 |
| `--color-info-text` | `#6BA5E7` | 信息文字 |
| `--color-info-bg` | `#1A2744` | 信息背景 |

### 2.2 Typography

#### Font Family

| Token | Value | 用途 |
|-------|-------|------|
| `--font-sans` | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | UI 文本 |
| `--font-mono` | `"Cascadia Code", "Fira Code", "JetBrains Mono", "Menlo", "Monaco", "Courier New", monospace` | 代码 / 数据 |

#### Font Size

| Token | Value | 用途 |
|-------|-------|------|
| `--text-caption` | `11px` | 版本号、微小标注 |
| `--text-label` | `12px` | 表单 Label |
| `--text-body` | `13px` | 正文、按钮、描述 |
| `--text-base` | `14px` | 导航项、菜单 |
| `--text-subtitle` | `16px` | 卡片标题 |
| `--text-title` | `20px` | 页面标题 |
| `--text-heading` | `24px` | 区域标题 |
| `--text-display` | `28px` | Hero 标题 |

#### Font Weight

| Token | Value | 用途 |
|-------|-------|------|
| `--weight-regular` | `400` | 正文 |
| `--weight-medium` | `500` | 按钮、Label、导航 |
| `--weight-semibold` | `600` | 标题 |
| `--weight-bold` | `700` | 强调 |

#### Line Height

| Token | Value | 用途 |
|-------|-------|------|
| `--leading-tight` | `1.25` | 标题 |
| `--leading-normal` | `1.5` | 正文 |
| `--leading-relaxed` | `1.75` | 长文本 |

### 2.3 Spacing（基于 4px 栅格）

| Token | Value | 用途 |
|-------|-------|------|
| `--space-0` | `0` | 无间距 |
| `--space-1` | `4px` | 微间距 (icon-label gap) |
| `--space-2` | `8px` | 紧凑间距 (inline gap) |
| `--space-3` | `12px` | 默认间距 (form gap) |
| `--space-4` | `16px` | 段落间距 |
| `--space-5` | `20px` | 区块内间距 |
| `--space-6` | `24px` | 区块间距 |
| `--space-8` | `32px` | 大区块间距 |
| `--space-10` | `40px` | 页面 padding 水平 |
| `--space-12` | `48px` | 页面间距 |
| `--space-16` | `64px` | 超大间距 |

### 2.4 Radius

| Token | Value | 用途 |
|-------|-------|------|
| `--radius-none` | `0` | 无圆角 |
| `--radius-sm` | `2px` | Checkbox、Badge |
| `--radius-md` | `4px` | Input、Button、Select（Fluent 标准） |
| `--radius-lg` | `6px` | Card、Dialog |
| `--radius-xl` | `8px` | Panel、Sheet |
| `--radius-full` | `9999px` | Pill、Badge 圆形 |

### 2.5 Border

| Token | Value | 用途 |
|-------|-------|------|
| `--border-width-thin` | `1px` | 默认边框 |
| `--border-width-medium` | `2px` | Focus ring |
| `--border-width-thick` | `3px` | 选中指示器（侧边栏） |
| `--border-color-default` | `#3D3D3D` | 默认边框颜色 |
| `--border-color-focus` | `#0078D4` | 聚焦边框 |
| `--border-color-error` | `#CF6679` | 错误边框 |
| `--border-color-subtle` | `#2D2D2D` | 分割线 / 弱边框 |

### 2.6 Shadow（暗色主题下极克制）

| Token | Value | 用途 |
|-------|-------|------|
| `--shadow-none` | `none` | 默认无阴影 |
| `--shadow-surface` | `0 1px 2px rgba(0,0,0,0.4)` | Card 微微抬起 |
| `--shadow-elevated` | `0 2px 8px rgba(0,0,0,0.5)` | Dropdown、Popover |
| `--shadow-overlay` | `0 4px 16px rgba(0,0,0,0.6)` | Dialog、Modal |

### 2.7 Animation

| Token | Value | 用途 |
|-------|-------|------|
| `--duration-fast` | `100ms` | 微交互（hover 变色） |
| `--duration-normal` | `150ms` | 标准过渡（focus、toggle） |
| `--duration-slow` | `250ms` | 展开/收起 |
| `--duration-entrance` | `400ms` | 页面入场 |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | 标准缓动 |
| `--ease-enter` | `cubic-bezier(0, 0, 0, 1)` | 入场（减速） |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | 退场（加速） |

---

## 3. 组件规范

### 3.1 Button

```
API:
  variant: primary | secondary | danger | ghost
  size: sm | md | lg
  disabled: boolean
  loading: boolean
```

| Variant | Background | Text | Border | Hover |
|---------|-----------|------|--------|-------|
| **primary** | `--color-accent-primary` | `#FFF` | none | `--color-accent-hover` |
| **secondary** | `--color-neutral-50` | `--color-neutral-100` | `--color-neutral-60` | `--color-neutral-40` |
| **danger** | `--color-danger-bg` | `--color-danger-text` | `--color-danger-border` | darker bg |
| **ghost** | transparent | `--color-neutral-90` | none | `--color-neutral-50` |

| Size | Padding | Font |
|------|---------|------|
| sm | `4px 12px` | `--text-label` (12px) |
| md | `9px 20px` | `--text-body` (13px) |
| lg | `12px 28px` | `--text-base` (14px) |

- Border-radius: `--radius-md` (4px)
- Font-weight: `--weight-medium` (500)
- Disabled: `opacity: 0.5; cursor: not-allowed`
- Loading: spinner + 文字变灰
- Transition: `background var(--duration-fast) var(--ease-standard)`

### 3.2 Input

```
API:
  type: text | password | number
  placeholder: string
  disabled: boolean
  readonly: boolean
  invalid: boolean
```

| State | Border | Background |
|-------|--------|------------|
| default | `--border-color-default` | `--color-neutral-20` |
| hover | `--color-neutral-70` | `--color-neutral-20` |
| focus | `--border-color-focus` + `box-shadow: 0 0 0 1px --color-accent-moderate` | `--color-neutral-10` |
| invalid | `--border-color-error` | `--color-neutral-20` |
| disabled | `--border-color-subtle` | `--color-neutral-30`, `opacity: 0.5` |

- Padding: `8px 10px`
- Border-radius: `--radius-md` (4px)
- Font: `--font-mono`, `--text-body` (13px)
- Color: `--color-neutral-100`
- Placeholder: `--color-neutral-70`
- Transition: `border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard)`

### 3.3 Select

```
API:
  options: { value, label }[]
  placeholder: string
  disabled: boolean
```

- 与 Input 一致的外观
- 自定义下拉箭头 (SVG chevron)
- `appearance: none` 移除原生样式
- Option 背景 `--color-neutral-50`，文字 `--color-neutral-100`
- Padding-right: `28px` 为箭头留空间

### 3.4 Textarea

```
API:
  rows: number
  placeholder: string
  readonly: boolean
```

- 与 Input 相同的 Token 规范
- `resize: vertical`
- 最小高度: 3 行
- 等宽字体 (`--font-mono`)

### 3.5 Sidebar

```
API:
  items: { path, label, icon }[]
  activePath: string
  onNavigate: (path) => void
```

| Element | Spec |
|---------|------|
| Width | `240px` (fixed) |
| Background | `--color-neutral-10` (`#111111`) |
| Border-right | `1px solid --border-color-subtle` |
| Header padding | `20px 20px 16px` |
| Nav item padding | `9px 20px` |
| Active indicator | `3px solid --color-accent-primary` (left border) |
| Active bg | `--color-accent-dim` |
| Hover bg | `--color-neutral-40` |
| Item font | `--text-body` (13px), `--weight-regular` |
| Icon size | `16px` (emoji) or `20px` (SVG) |
| Footer | border-top, `12px 20px`, `--text-caption` |

### 3.6 Card

```
API:
  variant: default | info
  padding: sm | md | lg
```

| Variant | Background | Border |
|---------|-----------|--------|
| default | `--color-neutral-40` (`#252525`) | `1px solid --border-color-subtle` |
| info | `--color-info-bg` | `1px solid --color-info-text` (dimmed) |

- Border-radius: `--radius-lg` (6px)
- Default padding: `20px 24px`

### 3.7 Divider

| Orientation | Spec |
|-------------|------|
| horizontal | `width: 100%; height: 1px; background: --border-color-subtle` |
| vertical | `width: 1px; height: 100%; background: --border-color-subtle` |

### 3.8 Toolbar / Page Header

```
结构:
┌──────────────────────────────────────────┐
│ Title                        [Actions]   │  ← Toolbar
├──────────────────────────────────────────┤  ← Divider
│ Content area                             │
└──────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Title font | `--text-title` (20px), `--weight-semibold` |
| Description | `--text-body` (13px), `--color-neutral-80` |
| Divider | `1px solid --border-color-subtle` |
| Margin-bottom | `--space-6` (24px) |
| Padding-bottom | `--space-4` (16px) |

---

## 4. 页面布局

```
┌──────────┬─────────────────────────────────────┐
│          │                                     │
│ Sidebar  │          Content Area               │
│ 240px    │          flex: 1                     │
│          │          padding: 32px 40px           │
│          │          max-width: 820px (centered) │
│          │                                     │
└──────────┴─────────────────────────────────────┘
```

- 主布局: `display: flex; height: 100vh`
- 内容区: `overflow-y: auto`
- 面板: `max-width: 820px; margin: 0 auto`
- 2 列表单: `grid-template-columns: 1fr 1fr; gap: var(--space-3)`

---

## 5. 可访问性对照

| 元素 | 要求 | 当前 |
|------|------|------|
| 正文对比度 | ≥ 4.5:1 | `#E8E8E8` on `#1E1E1E` = 11.5:1 ✅ |
| 次要文字 | ≥ 3:1 | `#9D9D9D` on `#1E1E1E` = 5.3:1 ✅ |
| Focus 可见 | 必须 | 蓝色 ring + border ✅ |
| Error 提示 | 不止依赖颜色 | Icon + text + background ✅ |
| Touch target | ≥ 44px | 侧边栏 44px x 240px ✅ |

---

## 6. 文件结构

```
src/
├── assets/
│   └── theme.css              ← 所有 Token 定义 (CSS custom properties)
│
├── styles/                    ← (未来) 组件级 CSS
│   ├── base.css               ← reset + 全局排版
│   ├── button.css
│   ├── input.css
│   └── ...
│
├── components/
│   ├── Sidebar.vue            ← 已 Token 化
│   ├── ...
│
└── modules/
    ├── crypto/CryptoView.vue  ← 已 Token 化
    └── ...

docs/
└── design/
    └── design-system.md       ← 本文档
```
