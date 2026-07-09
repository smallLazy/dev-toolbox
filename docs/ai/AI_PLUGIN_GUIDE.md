---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# AI Plugin Development Guide

> **Purpose**: Step-by-step guide for AI Agents to create Plugins. Follow this exactly — no deviations.
>
> **Primary references**:
> - [`../sdk/plugin-sdk-v1.md`](../sdk/plugin-sdk-v1.md) — Plugin SDK API
> - [`../sdk/feature-sdk-v1.md`](../sdk/feature-sdk-v1.md) — Feature SDK API
> - [`../plugin/plugin-generator.md`](../plugin/plugin-generator.md) — Plugin Generator
> - [`../product/plugin-definition-of-done-v1.md`](../product/plugin-definition-of-done-v1.md) — Definition of Done

---

## Golden Rule: Generator First

```
❌ NEVER hand-write a plugin directory.
✅ ALWAYS use the Plugin Generator.
```

```bash
npm run create-plugin <name> --template=<type>
```

The Generator produces 100% compliant code. Manual creation WILL violate rules.

---

## Step 1: Choose Your Template

| Template | Use When | Example Tools |
|----------|----------|---------------|
| `transform` | Input → transform → output | AES, Base64, Hash, URL Encode |
| `editor` | Editor + format/validate | JSON, SQL, YAML |
| `converter` | Two formats, bidirectional | Timestamp, Color, Unit |
| `inspector` | Parse → structured display | JWT, Regex, Certificate |
| `viewer` | File preview + metadata | Image, PDF, Font |
| `ai` | AI chat + streaming | Chat, Completion |
| `network` | HTTP request + response | cURL, GraphQL, WebSocket |
| `enterprise` | External service integration | Sentry, Gitee, Jira |

Full template reference: [`../plugin/plugin-generator.md`](../plugin/plugin-generator.md) §2.

---

## Step 2: Run the Generator

```bash
npm run create-plugin my-tool -- --template=transform
```

This creates:

```
src/features/my-tool/
├── MyToolFeature.ts     ← extends BaseFeature (auto-implemented)
├── logic.ts             ← pure functions (implement here)
├── composables.ts       ← Vue composable
├── types.ts             ← Config, State, Result types
├── settings.ts          ← settings schema + defaults
├── toolbar.ts           ← toolbar configuration
├── history.ts           ← history configuration
├── MyToolView.vue       ← main view (Card+Section, Design Tokens only)
├── index.ts             ← public API
├── __tests__/
│   └── logic.test.ts    ← test skeleton (5+ test stubs)
├── README.md            ← plugin documentation
└── CHANGELOG.md          ← version changelog

src/plugins/my-tool.plugin.ts  ← definePlugin() manifest (auto-filled)
```

---

## Step 3: Implement logic.ts

This is the **only file** with real work. Everything else is auto-generated.

```typescript
// src/features/my-tool/logic.ts

export interface MyToolConfig {
  mode: 'encode' | 'decode'
  algorithm: 'sha256' | 'md5'
}

export interface MyToolResult {
  output: string
  metadata?: Record<string, unknown>
}

/**
 * Pure function. Zero side effects. Directly testable.
 */
export function process(input: string, config: MyToolConfig): MyToolResult {
  // Your transformation logic here
  return { output: transformedInput }
}

/**
 * Validate input before processing.
 */
export function validate(input: string): { valid: boolean; errors: string[] } {
  if (!input.trim()) {
    return { valid: false, errors: ['Input cannot be empty'] }
  }
  return { valid: true, errors: [] }
}
```

### Rules for logic.ts

| Rule | Reason |
|------|--------|
| Pure function | Must be testable with vitest |
| No DOM access | Runs in test, not browser |
| No Vue imports | Framework-agnostic |
| No service calls | Services are for composables, not logic |
| Typed inputs/outputs | TypeScript strict mode |

---

## Step 4: Write Tests

