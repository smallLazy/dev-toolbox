---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# UI Guidelines v1.0 — Developer Workspace

> **规则**: 所有 Plugin 页面必须遵循本规范。禁止 Plugin 自定义布局。

---

## 1. Page Layout

```
┌──────────────────────────────────────────┐
│ Page Header (title + description)        │
├──────────────────────────────────────────┤
│ Card: Configuration / Mode               │
│ ┌──────────────────────────────────────┐ │
│ │ [Mode Switch] [Options...]           │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Card: Input                              │
│ ┌──────────────────────────────────────┐ │
│ │ [Textarea / Monaco Editor]           │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Toolbar: [Execute] [Copy] [Clear] [Swap] │
│                                          │
│ Alert (conditional)                      │
│                                          │
│ Card: Output (conditional)               │
│ ┌──────────────────────────────────────┐ │
│ │ [Readonly Textarea / Result]         │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Card: History (conditional)              │
└──────────────────────────────────────────┘
```

---

## 2. Sidebar

```
┌─────────────┐
│ 🖥 Logo      │
│─────────────│
│ 🔍 Search   │
│─────────────│
│ WORKSPACE   │  ← Section label (caps, subtle)
│  ⌂ Home     │
│  ★ Favorites│
│  ↻ Recent   │
│─────────────│
│ TOOLS       │
│  {} JSON    │
│  🔒 AES     │
│  #  Hash    │
│  ...        │
│─────────────│
│ APPLICATION │
│  ⚙ Settings │
│─────────────│
│ v0.1.0      │
└─────────────┘

Width: 240px
Section label: 11px, uppercase, #6E6E6E, letter-spacing 0.06em
Nav item: 34px height, icon 18px left, text 13px
Active: left-border 3px #0078D4, bg rgba(0,120,212,0.10)
```

---

## 3. Card

```
┌──────────────────────────────┐
│ HEADER           [actions]   │  ← 11px uppercase, 0.06em spacing
├──────────────────────────────┤
│                              │
│  Content area                │  ← padding: 16px 20px
│                              │
└──────────────────────────────┘

Bg: --color-neutral-35
Border: rgba(255,255,255,0.04)
Radius: 8px (--radius-xl)
Hover: translateY(-1px), shadow-sm, border → rgba(255,255,255,0.08)
Transition: all 150ms --ease-decelerate
```

---

## 4. Home

```
┌──────────────────────────────────────────┐
│  Welcome back                             │
│  ⏰ 2026-07-30 14:30                      │
│                                           │
│  ★ Favorites (if any)                    │
│  ┌─────┐ ┌─────┐                        │
│  │Icon │ │Icon │                        │
│  │Name │ │Name │                        │
│  └─────┘ └─────┘                        │
│                                           │
│  ↻ Recent                                │
│  (same card grid, last 5 tools)          │
│                                           │
│  All Tools                                │
│  4-column grid, all available tools      │
└──────────────────────────────────────────┘
```

---

## 5. Empty State

```
┌──────────────────────────────────┐
│                                  │
│          [Icon 48px]            │  ← opacity 0.15
│                                  │
│        Title (16px)              │
│   Description (13px, muted)     │
│                                  │
│      [Primary Action]           │  ← optional
│                                  │
└──────────────────────────────────┘
```

---

## 6. Settings

```
┌──────┬───────────────────────────┐
│ Tab  │ Content                   │
│      │                           │
│ Gen  │ ┌───────────────────────┐ │
│ Plug │ │ Card: Section        │ │
│ Shrt │ └───────────────────────┘ │
│ Abt  │                           │
│      │ ┌───────────────────────┐ │
│      │ │ Card: Section        │ │
│      │ └───────────────────────┘ │
└──────┴───────────────────────────┘
```

---

> **版本**: v1.0
