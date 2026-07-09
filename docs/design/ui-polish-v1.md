---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# UI Polish v1 — Developer Workspace

> **定位**: 将所有 UI 提升至 DevToys + Raycast + Xcode 水准。
> **规则**: 不新增功能。不修改 Core/SDK/Plugin/Architecture。仅 Design/Layout/Spacing/Typography。

---

## 1. Icon System

### Before → After

| 位置 | Before (Emoji) | After (SVG) | Icon Name |
|------|---------------|-------------|-----------|
| Sidebar AES | 🔐 | 24px SVG | `lock` |
| Sidebar JSON | 📋 | 24px SVG | `file-json` |
| Sidebar Base64 | 🔤 | 24px SVG | `case-sensitive` |
| Sidebar URL | 🔗 | 24px SVG | `link-2` |
| Sidebar Timestamp | ⏰ | 24px SVG | `clock-3` |
| Sidebar Hash | 🔑 | 24px SVG | `hash` |
| Sidebar JWT | 🎫 | 24px SVG | `shield` |
| Sidebar Cloud | 📦 | 24px SVG | `package` |
| Sidebar Settings | ⚙️ | 24px SVG | `settings-2` |
| Sidebar Search | 🔍 | 16px SVG | `search` |
| Sidebar Home | 🛠️ | 24px SVG | `terminal` |
| Sidebar Hello | 👋 | 24px SVG | `beaker` |
| Dashboard Cards | Emoji | 24px SVG | per-tool |

**Icon spec**: 24×24, stroke-width 2, color `currentColor`, `round` linecap/linejoin.

---

## 2. Sidebar

### Before

```
🛠️ Dev Toolbox
─────────────────
🔍 Search...
👋 Hello Plugin
🔐 AES 加解密     ← Tools mixed with
📦 请求参数编解码
📋 JSON 格式化
🔤 Base64 编解码
...
⚙️ 设置          ← Settings IN tool list (WRONG)
─────────────────
v0.1.0-beta.1
```

### After

```
🖥 Dev Toolbox
─────────────────
  ⌂ Home
  ★ Favorites      ← collapsed when empty
  ↻ Recent         ← last 5 tools
─────────────────
  Tools
  🔒 AES
  {} JSON
  🔤 Base64
  #  Hash
  ◷ Timestamp
  🔗 URL
  ⊡ JWT
  ⊞ Base Encrypt
  ...more...
─────────────────
  ⚙ Settings       ← MOVED OUT of tools
  ↻ Check Updates
  ⓘ About
─────────────────
v0.1.0
```

### States

```
Default:   icon #9D9D9D,  text #9D9D9D, bg transparent
Hover:     icon #E0E0E0,  text #E0E0E0, bg rgba(255,255,255,0.04)
Active:    icon #0078D4,  text #0078D4, bg rgba(0,120,212,0.10), border-left 3px #0078D4
Collapsed: 40px width, icons only, tooltip on hover
```

---

## 3. Home Workspace

### Before

```
3×3 grid of emoji cards, no sections
```

### After

```
┌─────────────────────────────────────────┐
│  Welcome back                            │
│  ⏰ Tue, Jul 30 14:30                    │
│                                          │
│  ┌─────────────────────────────────────┐ │
│  │ ↻ Recent                          │ │
│  │ [AES] [JSON] [Base64] [JWT]       │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  ┌─────────────────────────────────────┐ │
│  │ ★ Favorites                       │ │
│  │ [JSON] [Timestamp]                │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  ┌─────────────────────────────────────┐ │
│  │ All Tools                          │ │
│  │ ┌────┐ ┌────┐ ┌────┐ ┌────┐       │ │
│  │ │🔒 │ │{} │ │🔤│ │#  │       │ │
│  │ │AES│ │JSON│ │B64│ │Hash│       │ │
│  │ └────┘ └────┘ └────┘ └────┘       │ │
│  │ (grid of all tools, 4 columns)    │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 4. Card

### Unified Card Token

| Property | Value |
|----------|-------|
| Background | `--color-neutral-35` |
| Border | `rgba(255,255,255,0.04)` idle, `rgba(255,255,255,0.08)` hover |
| Border Radius | `--radius-xl` (8px) |
| Padding | `--space-5` (20px) |
| Shadow (idle) | `none` |
| Shadow (hover) | `var(--shadow-sm)` 0 2px 8px rgba(0,0,0,0.4) |
| Hover transform | `translateY(-1px)` |
| Transition | `all 150ms ease` |

### Card Header

| Property | Value |
|----------|-------|
| Font | `--text-caption` (11px) |
| Case | `uppercase` |
| Letter spacing | `0.06em` |
| Color | `--color-neutral-60` |
| Padding | `9px --space-5` |
| Border-bottom | `1px solid rgba(255,255,255,0.04)` |

---

## 5. Typography

### Hierarchy

| Level | Token | Weight | Usage |
|-------|-------|--------|-------|
| Hero | `--text-hero` 32px | 700 | Empty state |
| Heading | `--text-heading` 24px | 600 | Home welcome |
| Title | `--text-title` 20px | 600 | Page title |
| Subtitle | `--text-subtitle` 16px | 500 | Card title |
| Body | `--text-body` 13px | 400 | Content |
| Label | `--text-label` 12px | 500 | Form labels |
| Caption | `--text-caption` 11px | 400 | Hints, meta |
| Mono | `--text-body` 13px | 400 | Code, data |

### Title rewriting rule

```
Before:  "JSON 格式化工具 — 支持缩进格式化与压缩"
After:   "JSON"         ← title: just the format name
         "Format · Minify · Validate"   ← subtitle: modes
