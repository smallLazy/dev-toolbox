# Tool Development Guidelines v1.0

> **Rule**: Every Dev Toolbox tool must follow the standard development workflow defined in this document. After completion, every tool must produce a **Tool Completion Report** using the mandatory template in Section 8.

---

## 1. Scope & Applicability

These guidelines apply to **all tool development** within Dev Toolbox, including but not limited to:

| Category | Examples |
|----------|----------|
| **Encoding** | Base64, URL Encode, HTML Encode, Unicode |
| **Formatter** | JSON, XML, YAML, SQL |
| **Crypto** | Hash, AES, RSA |
| **Converter** | Color, Timestamp, Unit Converter |
| **Any future tool** | All new tools added to Dev Toolbox |

Regardless of category, every tool must follow the same ordered workflow and meet the same Definition of Done.

---

## 2. Standard Development Workflow

> **Rule**: Tools must be developed in the following order. Do not skip steps or reorder.

### Step 1 — Pure Logic First

Implement pure logic functions in `util` / `service` / `logic` layer **before** any UI work.

**Requirements:**

- Must NOT depend on Vue components
- Must NOT depend on DOM
- Must NOT depend on browser UI state
- Input and output must be explicitly typed
- Must be independently testable
- Must NOT embed business logic directly in UI components
- Error handling must return structured results or define clear exception boundaries — never throw raw exceptions to the UI layer

**Examples of well-structured pure functions:**

```typescript
// ✅ Correct: pure function with clear signature
function base64Encode(input: string): string

// ✅ Correct: structured result with error discrimination
function base64Decode(input: string): Result<string, ToolError>

// ✅ Correct: discriminated union for safe operations
function tryDecode(input: string): TryDecodeResult

// ❌ Wrong: throwing raw errors to UI
function decode(input: string): string {
  if (!input) throw new Error('empty')  // UI must catch this
}

// ❌ Wrong: depending on Vue reactivity
function encode(input: Ref<string>): string
```

**Error handling pattern:**

