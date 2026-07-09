---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Plugin Specification: Hash

> **Status**: Released | **SSOT**: This document.

---

## Basic Information

| Field | Value |
|-------|-------|
| **Plugin Name** | Hash |
| **Plugin ID** | `hash` |
| **Category** | `crypto` |
| **Description** | Generate MD5 and SHA-256 hashes |
| **Version** | `1.0.0` |
| **Priority** | `P0` |
| **Sprint** | Sprint 01 — Core Utilities |
| **Milestone** | v1.0.0-beta.1 |

---

## Overview

Cryptographic hash generator supporting MD5 and SHA-256. MD5 uses a pure-JS implementation (RFC 1321). SHA-256 uses the Web Crypto API. Output is displayed in lowercase hex.

---

## User Goals

```
As a developer,
I want to generate checksums for text content,
So that I can verify data integrity and detect accidental changes.
```

---

## Features

### Must Have (P0)
- [x] MD5 hash generation (pure JS RFC 1321)
- [x] SHA-256 hash generation (Web Crypto API)
- [x] Algorithm switching via segmented control

### Should Have (P1)
- [ ] SHA-1 support
- [ ] SHA-512 support
- [ ] File hashing

### Nice to Have (P2)
- [ ] HMAC mode
- [ ] Uppercase hex output toggle

---

## Input

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| Text | text | Yes | Content to hash |
| Algorithm | select | Yes | MD5 or SHA-256 |

## Output

| Output | Format | Description |
|--------|--------|-------------|
| Hash | text | Lowercase hex hash string (32 chars for MD5, 64 for SHA-256) |

## Actions

| Action | Description |
|--------|-------------|
| Generate | Compute hash (Cmd+Enter) |
| Copy Output | Copy hash to clipboard |
| Clear | Clear input and output |

---

## Validation

- 50MB input size limit
- Empty input returns the empty-string hash (standard behavior)

---

## Layout Requirements

- Uses `ToolLayout layout="io"` as outer shell
- Uses `ToolWorkspace layout="io"` with input/output `InputOutputPanel`
- Output panel has `readonly`
- Uses `ToolActionBar` for primary and secondary actions
- Uses `ToolOptionsRow` with `ToolSegmentedControl` for algorithm selection

---

## Accessibility

- Textarea has `aria-label`
- Primary button uses `aria-label`
- Output uses `aria-live="polite"` for screen readers

---

## Test Cases

| # | Input | Algorithm | Expected |
|---|-------|-----------|----------|
| 1 | `""` (empty) | MD5 | `d41d8cd98f00b204e9800998ecf8427e` |
| 2 | `"abc"` | MD5 | `900150983cd24fb0d6963f7d28e17f72` |
| 3 | `""` (empty) | SHA-256 | `e3b0c44298fc1c149afbf4c8996fb924...` |
| 4 | Chinese text | either | Non-empty hex output |
| 5 | 10KB text | either | Consistent repeatable output |

---

## Known Gaps

- MD5 is cryptographically broken — noted in tool description
- Only SHA-256 from SHA-2 family (no SHA-1, SHA-384, SHA-512)
- No file hashing support
- No HMAC keyed hash

---

## Definition of Done

- [ ] All Must Have features working
- [ ] Logic tests pass
- [ ] `npm run validate:layout` passes
- [ ] Spec document complete
