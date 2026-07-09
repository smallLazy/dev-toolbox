---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Plugin Specification: URL

> **Status**: Released | **SSOT**: This document.

---

## Basic Information

| Field | Value |
|-------|-------|
| **Plugin Name** | URL |
| **Plugin ID** | `url` |
| **Category** | `encoding` |
| **Description** | Encode and decode URLs using URI or component modes |
| **Version** | `1.0.0` |
| **Priority** | `P0` |
| **Sprint** | Sprint 01 — Core Utilities |
| **Milestone** | v1.0.0-beta.1 |

---

## Overview

URL encoder and decoder. Supports three variants: Component (`encodeURIComponent`), URI (`encodeURI`), and PHP (hand-written byte-level encoding matching Rust behavior — space to `+`, uppercase hex). The PHP variant is used internally by the PHP Compatible preset and is not exposed in the UI.

---

## User Goals

```
As a developer,
I want to encode and decode URL strings,
So that I can build query parameters, handle path segments, and debug URL encoding issues.
```

---

## Features

### Must Have (P0)
- [x] URL component encoding (encodes all special characters)
- [x] URL component decoding
- [x] URI encoding (preserves URL structure characters)
- [x] URI decoding
- [x] PHP-compatible encoding (space → `+`, uppercase hex)
- [x] Malformed percent encoding detection

### Should Have (P1)
- [ ] Query string parser
- [ ] URL split (scheme, host, path, query, fragment)

---

## Input

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| Text | text | Yes | Text to encode or decode |
| Mode | select | Yes | Encode or Decode |
| Variant | select | Yes | Component or URI |

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

- Decode: detects malformed percent encoding (e.g., `%ZZ`)
- Decode: `tryDecodeUrl()` returns safe result, never throws
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
| 1 | `"hello world"` | Encode | Component | `hello%20world` |
| 2 | `hello%20world` | Decode | Component | `hello world` |
| 3 | `https://example.com/path?q=abc` | Encode | URI | `://` and `?` preserved |
| 4 | `"hello world"` | Encode | PHP | `hello+world` |
| 5 | `%ZZ` | Decode | either | Malformed encoding error |
| 6 | Empty | Encode | either | Empty output |
| 7 | Chinese text | Encode→Decode | Component | Roundtrip correct |

---

## Known Gaps

- PHP variant not exposed in UI (used only by PHP Compatible preset)
- No URL parsing (scheme, host, path, query, fragment separation)
- No query string parameter editor

---

## Definition of Done

- [ ] All Must Have features working
- [ ] Logic tests pass
- [ ] `npm run validate:layout` passes
- [ ] Spec document complete
