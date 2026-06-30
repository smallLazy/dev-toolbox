# Plugin Specification: Base64

> **Status**: Review | **SSOT**: This document.
>
> **Rule**: This spec is the SSOT. No code before spec is approved.

---

## Basic Information

| Field | Value |
|-------|-------|
| **Plugin Name** | Base64 |
| **Plugin ID** | `base64` |
| **Category** | `encoding` |
| **Description** | Encode and decode text to/from Base64 with full Unicode support |
| **Version** | `1.0.0` |
| **Priority** | `P0` |
| **Owner** | TBD |
| **Sprint** | Sprint 02 — Core Utilities |
| **Milestone** | v1.0.0-beta.1 |

---

## Architecture

### Logic API

All encoding/decoding logic lives in pure functions. The Feature class (`Base64Feature`) provides the sole execution entry point.

```typescript
// --- Pure Logic Functions (logic.ts) ---

/** Encode a plain-text string to Base64 (RFC 4648 Standard). */
function encode(input: string): string

/** Decode a Base64 string to plain text (RFC 4648 Standard). */
function decode(input: string): string

/** Generic input validation: empty, whitespace-only, max size. */
function validate(input: string): ValidationResult

/** Base64-specific validation: alphabet, length, padding, invalid character position. */
function validateBase64(input: string): Base64ValidationResult

/** Compute text statistics (char count, byte size, etc.). */
function getStats(input: string): TextStats

/** Format a byte count into a human-readable string (e.g. "1.2 KB"). */
function formatSize(bytes: number): string
```

### Feature Entry Point

```typescript
// --- Feature Class (Base64Feature) ---

interface Base64Config {
  mode: 'encode' | 'decode'
}

interface Base64Result {
  output: string
  stats: TextStats
}

/** Sole execution entry point. Dispatches encode() or decode() based on config.mode. */
function run(input: string, config: Base64Config): Base64Result
```

**Design rule**: `run()` is the only Feature execution entry point. It:
1. Validates input via `validate()`
2. If mode is `decode`, additionally validates via `validateBase64()`
3. Dispatches to `encode()` or `decode()` based on `config.mode`
4. Returns a unified `Base64Result`

### Validation Responsibility Split

| Function | Responsibility | Does NOT cover |
|----------|---------------|----------------|
| `validate()` | Empty input, whitespace-only input, maximum size (50 MB) | Base64 alphabet, length, padding, invalid characters |
| `validateBase64()` | Base64 alphabet, length (multiple of 4), padding correctness, invalid character position | Empty input, max size (already handled by `validate()`) |

**No overlap**: `validate()` runs first for both modes. `validateBase64()` runs only in decode mode, after `validate()` passes. The two functions have disjoint responsibilities.

---

## Logic Breakdown

### Call Chains

**Encode path**:

```
Base64Feature.run(input, { mode: 'encode' })
  → validate(input)          // Generic validation
  → encode(input)            // Pure function: UTF-8 → Base64
  → getStats(input)          // Stats for UI display
  → return Base64Result
```

**Decode path**:

```
Base64Feature.run(input, { mode: 'decode' })
  → validate(input)          // Generic validation
  → validateBase64(input)    // Base64-specific validation
  → decode(input)            // Pure function: Base64 → UTF-8
  → getStats(input)          // Stats for UI display
  → return Base64Result
```

**No `process()` function exists.** The dispatch logic lives in `run()`.

---

## Data Flow

```
User Input (textarea)
      │
      ▼
Base64Feature.run(input, config)
      │
      ├─ validate(input)           ──▶ ValidationResult
      │
      ├─ [decode mode] validateBase64(input) ──▶ Base64ValidationResult
      │
      ├─ encode(input) | decode(input)        ──▶ string
      │
      └─ getStats(input)                      ──▶ TextStats
              │
              ▼
         Base64Result { output, stats }
              │
              ▼
         UI (Output Card + Char Count)
```

### Clipboard Flow

```
Copy Button / ⌘Shift C
      │
      ├─ navigator.clipboard.writeText(output)
      │        │
      │        ├─ Success → toast "Copied"
      │        │
      │        └─ Reject  → toast "Unable to copy: clipboard access was denied"
      │
      └─ navigator.clipboard unavailable
               │
               └─ toast "Clipboard is not supported in this environment"
```

### History Restore Flow

