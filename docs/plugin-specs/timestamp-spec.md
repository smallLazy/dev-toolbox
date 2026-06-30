# Plugin Specification: Timestamp

> **Status**: Draft | **SSOT**: This document.

---

## Basic Information

| Field | Value |
|-------|-------|
| **Plugin Name** | Timestamp |
| **Plugin ID** | `timestamp` |
| **Category** | `converter` |
| **Description** | Convert between Unix timestamps and human-readable dates |
| **Version** | `1.0.0` |
| **Priority** | `P0` |
| **Sprint** | Sprint 01 — Core Utilities |
| **Milestone** | v1.0.0-beta.1 |

---

## User Story

```
As a developer,
I want to convert between Unix timestamps and dates,
So that I can debug time-related issues in logs, APIs, and databases.
```

---

## Features

### Must Have (P0)
- [ ] Timestamp → Date conversion (seconds & milliseconds auto-detect)
- [ ] Date → Timestamp conversion
- [ ] Live clock display (current time, updates every second)
- [ ] Multiple timezone support (UTC, Local, custom offset)
- [ ] Copy result to clipboard

### Should Have (P1)
- [ ] ISO 8601 output
- [ ] RFC 2822 output
- [ ] Relative time ("2 hours ago")
- [ ] History

### Nice to Have (P2)
- [ ] Date picker widget
- [ ] Batch conversion
- [ ] Timezone database (IANA)

---

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| Timestamp | text | Yes (→Date mode) | Seconds or milliseconds, auto-detected |
| Date string | text | Yes (→Timestamp mode) | ISO 8601 or natural language |

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| Date | text | Formatted date in selected timezone |
| Timestamp | text | Unix seconds + milliseconds |

## Toolbar

| Action | Icon | Shortcut |
|--------|------|----------|
| Convert | Play | `⌘Enter` |
| Copy | Copy | `⌘Shift C` |
| Swap Mode | Refresh | — |
| Clear | Trash | — |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘Enter` | Convert |
| `⌘Shift C` | Copy result |

## Settings

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `defaultTimezone` | select | `local` | Default timezone |
| `defaultFormat` | select | `ISO 8601` | Default output format |

## Search Keywords

```
timestamp, unix, epoch, date, time, convert, iso8601, utc, 时间戳, 日期, 转换
```

## UI Layout

```
┌──────────────────────────────────────────┐
│ Timestamp                        ⌘Enter  │
│ Unix timestamp ↔ Date conversion         │
├──────────────────────────────────────────┤
│ ┌─ Live Clock ─────────────────────────┐ │
│ │ 2026-07-30 14:30:00 CST             │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ Card: Timestamp → Date                    │
│ [1700000000          ] [Convert]          │
│ → 2023-11-14T22:13:20Z                   │
├──────────────────────────────────────────┤
│ Card: Date → Timestamp                    │
│ [2024-01-01T00:00:00Z] [Convert]          │
│ → 1704067200 (1704067200000 ms)           │
└──────────────────────────────────────────┘
```

## Test Cases

| # | Input | Mode | Expected |
|---|-------|------|----------|
| 1 | `1700000000` | →Date | `2023-11-14T22:13:20.000Z` |
| 2 | `1700000000000` | →Date | (same, ms auto-detect) |
| 3 | `2024-01-01T00:00:00Z` | →Timestamp | `1704067200` |
| 4 | `"abc"` | →Date | Error: "Invalid timestamp" |
| 5 | `""` | →Date | Error: "Input is empty" |

## Acceptance Criteria

- [ ] All Must Have features working
- [ ] 5 test cases pass
- [ ] 17 Quality Gates pass
- [ ] Live clock updates every second without memory leak
