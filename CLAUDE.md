# CLAUDE.md — Dev Toolbox

> **Purpose**: Claude Code specific instructions. Read by Claude before every coding session.
>
> **Universal entry point**: `AGENTS.md` — read by all AI Agents, including Claude.

---

## Before Writing Any Code

### 1. Read Required Documents

Claude must read these before coding (in order):

```
[ ] AGENTS.md                              ← Universal AI rules
[ ] docs/ai/AI_OVERVIEW.md                 ← Project introduction
[ ] docs/ai/AI_ARCHITECTURE.md             ← Why Plugin Architecture
[ ] docs/platform/platform-freeze-v1.md    ← What's frozen
[ ] docs/ai/AI_PLUGIN_GUIDE.md             ← How to create Plugins
[ ] docs/ai/AI_UI_GUIDE.md                 ← Design System compliance
```

For full context: `docs/ai/AI_CONTEXT_GRAPH.md`

### 2. Run These Commands

Before making changes, understand the current state:

```bash
npm test                    # Are existing tests passing?
npx vue-tsc --noEmit        # Does TypeScript compile?
```

### 3. Follow These Rules

#### The Prime Directive

> **If it's not a Plugin, test, or documentation — don't touch it.**

#### Never Modify

```
❌ src/core/           ← Core Framework (Frozen)
❌ src/sdk/            ← Feature SDK + Plugin SDK (Frozen)
❌ src/components/     ← Design System components (Frozen)
❌ src/layouts/        ← App layouts (Frozen)
❌ src/patterns/       ← Page patterns (Frozen)
❌ src/router/         ← Router setup (auto-managed by Plugin system)
❌ src/app/            ← App lifecycle (Frozen)
```

#### Never Do

```
❌ Hardcode any color (#XXXXXX)
❌ Hardcode any spacing (16px, 20px, etc.)
❌ Hardcode any font size (13px, 14px, etc.)
❌ Use emoji in templates
❌ Import from lucide-vue-next directly
❌ Import from another Feature
❌ Access Registry directly
❌ Access Services directly
❌ Hand-write plugin directories (use Generator)
❌ Add manual route registrations
```

#### Always Do

```
✅ Use Plugin Generator: npm run create-plugin <name>
✅ Use Design Tokens: var(--color-*), var(--space-*), var(--text-*)
✅ Use Icons from: @/design/icons
✅ Use definePlugin() for Plugin registration
✅ Use BaseFeature for Feature classes
✅ Use FeatureContext for platform capabilities
✅ Use Card+Section layout for Plugin pages
✅ Write pure functions in logic.ts
✅ Write 5+ unit tests per Plugin
✅ Run npm run validate before committing
```

---

## Claude Checklist

### Before Starting Work

```
[ ] Read AGENTS.md
[ ] Read docs/ai/AI_OVERVIEW.md
[ ] Confirm the task is: Plugin creation / testing / documentation
[ ] If creating a Plugin: identify the correct template type
[ ] Run npm test to verify baseline
```

### During Implementation

```
[ ] Used Plugin Generator (not manual creation)
[ ] logic.ts is pure functions (no side effects, no service calls)
[ ] All colors from var(--*-*) tokens
[ ] All spacing from var(--space-*)
[ ] All fonts from var(--text-*)
[ ] All icons from @/design/icons
[ ] No cross-Feature imports
[ ] No Core/SDK/Registry modifications
[ ] Card+Section layout used
[ ] All states covered: idle, loading, success, error, empty
```

### Before Committing

```
[ ] npx vue-tsc --noEmit passes
[ ] npm test passes (all tests, not just new ones)
[ ] npm run validate passes (all CI checks)
[ ] No hardcoded hex values (grep for # in diff)
[ ] No hardcoded px values (grep for px in diff)
[ ] No emoji in templates (grep for emoji in diff)
[ ] Plugin README.md and CHANGELOG.md exist
[ ] Search keywords registered (8+, CN + EN)
```

---

## Quick Commands Reference

```bash
# Create a Plugin
npm run create-plugin <name> -- --template=<type>

# Type check
npx vue-tsc --noEmit

# Run tests
npm test
npx vitest run src/features/<name>/

# Full validation
npm run validate

# Individual validations
npx tsx scripts/ci/validate-architecture.ts
npx tsx scripts/ci/validate-design.ts
npx tsx scripts/ci/validate-ai.ts

# Development
npm run tauri dev

# Build
npm run build
npm run tauri build
```

---

## When Uncertain

1. Check `docs/ai/AI_DECISIONS.md` — the decision may already be documented
2. Check `docs/ai/AI_CODE_REVIEW.md` — the constraint may be listed
3. Check the SSOT document for the relevant domain (Architecture, Design, SDK, DoD)
4. If still uncertain: ask. Do not guess. Guessing produces violations.

---

> **Remember**: You are one of many AI Agents that will enter this repo. Leave it cleaner than you found it. Follow the rules so the next AI doesn't have to clean up after you.
