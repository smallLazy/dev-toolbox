---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Plugin Specification: Unicode

> **Status**: Released | **SSOT**: This document.

---

## Basic Information

| Field | Value |
|-------|-------|
| **Plugin Name** | Unicode |
| **Plugin ID** | `unicode` |
| **Category** | `encoding` |
| **Description** | Encode and decode Unicode escape sequences |
| **Version** | `1.0.0` |
| **Priority** | `P1` |
| **Sprint** | Sprint 02 — Encoding |
| **Milestone** | v1.0.0-beta.2 |

---

## Overview

Unicode escape sequence encoder and decoder. Supports two variants: JavaScript (`\uXXXX`) with surrogate pair support for supplementary planes, and Code Point (`U+XXXX`/`U+XXXXXX`) space-separated. Full surrogate pair validation on decode. ASCII bypass for printable characters in JS encoding mode.

---

## User Goals

```
As a developer,
I want to convert between text and Unicode escape sequences,
So that I can handle Unicode in source code, config files, and debugging.
```

---

## Features

### Must Have (P0)
- [x] JavaScript Unicode encoding (`\uXXXX` with surrogate pairs)
- [x] JavaScript Unicode decoding
- [x] Code Point encoding (`U+XXXX` / `U+XXXXXX`)
- [x] Code Point decoding
- [x] ASCII bypass for printable characters

### Should Have (P1)
- [ ] Additional escape formats (Python `\uXXXX`, CSS `\XXXX`, HTML `&#XXXX;`)
- [ ] Character information display (name, category, block)

---

## Input

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| Text | text | Yes | Text to encode or decode |
| Mode | select | Yes | Encode or Decode |
| Variant | select | Yes | JavaScript (`\uXXXX`) or Code Point (`U+XXXX`) |

## Output

| Output | Format | Description |
|--------|--------|-------------|
| Result | text | Encoded or decoded text |

## Actions

| Action | Description |
|--------|-------------|
| Encode / Decode | Execute transformation (Cmd+Enter) |
| Copy Output | Copy result to clipboard |
| Swap I/O | Swap input and output |
| Clear | Clear all fields |

---

## Validation

- Decode: validates surrogate pair correctness (high/low order, invalid surrogates)
- Decode: handles incomplete/trailing escape sequences
- Malformed escapes produce error messages with position reporting
- 50MB input size limit

---

## Layout Requirements

- Uses `ToolLayout layout="io"` as outer shell
- Uses `ToolWorkspace layout="io"` with input/output `InputOutputPanel`
- Output panel has `readonly`
- Uses `ToolActionBar` for primary and secondary actions
- Uses `ToolOptionsRow` with two `ToolSegmentedControl`s for Mode and Variant

---

## Accessibility

- Textarea has `aria-label`
- Primary button uses `aria-label`
- Output panel uses `aria-live`

---

## Test Cases

| # | Input | Mode | Variant | Expected |
|---|-------|------|---------|----------|
| 1 | `"你好"` | Encode | JS | `你好` |
| 2 | `你好` | Decode | JS | `你好` |
| 3 | `"你好"` | Encode | Code Point | `U+4F60 U+597D` |
| 4 | `U+4F60 U+597D` | Decode | Code Point | `你好` |
| 5 | `"🎉"` (U+1F389) | Encode | JS | `🎉` (surrogate pair) |
| 6 | `🎉` | Decode | JS | `🎉` |
| 7 | Invalid surrogate | Decode | JS | Error with position |

---

## Known Gaps

- Only two encoding variants (JS and Code Point)
- No character information display (Unicode name, block, category)
- No Python/CSS/HTML entity encoding formats

---

## Definition of Done

- [ ] All Must Have features working
- [ ] Logic tests pass
- [ ] `npm run validate:layout` passes
- [ ] Spec document complete
