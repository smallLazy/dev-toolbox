# AI Development Rules v1.0

> **Status**: This file is now a consolidated index. Detailed AI guidance has moved to individual files in `docs/ai/`.
>
> **Rule**: Any AI Agent (Cursor / Claude Code / Codex) in this repo must read `AGENTS.md` first, then follow the reading path.

---

## Quick Reference

### Entry Point

**[`AGENTS.md`](../../AGENTS.md)** — Universal AI entry point. Start here.

### Claude Code Specific

**[`CLAUDE.md`](../../CLAUDE.md)** — Claude Code checklist + behavior rules.

### AI Documentation Index

| Document | Purpose |
|----------|---------|
| [`AI_OVERVIEW.md`](./AI_OVERVIEW.md) | Project introduction for AI |
| [`AI_ARCHITECTURE.md`](./AI_ARCHITECTURE.md) | Why Plugin Architecture, why Frozen |
| [`AI_PLUGIN_GUIDE.md`](./AI_PLUGIN_GUIDE.md) | How to create Plugins (step-by-step) |
| [`AI_UI_GUIDE.md`](./AI_UI_GUIDE.md) | How to follow Design System |
| [`AI_CODE_REVIEW.md`](./AI_CODE_REVIEW.md) | Code review checklist |
| [`AI_RELEASE.md`](./AI_RELEASE.md) | Release checklist |
| [`AI_CONTEXT_GRAPH.md`](./AI_CONTEXT_GRAPH.md) | AI reading order map |
| [`AI_PROMPT_CONVENTION.md`](./AI_PROMPT_CONVENTION.md) | Standardized prompt format |
| [`AI_DECISIONS.md`](./AI_DECISIONS.md) | Architecture Decision Records |

### Primary SSOT References

| Domain | Document |
|--------|----------|
| Platform Freeze | [`../platform/platform-freeze-v1.md`](../platform/platform-freeze-v1.md) |
| Architecture | [`../architecture/workspace-architecture-v1.md`](../architecture/workspace-architecture-v1.md) |
| Design System | [`../design/design-system-v2.md`](../design/design-system-v2.md) |
| Feature SDK | [`../sdk/feature-sdk-v1.md`](../sdk/feature-sdk-v1.md) |
| Plugin SDK | [`../sdk/plugin-sdk-v1.md`](../sdk/plugin-sdk-v1.md) |
| Plugin Generator | [`../plugin/plugin-generator.md`](../plugin/plugin-generator.md) |
| Definition of Done | [`../product/plugin-definition-of-done-v1.md`](../product/plugin-definition-of-done-v1.md) |
| Icon Guidelines | [`../design/icon-guidelines-v1.md`](../design/icon-guidelines-v1.md) |

---

## Core Rules (Summary)

### Prohibited
```
❌ Direct Core import       → use FeatureContext / PluginContext
❌ Direct Registry access   → use SDK abstractions
❌ Direct Service access    → use this.context
❌ Hardcoded colors         → use var(--color-*)
❌ Hardcoded spacing        → use var(--space-*)
❌ Hardcoded font sizes     → use var(--text-*)
❌ Hardcoded animations     → use var(--duration-*) var(--ease-*)
❌ Emoji icons              → use @/design/icons
❌ Custom layout            → use PluginWorkspace template
❌ Cross-Feature import     → Feature A never imports Feature B
❌ Hand-write plugin dir    → use npm run create-plugin
```

### Required
```
✅ AGENTS.md first          → always read the entry point
✅ Generator First          → npm run create-plugin <name>
✅ BaseFeature inheritance  → every Feature extends BaseFeature
✅ definePlugin()           → every Plugin uses definePlugin()
✅ Design Tokens            → all visual properties
✅ SVG Icons                → from @/design/icons
✅ Card+Section layout      → consistent structure
✅ logic.ts pure functions  → zero side effects, directly testable
✅ 5+ unit tests            → vitest
✅ Search keywords          → 8+ keywords (CN + EN)
✅ npm run validate         → before every commit
```

---

## Developer Quick Start

```bash
# Create a Plugin (always use Generator)
npm run create-plugin <name> -- --template=<type>

# Implement logic.ts (pure functions)
# Write 5+ unit tests
# Run full validation
npm run validate

# Launch dev
npm run tauri dev
```

---

> **版本**: v1.1 — reorganized into `docs/ai/` directory (2026-07-30)
> **维护**: This file is an index. Detailed rules live in the referenced documents above.
