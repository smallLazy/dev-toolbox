---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Developer Workspace — Product Design Spec v2.0

> **角色**: 长期维护的企业级 Design System，面向专业开发者的现代化 Developer Workspace。
> **适用范围**: 所有新增功能、页面、组件必须遵守本规范。新增页面不得重新设计，只允许组合已有组件。
> **可用于**: Cursor / Claude Code / Codex 系统 Prompt。

---

## 0. 设计原则

| 原则 | 说明 |
|------|------|
| **清晰至上** | 信息层级明确，操作意图一眼可辨 |
| **高效导航** | 键盘可达、命令可达、搜索可达 |
| **深度克制** | 阴影极浅、边框微妙、色彩收敛 |
| **即时反馈** | 120-180ms 微交互，无等待感知 |
| **一致复用** | 页面 = 组件组合，不写新样式 |

### 参考产品

| 产品 | 借鉴方向 |
|------|----------|
| **DevToys** | 工具卡片网格、单一职责工具页 |
| **Raycast** | 命令面板、即时搜索、键盘优先 |
| **Xcode** | Workspace 布局（Sidebar + Editor + Inspector） |
| **Linear** | 精致细节、Loading 骨架、Toast 动画 |
| **Warp Terminal** | 现代暗色主题、Block 式输出、等宽字体氛围 |
| **Apple HIG** | SF Pro 字体体系、SF Symbols 图标、Vibrancy 材质 |
| **Fluent Design** | 5 级 Elevation、Acrylic 半透明、Reveal Highlight |

---

# 1. Foundation

## 1.1 Color Tokens

### Neutral Scale

```
--gray-0:   #000000   ← 最深
--gray-50:  #0D0D0D
--gray-100: #111111   ← Sidebar 背景
--gray-150: #161616
--gray-200: #1A1A1A   ← Input 背景
--gray-250: #1E1E1E   ← App 主背景
--gray-300: #222222   ← Card 背景
--gray-350: #282828   ← Hover 浅变
--gray-400: #2D2D2D
--gray-500: #333333
--gray-600: #3D3D3D   ← Border
--gray-700: #555555   ← Placeholder
--gray-800: #6E6E6E   ← Caption / 弱文字
--gray-900: #9D9D9D   ← Secondary 文字
--gray-950: #E0E0E0   ← Primary 文字
--gray-1000: #FFFFFF  ← 最高对比度
```

### Accent（品牌蓝）

```
--accent-primary:   #0078D4
--accent-hover:     #1A8CE8
--accent-pressed:   #005A9E
--accent-dim:       rgba(0,120,212,0.10)
--accent-subtle:    rgba(0,120,212,0.18)
--accent-moderate:  rgba(0,120,212,0.35)
--accent-strong:    rgba(0,120,212,0.55)
```

### Semantic

```
--red-text:     #E07380
--red-bg:       rgba(224,115,128,0.10)
--red-border:   rgba(224,115,128,0.40)
--green-text:   #5CBB5C
--green-bg:     rgba(92,187,92,0.10)
--yellow-text:  #E0B044
--yellow-bg:    rgba(224,176,68,0.08)
--blue-text:    #6BA5E7
--blue-bg:      rgba(107,165,231,0.08)
```

### 材质 & 透明

```
--material-sidebar:  rgba(22,22,22,0.92)   ← Sidebar 微透明
--material-overlay:  rgba(0,0,0,0.55)      ← Dialog 遮罩
--material-acrylic:  rgba(30,30,30,0.85)   ← Acrylic 面板
```

## 1.2 Typography

### Font Stack

```css
--font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
--font-mono: "SF Mono", "Cascadia Code", "Fira Code", "JetBrains Mono", Menlo, monospace;
--font-display: "SF Pro Display", -apple-system, sans-serif;
```

### Type Scale（8 级）

| Token | Size | Weight | Line Height | 用途 |
|-------|------|--------|-------------|------|
| `--text-caption` | 11px | 400 | 1.4 | Badge / KeyHint / 时间戳 |
| `--text-label` | 12px | 500 | 1.4 | Form Label / Sidebar Section |
| `--text-body` | 13px | 400 | 1.5 | 正文 / Button / Nav Item |
| `--text-base` | 14px | 400 | 1.5 | 大段正文 |
| `--text-subtitle` | 16px | 500 | 1.3 | Card 标题 |
| `--text-title` | 20px | 600 | 1.25 | 页面标题 |
| `--text-heading` | 24px | 600 | 1.2 | 区域标题 |
| `--text-hero` | 32px | 700 | 1.15 | Hero / EmptyState |

### Weights

```
--weight-regular:  400
--weight-medium:   500
--weight-semibold: 600
--weight-bold:     700
```

### Line Height

```
--leading-tight:   1.2    ← 标题
--leading-snug:    1.35   ← 紧凑 UI
--leading-normal:  1.5    ← 正文
--leading-relaxed: 1.65   ← 长文本
```

## 1.3 Spacing