```
User clicks History Item
      │
      ▼
Restore: { input, config.mode }
Clear:   { output, error }
      │
      ▼
State after restore:
  • input   = history.input
  • mode    = history.config.mode
  • output  = "" (cleared)
  • error   = null (cleared)
      │
      ▼
Behavior after restore:
  • Do NOT auto-execute
  • Focus returns to Input textarea
  • User must explicitly click Execute (or ⌘Enter)
```

---

## User Story

```
As a developer,
I want to encode/decode text between plain text and Base64,
So that I can work with Base64-encoded data in APIs, configs, and URLs.
```

---

## Goals

- **Primary**: Reliable Base64 encode/decode with full Unicode support (Chinese, emoji, RTL)
- **Secondary**: Streamlined developer workflow — clipboard integration, keyboard-first operation, instant feedback

---

## Features

### Scope

**Current version supports RFC 4648 Standard Base64 only.**

Out of Scope for v1:
- Base64URL
- URL-safe Base64
- Automatic Encode/Decode Detection

### Must Have (P0)
- [ ] Encode text → Base64 (RFC 4648 Standard)
- [ ] Decode Base64 → text (RFC 4648 Standard)
- [ ] Unicode support (Chinese, emoji, surrogate pairs)
- [ ] Empty input validation
- [ ] Invalid Base64 error handling

### Should Have (P1)
- [ ] Copy output to clipboard
- [ ] Swap input/output direction
- [ ] Character count display
- [ ] History (last 20 items)

### Nice to Have (P2)
- [ ] File encode/decode (drag & drop)
- [ ] URL-safe Base64 variant (`-` and `_` instead of `+` and `/`)
- [ ] Line wrapping option (76 characters per line)

### Future
- [ ] MIME Base64 support (Content-Transfer-Encoding headers)
- [ ] Streaming encode/decode for very large inputs (>100MB)
- [ ] Base32 / Base58 encoding variants

---

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| Text | textarea | Yes | Plain text (encode mode) or Base64-encoded string (decode mode) |

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| Encoded/Decoded text | text | Result displayed in a readonly textarea with copy support |

---

## Toolbar

