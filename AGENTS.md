# AGENTS.md — Dev Toolbox

> **Purpose**: Universal AI entry point. Any AI Agent (Claude Code, Cursor, Codex, Copilot, Gemini CLI) reads this first.
>
> **Rule**: Read this entire file before touching any code. Then follow the reading path.

---

## 1. Project Overview

**Dev Toolbox** — a desktop developer toolkit built on **Tauri 2 + Vue 3 + TypeScript + Rust**. Provides crypto, encoding, formatting, conversion, and inspection tools through a Plugin Architecture.

- **Platform**: v1.0 ❄ Frozen — Core, SDK, Registry, Architecture are locked
- **Extension**: Plugin Only — all new features are Plugins
- **Design**: Design System v2.0 ❄ Frozen — Design Tokens for all visual properties
- **Quality**: CI-enforced Architecture + Design + Plugin validation on every PR

---

## 2. Architecture Overview

### Plugin Architecture (8 Layers, Unidirectional)

```
Application → Plugins → Features → Patterns → Layouts → Components → Core → Foundation
```

**Upper layers depend on lower layers. Never reverse. Never cross-import within a layer.**

### Frozen Layers

| Layer | Status | Allowed Changes |
|-------|--------|-----------------|
| Core Framework | ❄ Frozen | Bug, Performance, Security, Compatibility |
| Feature SDK | ❄ Frozen | Bug, Performance, Security |
| Plugin SDK | ❄ Frozen | Bug, Performance, Security |
| Registry | ❄ Frozen | Bug, Performance |
| Architecture | ❄ Frozen | None (Platform v2 only) |
| Design System | ❄ Frozen | Token additions only |

### Dependency Rules

```
✅ Feature → Core (via FeatureContext)
✅ Feature → Patterns (use ToolPage template)
✅ Plugin → Feature (import component)

❌ Feature → Feature (zero cross-Feature imports)
❌ Component → Feature (components are generic)
❌ Core → Feature (Core doesn't know about Features)
❌ Direct Registry access (use definePlugin auto-registration)
❌ Direct Service access (use this.context)
```

---

## 3. Development Principles

### Feature First
Every tool is a Feature in `src/features/<name>/`. Features are self-contained, independently deletable, and share zero code.

### Plugin Only
All new capabilities are Plugins registered via `definePlugin()`. The Core never changes for new features.

### Generator First
**Never hand-write plugin directories.** Always use:
```bash
npm run create-plugin <name> -- --template=<type>
```

### Design System
All visual properties must use Design Tokens (`var(--*)`). Zero hardcoded hex, px, or font values. All icons from `@/design/icons`.

### Definition of Done
Every Plugin must pass the DoD checklist before merge. See `docs/product/plugin-definition-of-done-v1.md`.

---

## 4. Required Reading

Read these in order. Do NOT copy — these are the Single Source of Truth:

| # | Document | What It Covers |
|---|----------|---------------|
| 1 | `docs/ai/AI_OVERVIEW.md` | Project introduction for AI |
| 2 | `docs/platform/platform-freeze-v1.md` | What's frozen and why |
| 3 | `docs/ai/AI_ARCHITECTURE.md` | Plugin Architecture explained |
| 4 | `docs/architecture/workspace-architecture-v1.md` | Full Architecture SSOT |
| 5 | `docs/design/design-system-v2.md` | Design System SSOT (Tokens, Components, Patterns) |
| 6 | `docs/design/ui-guidelines-v1.md` | Page Layout, Sidebar, Card structure |
| 7 | `docs/design/icon-guidelines-v1.md` | Icon System rules |
| 8 | `docs/design/interaction-guidelines-v1.md` | Motion, States, Transitions |
| 9 | `docs/sdk/feature-sdk-v1.md` | BaseFeature, FeatureContext API |
| 10 | `docs/sdk/plugin-sdk-v1.md` | definePlugin, PluginContext API |
| 11 | `docs/plugin/plugin-generator.md` | Plugin Generator usage |
| 12 | `docs/ai/AI_PLUGIN_GUIDE.md` | Step-by-step Plugin creation |
| 13 | `docs/product/plugin-definition-of-done-v1.md` | DoD Checklist |
| 14 | `docs/ai/AI_CODE_REVIEW.md` | Code Review Checklist |
| 15 | `docs/ai/AI_RELEASE.md` | Release Checklist |

**Reading order map**: `docs/ai/AI_CONTEXT_GRAPH.md`

**Architecture decisions (why)**: `docs/ai/AI_DECISIONS.md`

---

## 5. Development Workflow

