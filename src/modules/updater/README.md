# Manual Update v1

> **Status**: Not Ready — pending first stable release + cross-platform smoke tests

## Overview

Manual update check for Dev Toolbox, triggered from the **About** page.

User clicks **Check for Updates** → if an update is available, a dialog shows version info, release notes, and a download button with progress tracking. After download, the user can install and restart.

## Scope (v1)

| Feature | Status |
|---------|--------|
| Manual check from About page | Implemented |
| Up-to-date status display | Implemented |
| UpdateAvailable dialog | Implemented |
| Download progress (%, bytes) | Implemented |
| Install & Restart | Implemented |
| Error handling (no crash) | Implemented |
| CI: updater artifacts + latest.json | Implemented |

## Out of Scope

- Startup auto-check
- Background periodic check
- Auto-download
- Beta channel
- China mirror
- Skip version
- Silent update
- Differential update

## Architecture

```
src/modules/updater/
├── logic.ts              # Pure functions: formatBytes, formatProgress, statusMessage
├── useUpdater.ts         # Composable: update state machine
├── UpdateDialog.vue      # Modal dialog with version info + progress + actions
├── README.md             # This file
└── __tests__/
    ├── logic.test.ts     # Unit tests for pure functions
    └── useUpdater.test.ts # State machine + composable tests
```

## Dependencies

| Layer | Package | Purpose |
|-------|---------|---------|
| Rust | `tauri-plugin-updater` v2 | Check, download, install updates |
| Rust | `tauri-plugin-process` v2 | Relaunch after install |
| JS | `@tauri-apps/plugin-updater` | Updater JS bindings |
| JS | `@tauri-apps/plugin-process` | Process JS bindings |

## Configuration

### tauri.conf.json

- `bundle.createUpdaterArtifacts`: `true`
- `bundle.targets`: includes `"updater"`
- `plugins.updater.active`: `true`
- `plugins.updater.dialog`: `false` (we use custom UpdateDialog; built-in native dialog disabled)
- `plugins.updater.endpoints`: `https://github.com/smallLazy/dev-toolbox/releases/latest/download/latest.json`
- `plugins.updater.windows.installMode`: `"passive"`

### latest.json

Tauri v2 static JSON manifest hosted at the GitHub Releases `latest` download URL.

**Platform artifacts:**
- macOS ARM: `.app.tar.gz`
- macOS x64: `.app.tar.gz`
- Windows x64: `.msi.zip` (MSI updater bundle; NSIS remains as manual install only)
- Linux x64: `.AppImage.tar.gz`

### Signing

Requires a minisign keypair:
- Private key + password → GitHub Secrets: `TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- Public key → embedded in `tauri.conf.json` (`plugins.updater.pubkey`)

### CI Env Var Compatibility

The release workflow passes **both** new and legacy env var names to Tauri bundler on all platforms:

| New Name (Tauri v2 preferred) | Legacy Name (fallback) | GitHub Secret Source |
|------------------------------|----------------------|---------------------|
| `TAURI_SIGNING_PRIVATE_KEY` | `TAURI_PRIVATE_KEY` | `secrets.TAURI_SIGNING_PRIVATE_KEY` |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | `TAURI_KEY_PASSWORD` | `secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD` |

This ensures compatibility regardless of which env var name the Tauri CLI / bundler version reads.

## States

```
IDLE → CHECKING → UP_TO_DATE (auto-dismiss after 5s)
                 → UPDATE_AVAILABLE → DOWNLOADING → READY_TO_INSTALL → INSTALLING
                 → ERROR (any state, with user-friendly message)
```

## Automated Testing

**29 tests** (all passing):
- `logic.test.ts`: formatBytes (8 cases), formatProgress (8 cases), statusMessage (3 cases)
- `useUpdater.test.ts`: initial state, check (no update, update found, error), download (success, progress, error), install (success, error, no pending), dismiss

---

## Manual Smoke Tests

> **Prerequisite**: A **stable release** must be published. **Beta/prerelease releases do NOT work** with the default endpoint.
>
> The endpoint `https://github.com/smallLazy/dev-toolbox/releases/latest/download/latest.json` resolves to the **latest stable (non-prerelease)** release only. If all releases are prerelease (e.g., `v0.1.0-beta.X`), the updater will receive a 404 and show an error or "Up to Date" depending on error handling.

---

### Precondition: Publish First Stable Release

