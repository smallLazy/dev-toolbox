# Plugin Specification: Base64

> **Status**: In Development | **SSOT**: This document.

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
| **Sprint** | Sprint 01 — Core Utilities |
| **Milestone** | v1.0.0-beta.1 |

---

## User Story

```
As a developer,
I want to encode/decode text between plain text and Base64,
So that I can work with Base64-encoded data in APIs, configs, and URLs.
```

---

## Goals

- **Primary**: Reliable Base64 encode/decode with Unicode (Chinese, emoji) support
- **Secondary**: Fast processing for large inputs, clipboard integration

---

## Features

### Must Have (P0)
- [x] Encode text → Base64
- [x] Decode Base64 → text
- [x] Unicode support (Chinese, emoji)
- [x] Empty input validation
- [x] Invalid Base64 error handling

### Should Have (P1)
- [ ] Copy output to clipboard
- [ ] Swap input/output
- [ ] Character count display
- [ ] History (last 20)

### Nice to Have (P2)
- [ ] File encode/decode (drag & drop)
- [ ] URL-safe Base64 variant
- [ ] Line wrapping option (76 chars)

---

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| Text | textarea | Yes | Plain text or Base64 string |

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| Encoded/Decoded text | text | Result in readonly textarea |

## Toolbar

| Action | Icon | Shortcut | Enabled |
|--------|------|----------|---------|
| Encode/Decode | Play | `⌘Enter` | Always |
| Copy Output | Copy | `⌘Shift C` | When output |
| Clear | Trash | — | Always |
| Swap Mode | Refresh | — | Always |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘Enter` | Execute |
| `⌘Shift C` | Copy output |

## Settings

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `defaultMode` | select | `encode` | Default mode on open |

## History

- **Enabled**: Yes, max 20 items
- **Fields**: input, output, mode, timestamp

## Search Keywords

```
base64, encode, decode, binary, text, unicode, 编码, 解码, base64url
```

## UI Layout

```
┌──────────────────────────────────────────┐
│ Base64                           ⌘Enter  │
│ Encode and decode text to/from Base64    │
├──────────────────────────────────────────┤
│ Card: Configuration                       │
│ [Encode | Decode]                         │
├──────────────────────────────────────────┤
│ Card: Input                               │
│ [                                        ] │
├──────────────────────────────────────────┤
│ [Execute] [Copy] [Clear] [Swap]           │
├──────────────────────────────────────────┤
│ Card: Output                              │
│ [                              readonly ] │
└──────────────────────────────────────────┘
```

## Test Cases

| # | Input | Mode | Expected |
|---|-------|------|----------|
| 1 | `Hello World` | Encode | `SGVsbG8gV29ybGQ=` |
| 2 | `SGVsbG8gV29ybGQ=` | Decode | `Hello World` |
| 3 | `你好世界` | Encode→Decode | Roundtrip OK |
| 4 | `""` | Encode | Error: "Input is empty" |
| 5 | `!!!not-base64!!!` | Decode | Error: "Invalid Base64" |

## Acceptance Criteria

- [ ] All Must Have features working
- [ ] 5 test cases pass
- [ ] 17 Quality Gates pass
- [ ] Unicode roundtrip verified
