# AI Release Checklist

> **Purpose**: Standardized release checklist for AI Agents preparing a release.
>
> **Primary reference**: [`../release/release-engineering-v1.md`](../release/release-engineering-v1.md)

---

## Pre-Release Verification

### Code Quality Gate

```bash
# All must pass — zero tolerance
npm test                                    # All unit tests
npx vue-tsc --noEmit                        # TypeScript compilation
npx tsx scripts/ci/validate-architecture.ts # Architecture compliance
npx tsx scripts/ci/validate-design.ts       # Design compliance
npx tsx scripts/ci/validate-ai.ts           # AI Governance compliance
```

### Manual Verification

```
[ ] App launches without errors (npm run tauri dev)
[ ] All existing Plugins still work (AES, JSON, Base64, JWT...)
[ ] New Plugin appears in Sidebar
[ ] New Plugin accessible via Command Palette (⌘K)
[ ] New Plugin keyboard shortcuts work
[ ] No console errors in DevTools
[ ] No visual regressions in existing pages
```

---

## Version Management

### When to Bump Versions

| Change | Version Bump |
|--------|-------------|
| New Plugin added | Plugin version: 1.0.0 → 1.0.0 (new) |
| Plugin bug fix | Plugin version: patch (1.0.0 → 1.0.1) |
| Plugin new feature | Plugin version: minor (1.0.1 → 1.1.0) |
| Core bug fix | Core version: patch |
| CI/CD change only | No version bump needed |
| Doc change only | No version bump needed |

### Files to Update

```
[ ] Plugin CHANGELOG.md (if releasing a Plugin)
[ ] Plugin version in definePlugin() manifest
[ ] Git tag (if milestone release)
[ ] Release notes (docs/releases/)
```

---

## Release Steps

### 1. Run Full CI Suite

```bash
npm run validate
```

Must pass all checks. Fix any violations before proceeding.

### 2. Build Production

```bash
npm run tauri build
```

Verify the build succeeds and produces the expected artifacts.

### 3. Test Production Build

```
[ ] Launch the built .app
[ ] Smoke test: open 3+ tools, verify each works
[ ] Verify keyboard shortcuts work in production
[ ] Verify no dev-only artifacts visible
```

### 4. Update Documentation

```
[ ] CHANGELOG.md updated for all changed Plugins
[ ] Release notes created in docs/releases/
[ ] README.md updated (if applicable)
```

### 5. Create Release

```
[ ] Git tag created (e.g., v0.1.0-beta.2)
[ ] Release notes published
[ ] Build artifacts attached to release
```

---

## Rollback Plan

If release introduces a regression:

```
1. Identify affected Plugin(s)
2. Revert Plugin to previous version
3. Re-run CI suite
4. Verify fix
5. Re-release
```

Core rollback requires Platform Architecture Review.

---

## What AI Must NOT Do During Release

```
❌ Bump Core version (Frozen)
❌ Bump SDK version (Frozen)
❌ Modify CI/CD quality gates to "pass" a failing check
❌ Skip validation steps
❌ Release with failing tests
❌ Delete existing release notes
```

---

> **Maintenance**: Update this checklist when release process changes. Keep aligned with [`../release/release-engineering-v1.md`](../release/release-engineering-v1.md).
