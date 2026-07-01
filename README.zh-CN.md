# Dev Toolbox

语言：[English](./README.md) | 简体中文

> **v0.1.0-beta.2** — Beta 就绪 | macOS arm64

一款桌面开发者工具箱，涵盖加解密、编解码、格式化、转换与数据检视等常用工具。基于 **Tauri v2 + Vue 3 + TypeScript + Rust** 构建，采用**插件架构**，核心层冻结不动，所有功能通过插件独立扩展。

## 功能一览

Dev Toolbox 共有 **40 个插件定义**，其中 **10 个已激活**，**30 个即将上线**。

### 已激活工具

| 分类 | 工具 | 说明 |
|------|------|------|
| **加解密** | AES | AES-256-CBC / AES-256-ECB 对称加密（Rust 后端执行） |
| **加解密** | Hash | MD5 / SHA-256 哈希计算 |
| **转换** | Timestamp | Unix 时间戳 ↔ 日期时间互转（秒/毫秒自动识别） |
| **转换** | JSON Formatter | JSON 格式化、校验、压缩 |
| **编解码** | Base64 | Base64 编解码，完整支持 Unicode 和 Emoji |
| **编解码** | URL | URL 编解码（encodeURIComponent / encodeURI 两种模式） |
| **编解码** | JWT | JWT 解析（Header / Payload / Signature + 过期检测） |
| **编解码** | PHP Codec | PHP 兼容载荷编解码（多层转换管道） |
| **格式化** | SQL | 批量数据转 SQL IN 查询列表 |
| **工具** | Hello Plugin | 框架验证 — 确认 Workspace Core 正常运行 |

### 即将上线（30 个插件）

覆盖以下类别：**AI**（Agent、Explain、Prompt、Review、Translate）、**加解密**（RSA、SM2、SM3、SM4）、**编解码**（HTML Encode、Unicode）、**格式化**（Diff、Markdown、XML、YAML）、**网络**（cURL、GraphQL、HTTP Client、Request Decoder、WebSocket）、**转换**（Color、UUID）、**分析**（Regex）、**企业集成**（Gitee、GitHub、Jira、Sentry、WeCom、ZenTao）、**工具**（QR Code）。

### 内置功能

- **仪表盘** — 欢迎页、最近使用、收藏夹、全部工具网格
- **命令面板** — Cmd+K 模糊搜索，覆盖全部工具和命令
- **设置** — 默认编解码偏好，通过 Tauri Store 本地持久化
- **关于** — 版本信息、Git 提交哈希、构建时间、平台检测、插件数量、许可证

## 技术栈

| 层级 | 技术 |
|------|------|
| **桌面壳** | Tauri v2 |
| **前端** | Vue 3 + TypeScript + Vite 6 |
| **状态管理** | Pinia |
| **路由** | Vue Router 4 |
| **后端** | Rust（AES 加解密引擎） |
| **存储** | Tauri Store 插件（`@tauri-apps/plugin-store`） |
| **测试** | Vitest（前端）+ cargo test（Rust） |
| **CI/CD** | GitHub Actions |

## 快速上手

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://www.rust-lang.org/)（最新 stable）

**macOS**：
```bash
xcode-select --install
```

