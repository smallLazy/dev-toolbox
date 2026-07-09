---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# AI Code Review Checklist

> **Purpose**: Standardized review checklist for AI Agents reviewing Plugin code. Every PR must pass all categories.
>
> **Primary reference**: [`../product/plugin-definition-of-done-v1.md`](../product/plugin-definition-of-done-v1.md)

---

## Review Categories

Review in this order. Each category blocks the next.

---

## 1. Architecture

```
[ ] Feature extends BaseFeature (not a plain class)
[ ] Plugin uses definePlugin() (not manual registration)
[ ] Zero direct Core imports (no import from @/core/registry, @/core/services)
[ ] Zero direct Registry access (no ToolRegistry.register() calls)
[ ] Zero direct Service access (all through this.context)
[ ] Zero Cross-Feature imports (no import from @/features/other-tool)
[ ] Plugin directory follows standard structure (logic.ts, composables.ts, <Name>View.vue...)
[ ] Deleting the Feature directory + Plugin file breaks nothing
```

**Key check**: If you can delete `src/features/<name>/` and `src/plugins/<name>.plugin.ts` and everything still compiles, architecture is correct.

---

## 2. Design

```
[ ] All colors from CSS variables: var(--color-*) or var(--gray-*) or var(--accent-*)
[ ] All spacing from var(--space-*) tokens
[ ] All font sizes from var(--text-*) tokens
[ ] All font weights from var(--weight-*)
[ ] All border radius from var(--radius-*)
[ ] All shadows from var(--elevation-*)
[ ] All durations from var(--duration-*)
[ ] All easing from var(--ease-*)
[ ] Zero hardcoded hex values (#XXXXXX)
[ ] Zero hardcoded px values > 2px
[ ] Zero emoji in templates
[ ] Zero PNG/JPG/GIF/WebP images
[ ] Zero direct lucide imports
[ ] Zero inline SVG in Feature templates
```

**Key check**: Search for `#` and `px` in the diff. Every hit must be justified or a violation.

---

## 3. Accessibility

```
[ ] All interactive elements are keyboard-reachable (Tab/Shift+Tab)
[ ] Enter executes primary action
[ ] Esc closes dialogs / clears errors
[ ] Focus order follows visual order
[ ] Focus ring is visible on :focus-visible
[ ] Touch targets ≥ 28×28px (IconButton minimum)
[ ] Color contrast meets WCAG AA (see design-system-v2.md §7.3)
[ ] Loading state has aria-busy or role="status"
[ ] Error state has role="alert"
[ ] Form inputs have associated labels
```

**Key check**: Tab through the entire page. Every interactive element must be reachable and show a visible focus indicator.

---

## 4. Performance

```
[ ] Feature component uses lazy loading (() => import(...))
[ ] No unnecessary re-renders (computed over method where possible)
[ ] logic.ts is a pure function (no side effects, no async unless needed)
[ ] Large inputs handled gracefully (no browser freeze)
[ ] History limited to 20 items max
[ ] No memory leaks (cleanup in onUnmounted / dispose)
[ ] Monaco Editor loaded only when needed (code mode)
[ ] No synchronous blocking operations on large data
```

---

## 5. Testing

```
[ ] logic.ts has ≥ 5 unit tests
[ ] Tests cover: happy path, empty input, edge cases, errors, consistency
[ ] Tests are deterministic (no random, no Date.now(), no network)
[ ] Tests run in isolation (no store, no router, no DOM)
[ ] validate() returns ValidationResult for all input states
[ ] Snapshot tests not used for dynamic data
```

**Key check**: Run `npx vitest run src/features/<name>/`. All must pass.

---

## 6. Documentation

```
[ ] Plugin README.md exists with:
      - Plugin description
      - Usage instructions
      - Configuration options
      - Example input/output
[ ] CHANGELOG.md exists with version history
[ ] Search keywords cover CN + EN (8+ total)
[ ] Commands registered in Command Palette (1+)
[ ] Shortcut hints in UI where applicable
```

---

## 7. Automated Validation (CI)

All these must pass:

```
[ ] npx vue-tsc --noEmit                         (TypeScript compiles)
[ ] npx vitest run                               (Tests pass)
[ ] npx tsx scripts/ci/validate-architecture.ts  (Architecture compliance)
[ ] npx tsx scripts/ci/validate-design.ts        (Design Token compliance)
[ ] npx tsx scripts/ci/validate-ai.ts            (AI Governance compliance)
```

---

## Quick Reference: Common Violations

| Pattern | Why Wrong | Correct |
|---------|-----------|---------|
| `import { ToolRegistry } from '@/core/registry'` | Direct Core access | Use `definePlugin()` auto-registration |
| `router.addRoute('/my-tool', ...)` | Manual routing | `definePlugin({ route: '/my-tool' })` |
| `style="color: #0078D4"` | Hardcoded color | `style="color: var(--accent-primary)"` |
| `padding: 16px` | Hardcoded spacing | `padding: var(--space-4)` |
| `font-size: 13px` | Hardcoded font | `font-size: var(--text-body)` |
| `🔍` in template | Emoji icon | `<Icon :name="APP_ICONS.search" />` |
| `import { Search } from 'lucide-vue-next'` | Direct lucide | `import { Icons } from '@/design/icons'` |
| `import { useJwt } from '@/features/jwt'` | Cross-Feature | Duplicate logic or use Event Bus |

---

> **Next**: Read [`AI_RELEASE.md`](./AI_RELEASE.md) for the release checklist.
