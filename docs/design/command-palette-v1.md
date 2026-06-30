# Command Palette v1.0 — Product Design Spec

> **Sprint**: 01 — UX Foundation
> **Date**: 2026-06-30
> **Status**: Implemented

---

## 1. Overview

The Command Palette is a global search dialog accessible via `⌘K` (Mac) / `Ctrl+K` (Windows/Linux). It provides instant access to all plugins, commands, settings, recent items, and favorites through fuzzy search.

### Reference Products
- **Raycast** — ⌘K global launcher, fuzzy search, command-first
- **Linear** — ⌘K command menu with keyboard navigation
- **VS Code** — Command Palette with `>` prefix for commands

---

## 2. Trigger

| Method | Behavior |
|--------|----------|
| `⌘K` / `Ctrl+K` | Global keyboard shortcut — opens palette |
| Sidebar search focus | Clicking the sidebar search box opens the palette |
| `Esc` | Closes palette |
| Click overlay | Closes palette |

Global shortcut is registered in `App.vue` via `window.addEventListener('keydown', ...)`.

---

## 3. Layout

```
┌─────────────────────────────────────┐
│ 🔍 Search tools and commands...     │  ← Search input (auto-focused)
├─────────────────────────────────────┤
│ 📋 JSON 格式化                      │  ← Results (40px each)
│    JSON 格式化、压缩与验证  plugin   │
│                                     │
│ 🔐 AES                              │
│    AES-256 encryption       crypto  │
│                                     │
│ ⚙ Settings                         │  ← Always present at bottom
│    Application settings...          │
├─────────────────────────────────────┤
│ ↑↓ Navigate  ↵ Open  Esc Cancel    │  ← Footer
└─────────────────────────────────────┘
```

- **Width**: 560px max, 100vw - 40px min
- **Height**: 480px max
- **Position**: centered, 15vh from top
- **Overlay**: `rgba(0,0,0,0.55)`, click to close
- **Z-index**: 1000

---

## 4. Search Algorithm

### No Query (Default State)

Priority order:
1. **Recent** (last 5, deduped)
2. **Favorites** (all, skip if already in Recent)
3. **All Tools** (alphabetical by name)
4. **Settings** (always last)

### With Query

Fuzzy search across:
- Plugin `id` (exact match = +100 score)
- Plugin `name` (exact = +80, startsWith = +50, contains = +30)
- Plugin `keywords` (each match = +20)
- Plugin `description` (contains = +10)
- Command `label` and `description` (same scoring)

### Result Limit

- Maximum **20 items** for performance (<16ms at 300+ plugins)
- Settings entry appended after the 20-item cap

---

## 5. Component Architecture

### useCommandPalette (Composable)

**File**: `src/composables/useCommandPalette.ts`

State:
- `isOpen: Ref<boolean>`
- `query: Ref<string>`
- `selectedIndex: Ref<number>`

Computed:
- `paletteItems: ComputedRef<PaletteItem[]>` — built from workspace store

Methods:
- `open()`, `close()`, `toggle()`
- `moveUp()`, `moveDown()`
- `execute()` — runs `item.action()`, touches recent, closes palette

### PaletteItem Type

```typescript
interface PaletteItem {
  id: string
  label: string
  description?: string
  icon: string
  type: 'plugin' | 'command' | 'recent' | 'favorite' | 'setting'
  pluginId?: string
  action: () => void
  shortcut?: string
}
```

### CommandPalette.vue

- `<Teleport to="body">` — renders outside component tree
- `<Transition name="palette">` — spring entrance animation
- Keyboard handler: Escape, ArrowUp, ArrowDown, Enter
- Listens for `workspace:open-palette` custom event from App.vue

### CommandPaletteItem.vue

- Props: `item: PaletteItem`, `active: boolean`
- Emits: `select`
- `role="option"`, `aria-selected` on active
- Icon resolved via `getToolIcon()`, Settings uses `Icons.Settings`

---

## 6. Keyboard Navigation

| Key | Action |
|-----|--------|
| `↑` / `↓` | Move selection up/down |
| `Enter` | Execute selected item |
| `Esc` | Close palette |
| `Tab` / `Shift+Tab` | Cycle focus within dialog (focus trap) |

- Selection wraps (arrow past last → first, arrow before first → last)
- Selection resets to 0 when query changes

---

## 7. Animation

| Phase | Duration | Easing | Effect |
|-------|----------|--------|--------|
| Enter | `--duration-entrance` (350ms) | `--ease-spring` | `scale(0.96→1)` + `opacity 0→1` |
| Leave | `--duration-fast` (120ms) | `--ease-accelerate` | `opacity 1→0` |
| Item hover | `--duration-fast` (120ms) | `--ease-standard` | `background-color` |

---

## 8. Accessibility

| Element | Attribute | Value |
|---------|-----------|-------|
| Dialog | `role` | `dialog` |
| Dialog | `aria-label` | "Command Palette" |
| Search input | `role` | `combobox` |
| Search input | `aria-expanded` | `true` |
| Search input | `aria-autocomplete` | `list` |
| Search input | `aria-controls` | `palette-list` |
| Results list | `role` | `listbox` |
| Result item | `role` | `option` |
| Result item | `aria-selected` | `true` / `false` |
| All items | Tab focusable | Via `<button>` element |

---

## 9. Design Tokens Used

| Token | Usage |
|-------|-------|
| `--color-neutral-15` | Panel background |
| `--color-neutral-20` | Search input background |
| `--color-neutral-25` | Search input focus background |
| `--color-neutral-40` | Shortcut badge background |
| `--color-neutral-70` | Description text, footer text |
| `--color-neutral-100` | Item label text |
| `--color-accent-dim` | Active item background |
| `--color-accent-primary` | Active item icon |
| `--border-color-default` | Panel border |
| `--border-color-focus` | Search focus border |
| `--sidebar-text` | Default item color |
| `--sidebar-text-secondary` | Placeholder, empty text |
| `--sidebar-icon` | Default icon color |
| `--sidebar-divider` | Search/footer borders |
| `--radius-2xl` | Panel border radius |
| `--radius-md` | Search input radius |
| `--radius-sm` | Shortcut badge radius |
| `--duration-entrance` | Enter animation |
| `--duration-fast` | Leave animation, item hover |
| `--ease-spring` | Enter easing |
| `--ease-accelerate` | Leave easing |
| `--ease-standard` | Item hover easing |

---

## 10. Performance

- **Result limit**: 20 items (O(n) filter + O(n log n) sort, bounded)
- **Search target**: <16ms at 300 plugins
- **No virtual scroll** needed at 20 items
- **Computed-based**: `paletteItems` is a single `computed` — no watchers for filtering
- **shallowRef** for tools list in workspace store
- **No DOM measurement** during search

---

## 11. Future Enhancements (Sprint 02+)

- [ ] AI plugin registration (commands from LLM)
- [ ] Command prefix modes (`>` for commands, `@` for plugins)
- [ ] Recent commands tracking (not just plugins)
- [ ] Sub-command palette (plugin-specific palette when inside a tool)
- [ ] Keyboard shortcut display customization
- [ ] Theme toggle from palette

---

> **Version**: v1.0
> **Maintained by**: Sprint 01 — UX Foundation
