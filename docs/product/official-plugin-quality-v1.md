---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Official Plugin Quality Standards v1.0

> **规则**: 未通过全部 Quality Gate 的 Plugin 禁止合并。

---

## Quality Gates (17 Checks)

### Architecture (3)
- [ ] Feature extends BaseFeature (Feature SDK)
- [ ] Plugin uses definePlugin() (Plugin SDK)
- [ ] Zero direct Core/Registry/Service imports

### Design (4)
- [ ] All visual properties from Design Tokens
- [ ] All icons from @/design/icons
- [ ] Zero emoji, PNG, JPG, GIF
- [ ] Card+Section layout structure

### Navigation (3)
- [ ] Valid category assigned
- [ ] Search keywords ≥ 3
- [ ] Commands ≥ 1

### Code Quality (3)
- [ ] logic.ts is pure functions (zero side effects)
- [ ] Unit tests ≥ 5 (vitest)
- [ ] TypeScript compiles (vue-tsc --noEmit)

### CI Gates (5)
- [ ] Plugin Validation passes
- [ ] Architecture Validation passes
- [ ] Design Validation passes
- [ ] Navigation Validation passes
- [ ] Build passes

### Documentation (2)
- [ ] README.md with usage instructions
- [ ] Screenshot or GIF of the plugin in action

---

## Test Requirements

```
Minimum: 5 unit tests covering:
  1. Happy path (normal input → correct output)
  2. Empty input
  3. Invalid input (error handling)
  4. Edge case (Unicode, large input, etc.)
  5. Configuration variation (different settings)
```

---

> **版本**: v1.0