基于 4px 栅格。**所有间距必须是 4 的倍数。**

| Token | px | 用途 |
|-------|-----|------|
| `--space-0` | 0 | |
| `--space-1` | 4 | 微间距 (icon-text gap) |
| `--space-2` | 8 | 紧凑间距 (inline gap) |
| `--space-3` | 12 | 默认间距 (form gap, card gap) |
| `--space-4` | 16 | 段落 / 区块 padding |
| `--space-5` | 20 | 卡片内边距 |
| `--space-6` | 24 | 区块间距 / 页面 margin-bottom |
| `--space-8` | 32 | Section 间距 |
| `--space-10` | 40 | 大区块 |
| `--space-12` | 48 | 页面级 |
| `--space-16` | 64 | 布局级 |

## 1.4 Radius

```
--radius-none:  0
--radius-sm:    3px    ← Checkbox, Badge
--radius-md:    4px    ← Input, Button, Select（标准）
--radius-lg:    6px    ← Card, Panel
--radius-xl:    8px    ← Dialog, Sheet
--radius-2xl:   12px   ← Large Card
--radius-full:  9999px ← Pill, Tag, Badge
```

## 1.5 Shadow & Elevation

暗色主题下极致克制。Elevation 通过**背景亮度差异**表达，shadow 仅作辅助。

| Level | Token | Value | 用途 |
|-------|-------|-------|------|
| 0 | `--elevation-0` | `none` | 页面背景 |
| 1 | `--elevation-1` | `0 1px 2px rgba(0,0,0,0.30)` | Card |
| 2 | `--elevation-2` | `0 2px 8px rgba(0,0,0,0.40)` | Dropdown, Popover |
| 3 | `--elevation-3` | `0 4px 16px rgba(0,0,0,0.55)` | Dialog, Modal, Command Palette |
| - | `--elevation-glow` | `0 0 0 3px var(--accent-moderate)` | Focus Ring |

Elevation 对应的背景亮度（用于 `z-index` 层级表达）:

| Layer | bg | Z 用途 |
|-------|-----|--------|
| Base | `--gray-250` | 页面 |
| Surface | `--gray-300` | Card |
| Overlay | `--gray-200` | Dropdown |
| Modal | `--gray-150` | Dialog |

## 1.6 Motion

### Duration

```
--duration-instant:  80ms    ← Checkbox toggle, ripple
--duration-micro:    120ms   ← Hover 变色, icon 动效
--duration-normal:   180ms   ← Focus, 展开, Toggle
--duration-slow:     250ms   ← 面板展开/收起, Page Transition
--duration-entrance: 350ms   ← Dialog 入场, Toast 入场
```

### Easing

```
--ease-standard:     cubic-bezier(0.4, 0.0, 0.2, 1.0)   ← 标准
--ease-decelerate:   cubic-bezier(0.0, 0.0, 0.0, 1.0)   ← 入场（减速停止）
--ease-accelerate:   cubic-bezier(0.4, 0.0, 1.0, 1.0)   ← 退场（加速消失）
--ease-spring:       cubic-bezier(0.34, 1.56, 0.64, 1)  ← 弹性（Badge 出现）
```

### 规则

- Hover: `--duration-micro` + `--ease-standard`
- Focus: `--duration-normal` + `--ease-standard`
- Pressed: `--duration-instant` + `--ease-standard` + `scale(0.97)`
- Page In: `--duration-slow` + `--ease-decelerate` + `opacity 0→1` + `translateY(4px→0)`
- Page Out: `--duration-micro` + `--ease-accelerate` + `opacity 1→0`
- Dialog In: `--duration-entrance` + `--ease-spring` + `scale(0.96→1)` + `opacity 0→1`
- Toast In: `--duration-normal` + `--ease-decelerate` + `translateY(8px→0)` + `opacity 0→1`

## 1.7 Opacity

```
--opacity-disabled:  0.35
--opacity-hover:     0.08
--opacity-pressed:   0.14
--opacity-overlay:   0.55
--opacity-glass:     0.75
```

## 1.8 Application Icons

> **Added**: 2026-06-30 — App Branding pass.
> **Rationale**: The Workspace previously used a Terminal (>_) icon, which implied a CLI/Shell application rather than a Developer Toolbox Platform. Application branding icons are now centralized through `APP_ICONS` as the single source of truth.

### Brand Icon Registry

All application-level branding icons are defined in `src/design/icons/index.ts` and accessed exclusively through `APP_ICONS`:

```typescript
import { APP_ICONS } from '@/design/icons'

// Usage in templates:
<component :is="APP_ICONS.toolbox" :size="24" />
<component :is="APP_ICONS.workspace" :size="22" />
<component :is="APP_ICONS.dashboard" :size="32" />
```

