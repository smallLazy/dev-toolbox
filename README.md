# Dev Toolbox

Languages: English | [简体中文](./README.zh-CN.md)

> **v0.1.0-beta.2** — Beta Readiness | macOS arm64

A desktop developer toolbox — crypto, encoding, formatting, conversion, and inspection tools. Built on **Tauri v2 + Vue 3 + TypeScript + Rust** with a **Plugin Architecture** that keeps the core frozen and all features independently extensible.

## Features

Dev Toolbox has **40 plugin definitions** — **10 active** tools and **30 coming soon**.

### Active Tools

| Category | Tool | Description |
|----------|------|-------------|
| **Crypto** | AES | AES-256-CBC / AES-256-ECB symmetric encryption (Rust backend) |
| **Crypto** | Hash | MD5 / SHA-256 hash computation |
| **Converter** | Timestamp | Unix timestamp ↔ date-time conversion (seconds / milliseconds auto-detect) |
| **Converter** | JSON Formatter | Format, validate, compact, and minify JSON |
| **Encoding** | Base64 | Encode and decode with full Unicode and Emoji support |
| **Encoding** | URL | URL encode / decode (encodeURIComponent / encodeURI modes) |
| **Encoding** | JWT | Parse JWT Header / Payload / Signature with expiry detection |
| **Encoding** | PHP Codec | Encode / decode PHP-compatible payloads (multi-layer pipeline) |
| **Formatter** | SQL | SQL IN List builder from batch data |
| **Utility** | Hello Plugin | Framework validation — verifies the Workspace Core is running correctly |

### Coming Soon (30 plugins)

Additional tools across **AI** (Agent, Explain, Prompt, Review, Translate), **Crypto** (RSA, SM2, SM3, SM4), **Encoding** (HTML Encode, Unicode), **Formatter** (Diff, Markdown, XML, YAML), **Network** (cURL, GraphQL, HTTP Client, Request Decoder, WebSocket), **Converter** (Color, UUID), **Analyzer** (Regex), **Enterprise** (Gitee, GitHub, Jira, Sentry, WeCom, ZenTao), and **Utility** (QR Code).

### Built-in Features

- **Dashboard** — Welcome screen, Recent tools, Favorites, All Tools grid
- **Command Palette** — Cmd+K fuzzy search across all tools and commands
- **Settings** — Default encoding preferences, persisted locally via Tauri Store
- **About** — Version info, git commit hash, build time, platform detection, plugin count, license

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Desktop Shell** | Tauri v2 |
| **Frontend** | Vue 3 + TypeScript + Vite 6 |
| **State Management** | Pinia |
| **Routing** | Vue Router 4 |
| **Backend** | Rust (AES crypto engine) |
| **Storage** | Tauri Store plugin (`@tauri-apps/plugin-store`) |
| **Testing** | Vitest (frontend) + cargo test (Rust) |
| **CI/CD** | GitHub Actions |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://www.rust-lang.org/) (latest stable)

**macOS**:
```bash
xcode-select --install
```

