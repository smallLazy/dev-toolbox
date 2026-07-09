---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# AI Overview — Dev Toolbox

> **Purpose**: First document for any AI Agent entering this repository. Read this before touching any code.

---

## What Is This Project?

**Dev Toolbox** — a desktop developer toolkit built on **Tauri 2 + Vue 3 + TypeScript + Rust**, providing crypto, encoding, formatting, conversion, and inspection tools through a plugin architecture.

- **Platform**: macOS (primary), Windows/Linux (target)
- **Version**: v1.0 (Platform Frozen)
- **License**: MIT

---

## Key Facts (Read First)

| Fact | Detail |
|------|--------|
| **Architecture** | Layered Plugin Architecture (8 layers, unidirectional dependency) |
| **Platform Status** | ❄ Frozen — Core Framework, SDK, Registry, Architecture locked |
| **Extension Model** | Plugin Only — all new features are Plugins, zero Core modifications |
| **Design System** | ❄ Frozen — Design Tokens, Components, Patterns locked |
| **Creation Method** | Generator First — `npm run create-plugin` produces 100% compliant code |
| **Quality Gate** | CI enforces Architecture, Design, Plugin validation on every PR |

---

## Quick Architecture Summary

```
Application → Plugins → Features → Patterns → Layouts → Components → Core → Foundation
```

- **Foundation**: Design Tokens, Types, i18n (no dependencies)
- **Core**: Registry, Services, Event Bus (depends on Foundation)
- **Components**: UI component library (depends on Foundation)
- **Layouts**: App-level layouts (depends on Components)
- **Patterns**: Reusable page templates (depends on Layouts + Components)
- **Features**: Business logic — pure functions + Vue composables (depends on Core + Patterns)
- **Plugins**: Declarative manifests via `definePlugin()` (depends on Features + Core)
- **Application**: Entry point, lifecycle (depends on Plugins)

**One rule**: Upper layers depend on lower layers. Never reverse.

---

## What You Can Do

| Allowed | How |
|---------|-----|
| ✅ Create a Plugin | `npm run create-plugin <name>` |
| ✅ Write logic.ts | Pure functions in `src/features/<name>/logic.ts` |
| ✅ Write tests | `vitest` in `src/features/<name>/__tests__/` |
| ✅ Write docs | Plugin README.md, CHANGELOG.md |
| ✅ Fix CI | `.github/workflows/` modifications |
| ✅ Add Design Token | Only when justified (new brand color) |

## What You Must Never Do

| Forbidden | Because |
|-----------|---------|
| ❌ Modify Core Framework | Frozen — see `docs/platform/platform-freeze-v1.md` |
| ❌ Modify SDK (Feature/Plugin) | Frozen — API stability guaranteed |
| ❌ Modify Registry | Frozen — registration logic locked |
| ❌ Modify Architecture | Frozen — layer structure locked |
| ❌ Bypass Plugin Generator | Manual plugin creation is not allowed |
| ❌ Cross-Feature imports | Features must be independently deletable |
| ❌ Hardcode colors/spacing/fonts | Must use Design Tokens from `var(--*)` |

---

## Reading Path

Start here, then follow the Context Graph:

```
AGENTS.md → AI_OVERVIEW (this file) → Platform Freeze → Architecture → Design System → Plugin Guide → Definition of Done
```

Detailed reading order: [`AI_CONTEXT_GRAPH.md`](./AI_CONTEXT_GRAPH.md)

---

## Quick Reference

| Need to... | Read |
|------------|------|
| Understand the project | This file |
| Know what's frozen | [`../platform/platform-freeze-v1.md`](../platform/platform-freeze-v1.md) |
| Understand architecture | [`AI_ARCHITECTURE.md`](./AI_ARCHITECTURE.md) |
| Create a plugin | [`AI_PLUGIN_GUIDE.md`](./AI_PLUGIN_GUIDE.md) |
| Follow Design System | [`AI_UI_GUIDE.md`](./AI_UI_GUIDE.md) |
| Review code | [`AI_CODE_REVIEW.md`](./AI_CODE_REVIEW.md) |
| Release | [`AI_RELEASE.md`](./AI_RELEASE.md) |
| Understand decisions | [`AI_DECISIONS.md`](./AI_DECISIONS.md) |
| Format prompts | [`AI_PROMPT_CONVENTION.md`](./AI_PROMPT_CONVENTION.md) |

---

> **Next**: Read [`AI_ARCHITECTURE.md`](./AI_ARCHITECTURE.md) to understand why the platform is frozen and how the Plugin system works.