```
Generator (create-plugin)
    ↓
Logic (implement logic.ts — pure functions)
    ↓
Tests (write 5+ unit tests for logic.ts)
    ↓
Review (AI_CODE_REVIEW.md checklist)
    ↓
Validate (npm run validate)
    ↓
Release (AI_RELEASE.md checklist)
```

---

## 6. Commands

```bash
# Development
npm run tauri dev              # Start dev server + Tauri window

# Testing
npm test                       # Run all unit tests (vitest)
npx vitest run src/features/<name>/  # Run tests for one Plugin

# Validation (run before every commit)
npm run validate               # Full CI quality gate (all checks)
npx vue-tsc --noEmit           # TypeScript type check
npx tsx scripts/ci/validate-architecture.ts  # Architecture compliance
npx tsx scripts/ci/validate-design.ts        # Design Token compliance
npx tsx scripts/ci/validate-ai.ts            # AI Governance compliance

# Plugin Creation
npm run create-plugin <name>   # Create a new Plugin (Generator)

# Build
npm run build                  # Production build
npm run tauri build            # Tauri production build (desktop app)
```

---

## 7. AI Behavior Rules

### ✅ Allowed (and how)

| Action | Method |
|--------|--------|
| Create a Plugin | `npm run create-plugin <name>` |
| Implement logic.ts | Pure functions in `src/features/<name>/logic.ts` |
| Write tests | `vitest` in `src/features/<name>/__tests__/` |
| Write documentation | Plugin README.md, CHANGELOG.md |
| Fix CI | Modify `.github/workflows/` |
| Add Design Token | Only when justified (new brand color) |

### ❌ Forbidden (never do)

| Action | Why |
|--------|-----|
| Modify Core Framework (`src/core/`) | Frozen — `docs/platform/platform-freeze-v1.md` |
| Modify SDK (`src/sdk/`) | Frozen — API stability guaranteed |
| Modify Registry logic | Frozen — registration logic locked |
| Modify Architecture (layer structure) | Frozen — Platform v2 only |
| Modify Design System components | Frozen — Token additions only |
| Bypass Plugin Generator | Manual creation violates rules |
| Import from another Feature | Features must be independently deletable |
| Hardcode colors (`#XXXXXX`) | Use `var(--color-*)` |
| Hardcode spacing (`16px`) | Use `var(--space-*)` |
| Hardcode fonts (`13px`) | Use `var(--text-*)` |
| Use emoji icons | Use `@/design/icons` |
| Direct lucide imports | Use `@/design/icons` |
| Add routes manually | `definePlugin()` handles routing |

### Core Principle

> **If it's not a Plugin, test, or documentation — don't touch it.**

---

## 8. Quick Start for AI Agents

```bash
# 1. Read this file (you just did)
# 2. Read docs/ai/AI_OVERVIEW.md
# 3. Understand the task
# 4. If creating a Plugin:
npm run create-plugin <name> -- --template=<type>
# 5. Implement logic.ts
# 6. Write tests
# 7. Run:
npm run validate
```

---

## 9. File Map

```
AGENTS.md                       ← You are here (AI entry point)
CLAUDE.md                       ← Claude Code specific instructions
docs/ai/                        ← AI-oriented documentation
  ├── AI_OVERVIEW.md            ← Project introduction
  ├── AI_ARCHITECTURE.md        ← Architecture for AI
  ├── AI_PLUGIN_GUIDE.md        ← Plugin development guide
  ├── AI_UI_GUIDE.md            ← UI/Design guide
  ├── AI_CODE_REVIEW.md         ← Review checklist
  ├── AI_RELEASE.md             ← Release checklist
  ├── AI_CONTEXT_GRAPH.md       ← Reading order map
  ├── AI_PROMPT_CONVENTION.md   ← Prompt format standard
  └── AI_DECISIONS.md           ← Architecture decisions
docs/
  ├── platform/                 ← Platform freeze spec
  ├── architecture/             ← Architecture SSOT
  ├── design/                   ← Design SSOT
  ├── sdk/                      ← SDK SSOT
  ├── product/                  ← DoD SSOT
  ├── plugin/                   ← Generator docs
  └── release/                  ← Release engineering
scripts/ci/
  ├── validate-architecture.ts  ← CI: Architecture check
  ├── validate-design.ts        ← CI: Design Token check
  └── validate-ai.ts            ← CI: AI Governance check
```

---

> **Next**: Read `docs/ai/AI_OVERVIEW.md` for a project introduction, then follow the Context Graph at `docs/ai/AI_CONTEXT_GRAPH.md`.
>
> **Questions about decisions?** See `docs/ai/AI_DECISIONS.md` before proposing changes.
