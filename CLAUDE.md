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
[ ] docs/design/ui-copy-guidelines.md      ← UI Copy Language Consistency
[ ] docs/development/tool-development-guidelines.md  ← Tool dev workflow & completion report
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
❌ src/templates/      ← Page templates (Frozen)
❌ src/router/         ← Router setup (auto-managed by Plugin system)
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
✅ Formatter tools use JSON Formatter as the reference layout unless explicitly justified
✅ Mode controls must follow the shared layout rule: single Mode controls use full width, Mode+Variant controls use two columns; action labels must use Title Case and shared labels such as Run Encode, Copy Output, and Swap I/O
✅ Copy Output and Swap I/O are output-dependent actions: hide them when there is no output, and hide Swap I/O when the current mode output is not suitable as input (e.g., Validate mode)
```

### UI Copy Language Consistency

> **Reference**: `docs/design/ui-copy-guidelines.md` — full spec with Good/Bad examples.

#### Default: English UI

Dev Toolbox is a developer-facing tool. **All user-visible copy defaults to English.**

```
✅ Plugin name:         PHP Codec, JSON Formatter, HTTP Client
✅ Page title:          PHP Codec
✅ Sidebar label:       PHP Codec
✅ Mode labels:         Encode / Decode
✅ Buttons:             Encode, Decode, Clear, Swap, Copy
✅ Input labels:        Input, Output
✅ Placeholders:        Enter text to encode...
✅ Help text / notes:   Note: This is not encryption.
✅ Error messages:      Invalid Base64 input
✅ Empty states:        No tools found
✅ Toast messages:      Copied to clipboard
```

#### Technical Terms Stay English

```
URL Encode, Base64, JSON, JWT, AES, Hash, Unicode, Regex,
Markdown, SQL, Timestamp, UUID, XML, YAML, HTML, HTTP
```

#### Never Mix Languages on One Page

> **One page, one language.** If a page is English, every visible string is English.
> If a page is explicitly Chinese, every visible string is Chinese.

```
❌ English title + Chinese buttons:   PHP Codec [编码] [解码]
❌ Chinese title + English buttons:   PHP 兼容编码 [Encode] [Decode]
❌ English labels + Chinese help:     Input: ___  注意：不是加密
```

#### Chinese Allowed Only When

1. Chinese-specific tool (e.g., Pinyin converter)
2. Chinese-named service integration (e.g., WeCom, Zentao)
3. Explicit product requirement (documented in Plugin README)

When Chinese is chosen, **the entire page must be Chinese** — no mixing.
Technical terms (Section 5 of the guidelines) remain English even on Chinese pages.

#### Never Do (UI Copy)

```
❌ Chinese plugin name for a general developer tool
❌ Mixed CN/EN labels on the same page
❌ Chinese buttons with English title (or vice versa)
❌ Chinese placeholder with English input label
❌ English error messages with Chinese help text
❌ Translated technical terms (e.g., "Base64 编码" as a tool name)
```

#### Always Do (UI Copy)

```
✅ English plugin name for all general developer tools
✅ Consistent language across the entire page
✅ Title Case for tool names (PHP Codec, JSON Formatter)
✅ Standard technical term spelling (URL Encode, not Url Encode)
✅ Both CN + EN search keywords for discoverability
✅ Test assertions match the chosen UI language
```

---

## Tool Development Rules

> **Reference**: `docs/development/tool-development-guidelines.md` — full spec with workflow, DoD, and mandatory completion report template.

When developing any Dev Toolbox tool, always follow the standard workflow:

```
1. Pure Logic First     → Implement util/service/logic functions
2. Unit Tests           → Write tests before connecting UI
3. UI Integration       → Connect UI only after logic tests pass
4. Component Tests      → Add interaction tests for critical paths
5. Manual Smoke Test    → Visual and UX validation
```

### Before Implementing a New Tool

```
[ ] Read docs/development/tool-development-guidelines.md
[ ] Output an implementation plan (files to create/modify)
[ ] Prefer minimal changes — do not over-engineer
```

### During Implementation

```
[ ] Implement pure util/service/logic functions first (Step 1)
[ ] Add unit tests before UI integration (Step 2)
[ ] Integrate UI only after logic tests pass (Step 3)
[ ] Add component interaction tests for critical paths (Step 4)
[ ] Interactive UI actions require wiring-level or component-level tests; pure unit tests alone are not enough
[ ] Run all quality gates: vue-tsc, npm test, validate:arch, validate:design, validate:plugins
[ ] Report manual smoke test items separately (Step 5)
[ ] Manual smoke tests must include steps, expected results, actual results, and status before a tool can be marked Ready
[ ] Tools in the same category must match the layout pattern of an existing reference tool; configuration controls, action placement, output sections, spacing, and visual grouping must stay consistent unless a difference is explicitly justified
[ ] Sidebar label: short scannable name; Page Title: full capability name; plugin id/route/feature id: stable; keywords: cover both short and full names (Section 3b)
```

### After Completion

```
[ ] Output the Tool Completion Report (mandatory template)
[ ] If DoD not met, Status must be "Not Ready" with explanation
[ ] Pre-existing issues listed in Known Issues — not silently fixed
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
[ ] UI copy: English by default (see docs/design/ui-copy-guidelines.md)
[ ] UI copy: No mixed CN/EN on the same page
[ ] Plugin name in English (Title Case) unless Chinese tool with justification
```

### Before Committing

```
[ ] npx vue-tsc --noEmit passes
[ ] npm test passes (all tests, not just new ones)
[ ] npm run validate passes (all CI checks)
[ ] No hardcoded hex values (grep for # in diff)
[ ] No hardcoded px values (grep for px in diff)
[ ] No emoji in templates (grep for emoji in diff)
[ ] No mixed CN/EN UI copy (see docs/design/ui-copy-guidelines.md)
[ ] Plugin README.md and CHANGELOG.md exist
[ ] Search keywords registered (8+, CN + EN)
[ ] Tool Completion Report filled (docs/development/tool-development-guidelines.md §8)
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
