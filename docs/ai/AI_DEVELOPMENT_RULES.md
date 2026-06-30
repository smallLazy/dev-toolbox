# AI Development Rules v1.0

> **规则**: 任何 AI Agent (Cursor / Claude Code / Codex) 在开发前必须阅读本文档及所有引用文档。

---

## Required Reading (In Order)

1. `docs/design/design-system-v2.md` — Design Tokens, Component API
2. `docs/design/ui-guidelines-v1.md` — Page Layout, Sidebar, Card, Empty State
3. `docs/design/interaction-guidelines-v1.md` — Hover, Focus, Pressed, Animation
4. `docs/architecture/workspace-architecture-v1.md` — Layer dependency rules
5. `docs/sdk/feature-sdk-v1.md` — BaseFeature, FeatureContext
6. `docs/sdk/plugin-sdk-v1.md` — definePlugin, PluginContext
7. `docs/product/plugin-definition-of-done-v1.md` — DoD Checklist

---

## Mandatory Constraints

### Prohibited
```
❌ Direct Core import      → use FeatureContext / PluginContext
❌ Direct Registry access  → use SDK abstractions
❌ Direct Service access   → use this.context
❌ Hardcoded colors        → use var(--color-*)
❌ Hardcoded spacing       → use var(--space-*)
❌ Hardcoded font sizes    → use var(--text-*)
❌ Hardcoded animations    → use var(--duration-*) var(--ease-*)
❌ Emoji icons             → use @/design/icons
❌ Custom layout           → use PluginWorkspace template
❌ Custom toolbar          → use FeatureToolbar
❌ Cross-Feature import    → Feature A never imports Feature B
```

### Required
```
✅ BaseFeature inheritance → every Feature extends BaseFeature
✅ definePlugin()          → every Plugin uses definedPlugin()
✅ Design Tokens           → all visual properties
✅ SVG Icons               → from @/design/icons
✅ Card+Section layout     → consistent structure
✅ logic.ts pure functions → zero side effects, directly testable
✅ 5+ unit tests           → vitest
✅ Search keywords         → 8+ keywords (CN + EN)
✅ ⌘Enter shortcut         → minimum keyboard support
```

---

## Code Template

```typescript
// New tool creation:
// 1. npx tsx scripts/create-plugin.ts <name> --template=<type>
// 2. Implement logic.ts (pure functions)
// 3. Add test vectors to __tests__/logic.test.ts
// 4. Run npm run tauri dev to verify
// DONE. No other files need modification.
```

---

> **版本**: v1.0