```

---

## 6. Toolbar

### Unified Toolbar Button

```
Height: 32px
Padding: 6px 12px
Icon: 16px SVG, left or solo
Text: --text-label 12px
Gap: 0px (segmented), 6px (standalone)

Variants:
  Primary:   bg #0078D4, text #fff
  Secondary: bg #2D2D2D, border rgba(255,255,255,0.08)
  Ghost:     bg transparent
  Danger:    bg rgba(224,115,128,0.10), text #E07380
```

---

## 7. Search Bar

### Spec

```
┌─────────────────────────────────┐
│ 🔍  Search tools...     ⌘K     │
└─────────────────────────────────┘

Width: 100% of sidebar
Height: 32px
Bg: --color-neutral-20
Border: rgba(255,255,255,0.06)
Radius: --radius-md (4px)
Icon left: 14px SVG, #6E6E6E
Shortcut right: ⌘K badge, --text-caption, --color-neutral-60 bg
Focus: border → #0078D4, glow ring 2px
```

---

## 8. Settings

### New Route: `/settings`

Settings is a dedicated page, NOT a tool entry.

Sections:
- **General**: Language, Theme, Startup behavior
- **Appearance**: Accent color, font size
- **Plugins**: List of installed plugins with enable/disable
- **Shortcuts**: Keyboard shortcut editor
- **About**: Version, license, GitHub link
- **Updates**: Check for updates button

---

## 9. Animation

### Motion Token Audit

| Element | Event | Duration | Easing | Effect |
|---------|-------|----------|--------|--------|
| Sidebar item | hover | 120ms | ease | bg + color fade |
| Card | hover | 150ms | decelerate | translateY(-1px) + shadow |
| Button | hover | 120ms | ease | bg fade |
| Button | press | 80ms | ease | scale(0.97) |
| Dialog | enter | 350ms | spring | scale(0.96→1) + opacity |
| Toast | enter | 180ms | decelerate | translateY(8→0) + opacity |
| Page | transition | 200ms | decelerate | opacity 0→1 + translateY(4→0) |
| Tooltip | enter | 150ms | decelerate | opacity 0→1 + translateY(-2→0) |
| Spinner | loading | 600ms | linear | rotate 360° |
| Progress | loading | 2s | linear | indeterminate bar |
| Empty state | mount | 400ms | decelerate, delay 300ms | opacity 0→1 |

---

## 10. Spacing Audit

### Token-only rule

Every px value must reference a `--space-*` token.

| Forbidden | Replace with |
|-----------|-------------|
| `12px` | `var(--space-3)` |
| `15px` | `var(--space-4)` (=16px, close enough) |
| `19px` | `var(--space-5)` (=20px) |
| `23px` | `var(--space-6)` (=24px) |
| `5px` | `var(--space-1)` (=4px) or inline gap |
| `7px` | `var(--space-2)` (=8px) |

### Height Standards

| Element | Height |
|---------|--------|
| Sidebar nav item | 36px |
| Toolbar button | 32px |
| Input (single line) | 32px |
| Select | 32px |
| Large button | 36px |
| Card header | 32px |
| Search bar | 32px |

---

## 11. Empty States

### Unified Empty State Pattern

```
┌───────────────────────────────┐
│                               │
│         [Icon 48px]          │   ← muted, opacity 0.2
│                               │
│       No data yet             │   ← --text-subtitle, --color-neutral-90
│  Paste or type to get started │   ← --text-body, --color-neutral-70
│                               │
│      [Primary Action]        │   ← optional
│                               │
└───────────────────────────────┘
```

Variants:
- **Empty**: Icon + title + description + optional action
- **Loading**: Skeleton placeholder (pulsing)
- **Error**: Red icon + error message + retry button
- **No Result**: Search icon + "No results" + clear filter link

---

## 12. Implementation Plan

### Phase 1 — Foundation (highest priority)
1. Icon System → `src/design/icons/`
2. Typography audit → all views
3. Spacing audit → all views

### Phase 2 — Structure
4. Sidebar redesign → sections
5. Settings → independent page
6. Home page → Welcome layout

### Phase 3 — Components
7. Card unification
8. Toolbar standardization
9. Search bar redesign
10. Empty states

### Phase 4 — Polish
11. Animation audit
12. Visual regression testing

---

> **版本**: v1.0  
> **验收**: 全应用零 Emoji, Settings 独立, 间距全 Token, 视觉一致。