```bash
# 1. Ensure keys are set as GitHub Secrets
#    - TAURI_SIGNING_PRIVATE_KEY = content of ~/.tauri/dev-toolbox.key
#    - TAURI_SIGNING_PRIVATE_KEY_PASSWORD = password used during key generation

# 2. Verify public key matches private key
echo "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEM0MTBFRkZCQjdCNTU3Q0EKUldUS1Y3VzMrKzhReE0xUm1hNllIRy9LenJCOVc2cThVTDkycXhBQ1J2SXVZb2RXZFg3RllYTXgK" | base64 -d
# Expected output starts with: untrusted comment: minisign public key: C410EFFBB7B557CA
# The private key at ~/.tauri/dev-toolbox.key MUST correspond to this public key.

# 3. Ensure version in tauri.conf.json is a stable semver (no -alpha/-beta/-rc suffix)
#    Example: "version": "0.1.0"

# 4. Tag and push
git tag v0.1.0
git push origin v0.1.0

# 5. Wait for the Release workflow to complete on all 4 platforms

# 6. Verify release assets
open https://github.com/smallLazy/dev-toolbox/releases/tag/v0.1.0
# Must include: latest.json, .app.tar.gz, .app.tar.gz.sig, .msi.zip, .msi.zip.sig,
#               .AppImage.tar.gz, .AppImage.tar.gz.sig

# 7. Verify latest.json is accessible
curl -sL https://github.com/smallLazy/dev-toolbox/releases/latest/download/latest.json | jq .
# Must return valid JSON with version, notes, pub_date, and 4 platform entries
```

---

### Old → New Upgrade Test Flow (v0.0.9 → v0.1.0)

```
Step 1: Publish "old" release (v0.0.9)
  # Temporarily change version in tauri.conf.json + package.json to "0.0.9"
  # Build normally (this release does NOT need updater artifacts on its own)
  # This simulates an older version already installed on a user's machine
  git tag v0.0.9 && git push origin v0.0.9
  # Wait for release workflow, then download + install v0.0.9

Step 2: Restore version and publish "new" stable release (v0.1.0)
  # Change version in tauri.conf.json + package.json back to "0.1.0"
  git tag v0.1.0 && git push origin v0.1.0
  # Wait for release workflow
  # Verify: curl -sL https://github.com/smallLazy/dev-toolbox/releases/latest/download/latest.json

Step 3: Launch old app (v0.0.9)
  # Install and open v0.0.9
  # Navigate to About page

Step 4: Trigger update
  # Click "Check for Updates"
  # → Should show "Checking..." spinner
  # → UpdateDialog appears: "Dev Toolbox v0.1.0 is available"
  # → Shows: Current v0.0.9 | Latest v0.1.0 | Date | Release Notes

Step 5: Download
  # Click "Download Update"
  # → Progress bar shows percentage
  # → Shows downloaded bytes / total bytes
  # → Progress updates in real time

Step 6: Install & Restart
  # After download completes, "Install & Restart" button appears
  # Click "Install & Restart"
  # → App exits
  # → New version is installed (passive mode on Windows)
  # → App relaunches as v0.1.0

Step 7: Verify upgrade
  # Open About page → version shows "0.1.0"
  # Verify all existing tools still work correctly
```

---

### macOS Smoke Test Checklist

| Case ID | Scenario | Steps | Expected | Status |
|---------|----------|-------|----------|--------|
| SMOKE-MAC-01 | Check — up to date | 1. Install v0.1.0 2. About → Check for Updates | Shows "Up to Date", auto-dismisses after 5s | — |
| SMOKE-MAC-02 | Check — update available | 1. Install v0.0.9 2. Publish v0.1.0 3. About → Check for Updates | UpdateDialog: current v0.0.9, latest v0.1.0, notes, date | — |
| SMOKE-MAC-03 | Download progress | 1. UpdateDialog open 2. Click "Download Update" | Progress bar fills; % and bytes update in real time | — |
| SMOKE-MAC-04 | Install & Restart | 1. Download complete 2. Click "Install & Restart" | App exits, installs v0.1.0, relaunches | — |
| SMOKE-MAC-05 | Network error | 1. Turn off Wi-Fi 2. Click "Check for Updates" | Error message in UpdateDialog; Close available; app doesn't crash | — |
| SMOKE-MAC-06 | Dialog dismiss | 1. UpdateDialog open 2. Click X or Cancel | Dialog closes; About page still visible; no side effects | — |
| SMOKE-MAC-07 | Visual — design tokens | 1. View UpdateDialog on macOS | Overlay + card + buttons use Design Tokens; no emoji; no hardcoded colors; matches theme | — |
| SMOKE-MAC-08 | Download interrupted | 1. Start download 2. Kill network mid-download | Error message; Close button available; app continues normally | — |

---

### Windows Smoke Test Checklist

| Case ID | Scenario | Steps | Expected | Status |
|---------|----------|-------|----------|--------|
| SMOKE-WIN-01 | Check — up to date | 1. Install v0.1.0 2. About → Check for Updates | Shows "Up to Date" | — |
| SMOKE-WIN-02 | Check — update available | 1. Install v0.0.9 2. Publish v0.1.0 3. About → Check for Updates | UpdateDialog appears with correct version info | — |
| SMOKE-WIN-03 | Download progress | 1. UpdateDialog open 2. Click "Download Update" | Progress bar + bytes update; MSI updater artifact downloaded | — |
| SMOKE-WIN-04 | Install & Restart | 1. Download complete 2. Click "Install & Restart" | Passive install (no UAC for updater); app relaunches as v0.1.0 | — |
| SMOKE-WIN-05 | Network error | 1. Disconnect 2. Click "Check for Updates" | Error message; app doesn't crash | — |
| SMOKE-WIN-06 | Dialog dismiss | 1. UpdateDialog open 2. Click Cancel | Dialog closes; app continues normally | — |
| SMOKE-WIN-07 | Visual — design tokens | 1. View UpdateDialog on Windows | Design tokens applied; consistent with macOS layout | — |
| SMOKE-WIN-08 | MSI updater artifact | 1. Check release assets | `.msi.zip` + `.msi.zip.sig` present; NSIS `.exe` available as separate manual installer | — |

