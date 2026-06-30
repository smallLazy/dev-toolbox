# AI UI Development Guide

> **Purpose**: How AI Agents must build UI — using Design Tokens, Components, and Icons. Zero custom styling.
>
> **Primary references**:
> - [`../design/design-system-v2.md`](../design/design-system-v2.md) — Design Tokens, Component API, Patterns (SSOT)
> - [`../design/ui-guidelines-v1.md`](../design/ui-guidelines-v1.md) — Page Layout, Sidebar, Card structure
> - [`../design/icon-guidelines-v1.md`](../design/icon-guidelines-v1.md) — Icon System rules
> - [`../design/interaction-guidelines-v1.md`](../design/interaction-guidelines-v1.md) — Motion, States, Transitions

---

## Core Principle: Token-Only Styling

```
❌ NEVER hardcode any visual value.
✅ ALWAYS use CSS custom properties (Design Tokens).
```

| Category | Use | Never Use |
|----------|-----|-----------|
| Colors | `var(--gray-250)` | `#1E1E1E` |
| Spacing | `var(--space-4)` | `16px` |
| Font Size | `var(--text-body)` | `13px` |
| Font Weight | `var(--weight-medium)` | `500` |
| Border Radius | `var(--radius-md)` | `4px` |
| Duration | `var(--duration-normal)` | `180ms` |
| Easing | `var(--ease-standard)` | `ease` |
| Shadow | `var(--elevation-1)` | `0 1px 2px rgba(...)` |

---

## Color Tokens Quick Reference

### Neutral Scale (Dark Theme)

```
--gray-250  → App background
--gray-300  → Card background
--gray-200  → Input background
--gray-100  → Sidebar background
--gray-600  → Border
--gray-900  → Secondary text
--gray-950  → Primary text
```

### Accent

```
--accent-primary   → #0078D4 (buttons, links, active states)
--accent-hover     → #1A8CE8
--accent-dim       → rgba(0,120,212,0.10) (active bg)
```

### Semantic

```
--red-text / --red-bg     → Error states
--green-text / --green-bg → Success states
--yellow-text / --yellow-bg → Warning states
```

Full tokens: [`../design/design-system-v2.md`](../design/design-system-v2.md) §1.1.

---

## Spacing System

Based on 4px grid. All spacing must use these tokens:

| Token | px | Use |
|-------|-----|-----|
| `--space-1` | 4 | icon-text gap |
| `--space-2` | 8 | inline gap |
| `--space-3` | 12 | form gap, card gap |
| `--space-4` | 16 | section padding |
| `--space-5` | 20 | card inner padding |
| `--space-6` | 24 | section margin |

```css
/* ✅ Correct */
.card { padding: var(--space-5); gap: var(--space-3); }

/* ❌ Wrong */
.card { padding: 20px; gap: 12px; }
```

---

## Typography Tokens

| Token | Size | Weight | Use |
|-------|------|--------|-----|
| `--text-caption` | 11px | 400 | Badge, KeyHint |
| `--text-label` | 12px | 500 | Form Label, Sidebar Section |
| `--text-body` | 13px | 400 | Body, Button, Nav Item |
| `--text-subtitle` | 16px | 500 | Card title |
| `--text-title` | 20px | 600 | Page title |

Full tokens: [`../design/design-system-v2.md`](../design/design-system-v2.md) §1.2.

---

## Icon System

**Single import, single source:**

```typescript
import { Icons, TOOL_ICONS, APP_ICONS, getToolIcon, ICON_SIZE } from '@/design/icons'
```

### Rules

| Rule | Detail |
|------|--------|
| ✅ Use `@/design/icons` | The only allowed icon source |
| ✅ Use `ICON_SIZE` constants | `ICON_SIZE.md` (16), `ICON_SIZE.lg` (18) |
| ✅ `currentColor` only | Icons inherit text color |
| ❌ No emoji | Use SVG icons from the registry |
| ❌ No PNG/JPG/GIF | SVG only |
| ❌ No direct lucide import | Always route through `@/design/icons` |

Full icon rules: [`../design/icon-guidelines-v1.md`](../design/icon-guidelines-v1.md).

---

## Component Usage

### Always Use Existing Components

```
✅ <Button variant="primary" size="md">Execute</Button>
✅ <Card variant="default">
✅ <Input v-model="value" placeholder="Enter text..." />
✅ <EmptyState icon="search" title="No results" description="Try another query" />
✅ <Toast variant="success" title="Copied!" />
```

### Never Create Inline Styles

```
❌ <button style="background: #0078D4; padding: 8px 18px;">Execute</button>
❌ <div class="my-custom-card" style="background: var(--gray-300);">...</div>
```

Components are defined in: [`../design/design-system-v2.md`](../design/design-system-v2.md) §2.

---

## Page Structure Template

Every Plugin page follows this structure:

```
┌──────────────────────────────────────────┐
│ Page Header (title + description)        │
├──────────────────────────────────────────┤
│ Card: Configuration                      │
├──────────────────────────────────────────┤
│ Card: Input                              │
├──────────────────────────────────────────┤
│ Toolbar: [Execute] [Copy] [Clear]        │
├──────────────────────────────────────────┤
│ Alert (conditional, on error)            │
├──────────────────────────────────────────┤
│ Card: Output (conditional)               │
├──────────────────────────────────────────┤
│ Card: History (conditional)              │
└──────────────────────────────────────────┘
```

Full page template: [`../design/ui-guidelines-v1.md`](../design/ui-guidelines-v1.md) §1.

---

## State Coverage

Every Plugin page MUST handle these states:

| State | Implementation |
|-------|---------------|
| **Idle** | Initial state, input ready |
| **Loading** | Spinner, input disabled |
| **Success** | Output displayed |
| **Error** | Alert with message |
| **Empty** | EmptyState component |

```vue
<!-- Always include all states -->
<div v-if="loading" class="loading-state"><Spinner /></div>
<div v-else-if="error" class="error-state"><Alert :message="error" /></div>
<div v-else-if="!output && !input" class="empty-state"><EmptyState ... /></div>
<div v-else-if="output" class="success-state"><!-- show output --></div>
```

---

## Interaction Rules

All interactive elements must handle these states:

| State | Rule |
|-------|------|
| **Hover** | Color/bg transition, 120ms |
| **Focus** | Visible focus ring, 180ms |
| **Pressed** | `scale(0.97)`, 80ms |
| **Disabled** | `opacity: 0.35`, `cursor: not-allowed` |

Full interaction spec: [`../design/interaction-guidelines-v1.md`](../design/interaction-guidelines-v1.md).

---

## Prohibited Patterns

```
❌ Inline styles on any element
❌ <style scoped> with component-level styles (use global classes)
❌ Custom CSS classes duplicating existing component styles
❌ transition: all 0.3s ease (use specific properties + tokens)
❌ @keyframes custom animations (use predefined motion tokens)
❌ Different hover effects per plugin (all plugins share the same patterns)
```

---

## Code Review Self-Check

Before submitting code, verify:

```
[ ] All colors use var(--*-*) tokens
[ ] All spacing uses var(--space-*)
[ ] All font sizes use var(--text-*)
[ ] All icons from @/design/icons
[ ] Zero emoji in templates
[ ] Zero hardcoded hex values
[ ] Zero hardcoded px values > 2
[ ] All interactive elements have hover/focus/active/disabled states
[ ] Focus ring is visible (keyboard navigation)
[ ] Page follows Card+Section structure
[ ] All 5 states covered: idle, loading, success, error, empty
```

---

> **Next**: Read [`AI_CODE_REVIEW.md`](./AI_CODE_REVIEW.md) for the complete review checklist.
