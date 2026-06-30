# Dev Toolbox

> **v0.1.0-beta.1** — Beta 内测版 | macOS arm64 | 不可公开发布

基于 **Tauri v2 + Vue 3 + TypeScript + Rust** 的桌面端开发者工具箱。

## 功能

| 工具 | 说明 |
|---|---|
| 🔐 参数加解密 | AES-256-CBC / AES-256-ECB 对称加解密，支持多种编码 |
| 📋 JSON 格式化 | JSON 格式化美化 / 压缩 |
| 🧾 SQL IN 列表 | 批量数据转换为 SQL IN 查询列表 |
| 🔤 Base64 编解码 | Base64 编码与解码，支持 Unicode |
| 🔗 URL 编解码 | URL 编码与解码 (encodeURIComponent / encodeURI) |
| ⏰ 时间戳转换 | 时间戳与日期时间互转 |
| 🔑 MD5 / SHA256 | 计算文本的哈希值 |
| 🎫 JWT 解析 | 解析 JWT Token 的 Header / Payload / Signature |
| ⚙️ 配置管理 | 管理默认编码设置，配置本地持久化 |

## 技术栈

- **前端**: Vue 3 + TypeScript + Vite + Pinia + Vue Router
- **后端**: Rust + Tauri v2
- **加解密**: AES-256 实现在 Rust 端，前端通过 `invoke` 调用
- **配置存储**: Tauri Store 插件 (`@tauri-apps/plugin-store`)

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
├── index.html                    # 入口 HTML
├── package.json                  # 前端依赖与脚本
├── vite.config.ts                # Vite 配置
├── tsconfig.json                 # TypeScript 配置
├── README.md
├── src/                          # 前端源码
│   ├── main.ts                   # 应用入口
│   ├── App.vue                   # 根组件
│   ├── env.d.ts                  # 类型声明
│   ├── components/
│   │   └── Sidebar.vue           # 左侧工具菜单
│   ├── layouts/
│   │   └── MainLayout.vue        # 主布局 (左侧菜单 + 右侧面板)
│   ├── router/
│   │   └── index.ts              # Vue Router 路由配置
│   ├── stores/
│   │   └── app.ts                # Pinia 全局状态（含配置管理）
│   └── modules/
│       ├── crypto/
│       │   └── CryptoView.vue    # 参数加解密面板
│       ├── json/
│       │   └── JsonView.vue      # JSON 格式化面板
│       ├── base64/
│       │   └── Base64View.vue    # Base64 编解码面板
│       ├── url/
│       │   └── UrlView.vue       # URL 编解码面板
│       ├── timestamp/
│       │   └── TimestampView.vue # 时间戳转换面板
│       ├── hash/
│       │   └── HashView.vue      # MD5 / SHA256 面板
│       ├── jwt/
│       │   └── JwtView.vue       # JWT 解析面板
│       └── config/
│           └── ConfigView.vue    # 配置管理面板
└── src-tauri/                    # Rust 后端
    ├── Cargo.toml                # Rust 依赖配置
    ├── tauri.conf.json           # Tauri 配置
    ├── build.rs                  # 构建脚本
    ├── capabilities/
    │   └── default.json          # 权限配置
    ├── icons/                    # 应用图标
    └── src/
        ├── main.rs               # Rust 入口
        ├── lib.rs                # Tauri 插件注册与命令注册
        ├── commands/
        │   ├── mod.rs
        │   └── aes_cmd.rs        # AES 加解密 Tauri command
        ├── services/
        │   ├── mod.rs
        │   └── crypto.rs         # AES-CBC / AES-ECB 核心逻辑
        └── models/
            └── mod.rs            # 数据结构定义
```

## 安全说明

- 加解密 Key、IV **不会**写死在代码中，需每次手动输入
- 加解密操作**不记录**明文参数，不记录 Key/IV
- 配置仅保存在本地 Tauri Store，不联网传输
- AES 加解密逻辑在 Rust 端执行

## 后续待补

- [ ] 运行 `npm run tauri icon ./src-tauri/icons/icon.png` 生成各平台图标
- [ ] 深色模式支持
- [ ] 多语言 (i18n)
- [ ] 加解密：支持更多算法 (DES, 3DES, RSA, SM4)
- [ ] Hash：支持更多算法 (SHA-1, SHA-512, SM3)
- [ ] 配置文件导入/导出
- [ ] 快捷键支持
- [ ] 单元测试 / E2E 测试
- [ ] CI/CD 自动构建
- [ ] 自动更新功能

## License

MIT
