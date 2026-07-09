---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Plugin Specification: SQL

> **Status**: Released | **SSOT**: This document.

---

## Basic Information

| Field | Value |
|-------|-------|
| **Plugin Name** | SQL |
| **Plugin ID** | `sql` |
| **Category** | `formatter` |
| **Description** | Build SQL IN lists from batch values |
| **Version** | `1.0.0` |
| **Priority** | `P1` |
| **Sprint** | Sprint 02 — Formatters |
| **Milestone** | v1.0.0-beta.2 |

---

## Overview

SQL IN list builder. Parses batch values (one per line) and generates formatted SQL `IN (...)` clauses. Supports string and number value types, single-line and multi-line output, optional parentheses wrapping, and deduplication. Uses discriminated union return types (`SqlBuildOutcome`) for success/empty/error states.

---

## User Goals

```
As a developer,
I want to build SQL IN lists from batch data,
So that I can quickly construct SQL queries without manual formatting.
```

---

## Features

### Must Have (P0)
- [x] Parse batch values (one per line)
- [x] String value type with SQL escaping (single quotes doubled)
- [x] Number value type with validation
- [x] Single-line and multi-line output formatting
- [x] Optional parentheses wrapping
- [x] Remove duplicates option

### Should Have (P1)
- [ ] Full SQL formatter (SELECT, INSERT, etc.)
- [ ] SQL syntax highlighting

---

## Input

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| Values | text | Yes | One value per line |
| Value Type | select | No | String (default) or Number |
| Output Layout | select | No | Single Line or Multi Line |
| Wrap Parentheses | checkbox | No | Wrap output in `(...)` |
| Remove Duplicates | checkbox | No | Deduplicate values |

## Output

| Output | Format | Description |
|--------|--------|-------------|
| SQL Clause | text | Formatted `IN (value1, value2, ...)` or `IN (\n  value1,\n  value2\n)` |

## Actions

| Action | Description |
|--------|-------------|
| Convert | Build SQL IN list (Cmd+Enter) |
| Copy Result | Copy to clipboard |
| Clear | Clear input and output |

---

## Validation

- Number type: each line must be a valid number (reports line number on error)
- Empty input: returns "No values entered"
- Line-by-line parsing — does NOT split on commas within lines

---

## Layout Requirements

- Uses `ToolLayout layout="io"` as outer shell
- Uses `ToolWorkspace layout="io"` with input/output `InputOutputPanel`
- Output panel has `readonly`
- Uses `ToolActionBar` for primary and secondary actions
- Uses `ToolOptionsRow` with `ToolSegmentedControl` for Value Type and Output Layout, plus checkboxes

---

## Accessibility

- Textarea has `aria-label`
- Primary button uses `aria-label`
- Monospaced font for SQL output

---

## Test Cases

| # | Input | Type | Layout | Expected |
|---|-------|------|--------|----------|
| 1 | `a\nb\nc` | String | Single | `IN ('a', 'b', 'c')` |
| 2 | `1\n2\n3` | Number | Single | `IN (1, 2, 3)` |
| 3 | `a\na` with dedupe | String | Single | `IN ('a')` |
| 4 | `a\nb\nc` | String | Multi | Multi-line with indentation |
| 5 | `"it's"` | String | Single | `IN ('it''s')` (escaped) |
| 6 | Empty | — | — | "No values entered" |

---

## Known Gaps

- Only IN list builder — not a general SQL formatter
- No syntax highlighting
- No database connection or query execution

---

## Definition of Done

- [ ] All Must Have features working
- [ ] Logic tests pass
- [ ] `npm run validate:layout` passes
- [ ] Spec document complete