| Icon | Key | SVG | Semantic | Usage |
|------|-----|-----|----------|-------|
| **Toolbox** | `APP_ICONS.toolbox` | `Layers3` | Layered platform architecture — container of tools | Primary brand mark, App icon |
| **Workspace** | `APP_ICONS.workspace` | `PanelsTopLeft` | IDE/editor layout — where work happens | Sidebar header, Workspace sections |
| **Dashboard** | `APP_ICONS.dashboard` | `LayoutGrid` | Grid overview — tool discovery surface | Home dashboard header |

### Semantic Distinction

| Icon | Represents | NOT |
|------|-----------|------|
| `toolbox` (Layers3) | Platform, modular architecture, tool container | A literal toolbox/chest |
| `workspace` (PanelsTopLeft) | IDE layout, split panels, developer environment | Terminal, code brackets, CLI |
| `dashboard` (LayoutGrid) | Grid overview, widget layout, home base | Chart, analytics, graph |

### Rules

1. **Always route through `APP_ICONS`** — never import icons directly in components.
2. **Never use Terminal (>_) for workspace branding** — it implies CLI, not a Developer Platform.
3. **Never use emoji, code brackets, or inline SVG** for brand elements.
4. **All brand icon references are centralized** in `src/design/icons/index.ts` — the SSOT.

### Prohibited for Branding

```
❌ Terminal (>_)
❌ Code brackets (</>)
❌ Emoji (🧰, 🔧, ⚙️)
❌ Inline SVG in components
❌ Direct Lucide imports
```

---

## 1.9 Sidebar Tokens

> **Added**: 2026-06-30 — Sidebar readability pass.
> **Rationale**: When the plugin registry grows to 100+ items, navigation legibility is critical. Generic neutral-scale tokens did not provide sufficient contrast for the sidebar's specific needs. These semantic tokens are calibrated for WCAG AA compliance (≥4.5:1 contrast ratio for normal text) against the sidebar background (`#161616`).

### Text

