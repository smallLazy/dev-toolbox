# AI Decision Record

> **Purpose**: Record WHY key architectural decisions were made. Prevents AI Agents from re-litigating settled decisions.
>
> **Rule**: These decisions are FINAL for Platform v1.0. Changing any requires Platform v2 Architecture Review.

---

## Decision 1: Plugin Architecture

**Date**: 2026-07 (Platform v1.0)

**Decision**: All features are Plugins. Core Framework never modified for new features.

**Why**:

1. **Scalability**: Plugin Architecture scales to 100+ tools without Core bloat. Each Plugin is ~10 files in its own directory.

2. **Safety**: AI Agents cannot break the platform because they never touch Core. The worst an AI can do is create a broken Plugin — which is isolated and deletable.

3. **Independence**: Plugins share zero code. Deleting a Plugin leaves zero traces. No cross-Plugin bugs.

4. **Parallel Development**: Multiple developers (and AIs) can create Plugins simultaneously with zero merge conflicts.

5. **Long-Term Maintenance**: Frozen Core means stable API. Plugin developers never deal with breaking changes.

**Alternatives Considered**:
- Monolithic feature modules → rejected: merge conflicts, tight coupling, unscalable
- Micro-frontend architecture → rejected: over-engineered for a desktop app
- Service-based architecture → rejected: unnecessary complexity for tool-type features

**References**:
- [`../architecture/workspace-architecture-v1.md`](../architecture/workspace-architecture-v1.md)
- [`AI_ARCHITECTURE.md`](./AI_ARCHITECTURE.md)

---

## Decision 2: Framework Frozen

**Date**: 2026-07-30

**Decision**: Core Framework, Feature SDK, Plugin SDK, Registry, Architecture are permanently frozen for v1.0. Only Bug, Performance, Security, and Compatibility fixes allowed.

**Why**:

1. **API Stability**: Plugin developers rely on stable SDK APIs. Changing `BaseFeature` breaks every Plugin.

2. **Quality Guarantee**: Frozen Core means Core bugs are fixed once, not introduced continuously.

3. **AI Safety**: The primary defense against AI modifying critical code is making it explicit that these layers are immutable.

4. **Platform Completeness**: v1.0 achieved its design goals. The extension model (Plugins) covers all future needs.

5. **Risk Management**: Every Core change risks subtle breakage across all Plugins. Freezing eliminates this risk category.

**Alternatives Considered**:
- Open Core evolution → rejected: continuous breakage, Plugin instability
- Versioned Core with migration guides → rejected: migration burden on Plugin developers
- Soft freeze (convention only) → rejected: AI Agents ignore conventions without enforcement

**References**:
- [`../platform/platform-freeze-v1.md`](../platform/platform-freeze-v1.md)

---

## Decision 3: Generator First

**Date**: 2026-07

**Decision**: All Plugins must be created via `npm run create-plugin`. Manual directory creation is prohibited.

**Why**:

1. **100% Compliance**: Generator output passes all CI validations by construction. Manually created Plugins inevitably violate rules.

2. **AI Error Prevention**: AI Agents frequently get boilerplate wrong (wrong imports, missing methods, hardcoded styles). Generator eliminates this class of errors.

3. **Consistency**: Every Plugin has identical structure, making the codebase uniformly navigable.

4. **Velocity**: `npm run create-plugin <name>` is faster than writing 12+ files manually.

5. **Template Quality**: Battle-tested templates encode best practices accumulated across all Plugins.

**Alternatives Considered**:
- Copy-paste from reference Plugin → rejected: inconsistent, missing template-specific content
- AI-generated from scratch → rejected: unreliable, violates rules
- Scaffolding CLI with prompts → adopted: `create-plugin` is this

**References**:
- [`../plugin/plugin-generator.md`](../plugin/plugin-generator.md)
- [`AI_PLUGIN_GUIDE.md`](./AI_PLUGIN_GUIDE.md)

---

## Decision 4: Feature SDK (BaseFeature)

**Date**: 2026-07

**Decision**: Every Feature must extend `BaseFeature` and implement all 9 abstract methods. Features access platform capabilities exclusively through `FeatureContext`.

**Why**:

1. **Uniform Lifecycle**: `initialize → activate → run → deactivate → dispose` is guaranteed for every Feature. No lifecycle bugs.

2. **Capability Sandbox**: `FeatureContext` provides clipboard, storage, history, settings, notifications, theme — without exposing Core internals.

3. **Testability**: `run()` is a pure function by contract. Test it without mocking platform services.

4. **Replaceability**: Any Feature can be replaced by another Feature implementing the same BaseFeature contract.

5. **Dependency Inversion**: Features depend on the SDK abstraction, not on concrete Core implementations.

**Alternatives Considered**:
- Free-form Feature classes → rejected: no lifecycle guarantees, no capability sandbox
- Functional Features (no classes) → rejected: no shared contract, harder to validate
- Mixin-based Features → rejected: complex, harder for AI to understand

**References**:
- [`../sdk/feature-sdk-v1.md`](../sdk/feature-sdk-v1.md)

---

## Decision 5: Design Tokens (CSS Custom Properties)

**Date**: 2026-07

**Decision**: All visual properties must reference CSS custom properties (`var(--token)`). Zero hardcoded hex, px, or font values in Feature code.

**Why**:

1. **Consistency**: Every Plugin looks like it belongs to the same application. No visual fragmentation.

2. **Theme Support**: Changing `--accent-primary` from blue to purple changes every component. One variable.

3. **AI Compliance**: AI Agents trained on general web data default to hex colors (`#1E1E1E`). Token-only rule makes violations trivially detectable (grep for `#` and `px`).

4. **Design System Evolution**: New Design Tokens can be added without touching any Plugin code. Plugins that use existing tokens pick up new theme automatically.

5. **Dark Mode First**: Token values are dark-theme by design. Light mode (future) is a token remap, not a code change.

**Alternatives Considered**:
- Tailwind CSS → rejected: generates hardcoded values in output, breaks token enforcement
- CSS-in-JS → rejected: harder to statically analyze for compliance
- SCSS variables → rejected: compile-time only, can't be validated at runtime

**References**:
- [`../design/design-system-v2.md`](../design/design-system-v2.md)
- [`AI_UI_GUIDE.md`](./AI_UI_GUIDE.md)

---

## Decision 6: Single Source of Truth (SSOT)

**Date**: 2026-07

**Decision**: Every domain has exactly one authoritative document. AI docs reference these — they never duplicate content.

**Mapping**:

| Domain | SSOT Document |
|--------|---------------|
| Platform Freeze | `docs/platform/platform-freeze-v1.md` |
| Architecture | `docs/architecture/workspace-architecture-v1.md` |
| Design System | `docs/design/design-system-v2.md` |
| Feature SDK | `docs/sdk/feature-sdk-v1.md` |
| Plugin SDK | `docs/sdk/plugin-sdk-v1.md` |
| Plugin Generator | `docs/plugin/plugin-generator.md` |
| Definition of Done | `docs/product/plugin-definition-of-done-v1.md` |
| Icon Guidelines | `docs/design/icon-guidelines-v1.md` |
| UI Guidelines | `docs/design/ui-guidelines-v1.md` |
| Interaction Guidelines | `docs/design/interaction-guidelines-v1.md` |
| Release Engineering | `docs/release/release-engineering-v1.md` |

**Why**:

1. **No Drift**: Two documents saying the same thing eventually disagree. One document never drifts.

2. **AI Accuracy**: AI Agents reading multiple documents with overlapping content get confused. SSOT eliminates ambiguity.

3. **Maintainability**: Changing a rule means updating exactly one file.

4. **Discoverability**: AI docs (`docs/ai/`) act as curated guides — they tell the AI WHERE to look, not WHAT the content is.

**References**: This whole directory structure.

---

## Status

All decisions above are **ACCEPTED** and **ACTIVE** for Platform v1.0.

To propose a change to any decision:
1. Wait for Platform v2 Architecture Review
2. Submit an Architecture Decision Record (ADR) with rationale
3. Get approval before implementation

---

> **Maintenance**: New architectural decisions should be added to this file following the same format. Old decisions are never deleted — mark as SUPERSEDED with a reference to the replacement.
