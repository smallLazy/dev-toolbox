# Plugin Definition of Done v1.0

> **规则**: 任何 Plugin 必须通过全部 Checklist 才能合并。

---

## Checklist

### Architecture
- [ ] Feature extends BaseFeature (Feature SDK)
- [ ] Plugin uses definePlugin() (Plugin SDK)
- [ ] Zero direct Core imports
- [ ] Zero direct Registry access
- [ ] Zero direct Service access

### Design
- [ ] All colors from Design Tokens (`var(--color-*)`)
- [ ] All spacing from Design Tokens (`var(--space-*)`)
- [ ] All typography from Design Tokens (`var(--text-*)`)
- [ ] All icons from Icon Registry (`@/design/icons`)
- [ ] Zero emoji (use SVG icons)
- [ ] Zero hardcoded hex values
- [ ] Zero hardcoded px values (except in Design Token definition)

### UI
- [ ] Uses Card+Section layout
- [ ] Uses PluginWorkspace template (or approved variant)
- [ ] Has Empty State
- [ ] Has Loading State
- [ ] Has Error State
- [ ] Toolbar uses FeatureToolbar (not custom)

### Functionality
- [ ] Settings schema defined (settings.ts)
- [ ] History enabled (history.ts)
- [ ] Search keywords registered (8+)
- [ ] Commands registered (1+, for Command Palette)
- [ ] Keyboard shortcut (⌘Enter minimum)

### Quality
- [ ] logic.ts has unit tests (5+)
- [ ] Plugin Validation passes (`npx tsx scripts/ci/validate-plugins.ts`)
- [ ] Architecture Validation passes (`npx tsx scripts/ci/validate-architecture.ts`)
- [ ] Design Validation passes (`npx tsx scripts/ci/validate-design.ts`)
- [ ] TypeScript compiles (`vue-tsc --noEmit`)

### Documentation
- [ ] README.md (plugin description + usage)
- [ ] CHANGELOG.md (version history)

---

## Quick Start Template

```typescript
// Minimum viable plugin checklist:
//   ✅ definePlugin({...})
//   ✅ BaseFeature with run/validate/transform
//   ✅ Card+Section layout
//   ✅ Design Tokens only
//   ✅ SVG Icons only
//   ✅ 5+ unit tests
//   ✅ Settings + History + Search + Commands
```

---

> **版本**: v1.0
