---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Plugin Development Workflow v1.0

> **Rule**: Specification first. No code before spec is approved.

---

## Workflow

```
1. Specification ──→ Write spec using plugin-spec-template.md
        │
        ▼
2. Review ──→ Spec reviewed by ≥1 maintainer
        │      Check: completeness, feasibility, scope
        │
        ▼
3. Approve ──→ Spec status → "Approved"
        │
        ▼
4. Generate ──→ npm run create-plugin <name> --template=<type>
        │
        ▼
5. Implement ──→ logic.ts (pure functions)
        │        Feature.ts (extends BaseFeature)
        │        View.vue (Card+Section layout)
        │
        ▼
6. Test ──→ __tests__/logic.test.ts (5+ tests)
        │    Manual QA: npm run tauri dev
        │
        ▼
7. Benchmark ──→ Compare with DevToys (if applicable)
        │         Check: features, UX, shortcuts, performance
        │
        ▼
8. Document ──→ README.md, CHANGELOG.md
        │       Screenshot / GIF
        │
        ▼
9. Validate ──→ 17 Quality Gates ALL pass
        │       npm run validate
        │
        ▼
10. Release ──→ PR merged → CI builds → GitHub Release
```

---

## Gate Checklist Per Stage

### Stage 1: Specification
- [ ] Template fully filled out
- [ ] User story clear
- [ ] Features categorized (Must/Should/Nice/Future)
- [ ] Test cases defined (5 minimum)
- [ ] Edge cases documented

### Stage 3: Approve
- [ ] Spec reviewed
- [ ] Scope agreed
- [ ] Priority confirmed
- [ ] Milestone assigned

### Stage 5: Implement
- [ ] `npm run create-plugin` used (NOT hand-written)
- [ ] logic.ts: pure functions only
- [ ] Feature.ts: all 12 BaseFeature methods
- [ ] View.vue: Design Tokens only, SVG icons only
- [ ] Zero Core/Registry/Service imports

### Stage 6: Test
- [ ] 5+ unit tests pass
- [ ] Happy path, empty, invalid, unicode, large input covered
- [ ] Manual smoke test on macOS

### Stage 9: Validate
- [ ] TypeScript compiles
- [ ] Plugin Validation passes
- [ ] Architecture Validation passes
- [ ] Design Validation passes
- [ ] Navigation Validation passes
- [ ] Build passes

---

## Commit Convention

```
feat(plugin): add Base64 encode/decode
fix(plugin): handle empty input in UUID generator
docs(plugin): update Timestamp README with examples
test(plugin): add unicode roundtrip test for Base64
```

---

> **版本**: v1.0