**Windows**:
- [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

**Linux**:
```bash
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file \
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

### Install Dependencies

```bash
cd dev-toolbox
npm install
```

### Start Development

```bash
npm run tauri dev
```

This starts the Vite dev server (port 1420) and opens a Tauri desktop window.

> **Note for macOS users**: The app is currently unsigned. If you see a security warning on first launch, go to **System Settings → Privacy & Security** and click "Open Anyway".

### Build Desktop App

```bash
# Production build (all checks + Tauri bundle)
npm run tauri build

# Platform-specific
npm run build:mac      # macOS DMG
npm run build:linux    # Linux DEB
npm run build:win      # Windows MSI

# Release build (full validation + all platform bundles)
npm run build:release
```

Build output is in `src-tauri/target/release/bundle/`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server only (port 1420) |
| `npm run tauri dev` | Start Vite + Tauri desktop window |
| `npm run build` | Type-check + production Vite build |
| `npm run tauri build` | Build Tauri desktop app bundle |
| `npm run build:mac` | Build macOS DMG |
| `npm run build:linux` | Build Linux DEB |
| `npm run build:win` | Build Windows MSI |
| `npm run build:release` | Full validate + multi-platform Tauri build |
| `npm test` | Run all unit tests (Vitest) |
| `npm run validate` | Full CI quality gate (type-check + tests + architecture + design + plugins + AI) |
| `npm run validate:arch` | Architecture compliance check |
| `npm run validate:design` | Design Token compliance check |
| `npm run validate:plugins` | Plugin structure validation |
| `npm run validate:ai` | AI Governance compliance check |
| `npm run create-plugin <name>` | Generate a new Plugin from template |
| `npm run preview` | Preview production build locally |

## Project Structure

```
dev-toolbox/
├── index.html                    # Entry HTML
├── package.json                  # Dependencies & scripts
├── vite.config.ts                # Vite config (build metadata injection)
├── tsconfig.json                 # TypeScript config
├── AGENTS.md                     # AI agent entry point
├── CLAUDE.md                     # Claude Code instructions
├── CHANGELOG.md                  # Release history
│
├── src/                          # Frontend source
│   ├── main.ts                   # App entry
│   ├── App.vue                   # Root component
│   ├── env.d.ts                  # Type declarations
│   │
│   ├── core/                     # Core Framework ❄ Frozen
│   │   ├── Application.ts        # App lifecycle
│   │   ├── PluginManager.ts      # Plugin lifecycle management
│   │   ├── LifecycleManager.ts   # Lifecycle hooks
│   │   ├── di.ts                 # Dependency injection
│   │   ├── event-bus.ts          # Event system
│   │   ├── command-bus.ts        # Command system
│   │   ├── build-info.ts         # Build metadata helpers
│   │   ├── plugin-types.ts       # Plugin type definitions
│   │   ├── registry/             # Tool & command registries
│   │   └── services/             # Service container
│   │
│   ├── sdk/                      # Feature SDK + Plugin SDK ❄ Frozen
│   │
│   ├── plugins/                  # Plugin manifests (40 total)
│   │   ├── index.ts              # Plugin barrel export
│   │   ├── base64.plugin.ts      # Active plugin example
│   │   ├── crypto.plugin.ts
│   │   ├── json.plugin.ts
│   │   └── ...                   # 36 more plugin definitions
│   │
│   ├── features/                 # Feature implementations (40 total)
│   │   ├── base64/               # Base64 encode/decode
│   │   ├── crypto/               # AES crypto (Rust-backed)
│   │   ├── hash/                 # MD5 / SHA-256
│   │   ├── json/                 # JSON formatter
│   │   ├── jwt/                  # JWT parser
│   │   ├── timestamp/            # Timestamp converter
│   │   ├── url/                  # URL encode/decode
│   │   ├── sql/                  # SQL IN builder
│   │   └── ...                   # 31 more features
│   │
│   ├── components/               # Shared UI components ❄ Frozen
│   │   ├── Sidebar.vue           # Navigation sidebar
│   │   ├── CommandPalette.vue    # Cmd+K command palette
│   │   ├── DashboardGrid.vue     # All tools grid
│   │   ├── DashboardCard.vue     # Tool card
│   │   ├── DashboardRecent.vue   # Recently used tools
│   │   ├── DashboardFavorites.vue # Favorited tools
│   │   ├── DashboardWelcome.vue  # First-launch welcome
│   │   └── ToolUnavailable.vue   # Inactive tool fallback
│   │
│   ├── templates/                # Page templates
│   │   ├── ToolPage.vue          # Standard tool page layout
│   │   ├── PluginWorkspace.vue   # Plugin workspace wrapper
│   │   ├── ToolHeader.vue        # Tool header with actions
│   │   ├── ToolActions.vue       # Action buttons bar
│   │   ├── ToolOutputPanel.vue   # Output display panel
│   │   ├── ToolSection.vue       # Tool content section
│   │   ├── ToolSegmentedControl.vue # Mode toggle control
│   │   └── PluginEmptyState.vue  # Empty state placeholder
│   │
│   ├── modules/                  # Built-in app pages (home, about, config, sql)
│   ├── presets/                  # Codec presets (e.g., PHP-compatible)
│   ├── layouts/                  # App layouts ❄ Frozen
│   ├── router/                   # Vue Router config (auto-managed)
│   ├── stores/                   # Pinia stores (app, workspace)
│   ├── composables/              # Vue composables (tools, favorites, recent, etc.)
│   ├── design/                   # Design System
│   │   └── icons/index.ts        # Centralized SVG icon registry
│   ├── assets/                   # Static assets (theme.css)
│   ├── shared/                   # Shared utilities (clipboard, pipeline, etc.)
│   ├── playground/               # Development playground
│
├── src-tauri/                    # Rust backend
│   ├── Cargo.toml                # Rust dependencies
│   ├── tauri.conf.json           # Tauri config (window, bundle, CSP)
│   ├── build.rs                  # Build script
│   ├── capabilities/
│   │   └── default.json          # Permission declarations
│   ├── icons/                    # App icons (all platforms)
│   └── src/
│       ├── main.rs               # Rust entry point
│       ├── lib.rs                # Tauri plugin & command registration
│       ├── commands/
│       │   ├── mod.rs
│       │   └── aes_cmd.rs        # AES crypto Tauri command
│       ├── services/
│       │   ├── mod.rs
│       │   └── crypto.rs         # AES-CBC / AES-ECB core logic
│       └── models/
│           └── mod.rs            # Data structures
│
├── scripts/                      # Tooling scripts
│   ├── create-plugin.ts          # Plugin generator
│   └── ci/                       # CI validation scripts
│       ├── validate-architecture.ts
│       ├── validate-design.ts
│       ├── validate-plugins.ts
│       ├── validate-navigation.ts
│       └── validate-ai.ts
│
├── docs/                         # Documentation (SSOT)
│   ├── ai/                       # AI-oriented guides
│   ├── architecture/             # Architecture specs
│   ├── design/                   # Design system specs
│   ├── platform/                 # Platform freeze policy
│   ├── sdk/                      # SDK API docs
│   ├── product/                  # Product & DoD specs
│   ├── plugin/                   # Plugin generator docs
│   ├── plugin-specs/             # Per-plugin specifications
│   ├── release/                  # Release engineering
│   ├── releases/                 # Release notes
│   └── checklists/               # QA checklists
│
└── .github/workflows/            # CI/CD pipelines
    ├── ci.yml                    # Quality gate (lint, test, validate, build)
    ├── build.yml                 # Build pipeline
    └── release.yml               # Release pipeline
```

## Development Guide

### Plugin Architecture

Dev Toolbox uses an **8-layer unidirectional Plugin Architecture**:

```
Application → Plugins → Features → Patterns → Layouts → Components → Core → Foundation
```

- **Upper layers depend on lower layers. Never reverse.**
- **Core Framework** and **SDK** are **frozen** — all new features are added as Plugins.
- **Features are independently deletable** — zero cross-Feature imports.

### Creating a New Plugin

> **Always use the Plugin Generator.** Never hand-write plugin directories.

```bash
npm run create-plugin <name> -- --template=<type>
```

This generates:
- Plugin manifest (`src/plugins/<name>.plugin.ts`)
- Feature implementation (`src/features/<name>/`)
- Logic module (`logic.ts` — **must be pure functions**)
- Test file (`__tests__/logic.test.ts` — **minimum 5 tests**)
- README and CHANGELOG

### Design Rules

| Rule | Do | Don't |
|------|----|-------|
| **Colors** | `var(--color-*)` | `#XXXXXX` |
| **Spacing** | `var(--space-*)` | `16px`, `20px` |
| **Fonts** | `var(--text-*)` | `13px`, `14px` |
| **Icons** | `@/design/icons` | Direct `lucide-vue-next` imports |
| **Icons** | SVG components from registry | Emoji in templates |
| **Layout** | `Card + Section` pattern | Custom layouts |

### Testing

```bash
# All tests
npm test

# Single plugin
npx vitest run src/features/base64/
```

Every plugin requires **5+ unit tests** for its `logic.ts`. Tests are pure — no DOM, no Tauri APIs, no side effects.

## Quality Checks

Before committing, run the full validation suite:

```bash
npm run validate
```

This runs sequentially:

| Check | Command | What It Validates |
|-------|---------|-------------------|
| TypeScript | `vue-tsc --noEmit` | Type correctness across all `.ts` and `.vue` files |
| Unit Tests | `vitest run` | All plugin logic tests pass |
| Architecture | `validate-architecture.ts` | Layer boundaries, frozen layer compliance, no cross-Feature imports |
| Design | `validate-design.ts` | Design Token usage, no hardcoded values |
| Plugins | `validate-plugins.ts` | Plugin structure, required files, registration correctness |
| AI Governance | `validate-ai.ts` | AI-readable docs presence, CLAUDE.md/AGENTS.md compliance |

Individual checks:

```bash
npm run validate:arch       # Architecture only
npm run validate:design     # Design tokens only
npm run validate:plugins    # Plugin structure only
npm run validate:ai         # AI governance only
npx vue-tsc --noEmit        # TypeScript only
npm test                    # Tests only
```

### CI/CD

GitHub Actions runs the full quality gate on every PR and push to `master`:

- **Lint & Typecheck** — `vue-tsc` + `cargo clippy`
- **Unit Tests** — Vitest + `cargo test` + code coverage (tarpaulin)
- **Plugin Validation** — Structure and registration checks
- **Navigation Validation** — Route and sidebar integrity
- **Design Validation** — Token compliance
- **Architecture Validation** — Layer boundary enforcement
- **Build Check** — Production build verification + `cargo build --release`
- **Quality Gate** — All-or-nothing final gate

## Security

- AES-256 encryption runs in **Rust**, not JavaScript
- Keys and IVs are **never hardcoded** — user-provided each session
- Encryption operations do **not log** plaintext, keys, or IVs
- Settings are stored **locally** via Tauri Store — no network transmission
- CSP enabled: `default-src 'self'`
- Store permissions minimized: get/set/save/load only

## Documentation

| Document | Description |
|----------|-------------|
| [AGENTS.md](./AGENTS.md) | Universal AI agent entry point |
| [CLAUDE.md](./CLAUDE.md) | Claude Code specific instructions |
| [CHANGELOG.md](./CHANGELOG.md) | Release history and changes |
| `docs/ai/AI_OVERVIEW.md` | Project introduction for AI agents |
| `docs/ai/AI_ARCHITECTURE.md` | Plugin Architecture explained |
| `docs/ai/AI_PLUGIN_GUIDE.md` | Step-by-step Plugin creation guide |
| `docs/ai/AI_UI_GUIDE.md` | Design System compliance guide |
| `docs/ai/AI_CODE_REVIEW.md` | Code review checklist |
| `docs/ai/AI_RELEASE.md` | Release checklist |
| `docs/ai/AI_CONTEXT_GRAPH.md` | Documentation reading order |
| `docs/ai/AI_DECISIONS.md` | Architecture decision records |
| `docs/design/design-system-v2.md` | Design System SSOT |
| `docs/design/ui-copy-guidelines.md` | UI copy language consistency |
| `docs/design/ui-guidelines-v1.md` | Page layout and component patterns |
| `docs/design/icon-guidelines-v1.md` | Icon system rules |
| `docs/platform/platform-freeze-v1.md` | What is frozen and why |
| `docs/sdk/feature-sdk-v1.md` | Feature SDK API reference |
| `docs/sdk/plugin-sdk-v1.md` | Plugin SDK API reference |
| `docs/product/plugin-definition-of-done-v1.md` | Plugin DoD checklist |
| `docs/release/release-engineering-v1.md` | Release engineering guide |

## License

MIT — see [package.json](./package.json) for details.

---

> **Contributing**: All contributions go through Plugins. The Core and SDK are frozen. See [AGENTS.md](./AGENTS.md) for development rules.
