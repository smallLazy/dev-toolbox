---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Plugin Specification: XML Formatter

> **Status**: Released | **SSOT**: This document.

---

## Basic Information

| Field | Value |
|-------|-------|
| **Plugin Name** | XML Formatter |
| **Plugin ID** | `xml` |
| **Category** | `formatter` |
| **Description** | Format, minify, and validate XML |
| **Version** | `1.0.0` |
| **Priority** | `P1` |
| **Sprint** | Sprint 02 — Formatters |
| **Milestone** | v1.0.0-beta.2 |

---

## Overview

XML manipulation tool. Pretty-prints, minifies, and validates XML. Uses the `xml-formatter` npm package for formatting and minification. Uses `DOMParser` for validation with graceful fallback. Supports configurable indent size (2, 4, or tab).

---

## User Goals

```
As a developer,
I want to format, validate, and minify XML data,
So that I can read, debug, and optimize XML payloads and config files.
```

---

## Features

### Must Have (P0)
- [x] XML pretty-print with configurable indent
- [x] XML minify (remove whitespace)
- [x] XML validation via DOMParser
- [x] Load sample XML

### Should Have (P1)
- [ ] XPath evaluation
- [ ] XML to JSON conversion

### Nice to Have (P2)
- [ ] XML schema (XSD) validation
- [ ] Tree view

---

## Input

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| XML text | text | Yes | XML string to process |
| Indent size | setting | No | 2, 4, or tab (plugin-level) |

## Output

| Output | Format | Description |
|--------|--------|-------------|
| Formatted XML | text | Pretty-printed or minified XML |
| Validation | text | Error message if invalid |

## Actions

| Action | Description |
|--------|-------------|
| Format | Pretty-print XML (Cmd+Enter) |
| Minify | Compress to single line |
| Validate | Check XML well-formedness |
| Copy Output | Copy result to clipboard |
| Clear | Clear input and output |
| Load Sample | Load sample XML and auto-format |

---

## Validation

- Uses `DOMParser` for validation
- Graceful fallback if `DOMParser` unavailable
- `transformXml` entry point never throws (returns structured result)

---

## Layout Requirements

- Uses `ToolLayout layout="io"` as outer shell
- Uses `ToolWorkspace layout="io"` with input/output `InputOutputPanel`
- Output panel has `readonly`
- Uses `ToolActionBar` with primary Format + secondary actions
- Monospaced editor

---

## Accessibility

- Textarea has `aria-label`
- Primary button uses `aria-label`
- Error messages read by screen readers

---

## Test Cases

| # | Input | Action | Expected |
|---|-------|--------|----------|
| 1 | `<root><a>1</a></root>` | Format | Indented multi-line XML |
| 2 | Formatted XML | Minify | Single-line XML |
| 3 | `<root><a>1</root>` | Validate | Error (mismatched tags) |
| 4 | Empty | Format | "Enter XML" prompt |
| 5 | Load Sample | Format | Well-formatted sample XML |

---

## Known Gaps

- Uses external `xml-formatter` npm package (not pure JS)
- No XSD/schema validation
- No XPath or XSLT support
- DOMParser fallback not available in all environments

---

## Definition of Done

- [ ] All Must Have features working
- [ ] Logic tests pass
- [ ] `npm run validate:layout` passes
- [ ] Spec document complete
