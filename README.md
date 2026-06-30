# Dev Toolbox

> **v0.1.0-beta.2** — Beta Readiness | macOS arm64

A desktop developer toolbox — crypto, encoding, formatting, conversion, and inspection tools. Built on **Tauri v2 + Vue 3 + TypeScript + Rust**.

## Features

| Tool | Description |
|------|-------------|
| AES Crypto | AES-256-CBC / AES-256-ECB symmetric encryption with multiple encodings |
| JSON Formatter | Format, beautify, and compact JSON |
| SQL IN List | Convert batch data to SQL IN query lists |
| Base64 | Encode and decode with Unicode support |
| URL Encode | URL encoding and decoding (encodeURIComponent / encodeURI) |
| Timestamp | Convert between timestamps and date-time |
| MD5 / SHA256 | Compute text hash values |
| JWT Parser | Parse JWT Header / Payload / Signature with expiry detection |
| Settings | Manage default encoding preferences, persisted locally |
| About | Version info, build details, plugin registry, license |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd+K | Open Command Palette |
| Arrow Up/Down | Navigate Command Palette |
| Enter | Execute selected action |
| Escape | Close Command Palette / cancel |
| Tab / Shift+Tab | Navigate focus between elements |

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite + Pinia + Vue Router
- **Backend**: Rust + Tauri v2
- **Crypto**: AES-256 executed in Rust, invoked from frontend via IPC
- **Storage**: Tauri Store plugin (`@tauri-apps/plugin-store`)

## 前置依赖

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://www.rust-lang.org/) (latest stable)
- 系统依赖 (macOS):
  ```bash
  xcode-select --install
  ```
- 系统依赖 (Windows):
  - [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- 系统依赖 (Linux):
  ```bash
  sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
  ```

## 安装依赖

```bash
# 克隆或进入项目目录
cd dev-toolbox

# 安装前端依赖
npm install

# 生成 Tauri 图标（可选，首次构建前执行）
npm run tauri icon
```

## 启动开发环境

```bash
npm run tauri dev
```

这会同时启动 Vite 开发服务器 (端口 1420) 和 Tauri 桌面窗口。

### 内测运行方式 (Beta)

> ⚠️ macOS 用户：应用当前未签名。首次启动如遇安全警告，打开 `系统设置 → 隐私与安全性` → 点击 "仍要打开"。

```bash
# 克隆或进入项目目录
cd dev-toolbox

# 安装前端依赖
npm install

# 开发模式（源码运行）
PATH="$HOME/.cargo/bin:$PATH" npm run tauri dev

# 构建 release 包
npm run tauri build
```

**如果 `cargo` 不在 PATH 中**，需要显式指定路径：
```bash
PATH="$HOME/.cargo/bin:$PATH" npm run tauri dev
```

**内测前必读**: 请先执行 `docs/checklists/v0.1.0-beta.1-manual-checklist.md` 中的 6 个 Release Gate 验收项。

**反馈方式**: 见 `docs/releases/v0.1.0-beta.1.md` 中的反馈模板。

## 构建安装包

```bash
npm run tauri build
```

构建产物在 `src-tauri/target/release/bundle/` 目录下。

## 项目结构

```
dev-toolbox/
├── index.html                    # Entry HTML
├── package.json                  # Frontend dependencies & scripts
├── vite.config.ts                # Vite config (with build metadata)
├── tsconfig.json                 # TypeScript config
├── README.md
├── src/                          # Frontend source
│   ├── main.ts                   # App entry
│   ├── App.vue                   # Root component
│   ├── env.d.ts                  # Type declarations
│   ├── components/
│   │   ├── Sidebar.vue           # Navigation sidebar
│   │   ├── CommandPalette.vue    # Cmd+K command palette
│   │   ├── DashboardWelcome.vue  # First-launch welcome
│   │   ├── DashboardCard.vue     # Tool card
│   │   ├── DashboardGrid.vue     # All tools grid
│   │   ├── DashboardRecent.vue   # Recently used
│   │   └── DashboardFavorites.vue # Favorited tools
│   ├── layouts/
│   │   └── MainLayout.vue        # Main layout (Sidebar + Content)
│   ├── router/
│   │   └── index.ts              # Vue Router config
│   ├── stores/
│   │   ├── app.ts                # App config store
│   │   └── workspace.ts          # Workspace store (tools, recent, favorites)
│   ├── composables/
│   │   ├── useCommandPalette.ts  # Command palette state
│   │   ├── useTools.ts           # Tool listing
│   │   ├── useRecent.ts          # Recent tools
│   │   └── useFavorites.ts       # Favorite tools
│   ├── templates/
│   │   └── PluginEmptyState.vue  # Reusable empty state
│   ├── modules/
│   │   ├── home/
│   │   │   └── DashboardView.vue # Dashboard page
│   │   ├── about/
│   │   │   └── AboutView.vue     # About page
│   │   ├── crypto/
│   │   │   └── CryptoView.vue    # AES Crypto
│   │   ├── base64/
│   │   │   └── Base64View.vue    # Base64
│   │   ├── url/
│   │   │   └── UrlView.vue       # URL Encode
│   │   ├── timestamp/
│   │   │   └── TimestampView.vue # Timestamp
│   │   ├── hash/
│   │   │   └── HashView.vue      # MD5 / SHA256
│   │   ├── jwt/
│   │   │   └── JwtView.vue       # JWT Parser
│   │   └── config/
│   │       └── SettingsView.vue  # Settings
│   ├── design/
│   │   └── icons/
│   │       └── index.ts          # Icon registry (SSOT)
│   └── plugins/
│       └── index.ts              # Plugin barrel (33 plugins)
└── src-tauri/                    # Rust backend
    ├── Cargo.toml                # Rust dependencies
    ├── tauri.conf.json           # Tauri config (window, bundle, CSP)
    ├── build.rs                  # Build script
    ├── capabilities/
    │   └── default.json          # Permissions
    ├── icons/                    # App icons
    └── src/
        ├── main.rs               # Rust entry
        ├── lib.rs                # Tauri plugin & command registration
        ├── commands/
        │   ├── mod.rs
        │   └── aes_cmd.rs        # AES crypto Tauri command
        ├── services/
        │   ├── mod.rs
        │   └── crypto.rs         # AES-CBC / AES-ECB core logic
        └── models/
            └── mod.rs            # Data structures
```

## 安全说明

- 加解密 Key、IV **不会**写死在代码中，需每次手动输入
- 加解密操作**不记录**明文参数，不记录 Key/IV
- 配置仅保存在本地 Tauri Store，不联网传输
- AES 加解密逻辑在 Rust 端执行

## Roadmap

- [ ] Generate high-resolution app icons (1024x1024 source)
- [ ] Code signing & notarization (macOS)
- [ ] Multi-platform builds (Intel Mac, Windows, Linux)
- [ ] Auto-updater (Tauri updater plugin)
- [ ] More crypto algorithms (GCM, CTR, RSA, SM4)
- [ ] More hash algorithms (SHA-1, SHA-512, SM3)
- [ ] Dark mode
- [ ] i18n (multi-language)
- [ ] E2E tests (Playwright)
- [ ] CI/CD (GitHub Actions)
- [ ] Plugin marketplace

## License

MIT
