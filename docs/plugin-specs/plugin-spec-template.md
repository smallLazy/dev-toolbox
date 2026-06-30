# Plugin Specification: `<PluginName>`

> **Status**: Draft | Review | Approved | In Development | Released
> **Rule**: This spec is the SSOT. No code before spec is approved.

---

## Basic Information

| Field | Value |
|-------|-------|
| **Plugin Name** | `<English name>` |
| **Plugin ID** | `<kebab-case>` |
| **Category** | `encoding \| crypto \| formatter \| converter \| network \| enterprise \| ai \| analyzer \| utility` |
| **Description** | `<One sentence>` |
| **Version** | `1.0.0` |
| **Priority** | `P0 \| P1 \| P2` |
| **Owner** | `<GitHub handle>` |
| **Sprint** | `Sprint 01 — Core Utilities` |
| **Milestone** | `v1.0.0-beta.1` |

---

## User Story

```
As a developer,
I want to <action>,
So that <benefit>.
```

---

## Goals

- **Primary**: `<Main goal>`
- **Secondary**: `<Additional goal>`

---

## Features

### Must Have (P0)
- [ ] `<Feature 1>`
- [ ] `<Feature 2>`

### Should Have (P1)
- [ ] `<Feature 3>`

### Nice to Have (P2)
- [ ] `<Feature 4>`

### Future
- [ ] `<Feature 5>`

---

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `<input1>` | `text` | Yes | `<desc>` |

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| `<output1>` | `text` | `<desc>` |

---

## Toolbar

| Action | Icon | Shortcut | Enabled |
|--------|------|----------|---------|
| Execute | Play | `⌘Enter` | Always |
| Copy Output | Copy | `⌘Shift C` | When output exists |
| Clear | Trash | — | Always |
| Swap I/O | Refresh | — | When output exists |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘Enter` | Execute |
| `⌘Shift C` | Copy output |
| `⌘K` | Search tools |

---

## Settings

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `<key>` | `select \| toggle \| input \| number` | `<value>` | `<desc>` |

---

## History

- **Enabled**: Yes
- **Max Items**: 20
- **Fields Stored**: input, output, config, timestamp

---

## Search Keywords

```
<keyword1>, <keyword2>, <keyword3>, <中文1>, <中文2>
```
Minimum 8 keywords (mix of EN + CN).

---

## UI Layout

```
┌──────────────────────────────────────────┐
│ Page Title                                │
│ Description                          ⌘Enter │
├──────────────────────────────────────────┤
│ Card: Configuration                       │
│ ┌──────────────────────────────────────┐ │
│ │ [Mode Switch]  [Options...]         │ │
│ └──────────────────────────────────────┘ │
│                                           │
│ Card: Input                               │
│ ┌──────────────────────────────────────┐ │
│ │ textarea / editor                    │ │
│ └──────────────────────────────────────┘ │
│                                           │
│ [Execute] [Copy] [Clear] [Swap]           │
│                                           │
│ Card: Output (conditional)                │
│ ┌──────────────────────────────────────┐ │
│ │ readonly textarea                    │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Empty input | Show validation error |
| Very large input (>1MB) | Process without freezing |
| Unicode characters | Handle correctly |
| Invalid format | Show clear error message |
| Rapid double-click | Ignore second click while loading |

---

## Error Messages

| Condition | Message |
|-----------|---------|
| Empty input | "Input is empty" |
| Invalid input | "Invalid format: <details>" |
| Processing error | "Error: <details>" |

---

## Accessibility

- [ ] All inputs have labels
- [ ] Focus visible on all interactive elements
- [ ] Keyboard navigable (Tab, Enter, Esc)
- [ ] Screen reader friendly (aria-labels)

---

## Performance

| Metric | Target |
|--------|--------|
| First paint | < 200ms |
| Processing 1KB input | < 50ms |
| Processing 1MB input | < 2s |
| Memory usage | < 50MB |

---

## Test Cases

| # | Input | Expected Output | Notes |
|---|-------|-----------------|-------|
| 1 | `<normal input>` | `<expected>` | Happy path |
| 2 | `""` (empty) | Error: "Input is empty" | Empty check |
| 3 | `<invalid input>` | Error: "Invalid format" | Validation |
| 4 | `<unicode input>` | `<expected>` | Unicode support |
| 5 | `<large input>` | `<expected>` | Performance |

---

## Benchmark (vs DevToys)

| Dimension | DevToys | Our Target | Notes |
|-----------|---------|------------|-------|
| Has this tool? | Yes/No | Yes | |
| Keyboard shortcut | — | `⌘Enter` | |
| History | — | Yes | |
| Favorites | — | Yes | |
| Search keywords | — | 8+ | |
| Settings persistence | — | Yes | |

---

## Acceptance Criteria

- [ ] All Must Have features implemented
- [ ] All test cases pass
- [ ] 17 Quality Gates pass
- [ ] Benchmark meets or exceeds DevToys
- [ ] Code review approved
- [ ] Spec updated with any changes during development

---

> **Template Version**: v1.0
> **Last Updated**: 2026-07-30
