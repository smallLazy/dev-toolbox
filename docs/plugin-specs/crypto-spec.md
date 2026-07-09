---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Plugin Specification: AES

> **Status**: Released | **SSOT**: This document.

---

## Basic Information

| Field | Value |
|-------|-------|
| **Plugin Name** | AES |
| **Plugin ID** | `crypto` |
| **Category** | `crypto` |
| **Description** | AES-256 symmetric encryption using CBC or ECB mode |
| **Version** | `1.0.0` |
| **Priority** | `P0` |
| **Sprint** | Sprint 01 — Core Utilities |
| **Milestone** | v1.0.0-beta.1 |

---

## Overview

AES-256 symmetric encryption tool. Actual AES operations run in a Rust backend via Tauri IPC. Supports two algorithms (CBC, ECB) and multiple encodings for key, IV, input, and output independently.

---

## User Goals

```
As a developer,
I want to encrypt and decrypt text using AES-256,
So that I can protect sensitive data with standard symmetric encryption.
```

---

## Features

### Must Have (P0)
- [x] AES-256-CBC encryption / decryption
- [x] AES-256-ECB encryption / decryption
- [x] Rust backend execution (not JavaScript)
- [x] Multiple key/IV encodings: UTF-8, Hex, Base64
- [x] Input/output encoding: UTF-8, Hex, Base64

### Should Have (P1)
- [ ] AES-GCM support
- [ ] AES-CTR support

---

## Input

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| Plaintext / Ciphertext | text | Yes | Text to encrypt or decrypt |
| Key | text | Yes | 32-byte key (256-bit) |
| IV | text | CBC only | 16-byte initialization vector |
| Algorithm | select | Yes | CBC or ECB |
| Key Encoding | select | Yes | UTF-8, Hex, Base64 |
| IV Encoding | select | Yes | UTF-8, Hex, Base64 |
| Input Encoding | select | Yes | UTF-8, Hex, Base64 |
| Output Encoding | select | Yes | Hex, Base64 |

## Output

| Output | Format | Description |
|--------|--------|-------------|
| Result | text | Encrypted or decrypted text in selected output encoding |

## Actions

| Action | Description |
|--------|-------------|
| Encrypt / Decrypt | Execute AES operation (Cmd+Enter) |
| Copy Output | Copy result to clipboard |
| Swap I/O | Swap input and output content |
| Clear | Clear all fields |

---

## Validation

- Key length must be exactly 32 bytes (after decoding from selected encoding)
- IV length must be exactly 16 bytes for CBC mode
- Hex input must be valid hexadecimal
- Base64 input must be valid RFC 4648
- ECB mode rejects tampered ciphertext with PKCS7 padding error

---

## Layout Requirements

- Uses `ToolLayout layout="io"` as outer shell
- Uses `ToolWorkspace layout="io"` with input/output `InputOutputPanel`
- Output panel has `readonly`
- Uses `ToolActionBar` for primary and secondary actions
- Two-column options grid for algorithm/key/IV/encoding selects

---

## Accessibility

- All textareas have `aria-label` attributes
- Primary button uses `aria-label` with descriptive action name
- Focus ring visible on all interactive elements

---

## Test Cases

| # | Input | Expected |
|---|-------|----------|
| 1 | CBC encrypt + decrypt roundtrip | Original plaintext recovered |
| 2 | ECB encrypt + decrypt roundtrip | Original plaintext recovered |
| 3 | Invalid key length | Validation error |
| 4 | CBC without IV | Validation error |
| 5 | Invalid hex key | Decode error |
| 6 | Chinese text encrypt + decrypt | Correct roundtrip (UTF-8) |

---

## Known Gaps

- Only AES-256 supported (not AES-128 or AES-192)
- No GCM, CTR, or other AEAD modes
- IV must be manually entered (no random generation)
- No file encryption support

---

## Definition of Done

- [ ] All Must Have features working
- [ ] Rust backend 18 tests pass
- [ ] Frontend logic tests pass
- [ ] `npm run validate:layout` passes
- [ ] Spec document complete
