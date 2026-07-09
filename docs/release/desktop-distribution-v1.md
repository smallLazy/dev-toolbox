---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Desktop Distribution v1.0 — Dev Toolbox

> **Purpose**: Packaging and distribution guide for Dev Toolbox desktop application.
> **Status**: v1.0 — macOS production-ready. Windows/Linux prepared.
> **Last Updated**: 2026-06-30 (Sprint 1.8)

---

## 1. Build Process

### Prerequisites

| Dependency | Version | Notes |
|------------|---------|-------|
| Node.js | >= 18 | Frontend build |
| Rust | latest stable | Backend compilation |
| Xcode CLI | any | macOS only (`xcode-select --install`) |
| MSVC Build Tools | any | Windows only |
| libwebkit2gtk | 4.1 | Linux only |

### Quick Build

```bash
# Development (frontend only, with hot reload)
npm run dev

# Frontend build only
npm run build

# macOS desktop app (.app + .dmg)
npm run build:mac

# All desktop platforms (runs validation first)
npm run build:release

# Full release pipeline (validate + build all)
npm run release
```

### Build Pipeline

```
npm run build:mac
    │
    ├── 1. beforeBuildCommand: npm run build
    │       ├── vue-tsc --noEmit        ← Type check
    │       └── vite build              ← Frontend bundle → dist/
    │
    ├── 2. cargo build --release        ← Rust compilation
    │       └── → src-tauri/target/release/dev-toolbox
    │
    ├── 3. Bundle .app                  ← macOS application bundle
    │       └── → target/release/bundle/macos/Dev Toolbox.app
    │
    └── 4. Bundle .dmg                  ← macOS disk image
            └── → target/release/bundle/dmg/Dev Toolbox_0.1.0_aarch64.dmg
```

---

## 2. Output Directory

All build artifacts are under `src-tauri/target/release/bundle/`:

```
bundle/
├── macos/
│   └── Dev Toolbox.app/               ← macOS application bundle
│       ├── Contents/
│       │   ├── Info.plist              ← App metadata
│       │   ├── MacOS/
│       │   │   └── dev-toolbox         ← Native binary (Mach-O arm64)
│       │   └── Resources/
│       │       └── icon.icns           ← App icon
├── dmg/
│   └── Dev Toolbox_0.1.0_aarch64.dmg  ← macOS installer
├── msi/                                ← Windows (future)
│   └── Dev Toolbox_0.1.0_x64.msi
├── nsis/                               ← Windows (future)
│   └── Dev Toolbox_0.1.0_x64-setup.exe
├── deb/                                ← Linux (future)
│   └── dev-toolbox_0.1.0_amd64.deb
└── appimage/                           ← Linux (future)
    └── Dev Toolbox_0.1.0_amd64.AppImage
```

---

## 3. Package Formats

| Platform | Format | Extension | Status |
|----------|--------|-----------|--------|
| macOS | Application Bundle | `.app` | ✅ Production |
| macOS | Disk Image | `.dmg` | ✅ Production |
| Windows | MSI Installer | `.msi` | 🔜 Prepared |
| Windows | NSIS Installer | `.exe` | 🔜 Prepared |
| Linux | Debian Package | `.deb` | 🔜 Prepared |
| Linux | AppImage | `.AppImage` | 🔜 Prepared |

### Current Build (Sprint 1.8)

```
Dev Toolbox_0.1.0_aarch64.dmg          6.5 MB
Dev Toolbox.app                         ~7 MB
Binary: Mach-O 64-bit arm64
Minimum macOS: 12.0
```

---

## 4. Release Checklist

### Before Release

- [ ] All CI Quality Gates pass (lint, typecheck, test, validate)
- [ ] Architecture validation clean
- [ ] Design validation clean
- [ ] AI validation clean
- [ ] `npm run build:mac` succeeds
- [ ] `.app` launch tested on clean macOS install
- [ ] `.dmg` mount and drag-to-install tested
- [ ] Dock icon displays correctly
- [ ] About page shows correct version and build info
- [ ] CHANGELOG.md updated
- [ ] Version bumped in `package.json`, `tauri.conf.json`, `Cargo.toml`

