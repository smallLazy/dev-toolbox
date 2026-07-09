---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# AI Prompt Convention

> **Purpose**: Standardize all AI prompts in this project. Consistent format → consistent results.
>
> **Applies to**: Claude Code, Cursor, Codex, GitHub Copilot, Gemini CLI — any AI Agent.

---

## Standard Prompt Format

Every prompt in this project should follow this structure:

```markdown
## Background
[Context the AI needs — project state, relevant history, what's already done]

## Goal
[One sentence: what should be achieved]

## Constraints
[RULES the AI must follow — what NOT to do, what boundaries exist]

## Tasks
[Numbered, specific, actionable steps]

## Acceptance
[How to verify the work is correct]

## Output
[What the AI should produce: files, code, report, etc.]
```

---

## Sections Explained

### Background

Give the AI enough context to understand WHY this task exists.

```markdown
✅ Good:
## Background
The project's Plugin Architecture is frozen. All new features must be Plugins.
We need a Timestamp-to-Relative-Time converter tool.
The Design System v2 defines all visual tokens.

❌ Bad:
## Background
Add a new tool.
```

### Goal

One sentence. Specific outcome.

```markdown
✅ Good:
## Goal
Create a Timestamp Converter Plugin using the transform template.

❌ Bad:
## Goal
Make the app better.
```

### Constraints

This is the most important section. List what the AI MUST NOT do.

```markdown
## Constraints
- ❌ Do NOT modify Core Framework (frozen)
- ❌ Do NOT modify SDK (frozen)
- ❌ Do NOT hardcode colors — use Design Tokens only
- ❌ Do NOT create the plugin directory manually — use Generator
- ✅ Must use definePlugin()
- ✅ Must pass all CI validations
```

### Tasks

Numbered, specific, actionable. Each task should be verifiable.

```markdown
## Tasks
1. Run `npm run create-plugin timestamp-relative -- --template=converter`
2. Implement logic.ts with conversion functions
3. Write 5+ unit tests in __tests__/logic.test.ts
4. Verify with `npm test`
5. Run full validation: `npm run validate`
```

### Acceptance

Define EXACTLY what "done" looks like.

```markdown
## Acceptance
- [ ] Plugin appears in Sidebar
- [ ] Tool converts timestamp → relative time correctly
- [ ] All 5+ tests pass
- [ ] CI quality gate passes
- [ ] Zero hardcoded colors/spacing
```

### Output

Tell the AI what to produce.

```markdown
## Output
- Modified files list
- New files created
- Test results summary
```

---

## Example: Complete Prompt

Here's a complete prompt following the convention:

```markdown
## Background
Dev Toolbox is a Tauri 2 + Vue 3 desktop developer toolkit.
Platform v1.0 is frozen — all new features are Plugins.
Design System v2.0 defines all visual tokens and components.
Architecture: Plugin → Feature → Core (unidirectional).

## Goal
Create a "Color Converter" Plugin that converts between HEX, RGB, and HSL formats.

## Constraints
- Platform frozen — Core/SDK/Registry cannot be modified
- Design System frozen — use Design Tokens only
- Generator First — use `npm run create-plugin`, not manual creation
- Feature isolation — no imports from other Features
- All colors/spacing from CSS variables (var(--*))

## Tasks
1. Generate plugin scaffold: `npm run create-plugin color-converter -- --template=converter`
2. Implement conversion logic in logic.ts (HEX↔RGB↔HSL, pure functions)
3. Implement validation in logic.ts (validate HEX, RGB, HSL formats)
4. Write 8+ unit tests covering all conversions and edge cases
5. Verify TypeScript compiles: `npx vue-tsc --noEmit`
6. Run tests: `npx vitest run src/features/color-converter/`
7. Run full validation: `npm run validate`

## Acceptance
- [ ] Conversions accurate (HEX↔RGB↔HSL)
- [ ] Invalid inputs rejected with clear error messages
- [ ] All CI checks pass
- [ ] Plugin appears in Sidebar and Command Palette
- [ ] Keyboard shortcut (⌘Enter) works
- [ ] Empty/Loading/Error/Success states covered

## Output
- New files in src/features/color-converter/
- New file src/plugins/color-converter.plugin.ts
- Test results
```

---

## Anti-Patterns: What to Avoid

### Vague Prompts
```
❌ "Add a new tool"
❌ "Fix the bug"
❌ "Improve the UI"
```

### Missing Constraints
```
❌ Prompts without "do not modify Core" → AI may touch frozen layers
❌ Prompts without Design Token rules → AI may hardcode colors
```

### Mixed Concerns
```
❌ "Create a plugin and also refactor the Sidebar and also update the Router"
   → Split into separate prompts. One concern per prompt.
```

### No Acceptance Criteria
```
❌ Prompts without verification steps → unclear when "done"
```

---

## Prompt Templates

### New Plugin Template

```markdown
## Background
[Why this plugin is needed]

## Goal
Create a [Name] Plugin using the [template-type] template.

## Constraints
- Platform frozen (Core/SDK/Registry)
- Design System frozen (Design Tokens only)
- Generator First (no manual creation)
- Feature isolation (no cross-Feature imports)

## Tasks
1. Generate: `npm run create-plugin <name> -- --template=<type>`
2. Implement logic.ts (pure functions)
3. Write 5+ unit tests
4. Run `npm run validate`

## Acceptance
- [ ] Plugin functional
- [ ] All CI checks pass

## Output
- File list + test results
```

### Bug Fix Template

```markdown
## Background
[Bug description, reproduction steps, affected files]

## Goal
Fix [bug summary].

## Constraints
- Do not modify frozen layers
- Do not change API signatures
- Maintain backward compatibility

## Tasks
1. [Diagnosis step]
2. [Fix step]
3. [Verification step]

## Acceptance
- [ ] Bug no longer reproducible
- [ ] Existing tests still pass
- [ ] No new lint/type errors

## Output
- Changed files + test results
```

### Review Template

```markdown
## Background
[What was changed, why]

## Goal
Review [PR/branch] for compliance.

## Constraints
- Review against AI_CODE_REVIEW.md checklist
- Review against plugin-definition-of-done-v1.md

## Tasks
1. Architecture check
2. Design check
3. Accessibility check
4. Performance check
5. Testing check
6. Documentation check

## Acceptance
- [ ] All checklist categories reviewed
- [ ] Violations documented

## Output
- Review findings with file:line references
```

---

> **Enforcement**: All prompts in this project should follow this convention. Inconsistent prompts produce inconsistent AI behavior.
