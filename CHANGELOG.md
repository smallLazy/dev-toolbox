# Changelog

## v0.1.0-beta.2 (2026-06-30) — Beta Readiness

### Added
- **About page**: Version info, git commit hash, build time, platform detection, plugin count (33), GitHub link, license
- **Welcome dashboard**: First-launch experience with hero branding, Quick Start tools (JSON, Base64, Timestamp), and keyboard shortcut hint
- **Sidebar**: About navigation link in footer section
- **Command Palette**: About entry (search "about" from Cmd+K)
- **Build metadata**: `__APP_VERSION__`, `__GIT_HASH__`, `__BUILD_TIME__` globals injected via Vite
- **Window constraints**: Minimum window size 800x600, centered launch
- **Documentation**: Beta readiness checklist, release notes template, icon generation guide, branding assets README

### Changed
- **Sidebar logo**: Replaced Terminal (>_) icon with workspace (PanelsTopLeft) icon
- **Sidebar version**: Dynamic version display (was hardcoded "v1.0.0", now reads from package.json)
- **Empty states**: Unified all empty states to use PluginEmptyState component (Sidebar search, Command Palette, Settings Plugins tab)
- **Tauri config**: Fixed identifier (`com.devtoolbox.app` → `com.devtoolbox.desktop`), added bundle section stub
- **README**: Updated features table, project structure, keyboard shortcuts, roadmap

### Fixed
- **Build script**: `npm test` now runs `vitest run --passWithNoTests` (was missing, broke `npm run validate`)

---

## v0.1.0-beta.1 (2026-06-29) — Initial Beta

### Added
- AES-256-CBC / AES-256-ECB symmetric encryption (Rust backend)
- MD5 / SHA-256 hash computation
- Base64 encode/decode with Unicode and Emoji support
- URL encode/decode (encodeURIComponent / encodeURI)
- Timestamp to date-time conversion (seconds/milliseconds auto-detect)
- JSON format / compact
- JWT Token parser (Header / Payload / Signature + expiry detection)
- Config persistence (encoding preferences via Tauri Store)
- Plugin Architecture with 33 plugin definitions
- Design System with CSS custom properties (Fluent Design dark theme)
- Icon System with centralized SVG registry (APP_ICONS, TOOL_ICONS)
- Sidebar navigation with collapsible categories
- Command Palette (Cmd+K) with fuzzy search
- Dashboard with Recent / Favorites / All Tools grid
- AI Governance layer (AGENTS.md, CLAUDE.md, validation scripts)

### Security
- CSP enabled (`default-src 'self'`)
- Store permissions minimized (get/set/save/load only)
- AES implementation in Rust (no JS crypto)
- ECB PKCS7 padding strict validation

### Technical
- Tauri v2 + Vue 3 + TypeScript + Vite + Pinia + Vue Router
- Rust AES-256-CBC/ECB service
- 18 Rust unit tests
- 33 plugin stubs with `logic.ts` pure functions
- CI validation: architecture, design, plugins, AI governance