Prefer discriminated unions over throwing. If the project does not have a `Result<T, E>` or `ToolError` type, use the minimal pattern already established in the codebase (e.g., `Base64Feature`'s `TryDecodeResult`). Do not introduce new type abstractions unless they align with existing patterns.

```typescript
// Minimal discriminated union (already used in Base64 logic.ts)
type TryDecodeResult =
  | { success: true; value: string }
  | { success: false; error: string }
```

### Step 2 — Unit Tests Before UI

Write unit tests for all pure logic functions **before** connecting them to UI.

**Minimum coverage requirements:**

| Scenario | Required |
|----------|----------|
| Normal / happy-path input | ✅ |
| Empty input | ✅ |
| Chinese characters (CJK) | ✅ |
| Emoji | ✅ |
| Special characters | ✅ |
| Invalid / malformed input | ✅ |
| Error result validation | ✅ |
| Edge cases (max length, boundary values) | ✅ |

**Requirements:**

- Must use code assertions — manual verification alone is insufficient
- Must not rely on AI ad-hoc inspection
- Every testable behavior must have a corresponding test case
- Tests must be included in `npm test` and CI
- Must NOT weaken validation just to make tests pass
- Must NOT delete existing tests to bypass failures

```bash
# Run tests for the tool being developed
npx vitest run src/features/<tool-name>/

# Run all tests to ensure no regressions
npm test
```

### Step 3 — UI Integration After Logic Is Stable

Connect UI **only after** pure logic is implemented and unit tests pass.

**Requirements:**

- Reuse the existing unified tool layout (`ToolPage`, `PluginWorkspace`, `Card+Section`)
- Must NOT break existing Design Tokens
- Must NOT use hardcoded colors, spacing, or emoji icons
- UI components must only handle: state management, event binding, and rendering
- All tool logic must be called through `util` / `service` / `logic` modules
- Error messages must be user-friendly — never use `alert()`
- States must be clearly distinguishable: **idle**, **loading**, **success**, **error**, **empty**
- Common interactions (`Copy`, `Clear`, `Run`) must remain consistent with existing tools

### Step 4 — Component Interaction Tests

After UI integration, add component interaction tests covering critical paths.

**Minimum coverage requirements:**

| Interaction | Required |
|-------------|----------|
| Default/initial state | ✅ |
| Input content typing | ✅ |
| Primary action button (Run / Convert / Format) | ✅ |
| Mode switch (if the tool has modes, e.g., Encode ↔ Decode) | ✅ / N/A |
| Clear action | ✅ |
| Output result display | ✅ |
| Error message display | ✅ |
| Copy button | ✅ |
| Keyboard shortcut (if supported) | ✅ / N/A |
| Invalid input does not crash the page | ✅ |

**Requirements:**

- `navigator.clipboard.writeText` may be mocked for Copy tests
- Only cover critical interaction paths — avoid over-testing visual details
- Must NOT depend on real network requests
- Must NOT depend on real system clipboard
- Must NOT depend on real system clock (unless explicitly mocked)

### Step 5 — Manual Smoke Test

After all automated tests pass, a structured manual smoke test must be prepared and executed.

**AI responsibility (before handoff):**

AI must produce a set of manual smoke test cases as part of the Tool Completion Report. Each case must include:

- **Case ID** — a short unique identifier (e.g., `SMOKE-01`, `SMOKE-02`)
- **Scenario** — what is being tested, in plain language
- **Steps** — numbered, repeatable steps a human can follow
- **Expected Result** — what should happen if the tool works correctly

**Human tester responsibility (after AI handoff):**

- Follow each test case step by step
- Record the **Actual Result** — what actually happened
- Set the **Status** to one of: `Passed`, `Failed`, `Pending`, or `N/A`
- If `Failed`, explain the failure in Notes
- If `N/A`, explain why the case does not apply

**Minimum required smoke test cases:**

| Case ID | Scenario |
|---------|----------|
| SMOKE-01 | Default / idle state renders correctly |
| SMOKE-02 | Primary action (Run / Convert / Format) produces correct output |
| SMOKE-03 | Clear action resets input and output |
| SMOKE-04 | Copy action copies output to clipboard with visible feedback |
| SMOKE-05 | Invalid input shows a user-friendly error (no crash, no white screen) |
| SMOKE-06 | Empty input is handled safely (no crash, clear feedback) |
| SMOKE-07 | Mode switch works correctly (if the tool has modes) |
| SMOKE-08 | Keyboard shortcut triggers primary action (if supported) |
| SMOKE-09 | Visual layout matches the existing tool design (macOS) |
| SMOKE-10 | Visual layout matches the existing tool design (Windows) |

**Important:**

- Manual testing supplements — it does NOT replace — unit tests and component tests
- Manual testing is only for visual and experiential validation
- If a behavior cannot be verified by an automated test, it must be explicitly listed as a manual smoke test item
- If the manual smoke test has **any** `Pending` or `Failed` item in a required case, the tool Status is **`Not Ready`**

---

## 2a. Interaction Testing Layers

> **Rule**: Pure logic unit tests are necessary but **not sufficient** for interactive UI features. A function passing its unit test does NOT prove the UI button wired to it actually works.

### Why Pure Unit Tests Are Not Enough

A pure function test only proves that **the function itself** behaves correctly given certain inputs. It does NOT prove:

- That a button click actually calls the function
- That the toolbar/handler/action dispatch chain is wired correctly
- That the UI state updates after the function returns
- That the user sees the correct result on screen

**Real-world counter-example — Base64 Swap I/O:**

| Layer | What Happened |
|-------|---------------|
| **Pure logic** | `useCodecTransform.swap()` unit test — ✅ Passed |
| **Toolbar wiring** | `FeatureToolbar` had `swap` action **disabled by default** |
| **Dispatch chain** | `toolbar.execute('swap')` could not find the action — handler never fired |
| **User experience** | Clicking Swap in the UI did **nothing** — no error, no feedback |

> The `swap()` state logic was correct. The unit test passed. But the feature was **broken for real users** because the wiring layer was not tested.

This class of bug — **correct logic, broken wiring** — can only be caught by tests above the pure-function layer.

### Test Layer Taxonomy

Every interactive UI feature must be covered by tests at the appropriate layers. The table below defines five distinct test layers:

| Layer | What It Tests | Example (Base64 Swap) |
|-------|---------------|----------------------|
| **1. Pure Logic** | Function correctness: input → output | `swap({ mode, input, output })` returns swapped state |
| **2. Composable / State** | State machine transitions, reactive state | `useCodecTransform` state changes when `swap()` is called |
| **3. Wiring / Action Dispatch** | Toolbar action → handler invocation chain | `toolbar.execute('swap')` reaches the registered swap handler |
| **4. Component / DOM** | Real button click → UI state change visible in DOM | Clicking the Swap button swaps input ↔ output textareas |
| **5. Manual Smoke** | Visual and experiential validation | Swap button looks correct, feedback is clear |

### Required Coverage by Interaction Type

For common tool interactions, the following layers are the **minimum** required. Pure logic tests alone (Layer 1) are never sufficient for interactive features.

| Interaction | Minimum Required Layers | Notes |
|-------------|------------------------|-------|
| **Copy** | Layer 1 + Layer 3 | Pure logic test for clipboard formatting + wiring test that `toolbar.execute('copy')` calls the handler. DOM click is manual smoke if no component test framework. |
| **Clear** | Layer 1 + Layer 2 + Layer 3 | Logic for reset + state test + wiring test for action dispatch |
| **Swap I/O** | Layer 1 + Layer 2 + Layer 3 | Logic for swap + state test + wiring test that toolbar action is **enabled** and dispatches correctly |
| **Run / Convert** | Layer 1 + Layer 2 + Layer 3 | Logic for transform + state test for result + wiring test for primary action dispatch |
| **Mode Switch** | Layer 1 + Layer 2 + Layer 3 | Logic for mode change + state test + wiring test for mode toggle action |
| **Keyboard Shortcut** | Layer 3 + Layer 4 | Wiring test that shortcut triggers the correct action + component test or manual smoke for key event |

### Implementation Guidance (No New Dependencies)

If the project does not currently have a component/DOM test framework, do **NOT** introduce a new dependency just for this rule. Instead:

1. **Cover Layers 1–3 with existing tooling** — Vitest can test pure functions, composables, and wiring (by importing and calling toolbar/action/handler directly).
2. **List Layer 4 as manual smoke test items** — DOM rendering, real button clicks, and visual feedback become explicit manual verification items in the Tool Completion Report.
3. **Layer 5 remains manual** — visual and UX validation is always manual.

**Wiring test pattern (no DOM required):**

```typescript
// ✅ Wiring test: verify toolbar action dispatches to handler
// No DOM, no mount, no browser — pure Vitest
it('swap action is enabled and dispatches to swap handler', () => {
  const toolbar = createToolbar(/* config */)
  const action = toolbar.actions.find(a => a.id === 'swap')

  // 1. Action must be registered and enabled
  expect(action).toBeDefined()
  expect(action.disabled).toBe(false)

  // 2. Executing the action must call the handler
  const spy = vi.fn()
  toolbar.on('swap', spy)
  toolbar.execute('swap')
  expect(spy).toHaveBeenCalledOnce()
})
```

**Composable/state test pattern:**

```typescript
// ✅ State test: verify composable state transitions
it('swap() swaps input and output in state', () => {
  const state = useCodecTransform()
  state.input.value = 'abc'
  state.output.value = 'XYZ'

  state.swap()

  expect(state.input.value).toBe('XYZ')
  expect(state.output.value).toBe('abc')
})
```

---

## 3. Definition of Done

A tool is **Ready** only when ALL of the following conditions are met:

- [ ] `util` / `service` / `logic` functions implemented
- [ ] Unit tests cover all core logic scenarios (Step 2 checklist)
- [ ] UI integrated into the unified tool layout
- [ ] Component interaction tests cover all critical paths (Step 4 checklist)
- [ ] Wiring / action dispatch tests cover Copy, Clear, Swap, Run, and mode switch (Section 2a)
- [ ] Error handling is user-friendly (no raw exceptions, no `alert()`)
- [ ] Empty input is safe (no crash, no white screen)
- [ ] `Copy` and `Clear` work correctly
- [ ] Keyboard shortcuts (if supported) match tool documentation
- [ ] Zero hardcoded colors, spacing, or emoji icons
- [ ] UI layout is consistent with the selected reference tool in the same category (Section 3a)
- [ ] Configuration controls, action placement, output section, spacing, and visual grouping match the reference pattern unless explicitly justified
- [ ] Sidebar label uses short, scannable name; Page Title uses full capability name (Section 3b)
- [ ] plugin `id`, route, and feature `id` are stable and unchanged by display name modifications
- [ ] Keywords cover short name, full capability, action verbs, and technical terms (Section 3b)
- [ ] No unrelated tools modified
- [ ] No unnecessary dependencies introduced
- [ ] All quality gates pass (see Section 4)
- [ ] Manual smoke test completed, OR pending items explicitly listed

> **If any condition is not met, the tool Status is `Not Ready`.**

---

## 3a. Layout Consistency Rules

> **Rule**: Tools in the same category must share the same visual layout. A user switching between URL Encode and Unicode Encode should feel like using the same tool.

### Reference Tool Requirement

Before implementing a new tool, you **must**:

1. Select an existing, completed tool in the same category as the **reference tool**.
2. State the reference tool in the Implementation Plan.
3. Align the new tool's layout to the reference tool's pattern.

**Category → reference tool mapping (current):**

| Category | Reference Tool |
|----------|---------------|
| Encoding | URL Encode / Decode |
| Formatter | JSON Formatter |
| Crypto | AES |
| Converter | Timestamp |

### Configuration Layout

Configuration controls (Mode, Variant, options) must follow the reference tool's internal grouping:

| Rule | Correct | Wrong |
|------|---------|-------|
| Control grouping | Mode and Variant on the **same row**, left-right two-column layout (as in URL Encode) | One tool uses same-row, another uses stacked rows |
| Label placement | Labels above or beside controls — must match the reference | Different label positions for tools in the same category |
| Spacing | Same `gap` and `padding` as reference | Custom spacing per tool |

**Example — Encoding category:**

```
✅ URL Encode:    [ Mode: Encode | Variant: encodeURIComponent ]   ← same row
✅ Unicode Encode: [ Mode: Encode | Variant: UTF-8            ]   ← same row, matching

❌ Unicode Encode:  Mode:   Encode                                 ← stacked rows
                    Variant: UTF-8                                   (does not match URL)
```

### Action Button Placement

Primary and secondary action buttons must match the reference tool in position, order, and visibility conditions:

| Aspect | Requirement |
|--------|-------------|
| **Position** | Same location relative to input/output (e.g., between input and output, or below output) |
| **Order** | Run / Convert first, then Clear, Copy, Swap — same order as reference |
| **Visibility** | Same conditions (e.g., Copy visible only when output is non-empty) |
| **Swap I/O** | If the reference tool has Swap, the new tool must also have it in the same position |

### Output Section

The output area must match the reference:

- Same placement (e.g., below actions, or right column)
- Same empty state message style
- Same error display location and style
- Same "Copied" feedback mechanism (toast, inline, etc.)

### Divergence Policy

If the new tool **cannot** fully align with the reference due to functional differences:

1. The difference must be **explicitly justified** in the Implementation Plan.
2. Each divergence must be listed in the Tool Completion Report (Section 5 — Differences from reference).
3. Each divergence must have a corresponding manual smoke test case (`SMOKE-LAYOUT-02`, etc.).
4. "I didn't notice" or "I forgot to check" are **not** valid justifications.

### Layout Consistency Checklist

Before marking a tool Ready, verify:

- [ ] Reference tool selected and stated in Implementation Plan
- [ ] Configuration controls (Mode, Variant, options) match reference grouping and spacing
- [ ] Action buttons (Run, Clear, Copy, Swap) match reference position and order
- [ ] Output section placement matches reference
- [ ] Empty state style matches reference
- [ ] Error state style matches reference
- [ ] "Copied" feedback matches reference
- [ ] Any divergences are justified, documented, and covered by smoke tests
- [ ] Layout smoke test (`SMOKE-LAYOUT-01`) passed

---

## 3b. Tool Naming Consistency

> **Rule**: Tool names in the Sidebar, Page Title, and keywords must follow a consistent naming convention. The Sidebar uses a short name; the Page Title uses the full capability name.

### Naming Convention

| UI Element | Format | Example (HTML Encode) | Example (JSON) |
|------------|--------|----------------------|-----------------|
| **Sidebar label** | Short name (no verb) | `HTML` | `JSON Formatter` |
| **Page Title** | Full capability name (with action) | `HTML Encode / Decode` | `JSON Formatter` |
| **plugin `id`** | kebab-case, unchanging | `html-encode` | `json` |
| **route** | `/kebab-case`, unchanging | `/html-encode` | `/json` |
| **feature id** | matches plugin id | `html-encode` | `json` |

### Principles

1. **Sidebar** uses a short, scannable name — no verb, no action prefix. Users scan the sidebar to find a tool; a shorter name is faster to locate.
2. **Page Title** uses the full capability name — includes the action (Encode / Decode, Format, Convert) so users know exactly what the tool does when they land on the page.
3. **plugin `id`**, **route**, and **feature `id`** are stable identifiers. They must **never** change just because the display name changed. Stability of identifiers prevents broken links, lost history, and plugin resolution failures.
4. **keywords / aliases** must cover **both** the short name and the full capability name to ensure search discoverability regardless of what the user types.

### Keywords Coverage Requirements

Every tool's `keywords` array must include at minimum:

| Keyword Type | Required | Example (HTML Encode) |
|---|---|---|
| Short name | ✅ | `html` |
| Full capability | ✅ | `html-encode`, `html-decode` |
| Action verbs | ✅ | `encode`, `decode` |
| Technical terms | ✅ | `entity`, `entities`, `escape`, `unescape` |
| CN search terms | ✅ (8+ total CN+EN) | `HTML编码`, `HTML解码`, `HTML实体` |

### Renaming an Existing Tool

When changing a tool's display name (Sidebar label or Page Title):

1. **Do NOT change** `plugin id`, `route`, or feature `id` — these are stable identifiers.
2. **Update `name`** in the plugin manifest for the new Sidebar label.
3. **Update `searchKeywords`** to cover both old and new names.
4. **Update `description`** if the short name alone is ambiguous.
5. Do NOT modify `Sidebar.vue`, `workspace.ts`, or any shared layout code — the Sidebar reads `name` from the plugin manifest automatically.

### Naming Consistency Checklist

Before marking a tool Ready, verify:

- [ ] Sidebar label is a short, scannable name (no verb unless essential)
- [ ] Page Title is the full capability name with action
- [ ] plugin `id`, route, feature `id` are stable and unchanged
- [ ] `keywords` cover short name, full capability, action verbs, technical terms
- [ ] CN search keywords cover both short and full name
- [ ] Any name change did not break search, route, or plugin resolution

---

## 4. Quality Gate Commands

After tool completion, run every command in this list:

```bash
npx vue-tsc --noEmit        # TypeScript type check
npm test                     # All unit tests
npm run build                # Production build
npm run validate:arch        # Architecture compliance
npm run validate:design      # Design Token compliance
npm run validate:plugins     # Plugin structure validation
```

**Requirements:**

- Must NOT skip failing tests
- Must NOT delete tests to pass
- Must NOT weaken validation standards
- If a failure is a pre-existing issue (not caused by the current tool), it must be documented separately in the Tool Completion Report — do NOT fix it silently in the same change
- If a command fails, explain: **what failed**, **what scope is affected**, and **whether it is related to the current tool**

---

## 5. AI Development Constraints

When developing a tool with AI assistance, the following rules apply:

**Before coding:**
- [ ] Read this document first (`docs/development/tool-development-guidelines.md`)
- [ ] Output an implementation plan before making changes
- [ ] Clearly list which files will be created, modified, or deleted
- [ ] Prefer minimal changes — do not over-engineer

**During coding:**
- [ ] Follow the 5-step workflow in order (Section 2)
- [ ] Do NOT refactor unrelated architecture
- [ ] Do NOT modify unrelated tools
- [ ] Do NOT introduce unnecessary dependencies
- [ ] After each step, output the list of modified files

**Quality gates:**
- [ ] Do NOT weaken quality standards to make tests pass
- [ ] Do NOT delete existing tests
- [ ] Run all quality gate commands (Section 4)
- [ ] Report the result of each validation command
- [ ] If a behavior cannot be auto-verified, list it as a manual smoke test item (Section 2, Step 5)

**After completion:**
- [ ] Output the **Tool Completion Report** using the mandatory template (Section 8)
- [ ] If the tool does not meet the Definition of Done, set Status to `Not Ready` and explain why

---

## 6. Recommended Directory Structure

Follow the existing project convention. The reference structure is the **Base64 tool**:

```
src/features/<tool-name>/
├── logic.ts                  # Pure logic functions (Step 1)
├── types.ts                  # Type definitions
├── index.ts                  # Plugin feature export
├── <ToolName>Feature.ts      # Feature class (extends BaseFeature)
├── <ToolName>View.vue        # UI component (Step 3)
├── composables.ts            # Vue composables (state management)
├── settings.ts               # Settings schema
├── history.ts                # History support
├── toolbar.ts                # Toolbar configuration
├── README.md                 # Tool documentation
├── CHANGELOG.md              # Version history
└── __tests__/
    ├── logic.test.ts         # Unit tests (Step 2)
    └── composables.test.ts   # Component interaction tests (Step 4)
```

**Requirements:**

- New tools should follow the Base64 structure — do not invent a new layout
- Tool logic, types, tests, and UI components must have clear boundaries
- Do NOT restructure existing tools to match this template
- Do NOT reorganize the project to match a different convention

---

## 7. Example: Base64 Tool

The Base64 tool demonstrates the standard workflow:

| Step | What was done |
|------|---------------|
| **1. Pure Logic** | `encode()`, `decode()`, `validate()`, `validateBase64()`, `tryDecode()`, `getStats()`, `formatSize()` in `logic.ts` — all pure functions, zero side effects |
| **2. Unit Tests** | `logic.test.ts` covers: ASCII, Chinese, emoji, empty input, invalid Base64, error messages, edge cases |
| **3. UI** | `Base64View.vue` with Encode/Decode mode switch, input/output textareas, Run/Clear/Copy/Swap buttons — all Design Tokens, SVG icons only |
| **4. Component Tests** | `composables.test.ts` covers: default state, Run, Clear, Copy, error display, Enter shortcut |
| **5. Manual Smoke Test** | Visual check, interaction flow, error messages, Copy feedback — completed before merge |

**Key takeaway from Base64:**
- `logic.ts` is the single source of truth for encoding/decoding
- The Vue component only wires state — it does not contain business logic
- `tryDecode()` returns a discriminated union instead of throwing, so the UI can display friendly errors

---

## 8. Tool Completion Report (Mandatory)

> **Rule**: After every tool is created or significantly modified, AI must output a report using the exact template below. This template is **mandatory** and must not be omitted.

```markdown
# Tool Completion Report

## 1. Tool Name

- Tool:
- Category:
- Status: Ready / Not Ready

## 2. Modified Files

| File | Type | Description |
|---|---|---|
|  | Created / Modified / Deleted |  |

## 3. Pure Logic

- Util / service file:
- Core functions:
- Error handling strategy:
- UI-independent: Yes / No

## 4. Pure Logic Tests

| Case | Covered | Notes |
|---|---|---|
| Normal input | Yes / No |  |
| Empty input | Yes / No |  |
| Chinese input | Yes / No |  |
| Emoji input | Yes / No |  |
| Special characters | Yes / No |  |
| Invalid input | Yes / No |  |
| Error result | Yes / No |  |
| Edge cases | Yes / No |  |

## 5. UI Integration

- Reference tool:
- Layout consistency:
- Configuration layout:
- Action placement:
- Output placement:
- Differences from reference:
- Layout:
- Input:
- Output:
- Primary action:
- Secondary actions:
- Error state:
- Empty state:
- Copy behavior:
- Clear behavior:
- Shortcut behavior:

### 5a. Naming Consistency

- Sidebar label:
- Page title:
- plugin `id`:
- route:
- feature `id`:
- `name` / `id` relationship:
- Keywords coverage (short name):
- Keywords coverage (full capability):
- Keywords coverage (CN):
- Naming checklist passed: Yes / No

## 6. Interaction Tests by Layer

> **Rule**: Interactive features require tests above the pure-function layer (see Section 2a). Distinguish which layers are covered.

### 6a. Composable / State Tests

| State transition | Covered | Notes |
|---|---|---|
| Default/initial state | Yes / No |  |
| Input change updates state | Yes / No |  |
| Mode switch updates state | Yes / No / N/A |  |
| Swap I/O updates state | Yes / No / N/A |  |
| Clear resets state | Yes / No |  |
| Transform result updates state | Yes / No |  |

### 6b. Wiring / Action Dispatch Tests

| Action | Handler invoked | Notes |
|---|---|---|
| Run / Convert | Yes / No |  |
| Copy | Yes / No |  |
| Clear | Yes / No |  |
| Swap I/O | Yes / No / N/A |  |
| Mode switch | Yes / No / N/A |  |
| Shortcut → action | Yes / No / N/A |  |

### 6c. Component / DOM Tests

| Interaction | Covered | Notes |
|---|---|---|
| Default state renders | Yes / No |  |
| Input typing renders | Yes / No |  |
| Primary action via real click | Yes / No |  |
| Error display renders | Yes / No |  |
| Invalid input does not crash UI | Yes / No |  |

> If the project has no component/DOM test framework, mark all rows in 6c as `Not Run` and list each as a manual smoke test item in Section 8.

## 7. Validation Commands

| Command | Result | Notes |
|---|---|---|
| npx vue-tsc --noEmit | Passed / Failed / Not Run |  |
| npm test | Passed / Failed / Not Run |  |
| npm run build | Passed / Failed / Not Run |  |
| npm run validate:arch | Passed / Failed / Not Run |  |
| npm run validate:design | Passed / Failed / Not Run |  |
| npm run validate:plugins | Passed / Failed / Not Run |  |

## 8. Manual Smoke Test

> **Rule**: Every case must have steps and expected results filled by AI. The human tester fills Actual Result and Status. Status values: `Pending`, `Passed`, `Failed`, `N/A`.

| Case ID | Scenario | Steps | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|
| SMOKE-01 | Default state | 1. Open tool page | Idle state renders with input, output, and action buttons visible |  | Pending |  |
| SMOKE-02 | Primary action | 1. Enter valid input 2. Click Run/Convert | Correct output appears in output area |  | Pending |  |
| SMOKE-03 | Clear | 1. Enter input 2. Click Clear | Input and output areas are cleared |  | Pending |  |
| SMOKE-04 | Copy | 1. Produce output 2. Click Copy | Output copied to clipboard; "Copied" feedback visible |  | Pending |  |
| SMOKE-05 | Invalid input | 1. Enter invalid input 2. Click Run/Convert | User-friendly error message displayed; no crash, no white screen |  | Pending |  |
| SMOKE-06 | Empty input | 1. Leave input empty 2. Click Run/Convert | Safe handling; clear feedback; no crash |  | Pending |  |
| SMOKE-07 | Mode switch | 1. Switch mode (e.g., Encode → Decode) | Mode changes; labels and behavior update correctly |  | Pending / N/A |  |
| SMOKE-08 | Keyboard shortcut | 1. Enter input 2. Press shortcut (e.g., ⌘Enter) | Primary action triggered |  | Pending / N/A |  |
| SMOKE-09 | Visual — macOS | 1. Open tool on macOS 2. Compare with design reference | Layout, spacing, colors match existing tools |  | Pending |  |
| SMOKE-10 | Visual — Windows | 1. Open tool on Windows 2. Compare with design reference | Layout, spacing, colors match existing tools |  | Pending / N/A |  |
| SMOKE-LAYOUT-01 | Layout matches reference tool | 1. Open the reference tool 2. Open the new tool side by side 3. Compare configuration controls, action buttons, output section, spacing, and grouping | New tool layout matches the reference; any differences are documented and justified |  | Pending |  |

> **Readiness gate**: If any row with a required case has Status `Pending` or `Failed`, the tool is **Not Ready**. Mark rows as `N/A` only with a justification in Notes (e.g., "Tool has no mode switch").

## 9. Known Issues

- 

## 10. Final Status

- Ready / Not Ready:
- Remaining issues:
- Next recommended tool:
```

**Template usage rules:**

| Rule | Description |
|------|-------------|
| **Not Run** | If a check was not executed, mark it `Not Run` and explain why |
| **Pending** | If a manual check is deferred, mark it `Pending` with a reason. Any `Pending` required case → tool is `Not Ready`. |
| **Passed** | Actual result matches expected result |
| **Failed** | Actual result does not match expected. Must explain the failure in Notes. Any `Failed` required case → tool is `Not Ready`. |
| **N/A** | Case does not apply. Must explain why in Notes. |
| **No vague answers** | Do NOT write "all passed" or "manual testing passed" without listing individual cases and results. Every row must be filled. |
| **Not Ready** | If the tool has not met the Definition of Done (Section 3), Status **must** be `Not Ready` |
| **Known Issues** | Pre-existing issues discovered during development must be listed separately — do not silently bundle fixes |

---

> **Version**: v1.0 — 2026-07-02
> **Maintained by**: Dev Toolbox team
> **Next review**: After the next 3 tools are developed using these guidelines
