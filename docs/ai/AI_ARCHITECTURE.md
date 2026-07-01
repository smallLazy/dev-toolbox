# AI Architecture Guide

> **Purpose**: Explain the Plugin Architecture and Frozen Layers to AI Agents. Understand WHY before touching any code.
>
> **Primary reference**: [`../architecture/workspace-architecture-v1.md`](../architecture/workspace-architecture-v1.md) — Single Source of Truth for architecture.

---

## Why Plugin Architecture?

### The Problem

Without a Plugin system, adding a new tool requires:
- Modifying the Sidebar
- Modifying the Router
- Modifying the Registry
- Risking breaking existing tools
- Every change touches Core

### The Solution

Plugin Architecture means:
1. **Each tool is a self-contained Plugin** — one directory, one manifest
2. **Zero Core modification** — Plugins auto-register via `definePlugin()`
3. **Independent lifecycle** — install, register, activate, deactivate, dispose
4. **Delete-safe** — removing a Plugin directory breaks nothing

### Benefits

| Benefit | Mechanism |
|---------|-----------|
| Scalable to 100+ tools | Flat directory structure, O(1) Registry lookup |
| No merge conflicts | Plugins never touch shared files |
| AI-safe | AI cannot break Core because it never touches Core |
| Long-term maintainable | Platform frozen, all innovation in Plugins |

---

## Why Framework Frozen?

### The Principle

> **Platform v1.0 is complete. All future development is Plugin development.**

The Core Framework (Registry, Services, SDK, Architecture) has reached stability. Changes to these layers risk:

- Breaking all existing Plugins
- Introducing subtle bugs across unrelated tools
- Forcing every Plugin to retest

See: [`../platform/platform-freeze-v1.md`](../platform/platform-freeze-v1.md) — Frozen Layers specification.

### Frozen Layers

| Layer | Status | Allowed Changes |
|-------|--------|-----------------|
| Core Framework | ❄ Frozen | Bug, Performance, Security, Compatibility |
| Feature SDK | ❄ Frozen | Bug, Performance, Security |
| Plugin SDK | ❄ Frozen | Bug, Performance, Security |
| Registry | ❄ Frozen | Bug, Performance |
| Architecture | ❄ Frozen | None (requires Platform v2) |
| Design System | ❄ Frozen | Token additions only |

---

## Layer Dependency Rules

### Direction: Top → Down (Unidirectional)

```
Application
    ↓  imports
Plugins         ← ONLY touchpoint for new code
    ↓  imports
Features        ← business logic lives here
    ↓  imports
Patterns        ← reusable page templates
    ↓  imports
Layouts         ← app-level layout
    ↓  imports
Components      ← UI component library
    ↓  imports
Core            ← Registry, Services, Event Bus
    ↓  imports
Foundation      ← Design Tokens, Types
```

### Concrete Rules

| Rule | Example |
|------|---------|
| ✅ Feature → Core | `import { services } from '@/core/services'` |
| ✅ Feature → Pattern | Use `<ToolPage>` template |
| ✅ Plugin → Feature | `import { XxxView } from '@/features/xxx'` |
| ❌ Feature → Feature | `import { useJwt } from '@/features/jwt'` in AES |
| ❌ Component → Feature | `import { useAes } from '@/features/aes'` in Button |
| ❌ Core → Feature | `import { AesView }` in registry.ts |

Full specification: [`../architecture/workspace-architecture-v1.md`](../architecture/workspace-architecture-v1.md) §6.

---

## Extension Points (The Only Places AI Should Touch)

### 1. `src/features/<name>/` — Business Logic

```
features/<name>/
├── <Name>Feature.ts    ← extends BaseFeature
├── logic.ts            ← pure functions (testable)
├── composables.ts      ← Vue composable
├── types.ts            ← Feature types
├── settings.ts         ← settings schema
├── <Name>View.vue      ← main view
├── index.ts            ← public API
└── __tests__/
    └── logic.test.ts   ← 5+ tests
```

### 2. `src/plugins/<name>.plugin.ts` — Plugin Manifest

```typescript
export default definePlugin({
  id: 'my-tool',
  name: 'My Tool',
  icon: '🔧',
  route: '/my-tool',
  // ... auto-registered
})
```

### 3. `docs/` — Documentation

Plugin README.md, CHANGELOG.md, internal docs.

**Nothing else.** No other directories should be modified for new features.

---

## How Plugins Work

```
definePlugin(config)
       │
       ▼  install()     → Feature SDK initialized
       ▼  register()    → Route added, Commands registered, Sidebar updated
       ▼  activate()    → User opens tool, Feature activated
       ▼  [ACTIVE]      → User interacts
       ▼  deactivate()  → User leaves tool
       ▼  dispose()     → Plugin unloaded
```

All automatic. Developer only writes `definePlugin({...})`.

Full specification: [`../sdk/plugin-sdk-v1.md`](../sdk/plugin-sdk-v1.md)

---

## Feature Lifecycle

Every Feature extends `BaseFeature` and implements 9 methods:

```
initialize() → activate() → [run() loop] → deactivate() → dispose()
```

`run()` must be a **pure function** — no side effects, directly testable.

Full specification: [`../sdk/feature-sdk-v1.md`](../sdk/feature-sdk-v1.md)

---

## AI Behavior Summary

| Action | Verdict |
|--------|---------|
| Create `src/features/<name>/` | ✅ Allowed |
| Create `src/plugins/<name>.plugin.ts` | ✅ Allowed |
| Modify `src/core/` | ❌ Forbidden |
| Modify `src/components/` | ❌ Forbidden (Design System frozen) |
| Modify `src/layouts/` | ❌ Forbidden |
| Modify `src/templates/` | ❌ Forbidden |
| Import from another Feature | ❌ Forbidden |
| Hardcode CSS values | ❌ Forbidden |
| Bypass Plugin Generator | ❌ Forbidden |

---

> **Next**: Read [`AI_PLUGIN_GUIDE.md`](./AI_PLUGIN_GUIDE.md) for step-by-step Plugin development.
