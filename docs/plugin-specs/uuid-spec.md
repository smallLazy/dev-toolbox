---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Plugin Specification: UUID

> **Status**: Draft | **SSOT**: This document.

---

## Basic Information

| Field | Value |
|-------|-------|
| **Plugin Name** | UUID |
| **Plugin ID** | `uuid` |
| **Category** | `utility` |
| **Description** | Generate and validate UUIDs (v1, v4, v7) |
| **Version** | `1.0.0` |
| **Priority** | `P1` |
| **Sprint** | Sprint 01 — Core Utilities |
| **Milestone** | v1.0.0-beta.1 |

---

## User Story

```
As a developer,
I want to generate UUIDs in different versions and validate existing ones,
So that I can quickly create unique identifiers for my applications.
```

---

## Features

### Must Have (P0)
- [ ] Generate UUID v4 (random)
- [ ] Generate UUID v7 (time-ordered)
- [ ] Copy to clipboard on click
- [ ] Batch generate (1-100)
- [ ] Validate UUID format

### Should Have (P1)
- [ ] UUID v1 (timestamp-based)
- [ ] Uppercase/lowercase toggle
- [ ] No-dash format
- [ ] History of generated UUIDs

### Nice to Have (P2)
- [ ] UUID v5 (namespace-based)
- [ ] Bulk export as JSON/CSV

---

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| Version | select | No | v4 (default), v1, v7 |
| Count | number | No | 1-100, default 1 |

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| UUID(s) | text | Generated UUID(s), one per line if batch |

## Toolbar

| Action | Icon | Shortcut |
|--------|------|----------|
| Generate | Play | `⌘Enter` |
| Copy | Copy | `⌘Shift C` |
| Clear | Trash | — |

## Search Keywords

```
uuid, guid, generate, unique, id, v4, v7, random, identifier, 唯一标识, 生成
```

## Test Cases

| # | Input | Expected |
|---|-------|----------|
| 1 | Generate v4 | 36 chars, format `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` |
| 2 | Generate v7 | 36 chars, time-ordered |
| 3 | Batch 5 | 5 UUIDs, one per line |
| 4 | Validate valid UUID | `true` |
| 5 | Validate `"not-uuid"` | `false` |

## Overview

UUID generation and validation tool. Supports v4 (random) and v7 (time-ordered) generation. Single-click copy, batch generation (1–100), and format validation.

## Validation

- Invalid UUID format: returns validation error with specific reason
- Batch count: clamped to 1–100 range

## Layout Requirements

- Uses `ToolLayout layout="io"` as outer shell
- Uses `ToolWorkspace layout="io"` with input/output `InputOutputPanel`
- Output panel has `readonly`
- Uses `ToolActionBar` for primary and secondary actions

## Accessibility

- All textareas have `aria-label` attributes
- Primary button uses `aria-label`
- Output panel uses `aria-live="polite"`

## Known Gaps

- UUID v1 not yet implemented (time-based, needs MAC address handling)
- UUID v5 not yet implemented (namespace-based)
- No uppercase/lowercase toggle exposed in UI

## Acceptance Criteria

- [ ] All Must Have features working
- [ ] 5 test cases pass
- [ ] 17 Quality Gates pass
