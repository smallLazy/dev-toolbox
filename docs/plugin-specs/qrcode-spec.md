---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Plugin Specification: QR Code

> **Status**: Released | **SSOT**: This document.

---

## Basic Information

| Field | Value |
|-------|-------|
| **Plugin Name** | QR Code |
| **Plugin ID** | `qrcode` |
| **Category** | `utility` |
| **Description** | Generate QR codes from text, URLs, and other content |
| **Version** | `1.0.0` |
| **Priority** | `P1` |
| **Sprint** | Sprint 02 — Utilities |
| **Milestone** | v1.0.0-beta.2 |

---

## Overview

QR code generator using the `qrcode` npm package. Converts text input to a PNG data URL rendered as an image. Supports configurable size, error correction level, and margin. Output can be copied as an image or downloaded as a PNG file.

---

## User Goals

```
As a developer,
I want to generate QR codes from text and URLs,
So that I can create shareable QR codes for links, configs, and data.
```

---

## Features

### Must Have (P0)
- [x] Generate QR codes from text input
- [x] Configurable size (128, 256, 512, 1024)
- [x] Configurable error correction (L, M, Q, H)
- [x] Configurable margin (0–8)
- [x] Copy image to clipboard
- [x] Download as PNG

### Should Have (P1)
- [ ] QR code scanning / decoding
- [ ] Custom foreground/background colors

---

## Input

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| Content | text | Yes | Text, URL, or data to encode |
| Size | select | No | 128, 256 (default), 512, 1024 |
| Error Correction | select | No | L, M (default), Q, H |
| Margin | number | No | 0–8, default 4 |

## Output

| Output | Format | Description |
|--------|--------|-------------|
| QR Code | PNG image | Data URL rendered as `<img>` with pixelated scaling |

## Actions

| Action | Description |
|--------|-------------|
| Generate | Create QR code (Cmd+Enter) |
| Copy Image | Copy QR code image to clipboard |
| Download PNG | Save QR code as PNG file |
| Clear | Clear input |
| Load Sample | Load a sample GitHub URL |

---

## Validation

- Size must be one of: 128, 256, 512, 1024
- Margin clamped to 0–8
- Empty input disables Generate button
- npm `qrcode` library handles data length limits

---

## Layout Requirements

- Uses `ToolLayout layout="io"` as outer shell
- Uses `ToolWorkspace layout="io"` with text input panel and image output panel
- Output panel displays image (not textarea) — image uses `image-rendering: pixelated` for crisp display
- Inline options within the input panel (Size, Error Correction, Margin)
- Uses `ToolActionBar` for primary and secondary actions

---

## Accessibility

- Textarea has `aria-label`
- QR code image has `alt` text
- Primary button uses `aria-label`

---

## Test Cases

| # | Input | Expected |
|---|-------|----------|
| 1 | `"https://github.com"` | QR code PNG generated |
| 2 | Empty input | Generate button disabled |
| 3 | Load Sample | Auto-fills GitHub URL |
| 4 | Size 1024 | Larger image output |

---

## Known Gaps

- No QR code scanning/decoding capability
- No custom colors (always black on white)
- No SVG output format (only PNG data URL)
- Image output is not text — different from most tools

---

## Definition of Done

- [ ] All Must Have features working
- [ ] Logic tests pass
- [ ] `npm run validate:layout` passes
- [ ] Spec document complete