---

### Linux Smoke Test Checklist

| Case ID | Scenario | Steps | Expected | Status |
|---------|----------|-------|----------|--------|
| SMOKE-LNX-01 | Check — up to date | 1. Install v0.1.0 2. About → Check for Updates | Shows "Up to Date" | — |
| SMOKE-LNX-02 | Check — update available | 1. Install v0.0.9 2. Publish v0.1.0 3. About → Check for Updates | UpdateDialog appears | — |
| SMOKE-LNX-03 | Download progress | 1. Click "Download Update" | Progress bar + bytes update; AppImage.tar.gz downloaded | — |
| SMOKE-LNX-04 | Install & Restart | 1. Download complete 2. Click "Install & Restart" | App exits, AppImage updated, relaunches | — |
| SMOKE-LNX-05 | Network error | 1. Disconnect 2. Click "Check for Updates" | Error message; app doesn't crash | — |
| SMOKE-LNX-06 | Dialog dismiss | 1. UpdateDialog open 2. Click Cancel | Dialog closes; app continues | — |
| SMOKE-LNX-07 | Visual — design tokens | 1. View UpdateDialog on Linux | Design tokens applied | — |

---

### About Page Integration Checklist

| Case ID | Scenario | Steps | Expected | Status |
|---------|----------|-------|----------|--------|
| SMOKE-ABOUT-01 | Button enabled | 1. Open About page | "Check for Updates" button is enabled (no disabled attribute, no "Coming soon" tooltip) | — |
| SMOKE-ABOUT-02 | Spinner animation | 1. Click "Check for Updates" | Button text → "Checking..." with spinning Refresh icon | — |
| SMOKE-ABOUT-03 | Up-to-date status | 1. Click Check when no update available | "Up to Date" appears in accent color, auto-dismisses after 5s | — |
| SMOKE-ABOUT-04 | Repeated checks | 1. Click Check 2. Wait for result 3. Click Check again | Each check works independently; no stale state | — |

---

## Public Key & GitHub Secrets

### The public key and private key MUST match

The public key in `src-tauri/tauri.conf.json` is:
```
dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEM0MTBFRkZCQjdCNTU3Q0EKUldUS1Y3VzMrKzhReE0xUm1hNllIRy9LenJCOVc2cThVTDkycXhBQ1J2SXVZb2RXZFg3RllYTXgK
```

Decode to verify:
```bash
echo "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEM0MTBFRkZCQjdCNTU3Q0EKUldUS1Y3VzMrKzhReE0xUm1hNllIRy9LenJCOVc2cThVTDkycXhBQ1J2SXVZb2RXZFg3RllYTXgK" | base64 -d
# Output:
# untrusted comment: minisign public key: C410EFFBB7B557CA
# RWTKV7W3++8QxM1Rma6YHG/KzrB9W6q8UL92qxACRvIuYodWdX7FYXMx
```

The private key stored as `TAURI_SIGNING_PRIVATE_KEY` in GitHub Secrets must be the **matching private key** that was generated at the same time as this public key (from `npx tauri signer generate -w ~/.tauri/dev-toolbox.key`).

### Mismatch symptoms

If the keys don't match:
- Build succeeds (bundler signs with private key)
- `latest.json` is generated correctly
- User can check for updates and see the UpdateDialog
- BUT: download will fail signature verification → "Update Error" in dialog

### Verification before tagging

```bash
# On the machine where the keypair was generated:
npx tauri signer sign -k ~/.tauri/dev-toolbox.key -p <password> test-file.txt
# If this succeeds, the keypair is valid

# Compare the embedded public key against the generated one:
# The public key in tauri.conf.json must match the output of:
# npx tauri signer generate --help (or check ~/.tauri/dev-toolbox.key.pub if generated)
```

---

## Known Limitations

1. Updater only works in release builds (not `tauri dev`)
2. Only stable releases are checked (`/releases/latest/download/` → stable only; prereleases excluded)
3. Signature verification requires matching public/private keypair
4. Manual smoke tests pending first stable release — Status: Not Ready
5. No beta channel endpoint (future: separate endpoint for prerelease channel)

---

## Changelog

- **2026-07-06**: Initial Manual Update v1 implementation
- **2026-07-06**: Added `dialog: false` to prevent double-dialog (built-in + custom)
- **2026-07-06**: Added legacy env var compatibility in release workflow
- **2026-07-06**: Added comprehensive smoke test documentation
