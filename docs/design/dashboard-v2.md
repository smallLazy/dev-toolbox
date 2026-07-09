---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Dashboard v2.0 — Product Design Spec

> **Sprint**: 01 — UX Foundation
> **Date**: 2026-06-30
> **Status**: Implemented

---

## 1. Overview

The Home Dashboard (`/`) is the primary landing page. It displays tools organized into three sections: **Recent**, **Favorites**, and **All Tools** (grouped by category). This replaces the previous flat 9-card static grid.

### Reference Products
- **Raycast** — search-first, sections for frequent/recent
- **DevToys** — categorized tool grid
- **Linear** — clean section hierarchy

---

## 2. Layout

```
┌─────────────────────────────────────────────┐
│ Page Header                                  │
│ "Dev Toolbox" / "Choose a tool to get..."   │
├─────────────────────────────────────────────┤
│ Recent                                       │
│ ┌──────┐ ┌──────┐ ┌──────┐                  │
│ │ JSON │ │ AES  │ │ Hash │  (up to 6)       │
│ └──────┘ └──────┘ └──────┘                  │
├─────────────────────────────────────────────┤
│ Favorites                                    │
│ ┌──────┐ ┌──────┐ ┌──────┐                  │
│ │ JWT  │ │ URL  │ │      │  (up to 10)      │
│ └──────┘ └──────┘ └──────┘                  │
├─────────────────────────────────────────────┤
│ All Tools                                    │
│                                              │
│ Crypto                                       │
│ ┌──────┐ ┌──────┐ ┌──────┐                  │
│ │ SM2  │ │ SM3  │ │ SM4  │  (3-col grid)    │
│ └──────┘ └──────┘ └──────┘                  │
│                                              │
│ Formatter                                    │
│ ┌──────┐ ┌──────┐ ┌──────┐                  │
│ │ JSON │ │ XML  │ │ YAML │                  │
│ └──────┘ └──────┘ └──────┘                  │
│ ...                                          │
└─────────────────────────────────────────────┘
```

- **Max width**: `var(--content-max-width)` (820px), centered
- **Padding**: inherited from `MainLayout` (`--content-padding-y` / `--content-padding-x`)
- **Scroll**: vertical, full page

---

## 3. Sections

### 3.1 Recent

- **Source**: `useRecent(6)` composable → workspace store `recentIds`
- **Max items**: 6
- **Auto-populated**: when navigating to any tool via `workspaceStore.touchRecent()`
- **Empty state**: `<PluginEmptyState icon="History" title="No recent tools" description="Tools you use will appear here." />`
- **Header**: "Recent" — 11px, uppercase, `--color-neutral-60`, 0.06em letter-spacing
- **Grid**: 3-column CSS grid, 12px gap

### 3.2 Favorites

- **Source**: `useFavorites()` composable → workspace store `favoriteIds`
- **Max items**: 10 (capped by store)
- **Persistence**: localStorage key `workspace:favorites`
- **Toggle API**: `workspaceStore.toggleFavorite(pluginId)` returns boolean
- **Empty state**: `<PluginEmptyState icon="Star" title="No favorites" description="Star tools to pin them here for quick access." />`
- **Header**: "Favorites" — same style as Recent

### 3.3 All Tools

- **Source**: `useTools()` composable → workspace store `toolsByCategory`
- **Grouping**: Auto-grouped by plugin `category` field
- **Category header**: 12px, semibold (`--weight-semibold`), `--color-neutral-60`, 0.08em letter-spacing, NO uppercase
- **Grid**: 3-column CSS grid, 12px gap, within each category group

---

## 4. DashboardCard Component

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `pluginId` | `string` | Yes | Plugin identifier (e.g., 'json') |
| `name` | `string` | Yes | Display name |
| `description` | `string` | Yes | One-line description |
| `icon` | `string` | Yes | Plugin icon identifier (resolved via `getToolIcon()`) |
| `path` | `string` | Yes | Route path |
| `variant` | `'default' \| 'recent' \| 'favorite'` | No | Visual variant (default: 'default') |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `select` | `pluginId: string` | Fired on click |

### States

| State | Visual |
|-------|--------|
| **Default** | Height 80px, bg `--color-neutral-35`, border `--border-color-subtle`, radius `--radius-xl` |
| **Hover** | border → `--border-color-hover`, `box-shadow: var(--shadow-sm)` |
| **Focus** | `:focus-visible` ring from global theme.css |
| **Active/Click** | No press animation per spec |

### Layout
- Flex row: icon (40×40, `--color-accent-primary`) + body (title + description)
- Icon: 24px, rendered via `getToolIcon(pluginId)`, fallback `Icons.Package`
- Title: 14px (`--text-base`), `--weight-medium`, `--color-neutral-100`
- Description: 12px (`--text-label`), `--color-neutral-70`
- Text overflow: ellipsis

### Motion
- Transition properties: `box-shadow`, `border-color` only
- Duration: `--duration-normal` (180ms)
- Easing: `--ease-decelerate`
- **NO** `transition: all`, scale, translateY, or card jump

### Accessibility
- `<button>` element — naturally focusable via Tab
- `aria-label="${name} — ${description}"`

---

## 5. Data Flow

```
Plugin files (33 .plugin.ts)
  ↓ import (barrel: src/plugins/index.ts)
Workspace Store (src/stores/workspace.ts)
  ↓ computed: toolsByCategory, recentTools, favoriteTools
Composables (useRecent, useFavorites, useTools)
  ↓ reactive refs + computed
Dashboard Components (DashboardRecent, DashboardFavorites, DashboardGrid)
  ↓ props + emits
DashboardCard
```

### Touch Recent on Navigation

```
User clicks card
  → DashboardCard emits 'select'
  → DashboardView.openTool(pluginId)
  → workspaceStore.touchRecent(pluginId)
  → router.push(path)
```

---

## 6. Design Tokens Used

| Token | Usage |
|-------|-------|
| `--color-neutral-35` | Card background |
| `--color-neutral-100` | Card title text |
| `--color-neutral-70` | Card description, page subtitle |
| `--color-neutral-60` | Section headers |
| `--color-neutral-110` | Page title |
| `--color-accent-primary` | Card icon color |
| `--border-color-subtle` | Card default border |
| `--border-color-hover` | Card hover border |
| `--border-color-focus` | Card focus ring |
| `--shadow-sm` | Card hover shadow |
| `--text-heading` | Page title size |
| `--text-base` | Card title size |
| `--text-label` | Card description, category header size |
| `--text-caption` | Section header size |
| `--text-body` | Page subtitle size |
| `--weight-medium` | Card title weight |
| `--weight-semibold` | Category header, page title weight |
| `--radius-xl` | Card border radius |
| `--duration-normal` | Card transition duration |
| `--ease-decelerate` | Card transition easing |
| `--space-*` | All spacing |
| `--content-max-width` | Page max width |

### Prohibited
- ❌ Hardcoded hex colors
- ❌ Hardcoded px values
- ❌ `transition: all`
- ❌ `transform: scale()` or `translateY()` on cards
- ❌ Emoji in templates
- ❌ Inline SVG

---

## 7. Category Display Labels

| Category ID | Display Label |
|-------------|---------------|
| `crypto` | Crypto |
| `encoder` | Encoding |
| `formatter` | Formatter |
| `converter` | Converter |
| `analyzer` | Analyzer |
| `generator` | Generator |
| `network` | Network |
| `utility` | Utility |

---

> **Version**: v2.0
> **Maintained by**: Sprint 01 — UX Foundation
