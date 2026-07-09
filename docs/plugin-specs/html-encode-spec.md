---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Plugin Specification: HTML

> **Status**: Released | **SSOT**: This document.

---

## Basic Information

| Field | Value |
|-------|-------|
| **Plugin Name** | HTML |
| **Plugin ID** | `html-encode` |
| **Category** | `encoding` |
| **Description** | Encode and decode HTML entities |
| **Version** | `1.0.0` |
| **Priority** | `P1` |
| **Sprint** | Sprint 02 — Encoding |
| **Milestone** | v1.0.0-beta.2 |

---

## Overview

HTML entity encoder and decoder. Encodes special characters (`<`, `>`, `&`, `"`, `'`) to their entity equivalents. Encodes `&` first to avoid corrupting already-escaped sequences. The decoder is lenient — unknown or incomplete entities are left as-is rather than throwing errors.

---

## User Goals

```
As a developer,
I want to encode and decode HTML entities,
So that I can safely embed text in HTML documents and debug entity issues.
```

---

## Features

### Must Have (P0)
- [x] Encode text to HTML entities (`<` → `&lt;`)
- [x] Decode HTML entities back to text
- [x] Lenient decoder (never throws, unknown entities left as-is)

### Should Have (P1)
- [ ] Named entity reference list
- [ ] Numeric entity mode (hex/dec toggle)

---

## Input

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| Text | text | Yes | Text to encode or decode |
| Mode | select | Yes | Encode or Decode |

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
| Clear | Clear input and output |

---

## Validation

- Empty input returns empty output
- Decoder handles malformed entities gracefully
- No input size limit beyond browser memory

---

## Layout Requirements

- Uses `ToolLayout layout="io"` as outer shell
- Uses `ToolWorkspace layout="io"` with input/output `InputOutputPanel`
- Output panel has `readonly`
- Uses `ToolActionBar` for primary and secondary actions
- Uses `ToolOptionsRow` with `ToolSegmentedControl` for mode selection

---

## Accessibility

- Textarea has `aria-label`
- Primary button uses `aria-label`
- Output panel uses `aria-live` for screen reader updates

---

## Test Cases

| # | Input | Mode | Expected |
|---|-------|------|----------|
| 1 | `<script>alert(1)</script>` | Encode | `&lt;script&gt;alert(1)&lt;/script&gt;` |
| 2 | `&lt;div&gt;` | Decode | `<div>` |
| 3 | `"quotes" & 'apos'` | Encode | `&quot;quotes&quot; &amp; &apos;apos&apos;` |
| 4 | Empty | Encode | Empty |
| 5 | `&unknown;` | Decode | `&unknown;` (left as-is) |
| 6 | Roundtrip | Encode→Decode | Original text recovered |

---

## Known Gaps

- Only the 5 basic XML entities (`&`, `<`, `>`, `"`, `'`) are encoded
- No full HTML5 named entity database
- No hex/dec numeric entity toggle

---

## Definition of Done

- [ ] All Must Have features working
- [ ] Logic tests pass
- [ ] `npm run validate:layout` passes
- [ ] Spec document complete
