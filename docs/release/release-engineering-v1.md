---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Release Engineering v1.0 — Developer Workspace

> **定位**: 完整的 CI/CD + 多平台构建 + 语义化版本 + Quality Gate 体系。
> **原则**: PR 未通过全部 Gate 禁止 Merge。版本号自动管理。

---

## 1. CI/CD Pipeline

```
PR Opened
    │
    ▼
┌─────────────────────────────────────────────┐
│ Quality Gate (ci.yml)                        │
│                                              │
│  ✅ Lint (cargo clippy, eslint)              │
│  ✅ Typecheck (vue-tsc, cargo check)         │
│  ✅ Unit Test (vitest, cargo test)           │
│  ✅ Plugin Validation                        │
│  ✅ Architecture Validation                  │
│  ✅ Build Test (npm run build, cargo build)  │
│                                              │
│  ALL MUST PASS → Merge allowed               │
└─────────────────────────────────────────────┘
    │
    ▼
Merge to master
    │
    ▼
┌─────────────────────────────────────────────┐
│ Build Matrix (build.yml)                     │
│                                              │
│  macOS arm64  │  macOS x64  │  Win x64      │
│  ──────────── │ ─────────── │ ─────────────  │
│  Linux x64    │             │                │
│                                              │
│  All artifacts uploaded to GitHub Artifacts  │
└─────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────┐
│ Release (release.yml)                        │
│                                              │
│  Tag trigger: v*.*.*                         │
│                                              │
│  1. Determine version from tag               │
│  2. Build all platforms                      │
│  3. Generate CHANGELOG                       │
│  4. Create GitHub Release                    │
│  5. Upload .dmg / .msi / .AppImage / .zip    │
└─────────────────────────────────────────────┘
```

---

## 2. Quality Gate (PR)

### Required Checks

| Check | Command | Failure = Block |
|-------|---------|-----------------|
| **Lint** | `cargo clippy -- -D warnings` | ❌ Block |
| **Typecheck Frontend** | `vue-tsc --noEmit` | ❌ Block |
| **Typecheck Backend** | `cargo check` | ❌ Block |
| **Unit Test Frontend** | `vitest run` | ❌ Block |
| **Unit Test Backend** | `cargo test` | ❌ Block |
| **Plugin Validation** | `npx tsx scripts/ci/validate-plugins.ts` | ❌ Block |
| **Architecture Validation** | `npx tsx scripts/ci/validate-architecture.ts` | ❌ Block |
| **Build** | `npm run build && cargo build --release` | ❌ Block |

### Coverage Gate

| Metric | Threshold |
|--------|-----------|
| Frontend (vitest) | ≥ 80% |
| Backend (cargo-tarpaulin) | ≥ 80% |

---

## 3. Multi-Platform Builds

| Platform | Architecture | Artifact | Runner |
|----------|-------------|----------|--------|
| macOS | arm64 (Apple Silicon) | `.dmg` | `macos-latest` |
| macOS | x86_64 (Intel) | `.dmg` | `macos-15-intel` |
| Windows | x86_64 | `.msi` + `.zip` | `windows-latest` |
| Linux | x86_64 | `.AppImage` + `.deb` | `ubuntu-latest` |

All artifacts uploaded to:
- **PR Builds** → GitHub Artifacts (90-day retention)
- **Releases** → GitHub Release Assets (permanent)

---

## 4. Semantic Versioning

### Version Format

```
MAJOR.MINOR.PATCH[-prerelease]

Examples:
  1.0.0          ← Stable release
  1.1.0-beta.1   ← Beta prerelease
  2.0.0-rc.1     ← Release candidate
```

### Automation

| Trigger | Action |
|---------|--------|
| Push tag `v*.*.*` | Extract version → Build → Release |
| Merge to `master` | Determine next version → Optionally bump |
| PR merged (feat:) | Bump MINOR |
| PR merged (fix:) | Bump PATCH |
| PR merged (BREAKING:) | Bump MAJOR |

### CHANGELOG

Auto-generated from conventional commits:
- `feat:` → Features
- `fix:` → Bug Fixes
- `docs:` → Documentation
- `refactor:` → Refactoring
- `perf:` → Performance
- `test:` → Tests
- `chore:` → Maintenance

---

## 5. Artifact Signing (Future)

| Platform | Method |
|----------|--------|
| macOS | Apple notarization + Hardened Runtime |
| Windows | Authenticode code signing |
| Linux | GPG signature |

---

## 6. Tauri Updater

### manifest.json

```json
{
  "version": "1.0.0",
  "platforms": {
    "darwin-aarch64": { "url": "...", "signature": "..." },
    "darwin-x86_64":  { "url": "...", "signature": "..." },
    "windows-x86_64": { "url": "...", "signature": "..." },
    "linux-x86_64":   { "url": "...", "signature": "..." }
  }
}
```

Auto-uploaded to GitHub Release as `update.json`.

---

## 7. Environment Variables (GitHub Secrets)

| Secret | Purpose |
|--------|---------|
| `APPLE_SIGNING_IDENTITY` | macOS code signing |
| `APPLE_CERTIFICATE` | Base64-encoded .p12 |
| `APPLE_CERTIFICATE_PASSWORD` | .p12 password |
| `APPLE_TEAM_ID` | Apple Developer Team |
| `WINDOWS_CERTIFICATE` | Windows code signing |
| `TAURI_PRIVATE_KEY` | Tauri updater signing |
| `TAURI_KEY_PASSWORD` | Updater key password |

---

> **版本**: v1.0  
> **维护**: 本文件是 Release Engineering 的单一事实来源。