```typescript
// src/features/my-tool/__tests__/logic.test.ts
import { describe, it, expect } from 'vitest'
import { process, validate } from '../logic'

describe('process', () => {
  it('should encode input with sha256', () => {
    const result = process('hello', { mode: 'encode', algorithm: 'sha256' })
    expect(result.output).toBeDefined()
    expect(result.output).not.toBe('hello')
  })

  it('should handle empty input', () => {
    // Edge case
  })

  it('should handle unicode input', () => {
    // Internationalization
  })

  it('should handle very long input', () => {
    // Performance boundary
  })

  it('should produce consistent output', () => {
    // Idempotency
  })
})

describe('validate', () => {
  it('should reject empty input', () => {
    expect(validate('').valid).toBe(false)
  })

  it('should accept valid input', () => {
    expect(validate('hello').valid).toBe(true)
  })
})
```

**Minimum: 5 tests.** Cover: happy path, empty input, edge cases, error handling, consistency.

---

## Step 5: Verify Plugin Works

```bash
# Type check
npx vue-tsc --noEmit

# Run tests
npx vitest run src/features/my-tool/

# Start dev server
npm run tauri dev
```

Open the app, find your tool in the Sidebar, test basic functionality.

---

## Step 6: Pass Definition of Done

Before considering the Plugin complete, verify every item in:

[`../product/plugin-definition-of-done-v1.md`](../product/plugin-definition-of-done-v1.md)

Quick checklist:

```
Architecture:
  [ ] Feature extends BaseFeature
  [ ] Plugin uses definePlugin()
  [ ] Zero direct Core imports
  [ ] Zero direct Registry access
  [ ] Zero direct Service access

Design:
  [ ] All colors from var(--color-*)
  [ ] All spacing from var(--space-*)
  [ ] All typography from var(--text-*)
  [ ] All icons from @/design/icons
  [ ] Zero emoji (use SVG icons)
  [ ] Zero hardcoded hex values
  [ ] Zero hardcoded px values

UI:
  [ ] Uses Card+Section layout
  [ ] Uses PluginWorkspace template
  [ ] Has Empty State
  [ ] Has Loading State
  [ ] Has Error State
  [ ] Toolbar uses FeatureToolbar

Functionality:
  [ ] Settings schema defined
  [ ] History enabled
  [ ] Search keywords registered (8+)
  [ ] Commands registered (1+)
  [ ] Keyboard shortcut (⌘Enter minimum)

Quality:
  [ ] logic.ts has 5+ unit tests
  [ ] Plugin Validation passes
  [ ] Architecture Validation passes
  [ ] Design Validation passes
  [ ] TypeScript compiles

Documentation:
  [ ] README.md (description + usage)
  [ ] CHANGELOG.md (version history)
```

---

## Step 7: Run All Validations

```bash
# Full CI quality gate
npm run validate

# Or individually:
npx tsx scripts/ci/validate-architecture.ts
npx tsx scripts/ci/validate-design.ts
npx tsx scripts/ci/validate-plugins.ts
npm test
```

All must pass before merge.

---

## Common Mistakes (AI Pitfalls)

| Mistake | Why It Happens | Fix |
|---------|---------------|-----|
| Importing from `@/core/registry` directly | AI tries to register manually | Use `definePlugin()` — auto-registration |
| Adding route in `router/index.ts` | AI thinks routes are manual | `definePlugin()` auto-adds routes |
| Hardcoding `#1E1E1E` | AI generates hex from training data | Use `var(--gray-250)` instead |
| `import { Something } from '@/features/other-tool'` | AI reuses existing code | Features must be independent |
| Creating `src/features/my-tool/` manually | AI doesn't know about Generator | Always use `npm run create-plugin` |
| Importing lucide directly | AI knows lucide-vue-next | Always use `@/design/icons` |

---

> **Next**: Read [`AI_UI_GUIDE.md`](./AI_UI_GUIDE.md) for Design System compliance.
