---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Plugin Specification: JWT

> **Status**: Released | **SSOT**: This document.

---

## Basic Information

| Field | Value |
|-------|-------|
| **Plugin Name** | JWT |
| **Plugin ID** | `jwt` |
| **Category** | `encoding` |
| **Description** | Decode JSON Web Tokens locally |
| **Version** | `1.0.0` |
| **Priority** | `P0` |
| **Sprint** | Sprint 01 — Core Utilities |
| **Milestone** | v1.0.0-beta.1 |

---

## Overview

Client-side JWT decoder. Parses and displays header, payload, and signature sections. Extracts registered time claims (exp, iat, nbf) with human-readable dates. This tool decodes tokens locally — it does NOT verify signatures.

---

## User Goals

```
As a developer,
I want to decode and inspect JWT tokens,
So that I can debug authentication issues and understand token contents.
```

---

## Features

### Must Have (P0)
- [x] Parse three-part JWT tokens
- [x] Display Header JSON
- [x] Display Payload JSON
- [x] Display Signature hex
- [x] Extract and format time claims (exp, iat, nbf)
- [x] Expiry detection (expired / active status)
- [x] Load example token

### Should Have (P1)
- [ ] Signature verification (needs key input)
- [ ] JWKS endpoint support

---

## Input

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| JWT Token | text | Yes | Three-part base64url-encoded token |

## Output

| Output | Format | Description |
|--------|--------|-------------|
| Decoded JWT | structured text | Header, Payload (formatted JSON), Registered Claims, Signature |

## Actions

| Action | Description |
|--------|-------------|
| Decode | Parse JWT (Cmd+Enter) |
| Copy Output | Copy decoded result to clipboard |
| Clear | Clear input and output |
| Example | Load a sample JWT token |

---

## Validation

- Must contain exactly 2 dots (3 parts)
- Each part must be valid base64url
- Header and Payload must parse as valid JSON
- 6 error codes: format, encoding, JSON (header), JSON (payload)

---

## Layout Requirements

- Uses `ToolLayout layout="io"` as outer shell
- Uses custom `ToolHeader` in `#header` slot with privacy notice
- Uses `ToolWorkspace layout="io"` with input/output `InputOutputPanel`
- Output panel has `readonly`
- Uses `ToolActionBar` for primary and secondary actions

---

## Accessibility

- Textarea has `aria-label`
- Primary button uses `aria-label`
- Privacy notice visible to all users
- Output uses `aria-live`

---

## Test Cases

| # | Input | Expected |
|---|-------|----------|
| 1 | Valid 3-part JWT | Header, Payload, Signature displayed |
| 2 | `"a.b"` (2 parts) | "Invalid JWT format" |
| 3 | Invalid base64url | Encoding error |
| 4 | Non-JSON payload | "[Unable to parse Payload]" |
| 5 | Expired token | "Token has expired" warning |
| 6 | Valid future exp | "Token valid until ..." |

---

## Known Gaps

- No signature verification (requires key management)
- No JWKS / OIDC discovery support
- Pretty-print toggle via plugin settings, not view options

---

## Definition of Done

- [ ] All Must Have features working
- [ ] Logic tests pass
- [ ] `npm run validate:layout` passes
- [ ] Spec document complete
