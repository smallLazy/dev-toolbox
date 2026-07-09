---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Official Plugin Lifecycle v1.0

> **规则**: 所有 Official Plugin 必须遵循本生命周期。

---

## Lifecycle States

```
  💡 Idea
    │
    ▼
  📝 RFC (Request for Comments)
    │
    ▼
  ✅ Ready (Approved for development)
    │
    ▼
  🔧 Development
    │
    ▼
  👀 Review (Code Review + QA)
    │
    ▼
  🚀 Release
    │
    ▼
  🔄 Maintenance
    │
    ▼
  ⚰️ Deprecated (future)
```

---

## Stage Details

### 1. Idea
- File a GitHub Issue with `plugin-proposal` label
- Fill: Name, Category, Problem, Target users, Expected value
- Community discussion (1 week minimum)

### 2. RFC
- Write a brief RFC in `docs/rfc/plugin-<name>.md`
- Sections: Motivation, Design, API, Dependencies, Alternatives
- Review by at least 1 maintainer

### 3. Ready
- RFC approved → Issue labeled `ready-for-dev`
- Assigned to an owner
- Milestone set

### 4. Development
- Use `npm run create-plugin <name>` (Generator)
- Implement: `logic.ts` → `Feature.ts` → `View.vue` → `tests`
- Commit convention: `feat(plugin): <message>`

### 5. Review
- PR must pass all CI checks (9 gates)
- Code review by at least 1 maintainer
- Design review (check Design Tokens, Icons, Navigation)
- Manual QA: launch `npm run tauri dev`, test all features

### 6. Release
- Merge to `master`
- Tagged with version bump (Semantic Versioning)
- GitHub Release created automatically
- CHANGELOG updated

### 7. Maintenance
- Monitor GitHub Issues for bugs
- Release patch versions as needed
- Keep dependencies updated

### 8. Deprecated (future)
- Plugin no longer maintained
- Marked deprecated in Plugin Registry
- Users see deprecation warning
- Removed after 2 major versions

---

> **版本**: v1.0