**Windows**：
- [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

**Linux**：
```bash
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file \
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

### 安装依赖

```bash
cd dev-toolbox
npm install
```

### 启动开发环境

```bash
npm run tauri dev
```

此命令会同时启动 Vite 开发服务器（端口 1420）和 Tauri 桌面窗口。

> **macOS 用户注意**：应用当前未签名。首次启动如遇安全警告，请前往**系统设置 → 隐私与安全性**，点击「仍要打开」。

### 构建桌面应用

```bash
# 生产构建（全部检查 + Tauri 打包）
npm run tauri build

# 按平台构建
npm run build:mac      # macOS DMG
npm run build:linux    # Linux DEB
npm run build:win      # Windows MSI

# 发布构建（完整校验 + 全平台打包）
npm run build:release
```

构建产物位于 `src-tauri/target/release/bundle/`。

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 仅启动 Vite 开发服务器（端口 1420） |
| `npm run tauri dev` | 启动 Vite + Tauri 桌面窗口 |
| `npm run build` | 类型检查 + Vite 生产构建 |
| `npm run tauri build` | 构建 Tauri 桌面应用包 |
| `npm run build:mac` | 构建 macOS DMG |
| `npm run build:linux` | 构建 Linux DEB |
| `npm run build:win` | 构建 Windows MSI |
| `npm run build:release` | 完整校验 + 全平台 Tauri 构建 |
| `npm test` | 运行全部单元测试（Vitest） |
| `npm run validate` | 完整 CI 质量门（类型检查 + 测试 + 架构 + 设计 + 插件 + AI） |
| `npm run validate:arch` | 架构合规检查 |
| `npm run validate:design` | Design Token 合规检查 |
| `npm run validate:plugins` | 插件结构校验 |
| `npm run validate:ai` | AI 治理合规检查 |
| `npm run create-plugin <name>` | 从模板生成新插件 |
| `npm run preview` | 本地预览生产构建 |

## 项目结构

```
dev-toolbox/
├── index.html                    # 入口 HTML
├── package.json                  # 依赖与脚本
├── vite.config.ts                # Vite 配置（注入构建元数据）
├── tsconfig.json                 # TypeScript 配置
├── AGENTS.md                     # AI Agent 入口文件
├── CLAUDE.md                     # Claude Code 专属指令
├── CHANGELOG.md                  # 发布历史
│
├── src/                          # 前端源码
│   ├── main.ts                   # 应用入口
│   ├── App.vue                   # 根组件
│   ├── env.d.ts                  # 类型声明
│   │
│   ├── core/                     # 核心框架 ❄ 冻结层
│   │   ├── Application.ts        # 应用生命周期
│   │   ├── PluginManager.ts      # 插件生命周期管理
│   │   ├── LifecycleManager.ts   # 生命周期钩子
│   │   ├── di.ts                 # 依赖注入
│   │   ├── event-bus.ts          # 事件系统
│   │   ├── command-bus.ts        # 命令系统
│   │   ├── build-info.ts         # 构建元数据工具
│   │   ├── plugin-types.ts       # 插件类型定义
│   │   ├── registry/             # 工具与命令注册中心
│   │   └── services/             # 服务容器
│   │
│   ├── sdk/                      # Feature SDK + Plugin SDK ❄ 冻结层
│   │
│   ├── plugins/                  # 插件清单（共 40 个）
│   │   ├── index.ts              # 插件统一导出
│   │   ├── base64.plugin.ts      # 已激活插件示例
│   │   ├── crypto.plugin.ts
│   │   ├── json.plugin.ts
│   │   └── ...                   # 另 36 个插件定义
│   │
│   ├── features/                 # 功能实现（共 40 个）
│   │   ├── base64/               # Base64 编解码
│   │   ├── crypto/               # AES 加解密（Rust 后端）
│   │   ├── hash/                 # MD5 / SHA-256
│   │   ├── json/                 # JSON 格式化
│   │   ├── jwt/                  # JWT 解析
│   │   ├── timestamp/            # 时间戳转换
│   │   ├── url/                  # URL 编解码
│   │   ├── sql/                  # SQL IN 构建器
│   │   └── ...                   # 另 31 个功能
│   │
│   ├── components/               # 共享 UI 组件 ❄ 冻结层
│   │   ├── Sidebar.vue           # 侧边栏导航
│   │   ├── CommandPalette.vue    # Cmd+K 命令面板
│   │   ├── DashboardGrid.vue     # 全部工具网格
│   │   ├── DashboardCard.vue     # 工具卡片
│   │   ├── DashboardRecent.vue   # 最近使用
│   │   ├── DashboardFavorites.vue # 收藏工具
│   │   ├── DashboardWelcome.vue  # 首次启动欢迎页
│   │   └── ToolUnavailable.vue   # 未激活工具占位
│   │
│   ├── templates/                # 页面模板
│   │   ├── ToolPage.vue          # 标准工具页布局
│   │   ├── PluginWorkspace.vue   # 插件工作区包装
│   │   ├── ToolHeader.vue        # 工具标题栏
│   │   ├── ToolActions.vue       # 操作按钮栏
│   │   ├── ToolOutputPanel.vue   # 输出展示面板
│   │   ├── ToolSection.vue       # 工具内容区
│   │   ├── ToolSegmentedControl.vue # 模式切换控件
│   │   └── PluginEmptyState.vue  # 空状态占位
│   │
│   ├── modules/                  # 内置应用页（首页、关于、设置、SQL）
│   ├── presets/                  # Codec 预设（如 PHP 兼容管道）
│   ├── layouts/                  # 应用布局 ❄ 冻结层
│   ├── router/                   # Vue Router 配置（插件系统自动管理）
│   ├── stores/                   # Pinia 状态（app、workspace）
│   ├── composables/              # Vue 组合式函数
│   ├── design/                   # 设计系统
│   │   └── icons/index.ts        # 集中式 SVG 图标注册中心
│   ├── assets/                   # 静态资源（theme.css）
│   ├── shared/                   # 共享工具（剪贴板、管道等）
│   ├── playground/               # 开发试验场
│
├── src-tauri/                    # Rust 后端
│   ├── Cargo.toml                # Rust 依赖
│   ├── tauri.conf.json           # Tauri 配置（窗口、打包、CSP）
│   ├── build.rs                  # 构建脚本
│   ├── capabilities/
│   │   └── default.json          # 权限声明
│   ├── icons/                    # 应用图标（全平台）
│   └── src/
│       ├── main.rs               # Rust 入口
│       ├── lib.rs                # Tauri 插件与命令注册
│       ├── commands/
│       │   ├── mod.rs
│       │   └── aes_cmd.rs        # AES 加密 Tauri 命令
│       ├── services/
│       │   ├── mod.rs
│       │   └── crypto.rs         # AES-CBC / AES-ECB 核心逻辑
│       └── models/
│           └── mod.rs            # 数据结构
│
├── scripts/                      # 工具脚本
│   ├── create-plugin.ts          # 插件生成器
│   └── ci/                       # CI 校验脚本
│       ├── validate-architecture.ts
│       ├── validate-design.ts
│       ├── validate-plugins.ts
│       ├── validate-navigation.ts
│       └── validate-ai.ts
│
├── docs/                         # 文档（SSOT 唯一真相来源）
│   ├── ai/                       # AI 导向指南
│   ├── architecture/             # 架构规范
│   ├── design/                   # 设计系统规范
│   ├── platform/                 # 平台冻结策略
│   ├── sdk/                      # SDK API 文档
│   ├── product/                  # 产品与完成标准
│   ├── plugin/                   # 插件生成器文档
│   ├── plugin-specs/             # 各插件规格说明
│   ├── release/                  # 发布工程
│   ├── releases/                 # 发布说明
│   └── checklists/               # QA 检查清单
│
└── .github/workflows/            # CI/CD 流水线
    ├── ci.yml                    # 质量门（lint、测试、校验、构建）
    ├── build.yml                 # 构建流水线
    └── release.yml               # 发布流水线
```

## 开发指南

### 插件架构

Dev Toolbox 采用 **8 层单向插件架构**：

```
Application → Plugins → Features → Patterns → Layouts → Components → Core → Foundation
```

- **上层依赖下层，绝不反向。**
- **Core Framework** 和 **SDK** 已**冻结** — 所有新功能都以插件形式添加。
- **每个 Feature 独立可删除** — 禁止跨 Feature 导入。

### 创建新插件

> **必须使用插件生成器。** 禁止手动创建插件目录。

```bash
npm run create-plugin <name> -- --template=<type>
```

生成内容包括：
- 插件清单（`src/plugins/<name>.plugin.ts`）
- 功能实现（`src/features/<name>/`）
- 逻辑模块（`logic.ts` — **必须是纯函数**）
- 测试文件（`__tests__/logic.test.ts` — **最少 5 个测试**）
- README 和 CHANGELOG

### 设计规范

| 规则 | ✅ 正确做法 | ❌ 禁止做法 |
|------|------------|------------|
| **颜色** | `var(--color-*)` | `#XXXXXX` |
| **间距** | `var(--space-*)` | `16px`、`20px` |
| **字体** | `var(--text-*)` | `13px`、`14px` |
| **图标** | `@/design/icons` | 直接导入 `lucide-vue-next` |
| **图标** | 从图标注册中心取 SVG 组件 | 在模板中使用 Emoji |
| **布局** | `Card + Section` 模式 | 自定义布局 |

### 测试

```bash
# 全部测试
npm test

# 单个插件
npx vitest run src/features/base64/
```

每个插件要求 **5 个以上单元测试**，覆盖其 `logic.ts`。测试是纯函数测试 — 不涉及 DOM、Tauri API 或副作用。

## 质量检查

提交前请执行完整校验：

```bash
npm run validate
```

此命令依次执行：

| 检查项 | 对应命令 | 校验内容 |
|--------|---------|---------|
| TypeScript | `vue-tsc --noEmit` | 全部 `.ts` 和 `.vue` 文件的类型正确性 |
| 单元测试 | `vitest run` | 全部插件逻辑测试通过 |
| 架构 | `validate-architecture.ts` | 层级边界、冻结层合规、无跨 Feature 导入 |
| 设计 | `validate-design.ts` | Design Token 使用、无硬编码值 |
| 插件 | `validate-plugins.ts` | 插件结构、必需文件、注册正确性 |
| AI 治理 | `validate-ai.ts` | AI 可读文档存在性、CLAUDE.md/AGENTS.md 合规 |

单独执行某项检查：

```bash
npm run validate:arch       # 仅架构
npm run validate:design     # 仅设计令牌
npm run validate:plugins    # 仅插件结构
npm run validate:ai         # 仅 AI 治理
npx vue-tsc --noEmit        # 仅 TypeScript
npm test                    # 仅测试
```

### CI/CD

每次向 `master` 分支发起 PR 或推送时，GitHub Actions 会自动运行完整质量门：

- **Lint & Typecheck** — `vue-tsc` + `cargo clippy`
- **单元测试** — Vitest + `cargo test` + 代码覆盖率（tarpaulin）
- **插件校验** — 结构与注册检查
- **导航校验** — 路由与侧边栏完整性
- **设计校验** — Token 合规
- **架构校验** — 层级边界执行
- **构建检查** — 生产构建 + `cargo build --release`
- **质量门** — 全通过才算合格

## 安全说明

- AES-256 加解密在 **Rust** 端执行，不使用 JavaScript 加密
- 密钥和 IV **永不硬编码** — 每次会话由用户提供
- 加解密操作**不记录**明文、密钥或 IV
- 设置仅通过 Tauri Store **本地存储** — 不联网传输
- CSP 已启用：`default-src 'self'`
- Store 权限最小化：仅 get/set/save/load

## 文档索引

| 文档 | 说明 |
|------|------|
| [AGENTS.md](./AGENTS.md) | 通用 AI Agent 入口 |
| [CLAUDE.md](./CLAUDE.md) | Claude Code 专属指令 |
| [CHANGELOG.md](./CHANGELOG.md) | 发布历史与变更记录 |
| `docs/ai/AI_OVERVIEW.md` | 面向 AI Agent 的项目介绍 |
| `docs/ai/AI_ARCHITECTURE.md` | 插件架构详解 |
| `docs/ai/AI_PLUGIN_GUIDE.md` | 插件开发分步指南 |
| `docs/ai/AI_UI_GUIDE.md` | 设计系统合规指南 |
| `docs/ai/AI_CODE_REVIEW.md` | 代码审查清单 |
| `docs/ai/AI_RELEASE.md` | 发布清单 |
| `docs/ai/AI_CONTEXT_GRAPH.md` | 文档阅读顺序图 |
| `docs/ai/AI_DECISIONS.md` | 架构决策记录 |
| `docs/design/design-system-v2.md` | 设计系统 SSOT |
| `docs/design/ui-copy-guidelines.md` | UI 文案语言一致性规范 |
| `docs/design/ui-guidelines-v1.md` | 页面布局与组件模式 |
| `docs/design/icon-guidelines-v1.md` | 图标系统规则 |
| `docs/platform/platform-freeze-v1.md` | 冻结层说明 |
| `docs/sdk/feature-sdk-v1.md` | Feature SDK API 参考 |
| `docs/sdk/plugin-sdk-v1.md` | Plugin SDK API 参考 |
| `docs/product/plugin-definition-of-done-v1.md` | 插件完成标准 |
| `docs/release/release-engineering-v1.md` | 发布工程指南 |

## 许可证

MIT — 详见 [package.json](./package.json)。

---

> **贡献方式**：所有贡献通过插件进行。Core 和 SDK 已冻结。开发规则详见 [AGENTS.md](./AGENTS.md)。