| Token | Value | Contrast (on #161616) | Usage |
|-------|-------|----------------------|-------|
| `--sidebar-text` | `#CCCCCC` | 11.4:1 ✅ AA/AAA | Normal navigation items |
| `--sidebar-text-secondary` | `#808080` | 4.6:1 ✅ AA | Secondary info, version, search placeholder |
| `--sidebar-category` | `#999999` | 6.5:1 ✅ AA | Category labels, default icons |
| `--sidebar-muted` | `var(--color-neutral-70)` (#555555) | ~2.4:1 (exempt) | Disabled items only |

### Interaction

| Token | Value | Usage |
|-------|-------|-------|
| `--sidebar-hover-bg` | `rgba(255,255,255,0.06)` | Hover background (subtle but obvious) |
| `--sidebar-active-bg` | `var(--color-accent-subtle)` | Active item background (accent tint, 18% opacity) |

### Icons

| Token | Value | Usage |
|-------|-------|-------|
| `--sidebar-icon` | `var(--sidebar-category)` | Default icon color |
| `--sidebar-icon-hover` | `var(--sidebar-text)` | Icon color on hover (matches text) |
| `--sidebar-icon-active` | `var(--color-accent-primary)` | Icon color when item is active |

### Badge & Divider

| Token | Value | Usage |
|-------|-------|-------|
| `--sidebar-badge-bg` | `var(--color-neutral-40)` | Badge/count background |
| `--sidebar-badge-text` | `var(--color-neutral-90)` | Badge/count text |
| `--sidebar-divider` | `rgba(255,255,255,0.06)` | Section dividers, borders |

### Usage Rules

1. **Always use sidebar tokens in Sidebar.vue styles** — never reference `--color-neutral-*` directly for sidebar elements.
2. **Category labels** must use `font-size: var(--text-label)` (12px), `font-weight: var(--weight-semibold)` (600), `letter-spacing: 0.08em`. Never use `text-transform: uppercase` or `opacity` tricks.
3. **Active items** must use `--sidebar-active-bg` for background + `--color-accent-primary` for text and left-border.
4. **Hover** must use `--sidebar-hover-bg` — a consistent `rgba(255,255,255,0.06)` overlay.
5. **Icons** use `--sidebar-icon` by default, `--sidebar-icon-hover` on hover, `--sidebar-icon-active` when active.

### Accessibility Rationale

| Element | Previous Token | Previous Contrast | New Token | New Contrast | WCAG AA |
|---------|---------------|-------------------|-----------|-------------|---------|
| Nav item text | `--color-neutral-80` (#6E6E6E) | 3.8:1 ❌ | `--sidebar-text` (#CCCCCC) | 11.4:1 ✅ | Pass |
| Category label | `--color-neutral-60` (#3D3D3D) | 1.6:1 ❌ | `--sidebar-category` (#999999) | 6.5:1 ✅ | Pass |
| Secondary text | (none formalized) | — | `--sidebar-text-secondary` (#808080) | 4.6:1 ✅ | Pass |
| Badge count | `--color-neutral-30` bg | Near-invisible | `--sidebar-badge-bg` (#252525) | Visible ✅ | N/A |
| Hover feedback | `rgba(255,255,255,0.04)` | Barely perceptible | `--sidebar-hover-bg` (0.06) | Subtle but obvious ✅ | N/A |

### Category Labels — Before/After

```
Before: text-transform: uppercase; font-size: 11px; font-weight: 500; letter-spacing: 0.06em; opacity trick
After:  font-size: 12px; font-weight: 600; letter-spacing: 0.08em; no transform; no opacity
```

The previous approach used uppercase + small font + low contrast to de-emphasize categories. The new approach uses readable typography with proper hierarchy — larger size, higher weight, wider tracking, and proper contrast — making categories scannable without competing with navigation items.

---
# 2. Components

## 2.1 Button

```
API:
  variant: 'primary' | 'secondary' | 'danger' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  icon?: string      ← SF Symbol or emoji
  loading?: boolean
  disabled?: boolean
  shortcut?: string  ← 键盘快捷键提示
```

**Primary** (`variant='primary'`):
- bg: `--accent-primary`, text: `#fff`
- hover: `--accent-hover`
- pressed: `--accent-pressed` + `scale(0.97)`
- disabled: `opacity: 0.35`
- radius: `--radius-md`
- font: `--text-body`, `--weight-medium`

**Secondary** (`variant='secondary'`):
- bg: `--gray-350`, border: `rgba(255,255,255,0.08)`
- hover: bg → `--gray-400`, border → `rgba(255,255,255,0.12)`
- pressed: `scale(0.97)`

**Sizes**:

| Size | Padding | Font |
|------|---------|------|
| sm | `4px 12px` | `--text-label` |
| md | `8px 18px` | `--text-body` |
| lg | `10px 24px` | `--text-base` |

**Loading**: spinner (14px) + text dim to `--gray-700`

**Shortcut**: 在按钮右侧以 `--text-caption` + `--gray-600` bg 显示，如 `⌘K`

## 2.2 IconButton

```
API:
  icon: string
  size: 'sm' | 'md'
  tooltip: string
  variant: 'default' | 'subtle'
```

- 正方形，`sm=28px`, `md=36px`
- radius: `--radius-md`
- default: bg transparent, hover bg `rgba(255,255,255,0.06)`
- subtle: 始终透明，hover icon 颜色变亮
- transition: `--duration-micro`

## 2.3 Sidebar

```
API:
  width?: number          ← default 240px
  resizable?: boolean
  sections: SidebarSection[]
```

**SidebarSection**:
```
{
  id: string
  label?: string          ← Section header
  items: SidebarItem[]
}
```

**SidebarItem**:
```
{
  id: string
  icon: string
  label: string
  shortcut?: string       ← ⌘1, ⌘2...
  badge?: number
  action: () => void
}
```

**States** (see §1.9 Sidebar Tokens for token definitions):
- default: text `--sidebar-text`, icon `--sidebar-icon`, bg transparent
- hover: bg `--sidebar-hover-bg`, text → `--color-neutral-100`, icon → `--sidebar-icon-hover`
- active: bg `--sidebar-active-bg`, text → `--color-accent-primary`, icon → `--sidebar-icon-active`, left-border `3px solid --color-accent-primary`
- category: text `--sidebar-category`, `font-size: 12px`, `font-weight: 600`, `letter-spacing: 0.08em` — no `text-transform: uppercase`, no opacity tricks

**Layout**:
- Header (logo + app name + version)
- SearchBar (always visible, ⌘K to focus)
- Nav items (scrollable)
- Footer (status / version / settings icon)

**Width**: 240px default, 200px collapsed, 320px max

## 2.4 Toolbar

```
API:
  left?: ReactNode       ← Title + Description
  right?: ReactNode      ← Actions
  border?: boolean       ← bottom divider
```

- 高度: 48px
- padding: `0 var(--space-5)`
- bg: transparent / `--material-sidebar`（blur 模式）
- border-bottom: `1px solid rgba(255,255,255,0.04)`

## 2.5 SearchBar

```
API:
  value: string
  placeholder: string
  onChange: (value: string) => void
  onFocus?: () => void    ← 打开 Command Palette
  shortcut?: string       ← ⌘K
```

**States**:
- idle: `--gray-200` bg, `--gray-600` border
- hover: bg → `--gray-250`, border → `rgba(255,255,255,0.12)`
- focus: bg → `--gray-150`, border → `--accent-primary`, glow ring 2px
- active (has value): clear button appears

**Radius**: `--radius-md` (embedded) / `--radius-lg` (standalone)

**Icons**: 🔍 left, ⌘K shortcut hint right, ✕ clear button (when has value)

## 2.6 Command Palette

```
API:
  open: boolean
  onClose: () => void
  commands: Command[]
```

**Command**:
```
{
  id: string
  label: string
  description?: string
  icon?: string
  shortcut?: string
  category?: string
  action: () => void
}
```

**Behavior**:
- 打开: `⌘K` 全局快捷键 → Dialog 居中弹出
- 搜索: 实时过滤，模糊匹配 label + description + category
- 导航: ↑↓ 选择，Enter 执行，Esc 关闭
- 最近使用: 自动记录最近 5 个命令，排在结果顶部
- Footer: "↑↓ 导航  ↵ 打开  Esc 取消"

**Animation**: Dialog In — `scale(0.96→1)` + `opacity 0→1`, `--duration-entrance`, `--ease-spring`

**Style**:
- bg: `--gray-150`, border: `rgba(255,255,255,0.08)`
- radius: `--radius-2xl`
- max-height: 480px, max-width: 560px
- item: 40px height, icon + label left, shortcut right
- active item: `--accent-dim` bg

## 2.7 Input

```
API:
  type: 'text' | 'password' | 'number' | 'search'
  value: string
  placeholder: string
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  prefix?: ReactNode    ← icon or text
  suffix?: ReactNode    ← clear button, unit
```

**States**:

| State | Border | Background | Other |
|-------|--------|------------|-------|
| idle | `rgba(255,255,255,0.08)` | `--gray-200` | |
| hover | `rgba(255,255,255,0.12)` | `--gray-250` | |
| focus | `--accent-primary` | `--gray-150` | glow ring 2px `--accent-dim` |
| invalid | `rgba(224,115,128,0.40)` | `--gray-200` | red glow ring |
| disabled | `rgba(255,255,255,0.04)` | `--gray-250` | opacity 0.35 |

- padding: `7px 10px`
- radius: `--radius-md`
- font: `--font-mono`, `--text-body`, `--leading-snug`
- transition: `--duration-micro`

## 2.8 Textarea

与 Input 相同的视觉规范。
- min-height: 80px (3 rows)
- resize: vertical
- font: `--font-mono`
- 支持行号（可选，通过 Monaco Editor）

## 2.9 Monaco Editor

```
API:
  value: string
  language: string       ← 'json' | 'xml' | 'javascript' | 'plaintext'
  readOnly?: boolean
  lineNumbers?: boolean
  minimap?: boolean      ← default false
  theme?: 'dev-workspace-dark'
  height?: number | 'auto'
```

**用途**: JSON 格式化、JWT Payload 查看、代码片段编辑。

**Theme**: 自定义 `dev-workspace-dark` 主题，匹配 Design Token：
- bg: `--gray-200`, line highlight: `--gray-250`
- 与 Textarea 视觉一致，但提供语法高亮和行号

## 2.10 Card

```
API:
  variant: 'default' | 'info' | 'warning' | 'output'
  header?: string
  headerActions?: ReactNode
  padding?: 'sm' | 'md' | 'lg'
  collapsed?: boolean
  onToggle?: () => void
```

**Default**: bg `--gray-300`, border `rgba(255,255,255,0.05)`, radius `--radius-xl`
**Info**: bg `--blue-bg`, border `rgba(107,165,231,0.15)`
**Warning**: bg `--yellow-bg`, border `rgba(224,176,68,0.15)`
**Output**: bg `--gray-150`, border `--accent-primary` (极细)

**Header**: 11px uppercase, `letter-spacing: 0.06em`, color `--gray-600`

**Sections**（Card 内部可包含 Section）:
```
Card > Section > SectionHeader + SectionBody
SectionHeader: 文字在左, Actions 在右, 可选 divider
```

## 2.11 SplitView

```
API:
  direction: 'horizontal' | 'vertical'
  defaultSize: number    ← px or %
  minSize: number
  maxSize: number
  left: ReactNode
  right: ReactNode
```

**用途**: Workspace 布局（Sidebar | Main | Inspector）

- Resize handle: 3px, hover 变 `--accent-primary`, cursor `col-resize` / `row-resize`
- 拖拽时显示半透明指示线

## 2.12 Inspector

```
API:
  visible: boolean
  sections: InspectorSection[]
  onClose: () => void
```

**InspectorSection**:
```
{
  id: string
  label: string
  collapsed?: boolean
  content: ReactNode
}
```

- 右侧面板，width 280px
- bg: `--gray-150`, border-left
- 每个 Section 可折叠
- 适用于：属性查看、详情展示

## 2.13 StatusBar

```
API:
  left: ReactNode        ← status text, breadcrumb
  right: ReactNode       ← shortcuts hint, settings
```

- 高度: 28px
- bg: `--gray-100`, border-top: `rgba(255,255,255,0.04)`
- font: `--text-caption`, `--gray-700`
- 固定在窗口底部

## 2.14 Toast

```
API:
  variant: 'info' | 'success' | 'warning' | 'error'
  title: string
  description?: string
  action?: { label: string, onClick: () => void }
  duration?: number      ← default 4000ms, 0 = 不自动关闭
```

**Position**: 右下角，距边缘 `--space-5`

**Animation**: `translateY(8px→0)` + `opacity 0→1`, `--duration-normal`, `--ease-decelerate`

**Style**:
- bg: `--gray-300`, border-left: 3px (颜色取决于 variant)
- max-width: 360px
- 5 秒后自动消失（hover 时暂停计时）

## 2.15 Dialog

```
API:
  open: boolean
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode      ← Buttons
  size: 'sm' | 'md' | 'lg'
  onClose: () => void
```

**Animation**: `scale(0.96→1)` + `opacity 0→1` + overlay fade, `--duration-entrance`, `--ease-spring`

**Style**:
- overlay: `rgba(0,0,0,0.55)`, click to close
- panel: bg `--gray-150`, radius `--radius-2xl`, max-height 80vh
- header: title `--text-subtitle`, desc `--text-body --gray-700`
- Esc → close, 点击 overlay → close

## 2.16 Badge

```
API:
  variant: 'default' | 'accent' | 'success' | 'warning' | 'danger'
  size: 'sm' | 'md'
  children: number | string
```

- `sm`: `--text-caption`, padding `1px 5px`, radius `--radius-full`
- `md`: `--text-label`, padding `2px 7px`, radius `--radius-full`
- default: `--gray-400` bg, `--gray-900` text
- accent: `--accent-dim` bg, `--accent-primary` text

## 2.17 Tag

```
API:
  label: string
  color?: string         ← hex
  removable?: boolean
  onRemove?: () => void
```

- padding: `2px 8px`, radius: `--radius-full`
- bg: color 10% opacity, border: color 30% opacity, text: color
- remove button: ✕, hover bg deepen

## 2.18 EmptyState

```
API:
  icon: string
  title: string
  description: string
  action?: { label: string, onClick: () => void }
```

- 居中布局，max-width 400px
- icon: 48px, opacity 0.3
- title: `--text-subtitle`, `--gray-900`
- desc: `--text-body`, `--gray-700`
- action button below desc
- 动画: 延迟 300ms 后 fade in

---

# 3. Layout

## 3.1 Workspace Layout

```
┌──────┬──────────────────────────┬──────────┐
│      │                          │          │
│ Side │     Workspace            │ Inspect  │
│ bar  │     (Editor / Tools)     │ or       │
│      │                          │          │
├──────┴──────────────────────────┴──────────┤
│ StatusBar                                   │
└─────────────────────────────────────────────┘
```

- **Sidebar**: 240px, 可折叠收起
- **Workspace**: flex: 1, 路由内容区域
- **Inspector**: 280px, 可关闭
- **StatusBar**: 28px, 常驻底部

## 3.2 Page Structure

每个工具页统一使用以下结构：

```
┌──────────────────────────────────────────┐
│ Page Header (title + description)        │
├──────────────────────────────────────────┤
│ Toolbar (actions, filters, view toggle)  │
├──────────────────────────────────────────┤
│ Card: Input                              │
│ ┌──────────────────────────────────────┐ │
│ │ Section: Input Content               │ │
│ │ Section: Configuration               │ │
│ └──────────────────────────────────────┘ │
│ Action Bar                               │
│ Card: Output (conditional)               │
│ Card: History (conditional)              │
└──────────────────────────────────────────┘
```

## 3.3 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Compact | < 800px | Sidebar hidden, full-width content |
| Medium | 800-1100px | Sidebar visible, Inspector hidden |
| Wide | > 1100px | Full Workspace (Sidebar + Content + Inspector) |

---

# 4. Patterns

## 4.1 Tool Page Pattern

所有工具页（AES、Base64、JSON、JWT...）必须遵循此模式：

```yaml
Page:
  layout: "page > page-header + page-content"
  maxWidth: "--content-md" (820px)

PageHeader:
  title: string          # 工具名称
  description: string    # 一句话说明
  icon?: string          # 可选 emoji
  breadcrumb?: string    # 面包屑路径

Toolbar:
  position: below-header # 可选的工具栏
  items: [ViewToggle, CopyButton, ClearButton, ...]

InputCard:
  variant: "default"
  header: "输入" | "Input"
  sections:
    - InputSection:
        type: "textarea" | "monaco-editor"
        placeholder: "..."
    - ConfigSection:
        type: "form-grid"
        fields: [ModeSwitch, Select, Input, ...]

ActionBar:
  position: between-input-output
  items:
    - PrimaryButton (execute action)
    - SecondaryButton (swap mode, clear)
  alignment: left
  gap: 8px

ErrorAlert:
  condition: "errorMsg is not empty"
  variant: "error"

OutputCard:
  condition: "output is not empty"
  variant: "output"
  header: "输出" | "Output"
  sections:
    - OutputSection:
        type: "textarea" | "monaco-editor" | "code-block"
        readOnly: true
        copyable: true

HistoryCard:
  condition: "has history"
  variant: "default"
  header: "历史记录"
  maxItems: 20
```

## 4.2 State Management

每个工具页管理以下状态：

```
State:
  input: string
  output: string | null
  config: Record<string, any>      # 工具配置 (mode, algorithm, encoding...)
  error: string | null
  loading: boolean
  history: HistoryItem[]           # 最近 20 条
  viewMode: 'split' | 'input-only' | 'output-only'
```

---

# 5. Navigation

## 5.1 Sidebar Navigation

```
Sidebar:
  - Header (logo → click to Dashboard)
  - SearchBar (⌘K → Command Palette)
  - Favorites Section (pinned tools, max 5)
  - Recent Section (last 5 used, auto-sorted)
  - All Tools Section (grouped by category)
  - Footer (Settings, version)
```

## 5.2 Favorites

- 每个工具页 Toolbar 有 ☆ 按钮
- Favorites 显示在 Sidebar 顶部（最多 5 个）
- 数据持久化到 local Store

## 5.3 Recent

- 自动记录最近使用的 10 个工具
- 显示在 Favorites 下方
- 不持久化（session only）

## 5.4 Command Palette（全局搜索）

- `⌘K` 打开
- 搜索所有工具 + 操作（编码/解码/格式化/复制...）
- 支持模糊匹配
- 最近使用排在结果顶部
- `⌘1-9` 快速切换到前 9 个工具

## 5.5 Keyboard Shortcuts

| 快捷键 | 操作 |
|--------|------|
| `⌘K` | 打开 Command Palette |
| `⌘1` - `⌘9` | 切换到第 N 个 Sidebar 工具 |
| `⌘,` | 打开设置 |
| `⌘Shift+C` | 复制输出 |
| `⌘Enter` | 执行当前工具操作 |
| `⌘Shift+[` | 上一个工具 |
| `⌘Shift+]` | 下一个工具 |
| `Esc` | 关闭 Dialog / 清除错误 / 取消操作 |

---

# 6. Motion（完整规范）

| 场景 | Duration | Easing | 动画 |
|------|----------|--------|------|
| Hover 颜色变化 | 120ms | standard | background-color, color, border-color |
| Hover 微升 | 180ms | decelerate | transform: translateY(-1px) |
| Focus ring 出现 | 180ms | standard | box-shadow |
| Press (按钮) | 80ms | standard | transform: scale(0.97) |
| Segmented toggle | 180ms | standard | background 滑动 (伪元素) |
| Dropdown 展开 | 180ms | decelerate | opacity 0→1 + translateY(-4px→0) |
| Dialog 入场 | 350ms | spring | scale(0.96→1) + opacity 0→1 |
| Dialog 退场 | 120ms | accelerate | opacity 1→0 |
| Toast 入场 | 180ms | decelerate | translateY(8px→0) + opacity 0→1 |
| Toast 退场 | 150ms | accelerate | translateY(0→8px) + opacity 1→0 |
| Page 切换 | 250ms | decelerate | opacity 0→1 + translateY(4px→0) |
| Command Palette | 250ms | spring | scale(0.96→1) + opacity 0→1 |
| Sidebar 折叠 | 250ms | standard | width transition |
| Loading spinner | ∞ | linear | rotate 360° |
| Skeleton loading | 1.5s | ease | shimmer gradient sweep |

---

# 7. Accessibility

## 7.1 Keyboard

- 所有交互必须键盘可达（Tab / Shift+Tab / Enter / Esc / ↑↓）
- Focus order 必须遵循视觉顺序
- Dialog 打开时 focus trap 在 Dialog 内
- Command Palette 支持 ↑↓ 导航 + Enter 选择

## 7.2 Focus Ring

- 全局: `:focus-visible { outline: 2px solid --accent-primary; outline-offset: 2px; }`
- Input: focus 时 border → accent + glow ring（替代 outline）
- Button: focus-visible 时显示 ring

## 7.3 Contrast（WCAG AA）

| 元素 | 组合 | 对比度 |
|------|------|--------|
| 正文 | `#E0E0E0` on `#1E1E1E` | 11.2:1 ✅ |
| 次要文字 | `#9D9D9D` on `#1E1E1E` | 5.1:1 ✅ |
| 弱文字 | `#6E6E6E` on `#1E1E1E` | 3.2:1 ⚠️ (large text only) |
| Accent on dark | `#0078D4` on `#1E1E1E` | 4.6:1 ✅ |
| Error text | `#E07380` on `#3D1F1F` | 7.2:1 ✅ |

## 7.4 Font Scaling

- 所有字体使用相对单位或 CSS 变量
- 支持 `cmd+` / `cmd-` 缩放
- Minimum touch target: 28×28px (IconButton sm)
- Sidebar nav item height: 36px (超过 28px 最小触控区域)

---

# 8. AI Design Rules

> **以下规则为强制性约束，所有 AI Agent（Cursor / Claude Code / Codex）在生成代码时必须遵守。**

## 8.1 组件优先

1. 新增页面**只能组合已有组件**，不得创建新的内联样式。
2. 如需新组件，**先在本文件中定义 API + States + Style**，再实现代码。
3. 所有颜色必须通过 `var(--token)` 引用，**零硬编码 hex 值**。
4. 所有间距必须是 `--space-*`（4 的倍数），**零硬编码 px 值**。

## 8.2 页面模板

新增工具页 = **复制以下模板**，只替换：

```yaml
- page-title
- page-desc
- configFields (form grid items)
- executeAction (logic)
- outputFormat
```

```html
<div class="page">
  <header class="page-header"><h1>{{ title }}</h1><p>{{ desc }}</p></header>
  <div class="page-content">
    <div class="card"><div class="card-header">配置</div><div class="card-body">...</div></div>
    <div class="card"><div class="card-header">输入</div><div class="card-body">...</div></div>
    <div class="action-bar"><button class="btn-accent" @click="execute">执行</button></div>
    <div v-if="error" class="alert-error">{{ error }}</div>
    <div class="card card-output" v-if="output"><div class="card-header">输出</div><div class="card-body">...</div></div>
  </div>
</div>
```

## 8.3 禁止事项

- ❌ 不得在组件 `<style scoped>` 中定义组件通用样式（按钮、输入框、卡片）
  - → 必须使用 `theme.css` 中的全局 class（`.btn-accent`, `.dt-input`, `.card`...）
- ❌ 不得硬编码颜色（`#1E1E1E`, `#0078D4`...）
  - → 必须使用 `var(--token)`
- ❌ 不得硬编码间距（`padding: 16px`）
  - → 必须使用 `var(--space-*)`
- ❌ 不得硬编码字体大小
  - → 必须使用 `var(--text-*)`
- ❌ 不得创建新的动画曲线
  - → 必须使用 `var(--ease-*)` + `var(--duration-*)`
- ❌ 不得在 scoped style 中覆盖全局组件样式
  - → 应使用全局 class，scoped style 只定义布局（`.page`, `.form-grid`, `.field`）

## 8.4 Code Review Checklist

新增代码必须通过以下检查：

- [ ] 所有颜色使用 `var(--*-*)` Token
- [ ] 所有间距使用 `var(--space-*)` Token
- [ ] 所有字体大小使用 `var(--text-*)` Token
- [ ] 组件样式使用全局 class，不在 scoped 中重复定义
- [ ] 页面结构符合 Card+Section 模板
- [ ] 交互元素有 hover/focus/active/disabled 状态
- [ ] Focus ring 可见
- [ ] 动画使用 `var(--duration-*)` + `var(--ease-*)`
- [ ] 键盘可达（Tab / Enter / Esc）

---

## 8.5 Tool Layout Requirements

> **Mandatory**: All tool pages MUST follow these layout rules. Violations are flagged by `npm run validate:layout`.

### Standard Tool Page Structure

Every tool page must use the following component hierarchy:

```
<ToolLayout layout="io|editor|inspector|custom">
  ├── <template #options>        ← ToolOptionsRow + ToolOptionGroup (optional)
  ├── <template #workspace>      ← ToolWorkspace (required for I/O tools)
  │   ├── <template #input>      ← InputOutputPanel
  │   └── <template #output>     ← InputOutputPanel (with readonly)
  ├── <template #actions>        ← ToolActionBar
  └── <template #status>         ← ToolStatusBar
</ToolLayout>
```

### Component Roles

| Component | Role | Required |
|-----------|------|----------|
| **ToolLayout** | Outer shell — provides header, options, workspace, actions, status slots | ✅ Always |
| **ToolWorkspace** | Content layout — grid-based input/output/side panes | ✅ I/O tools |
| **InputOutputPanel** | Input/output text area with header, stats, error display | ✅ I/O tools |
| **ToolActionBar** | Action button bar with primary + secondary action slots | ✅ Recommended |
| **ToolOptionsRow** | Horizontal options bar within workspace | Optional |
| **ToolOptionGroup** | Labeled group of controls | Optional |
| **ToolStatusBar** | Status/error message display | Recommended |

### Layout Modes

| Layout | When to Use |
|--------|------------|
| `layout="io"` | Standard input→output transform tools (Base64, JSON, URL, Hash, etc.) |
| `layout="editor"` | Single-pane editor tools |
| `layout="inspector"` | Read/analyze tools with side info panel |
| `layout="custom"` | Complex tools that genuinely cannot fit standard layouts. **Must include a comment explaining why.** |

### Forbidden Patterns

The following legacy components must NOT be used as a tool page's primary structure:

| Component | Replacement |
|-----------|-------------|
| `ToolPage` | `ToolLayout` |
| `ToolSection` | `InputOutputPanel` |
| `ToolActions` | `ToolActionBar` |
| `ToolOutputPanel` | `InputOutputPanel` with `readonly` |

### Custom Layout Rules

When `layout="custom"` is used:
1. A comment must appear within 3 lines before or on the same line explaining why standard layouts cannot be used.
2. The tool must still be wrapped in `<ToolLayout>`.
3. The custom layout should be an exception, not the norm.
4. Custom layout tools are tracked in `scripts/validate-tool-layout.js` allowlist.

### Validation

```bash
npm run validate:layout   # Check all active tool views for layout compliance
```

---

> **版本**: v2.0  
> **维护**: 本文件是单一事实来源 (Single Source of Truth)。所有设计讨论、PR Review、AI Prompt 均以此为准。
