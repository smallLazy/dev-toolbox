# Platform Freeze v1.0

> **生效日期**: 2026-07-30
> **冻结范围**: Core Framework, SDK, Registry, Architecture

---

## Frozen Layers

| Layer | Status | Allowed Changes |
|-------|--------|----------------|
| **Core Framework** | ❄ Frozen | Bug, Performance, Security, Compatibility |
| **Feature SDK** | ❄ Frozen | Bug, Performance, Security |
| **Plugin SDK** | ❄ Frozen | Bug, Performance, Security |
| **Registry** | ❄ Frozen | Bug, Performance |
| **Architecture** | ❄ Frozen | None (unless Platform v2) |
| **Design System** | ❄ Frozen | Token additions only (new colors for new brands) |
| **CI/CD** | 🔧 Maintained | Workflow improvements allowed |

---

## Allowed Changes

```
✅ Bug fixes
✅ Performance optimization
✅ Security patches
✅ Dependency version bumps (safe)
✅ New Design Token (when justified)
✅ CI/CD workflow improvements

❌ New Framework layer
❌ New SDK API
❌ New Registry type
❌ Architecture restructure
❌ Breaking API changes
❌ New Core feature
```

---

## Extension Points

All new capabilities must be built as:

1. **Plugin** — `definePlugin()` + `BaseFeature`
2. **Service** — Configured in Application boot, accessed via FeatureContext
3. **Component** — Registered in Design System, used by all Plugins

---

> **版本**: v1.0  
> **维护**: Platform v1 长期支持 (LTS)。v2 需要 Architecture Review。
