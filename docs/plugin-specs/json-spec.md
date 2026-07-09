---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Plugin Specification: JSON Formatter

> **Status**: Released | **SSOT**: This document.

---

## Basic Information

| Field | Value |
|-------|-------|
| **Plugin Name** | JSON Formatter |
| **Plugin ID** | `json` |
| **Category** | `formatter` |
| **Description** | Format, validate, and minify JSON |
| **Version** | `1.0.0` |
| **Priority** | `P0` |
| **Sprint** | Sprint 01 — Core Utilities |
| **Milestone** | v1.0.0-beta.1 |

---

## Overview

JSON manipulation tool. Pretty-prints, minifies, and validates JSON. Provides rich statistics (JSON type detection, key count, item count). Uses `layout="editor"` mode for a single-pane editing experience. Dual API: v1 safe path (`parseJson`, `transformJson`) plus legacy compat functions.

---

## User Goals

```
As a developer,
I want to format, validate, and minify JSON data,
So that I can read, debug, and optimize JSON payloads from APIs and config files.
```

---

## Features

### Must Have (P0)
- [x] JSON pretty-print with configurable indent
- [x] JSON minify (single-line)
- [x] JSON validation with line/column error location
- [x] Sort keys (deep recursive)
- [x] Rich statistics (type, key count, item count)
- [x] Load example and auto-format

### Should Have (P1)
- [ ] Tree view
- [ ] JSON path evaluation

### Nice to Have (P2)
- [ ] JSON schema validation
- [ ] JSON diff mode

---

## Input

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| JSON text | text | Yes | JSON string to process |
| Indent size | setting | No | 2 or 4 spaces (plugin-level) |
| Sort keys | setting | No | Toggle alphabetical key sort |
| Auto-format | setting | No | Auto-format on input change |

## Output

| Output | Format | Description |
|--------|--------|-------------|
| Formatted JSON | text | Pretty-printed or minified JSON |
| Validation | text | Error with line and column number |

## Actions

| Action | Description |
|--------|-------------|
| Format | Pretty-print JSON (Cmd+Enter) |
| Minify | Compress to single line |
| Validate | Check JSON syntax and report errors |
| Copy Result | Copy output to clipboard |
| Clear | Clear input and output |
| Example | Load sample JSON and auto-format |

---

## Validation

- Invalid JSON: error message with line and column number from `JSON.parse`
- Empty input: prompts user to enter JSON
- Large input: handles up to browser memory limits

---

## Layout Requirements

- Uses `ToolLayout layout="editor"` — single-pane editing layout
- Uses `ToolWorkspace layout="editor"` with input/output panels
- Output panel has `readonly`
- Uses `ToolActionBar` with dual primary style (Format main, Minify + Validate secondary)
- Monospaced editor (`mono-editor` class) with tab-size:2

---

## Accessibility

- Textarea has `aria-label`
- Primary button uses `aria-label`
- Error messages read by screen readers via `aria-live`

---

## Test Cases

| # | Input | Action | Expected |
|---|-------|--------|----------|
| 1 | `{"a":1,"b":[2,3]}` | Format | Indented 2-space output |
| 2 | `{"a":1}` | Minify | `{"a":1}` |
| 3 | `{invalid}` | Validate | Error with line:column |
| 4 | `{"b":2,"a":1}` | Format+Sort | `{"a":1,"b":2}` |
| 5 | Empty | Format | "Enter JSON text" prompt |
| 6 | Nested objects | Format | Correct deep indentation |

---

## Known Gaps

- Only `layout="editor"` — not the standard `io` layout (JSON has no separate input/output workflow)
- JSON quickly reaches browser memory limits for >10MB files
- No streaming/chunked parsing

---

## Definition of Done

- [ ] All Must Have features working
- [ ] Logic tests pass
- [ ] `npm run validate:layout` passes
- [ ] Spec document complete
