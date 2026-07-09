---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Plugin Specification: Diff

> **Status**: Released | **SSOT**: This document.

---

## Basic Information

| Field | Value |
|-------|-------|
| **Plugin Name** | Diff |
| **Plugin ID** | `diff` |
| **Category** | `formatter` |
| **Description** | Compare two text inputs and generate a unified diff |
| **Version** | `1.0.0` |
| **Priority** | `P0` |
| **Sprint** | Sprint 02 — Formatters |
| **Milestone** | v1.0.0-beta.2 |

---

## Overview

Text comparison tool using LCS-based DP algorithm. Accepts two text inputs (Original and Modified), generates unified diff output with color-coded visual viewer. Supports ignore whitespace, ignore case, and ignore line order options.

---

## User Goals

```
As a developer,
I want to compare two text inputs side by side and see the differences,
So that I can review changes, identify edits, and generate patches.
```

---

## Features

### Must Have (P0)
- [x] Side-by-side text input (Original / Modified)
- [x] Unified diff output with visual viewer
- [x] Color-coded lines: added, removed, unchanged, hunk headers
- [x] Configurable context lines (3, 5, 10, All)
- [x] Ignore whitespace option
- [x] Ignore case option

### Should Have (P1)
- [x] Ignore line order (multiset comparison)
- [ ] Patch file export

### Nice to Have (P2)
- [ ] Inline diff mode
- [ ] Word-level diff highlighting

---

## Input

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| Original Text | text | Yes | Left-side text area, editable |
| Modified Text | text | Yes | Right-side text area, editable |
| Context Lines | select | No | 3 (default), 5, 10, All |
| Ignore Whitespace | checkbox | No | Strip whitespace before comparison |
| Ignore Case | checkbox | No | Case-insensitive comparison |
| Ignore Line Order | checkbox | No | Multiset comparison |

## Output

| Output | Format | Description |
|--------|--------|-------------|
| Diff | visual | Color-coded unified diff lines in a viewer |

## Actions

| Action | Description |
|--------|-------------|
| Compare | Run diff (Cmd+Enter) |
| Copy Output | Copy unified diff text |
| Clear | Clear all inputs and output |

---

## Validation

- 500KB per-side input limit
- Empty input allowed (returns "No differences found")

---

## Layout Requirements

- Uses `ToolLayout layout="io"` as outer shell
- Custom dual-input workspace within ToolLayout: two `InputOutputPanel` side by side (Original / Modified)
- Uses `ToolActionBar` mid-page between inputs and diff output
- Third `InputOutputPanel` for diff output with custom visual viewer
- Allowlisted in validate-tool-layout as legitimate custom layout (dual-input comparison tool)

---

## Accessibility

- All textareas have `aria-label` attributes
- Diff viewer uses `role="list"` and `role="listitem"` for line navigation
- Primary button uses `aria-label`

---

## Test Cases

| # | Input | Expected |
|---|-------|----------|
| 1 | Identical texts | "No differences found" |
| 2 | One line changed | Single hunk with 1 added, 1 removed |
| 3 | Chinese text diff | Correct diff output |
| 4 | Empty inputs | Graceful empty state |
| 5 | Whitespace-only change + ignore whitespace | "No differences found" |

---

## Known Gaps

- LCS is O(m*n) — large inputs (>100KB) may be slow
- Only unified diff format supported (no side-by-side viewer)
- No patch file export yet

---

## Definition of Done

- [ ] All Must Have features working
- [ ] Logic tests pass
- [ ] `npm run validate:layout` passes
- [ ] Spec document complete