| Action | Icon | Shortcut | Enabled |
|--------|------|----------|---------|
| Execute | Play | `⌘Enter` | Always |
| Copy Output | Copy | `⌘Shift C` | When output exists |
| Swap I/O | Refresh | — | When output exists |
| Clear | Trash | `Escape` | Always |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘Enter` | Execute encode/decode |
| `⌘Shift C` | Copy output to clipboard |
| `Escape` | Clear input and output |
| `⌘K` | Open Command Palette |

---

## Settings

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `defaultMode` | select | `encode` | Default mode when plugin opens: `encode` or `decode` |

**Design decision**: Only `defaultMode` is exposed as a setting for v1.0. URL-safe variant and line wrapping are P2 features; when implemented, they will add `defaultVariant` (select) and `lineWrap` (toggle) settings. These are intentionally deferred to keep the v1.0 settings surface minimal and avoid dead controls for unimplemented features.

---

## History

- **Enabled**: Yes
- **Max Items**: 20
- **Fields Stored**: input, output, config, timestamp

> **Note**: `config` captures the full configuration state (mode, variant, line wrapping) so that history items can be restored correctly even after settings changes or future settings additions. This is more extensible than storing only `mode`.

### History Restore Behavior

When a history item is clicked:

| Action | Detail |
|--------|--------|
| **Restore** | `input` — populated from history |
| **Restore** | `config.mode` — set from history |
| **Clear** | `output` — reset to empty |
| **Clear** | `error` — reset to null |

After restore:
- Execution is **not** triggered automatically
- Focus **returns to the Input** textarea
- The user **must explicitly click Execute** (or press `⌘Enter`) to produce output

**Rationale**: Auto-executing on restore would overwrite the user's output before they can inspect the restored input. Requiring explicit execution gives the user control.

---

## Search Keywords

```
base64, encode, decode, binary, text, unicode, utf8, mime, base64url,
编码, 解码, base64编码, base64解码, 文本, 二进制
```

15 keywords (9 EN + 6 CN). Minimum 8 required.

---

## UI Layout

```
┌──────────────────────────────────────────┐
│ Base64                                    │
│ Encode and decode text to/from Base64     │
│                                    ⌘Enter │
├──────────────────────────────────────────┤
│ Card: Configuration                       │
│ [Encode | Decode]                         │
├──────────────────────────────────────────┤
│ Card: Input                               │
│ ┌──────────────────────────────────────┐ │
│ │ textarea (monospace, 6+ rows)        │ │
│ │                                      │ │
│ │                           chars: 0   │ │
│ └──────────────────────────────────────┘ │
│                                           │
│ [Execute] [Copy] [Clear] [Swap I/O]          │
│                                           │
│ Card: Output (conditional — shown only    │
│        after execution produces output)   │
│ ┌──────────────────────────────────────┐ │
│ │ readonly textarea (monospace)        │ │
│ │                                      │ │
│ │                           chars: 0   │ │
│ └──────────────────────────────────────┘ │
│                                           │
│ Card: History (conditional — shown when   │
│        history has items)                 │
│ ┌──────────────────────────────────────┐ │
│ │ Recent encodings/decodings...        │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Empty input (encode mode) | Show validation error: "Input is empty". Do not execute. |
| Empty input (decode mode) | Show validation error: "Input is empty". Do not execute. |
| Whitespace-only input | Treat as valid input. Encode the whitespace characters. On decode, whitespace is stripped before validation? **Decision**: Do NOT auto-strip — pass through verbatim. If the user pastes Base64 with trailing newline, that's an invalid Base64 error. The error message should mention whitespace as a possible cause. |
| Very large input (>1MB) | Process without freezing. Show a processing indicator if operation takes >100ms. Target: <500ms for 1MB encode. If input exceeds 10MB, show a warning: "Large input may be slow" before processing. |
| Very large input (>50MB) | Block execution with error: "Input exceeds maximum size of 50MB". This prevents browser tab crashes. File mode (P2) will handle larger inputs via streaming. |
| Unicode: Chinese characters | Encode correctly via `TextEncoder` (UTF-8). Roundtrip: encode → decode → original text preserved. |
| Unicode: Emoji (surrogate pairs) | Encode correctly. Emoji like `😀🚀` are multi-byte in UTF-8 and must survive roundtrip. Test explicitly. |
| Unicode: RTL text | Encode correctly. Arabic/Hebrew characters must survive roundtrip. |
| Unicode: Zero-width characters | Encode correctly. ZWJ, ZWNJ, BOM characters must be preserved through roundtrip. |
| Invalid Base64 characters (decode) | Show error: "Invalid Base64: unexpected character at position N". Highlight or report the position of the first invalid character. |
| Invalid Base64 length (decode) | Show error: "Invalid Base64: input length must be a multiple of 4". Include the actual length for debugging: `(got N chars)`. |
| Base64 with incorrect padding | Show error: "Invalid Base64: incorrect padding". Distinguish from character errors since the cause is different. |
| Rapid double-click on Execute | Ignore the second click while `loading === true`. Debounce is not needed for `<button disabled>` — use the disabled attribute. |
| Switch mode with output present | Preserve the output text so the user can reference it. Clear only the input, or swap input ↔ output? **Decision**: Swap action swaps the input and output fields. Mode toggle (Encode↔Decode) only changes the mode without modifying fields. |
| Input equals output after operation (correctness property) | The Base64 algorithm maps empty input to empty output: encoding `""` → `""`, decoding `""` → `""`. This is a correctness guarantee for the underlying logic function, NOT a UI scenario — the UI intentionally blocks empty input via validation (see edge cases #2 and #5). The logic function must handle empty input correctly so that future programmatic callers (API, CLI, batch processing) receive correct results even if the UI prevents the scenario today. |
| Copy with no output | Disable the Copy button (toolbar Enabled condition: "When output exists"). If triggered via keyboard shortcut, show a brief toast: "Nothing to copy". |
| Clipboard API unavailable | `navigator.clipboard` may not exist or may throw on `writeText()`. When unavailable, show a toast: "Clipboard is not supported in this environment." Do not assume Clipboard API is always present. |
| Browser tab loses focus during processing | Continue processing. Result is available when the user returns. |
| Non-UTF-8 binary data pasted into input | The textarea only accepts UTF-8 text. Binary data pasted into the input may be corrupted by the browser. Display a note in the UI: "For binary files, use File mode (drag & drop)" once P2 file support is implemented. Until then, document this limitation. |

---

## Error Messages

| Condition | Message | Details |
|-----------|---------|---------|
| Empty input | `Input is empty` | Shown for both encode and decode modes. Validation runs before processing. |
| Invalid Base64 characters | `Invalid Base64: unexpected character at position N` | `N` is the 0-based index of the first non-Base64 character. Base64 alphabet: A-Z, a-z, 0-9, +, /, =. |
| Invalid Base64 length | `Invalid Base64: input length must be a multiple of 4` | Reported length excludes whitespace if auto-trim is enabled. Include actual length: `(got N chars)`. |
| Input too large | `Input exceeds maximum size of 50MB` | Prevents browser freeze. File mode (P2) will handle larger files via streaming. |
| Large input warning | `Processing large input (N MB) — this may take a moment` | Shown as a warning (not error) for inputs >10MB. Processing continues. |
| Processing error | `An unexpected error occurred. Please try again.` | Catch-all for unexpected exceptions. Log the full error to console for debugging. |
| Clipboard denied | `Unable to copy: clipboard access was denied` | Shown when `navigator.clipboard.writeText()` rejects. Suggest manual selection as fallback. |
| Clipboard unavailable | `Clipboard is not supported in this environment` | Shown when `navigator.clipboard` is `undefined` or the API is not present. |
| Nothing to copy | `Nothing to copy` | Shown as a brief toast when Copy shortcut is pressed with no output. |

---

## Loading State

Base64 encode/decode is a **synchronous computation** in v1. There is no async processing, no Web Worker, and no chunked execution.

The Loading state exists solely for **uniform UI behavior** across all plugins:
- Button shows disabled + spinner while `loading === true`
- Prevents double-execution via disabled attribute
- For small inputs, the Loading state may flash too briefly to be visible — this is expected and acceptable

**v1 does not introduce asynchronous processing.** This avoids unnecessary complexity and follows the KISS principle.

---

## Accessibility

- [ ] All inputs have visible labels (`aria-label` on textareas: "Plain text input" / "Base64 input" on encode mode, roles adjusted per mode)
- [ ] Focus ring visible on all interactive elements (`:focus-visible` with `--accent-primary` outline)
- [ ] Full keyboard navigation: `Tab` through fields, `Enter` to execute, `Escape` to clear, `⌘Shift C` to copy
- [ ] Mode toggle (Encode/Decode) is keyboard-accessible via `ArrowLeft`/`ArrowRight` keys
- [ ] Output textarea has `aria-live="polite"` so screen readers announce when result changes
- [ ] Error messages use `role="alert"` for immediate screen reader announcement
- [ ] All toolbar buttons have `aria-label` (e.g., "Copy output to clipboard", "Clear input and output")
- [ ] Color contrast meets WCAG AA for all text elements (minimum 4.5:1 for body text, 3:1 for large text)
- [ ] Character count is associated with its textarea via `aria-describedby`
- [ ] Focus returns to the Execute button after Clear action
- [ ] No `tabindex` values > 0 — natural DOM order defines tab sequence

---

## Performance

| Metric | Target | Notes |
|--------|--------|-------|
| First paint | < 200ms | Plugin page renders with empty state |
| Encode 1KB text | < 10ms | Typical use case (short strings, tokens) |
| Encode 100KB text | < 100ms | Larger payloads (configs, certificates) |
| Encode 1MB text | < 500ms | Maximum recommended interactive input size |
| Decode 1KB Base64 | < 10ms | Typical use case |
| Decode 100KB Base64 | < 100ms | Larger payloads |
| Decode 1MB Base64 | < 500ms | Maximum recommended interactive input size |
| Memory (idle) | < 30MB | Plugin loaded, no input processed |
| Memory (processing 1MB) | < 100MB | Peak during encode/decode |
| Input debounce | N/A | No debounce — processing is on-demand (button press / `⌘Enter`), not on keystroke |

**Implementation notes**:
- Use `TextEncoder`/`TextDecoder` (native browser APIs, highly optimized) for UTF-8 conversion
- Base64 encode: `btoa()` after UTF-8 encoding via `TextEncoder`
- Base64 decode: `atob()` then UTF-8 decode via `TextDecoder`
- Avoid creating unnecessary intermediate string copies — work with `Uint8Array` where possible

### Performance Tests

Performance testing is **benchmark only**. There are no absolute time assertions in CI.

- Benchmarks measure execution time for informational purposes
- Tests must complete within a reasonable time on supported platforms
- CI must **not** rely on absolute execution times — hardware varies across CI runners
- If a benchmark shows a regression, investigate manually; do not gate CI on wall-clock time

**Example**: Do NOT assert `encode(100KB) < 100ms` in CI. Instead, run a benchmark script that reports timings for human review.

---

## Test Cases

| # | Input | Mode | Expected | Notes |
|---|-------|------|----------|-------|
| 1 | `Hello World` | Encode | `SGVsbG8gV29ybGQ=` | Happy path — ASCII |
| 2 | `SGVsbG8gV29ybGQ=` | Decode | `Hello World` | Happy path — valid Base64 |
| 3 | `你好世界` | Encode→Decode | Roundtrip OK (original = `你好世界`) | Unicode CJK roundtrip |
| 4 | `Hello 😀🚀` | Encode→Decode | Roundtrip OK (original = `Hello 😀🚀`) | Unicode emoji (surrogate pairs) |
| 5 | `""` (empty) | Encode | Error: "Input is empty" | Empty validation |
| 6 | `""` (empty) | Decode | Error: "Input is empty" | Empty validation |
| 7 | `!!!not-base64!!!` | Decode | Error: "Invalid Base64: unexpected character at position 0" | Invalid characters |
| 8 | `SGVsbG8` (7 chars) | Decode | Error: "Invalid Base64: input length must be a multiple of 4 (got 7)" | Invalid length |
| 9 | `"A"` × 100,000 | Encode | Correct Base64 output; performance measured for benchmark only | Large input — correctness verified, timing is informational |
| 10 | `שלום` (Hebrew) | Encode→Decode | Roundtrip OK | Unicode RTL text |

---

## Benchmark (vs DevToys)

| Dimension | DevToys | Our Target | Notes |
|-----------|---------|------------|-------|
| Has this tool? | Yes | Yes | Base64 encoder/decoder is a standard dev tool |
| Encode mode | Yes | Yes | |
| Decode mode | Yes | Yes | |
| Unicode support | Partial (UTF-8) | Full (UTF-8 + emoji + RTL) | DevToys handles CJK but emoji support varies by platform |
| URL-safe variant | Yes | P2 (v1.1) | |
| File encode/decode | Yes | P2 (v1.1) | |
| Line wrapping (76 chars) | Yes | P2 (v1.1) | MIME standard wrapping |
| Keyboard shortcut | No default | `⌘Enter` | DevToys requires mouse click |
| Copy to clipboard | Yes | Yes (`⌘Shift C`) | |
| History | No | Yes (last 20) | Unique differentiator |
| Favorites | No | Yes (via platform) | Platform-level feature |
| Search keywords | N/A | 15 (9 EN + 6 CN) | |
| Settings persistence | Partial | Yes | Mode preference saved across sessions |
| Character count | No | Yes | Input + output char counts |
| Dark theme | Yes | Yes (Design Tokens) | |

---

## Implementation Order

| Task | Description | Depends On | Deliverable |
|------|-------------|------------|-------------|
| T1 | Create plugin scaffold via Generator | — | Plugin directory + registration |
| T2 | Implement `logic.ts` — `encode()`, `decode()`, `validate()`, `validateBase64()`, `getStats()`, `formatSize()` | T1 | Pure functions + unit tests |
| T3 | Implement `Base64Feature.run()` — dispatch, validation, error handling | T2 | Feature class + unit tests |
| T4 | Build UI — Configuration Card (mode toggle) | T1 | Vue component |
| T5 | Build UI — Input Card (textarea + char count) | T1, T4 | Vue component |
| T6 | Build UI — Output Card (readonly textarea + char count) | T1, T5 | Vue component |
| T7 | Build UI — Action Bar (Execute, Copy, Clear, Swap) | T1, T6 | Vue component |
| T8 | Wire UI to `Base64Feature.run()` | T3, T7 | Working end-to-end |
| T9 | Implement History (store + restore) | T8 | History UI + integration |
| T10 | Implement Clipboard integration (write + fallback) | T8 | Copy button + shortcut |
| T11 | Implement `⌘Enter` shortcut + keyboard navigation | T8 | Keyboard support |
| T12 | Manual QA — Unicode roundtrip, edge cases, screenshots | T11 | QA report + screenshots |

**Note**: Each task includes its own unit tests. Task 2 tests must pass before moving to Task 3.

---

## Risk

### R1: Unicode Surrogate Pair Handling
- **Likelihood**: Medium
- **Impact**: High — incorrect output for emoji and supplementary characters
- **Mitigation**: Use `TextEncoder`/`TextDecoder` (native APIs handle surrogates correctly). Write explicit roundtrip tests for `😀🚀`, `𐍈` (supplementary multilingual plane), and ZWJ sequences.

### R2: Browser `atob` Limitation
- **Likelihood**: Low
- **Impact**: Medium — `atob()` cannot decode Base64 strings containing non-Latin1 bytes after decode
- **Mitigation**: Decode to a binary string via `atob()`, then convert to `Uint8Array` byte-by-byte, then decode via `TextDecoder`. This is the standard pattern and handles all byte values correctly.

### R3: Large Input Performance
- **Likelihood**: Low
- **Impact**: Low — most developer use cases involve short strings (tokens, config values)
- **Mitigation**: Current implementation remains synchronous. Only optimize (Web Worker, chunking, `requestIdleCallback`) after a real benchmark proves a measurable performance issue on supported platforms. Follow the KISS principle.

### R4: Clipboard API Availability
- **Likelihood**: Low
- **Impact**: Low — clipboard is a convenience feature; manual copy-paste still works
- **Mitigation**: Feature-detect `navigator.clipboard` before calling. Show a friendly fallback message when unavailable. Do not block execution on clipboard failure.

---

## Non-goals

The following capabilities are intentionally out of scope for v1:

- Base64URL
- URL-safe Base64
- File encoding
- Drag & Drop
- Batch processing
- Streaming
- Persistent history (in-memory only, cleared on page unload)
- Automatic mode detection (encode vs. decode)
- Image preview

These are not missing features — they are version scope boundaries. Each may be reconsidered in a future release based on user feedback.

---

## Future Extensions

Potential enhancements for future versions (roadmap only — no commitment):

- Base64URL (RFC 4648 §5)
- URL-safe encoding
- Auto Detect Encode/Decode
- File upload
- Image preview for decoded Base64 images
- Download decoded file
- Clipboard watcher (auto-detect Base64 on clipboard)
- Batch encoding (multiple inputs)
- Streaming support for very large inputs

> **Note**: This list is informational. It does not affect v1 scope, implementation, or acceptance criteria.

---

## Definition of Done

- [ ] All Must Have (P0) features implemented
- [ ] `logic.ts` pure functions: `encode()`, `decode()`, `validate()`, `validateBase64()`, `getStats()`, `formatSize()`
- [ ] `Base64Feature.run(input, config): Base64Result` dispatches correctly for both modes
- [ ] All 10 test cases pass (unit tests)
- [ ] 17 Quality Gates pass (Architecture, Design, Navigation, Code Quality, CI, Documentation)
- [ ] Unicode roundtrip verified for: ASCII, Chinese, emoji, RTL, zero-width characters
- [ ] Performance benchmarks recorded (informational only — not gating CI)
- [ ] Benchmark meets or exceeds DevToys on all v1.0 in-scope dimensions (dimensions marked P2 are excluded from this criterion; they will be evaluated in their respective release milestones)
- [ ] Clipboard fallback tested (denied + unavailable scenarios)
- [ ] History restore behavior verified (input + mode restored; output + error cleared; no auto-execute)
- [ ] Code review approved
- [ ] Spec updated with any changes made during development
- [ ] Screenshots captured (Task 12 — Manual QA phase; not required during development)

---

## Acceptance Criteria

- [ ] All Must Have features implemented
- [ ] All 10 test cases pass
- [ ] 17 Quality Gates pass (Architecture, Design, Navigation, Code Quality, CI, Documentation)
- [ ] Unicode roundtrip verified for: ASCII, Chinese, emoji, RTL, zero-width characters
- [ ] Performance targets met (1MB encode < 500ms, 1MB decode < 500ms)
- [ ] Benchmark meets or exceeds DevToys on all v1.0 in-scope dimensions (dimensions marked P2 are excluded from this criterion; they will be evaluated in their respective release milestones)
- [ ] Code review approved
- [ ] Spec updated with any changes made during development

---

> **Template Version**: v1.0
> **Last Updated**: 2026-06-30
> **Review Status**: Revised per Sprint 02 Step 1.3 (Second Review). All 4 findings resolved. Ready for Approval Review.