### Release Steps

```bash
# 1. Verify everything
npm run validate

# 2. Build for macOS
npm run build:mac

# 3. Test the .dmg
open src-tauri/target/release/bundle/dmg/

# 4. Tag and push
git tag v0.1.0
git push origin v0.1.0
```

---

## 5. Version Strategy

### Semantic Versioning

```
MAJOR.MINOR.PATCH

MAJOR — Breaking changes to Plugin API or Core
MINOR — New features, new plugins
PATCH — Bug fixes, design tweaks
```

### Current Version

```
0.1.0 — Beta (Sprint 1.8)
  - Core framework frozen
  - Plugin system operational
  - macOS packaging production-ready
```

### Version Files

| File | Field | Example |
|------|-------|---------|
| `package.json` | `version` | `"0.1.0"` |
| `src-tauri/tauri.conf.json` | `version` | `"0.1.0"` |
| `src-tauri/Cargo.toml` | `version` | `"0.1.0"` |

All three must be bumped together.

### Build Number

Build numbers are auto-generated from the build timestamp:

```
Format: YYMMDD.HHmm
Example: 260630.1416 → June 30, 2026 at 14:16
```

---

## 6. Code Signing Strategy (Future)

### macOS

```
Current: Unsigned (manual Gatekeeper bypass required)
Target:  Apple Developer ID signing
         → notarization via Apple Notary Service
         → Gatekeeper compliance
```

### Windows

```
Current: Unsigned
Target:  EV Code Signing Certificate
         → SmartScreen trust
```

### Signing Roadmap

| Milestone | Target |
|-----------|--------|
| v0.1.0-beta | Unsigned (developer distribution) |
| v0.5.0 | Apple Developer ID (macOS) |
| v1.0.0 | EV cert (Windows) + notarization (macOS) |

---

## 7. Auto-Update Roadmap

### Current

Auto-update is **not implemented**. Users must manually download new versions.

### Future

| Component | Plan |
|-----------|------|
| Update server | GitHub Releases API |
| Update check | `tauri-plugin-updater` |
| Signature verification | Required for production |
| Update UI | About → Check for Updates button (reserved) |

### Implementation Target

```
v0.3.0 — tauri-plugin-updater integration
v0.5.0 — signed updates + notarization
v1.0.0 — full auto-update pipeline
```

---

## 8. Troubleshooting

### Build fails: "rustc not found"

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

### Build fails: "linker `cc` not found"

```bash
# macOS
xcode-select --install

# Ubuntu
sudo apt install build-essential

# Windows
# Install Microsoft Visual Studio C++ Build Tools
```

### Build fails: "libwebkit2gtk not found" (Linux)

```bash
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev \
  libayatana-appindicator3-dev librsvg2-dev
```

### App crashes on launch

```bash
# Check console logs
# macOS
log stream --predicate 'process == "dev-toolbox"' --level debug

# Run from terminal to see output
./src-tauri/target/release/bundle/macos/Dev\ Toolbox.app/Contents/MacOS/dev-toolbox
```

### DMG won't open (macOS Gatekeeper)

The app is currently unsigned. To open:
1. Right-click the `.dmg` → Open
2. Or run: `xattr -cr /Applications/Dev\ Toolbox.app`

### Icon not showing in Dock

```bash
# macOS caches icons — force refresh
killall Dock
touch /Applications/Dev\ Toolbox.app
```

### Package size too large

```bash
# Check what's taking space
du -sh src-tauri/target/release/bundle/*/
ls -lhS src-tauri/target/release/bundle/dmg/

# Common causes:
# - Debug symbols in binary → already stripped in release
# - Large assets in dist/ → check vite build output
```

---

## 9. Related Documents

- `docs/release/release-engineering-v1.md` — CI/CD pipeline and quality gates
- `AGENTS.md` — Universal AI entry point
- `CLAUDE.md` — Claude-specific instructions
- `docs/ai/AI_ARCHITECTURE.md` — Platform architecture
