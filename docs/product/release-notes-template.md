---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# v{VERSION} — {RELEASE_NAME}

**Version**: v{VERSION}
**Application version**: {APP_VERSION}
**Release date**: {RELEASE_DATE}
**Status**: {STATUS}

---

## Current State

> {STATUS_ICON} **{STATUS_LABEL}**
> {STATUS_DETAILS}

---

## Changes

### Features

{FEATURE_LIST}

### Security Improvements

{SECURITY_LIST}

### Technical Improvements

{TECHNICAL_LIST}

---

## Supported Platforms

| Platform | Status |
|----------|--------|
| macOS arm64 (Apple Silicon) | {MACOS_ARM64_STATUS} |
| macOS x86_64 (Intel) | {MACOS_X86_STATUS} |
| Windows | {WINDOWS_STATUS} |
| Linux | {LINUX_STATUS} |

---

## Completed Verification

| # | Verification Item | Method | Result |
|---|-------------------|--------|--------|
{VERIFICATION_TABLE}

---

## Known Limitations

| # | Limitation | Impact | Target Fix |
|---|-----------|--------|------------|
{LIMITATIONS_TABLE}

---

## Changelog

### v{VERSION} ({RELEASE_DATE})

{CHANGELOG_ENTRIES}

---

## Run Instructions

```bash
# Prerequisites: Node.js >= 18, Rust (stable)
cd dev-toolbox
npm install

# Development mode
npm run tauri dev

# Production build
npm run tauri build
```

{RUN_NOTES}

---

## Feedback

Feedback template:

```
Module: {TOOL_NAME}
Action: {WHAT_YOU_DID}
Expected: {WHAT_YOU_EXPECTED}
Actual: {WHAT_ACTUALLY_HAPPENED}
Environment: macOS {VERSION}, {ARCH}
```
