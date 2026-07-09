---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Developer Workspace — Architecture Specification v1.0

> **定位**: 可扩展至上百个开发工具的企业级 Tauri + Vue3 Workspace。
> **设计原则**: 插件化、分层解耦、零修改扩展、长期可维护。
> **用于**: Cursor / Claude Code / Codex 系统规范。

---

## 1. Workspace Architecture（分层架构）

```
┌──────────────────────────────────────────────┐
│                  Application                  │  ← 入口、窗口管理、生命周期
├──────────────────────────────────────────────┤
│                   Plugins                     │  ← 每个工具的 Plugin Manifest
├──────────────────────────────────────────────┤
│                  Features                     │  ← 工具的业务逻辑实现
├──────────────────────────────────────────────┤
│                  Patterns                     │  ← 可复用的页面模式 (ToolPage)
├──────────────────────────────────────────────┤
│                  Layouts                      │  ← 布局组件 (Workspace, SplitView)
├──────────────────────────────────────────────┤
│                 Components                    │  ← UI 组件库 (Button, Card, Input...)
├──────────────────────────────────────────────┤
│                    Core                       │  ← Registry, Service, Command Bus
├──────────────────────────────────────────────┤
│                 Foundation                    │  ← Design Token, Theme, I18n, Types
└──────────────────────────────────────────────┘
```

### 层职责

| 层 | 职责 | 依赖方向 | 示例 |
|----|------|----------|------|
| **Foundation** | Design Token, 类型定义, i18n 字符串, 全局常量 | 无依赖 | `tokens.css`, `types.ts`, `i18n/` |
| **Core** | 基础设施：Registry, Service Bus, Command Bus, IPC Bridge | 仅依赖 Foundation | `registry.ts`, `clipboard.ts`, `ipc.ts` |
| **Components** | Design System 规定的 UI 组件库 | 依赖 Foundation | `Button.vue`, `Card.vue`, `Sidebar.vue` |
| **Layouts** | 应用级布局（Workspace, SplitView） | 依赖 Components | `WorkspaceLayout.vue`, `SplitView.vue` |
| **Patterns** | 页面级可复用模式 | 依赖 Layouts + Components | `ToolPage.vue`, `ToolPageHeader.vue` |
| **Features** | 工具业务逻辑（纯函数 + Composables） | 依赖 Core + Patterns | `aes/`, `jwt/`, `json/` |
| **Plugins** | 工具的 Plugin Manifest（声明式注册） | 依赖 Features + Core | `aes.plugin.ts`, `jwt.plugin.ts` |
| **Application** | 入口、窗口创建、Plugin 加载、生命周期 | 依赖 Plugins | `main.ts`, `App.vue`, `plugin-loader.ts` |

### 关键规则

- **上层可依赖下层，下层永不可依赖上层**
- **同层之间禁止互相引用**（Feature A 不可 import Feature B）
- **跨层通信仅通过 Core 的 Registry / Service / Event Bus**

---

## 2. Feature Architecture（Feature 工程）

### 2.1 Feature 标准目录

```
src/features/
├── aes/
│   ├── index.ts              ← 公共导出（Plugin 引用此文件）
│   ├── aes.worker.ts         ← 可选: Web Worker（大计算量）
│   ├── logic.ts              ← 纯业务逻辑（可单元测试）
│   ├── composables.ts        ← Vue Composables (useAes)
│   ├── types.ts              ← Feature 专属类型
│   ├── constants.ts          ← 常量（算法列表、编码列表...）
│   ├── AesView.vue           ← 主 UI 组件
│   ├── AesConfigSection.vue  ← 可选的子组件
│   └── __tests__/
│       ├── logic.test.ts
│       └── AesView.test.ts
├── jwt/
│   └── ...
├── json/
│   └── ...
└── curl/
    └── ...
```

### 2.2 Feature 契约

每个 Feature 必须导出以下接口：

```typescript
// src/features/aes/index.ts
export { AesView } from './AesView.vue'           // 主视图组件
export { useAesLogic } from './composables'       // Composable (逻辑复用)
export { aesEncrypt, aesDecrypt } from './logic'  // 纯函数 (可测试)
export type { AesConfig, AesResult } from './types'
```

### 2.3 Feature 约束

| 约束 | 说明 |
|------|------|
| **独立** | Feature 不可 import 其他 Feature |
| **低耦合** | Feature 仅依赖 `Core`（Services）和 `Patterns`（ToolPage 模板） |
| **可测试** | `logic.ts` 是纯函数，可直接 `vitest` |
| **可删除** | 删除 `src/features/aes/` + 删除 Plugin 文件，不影饷任何其他代码 |
| **Lazy Load** | Vue Router 使用 `() => import(...)` 动态加载 |
| **插件注册** | 通过独立的 Plugin 文件注册到 Registry |

### 2.4 Feature 通信

Feature 之间**不直接通信**。需要跨 Feature 交互时：

```
Feature A → Core Event Bus → Feature B
```

例如：JWT 解析结果 → 复制到剪贴板 → Base64 工具粘贴：

```
JwtFeature → ClipboardService.write(text)
Base64Feature → ClipboardService.read()  (用户主动粘贴)
```

---

## 3. Plugin System（插件系统）

### 3.1 Plugin Manifest

```typescript
// src/plugins/aes.plugin.ts
import type { ToolPlugin } from '@/core/plugin-types'
import { AesView } from '@/features/aes'

export const aesPlugin: ToolPlugin = {
  // ── 元信息 ──
  id: 'aes',
  name: 'AES 加解密',
  description: 'AES-256 对称加解密，支持 CBC / ECB 模式',
  icon: '🔐',
  version: '1.0.0',
  category: 'crypto',            // 'crypto' | 'encoder' | 'formatter' | 'converter' | 'analyzer' | 'utility'

  // ── 路由 ──
  route: {
    path: '/aes',
    component: () => import('@/features/aes/AesView.vue'),
  },

  // ── 命令（Command Palette 可用）──
  commands: [
    { id: 'aes:encrypt', label: 'AES 加密', shortcut: 'Cmd+Shift+E' },
    { id: 'aes:decrypt', label: 'AES 解密', shortcut: 'Cmd+Shift+D' },
  ],

  // ── 快捷键 ──
  shortcuts: {
    'aes:encrypt': { default: 'Cmd+Shift+E', mac: 'Cmd+Shift+E' },
    'aes:decrypt': { default: 'Cmd+Shift+D', mac: 'Cmd+Shift+D' },
  },

  // ── 搜索关键词 ──
  searchKeywords: ['aes', 'encrypt', 'decrypt', 'cbc', 'ecb', '加密', '解密'],

  // ── 权限（未来）──
  permissions: ['clipboard:read', 'clipboard:write'],

  // ── 设置 ──
  settings: {
    keyEncoding: { type: 'select', options: ['utf8', 'hex', 'base64'], default: 'utf8' },
    ivEncoding:  { type: 'select', options: ['utf8', 'hex', 'base64'], default: 'utf8' },
    inputEncoding: { type: 'select', options: ['utf8', 'hex', 'base64'], default: 'utf8' },
    outputEncoding: { type: 'select', options: ['hex', 'base64'], default: 'base64' },
  },

  // ── 历史记录 ──
  history: {
    enabled: true,
    maxItems: 20,
    fields: ['mode', 'algorithm', 'input', 'output'],
  },
}
```

### 3.2 Plugin 生命周期

```
Register  →  Plugin 文件被 `plugin-loader.ts` 扫描
          →  注册到 ToolRegistry, CommandRegistry, ShortcutRegistry, SearchRegistry
          →  Router 自动添加路由
          →  Sidebar 自动添加菜单项 (从 ToolRegistry 读取)

Activate  →  用户首次导航到该工具
          →  Lazy Load Feature 组件
          →  Feature 的 `setup()` 执行

Deactivate →  用户离开工具页面
          →  Feature 组件被卸载
          →  非持久化状态被清除

Unregister →  (未来) 动态卸载 Plugin
          →  从所有 Registry 移除
          →  Router 移除路由
```

### 3.3 新增工具的步骤

```
1. 创建 src/features/new-tool/
   ├── index.ts
   ├── logic.ts
   ├── composables.ts
   ├── NewToolView.vue
   └── types.ts

2. 创建 src/plugins/new-tool.plugin.ts
   → 填写 ToolPlugin manifest

3. 完成。
   ✅ 无需修改 Sidebar
   ✅ 无需修改 Router
   ✅ 无需修改 Workspace
   ✅ 无需修改任何现有代码
```

---

## 4. Registry（注册中心）

### 4.1 Registry 架构

```typescript
// src/core/registry/

// ── Tool Registry ──
interface ToolRegistry {
  register(plugin: ToolPlugin): void
  unregister(id: string): void
  get(id: string): ToolPlugin | undefined
  getAll(): ToolPlugin[]
  getByCategory(category: string): ToolPlugin[]
  getFavorites(): ToolPlugin[]          // 从 FavoriteRegistry 读取
  getRecent(): ToolPlugin[]             // 从 HistoryRegistry 读取
  search(query: string): ToolPlugin[]   // 模糊搜索
}

// ── Command Registry ──
interface CommandRegistry {
  register(pluginId: string, commands: Command[]): void
  unregister(pluginId: string): void
  getAll(): Command[]
  search(query: string): Command[]
  execute(commandId: string): Promise<void>
}

// ── Shortcut Registry ──
interface ShortcutRegistry {
  register(pluginId: string, shortcuts: Record<string, ShortcutDef>): void
  unregister(pluginId: string): void
  resolve(event: KeyboardEvent): string | null   // → commandId
}

// ── Search Registry ──
interface SearchRegistry {
  register(pluginId: string, keywords: string[]): void
  unregister(pluginId: string): void
  search(query: string): SearchResult[]
}

// ── History Registry ──
interface HistoryRegistry {
  record(pluginId: string, entry: HistoryEntry): void
  getRecent(pluginId?: string, limit?: number): HistoryEntry[]
  getToolHistory(pluginId: string): HistoryEntry[]
  clear(pluginId?: string): void
}

// ── Recent Registry ──
interface RecentRegistry {
  touch(pluginId: string): void         // 记录使用
  getAll(limit?: number): string[]      // → pluginId[]
}

// ── Favorite Registry ──
interface FavoriteRegistry {
  add(pluginId: string): void
  remove(pluginId: string): void
  isFavorite(pluginId: string): boolean
  getAll(): string[]
}
```

### 4.2 生命周期

```
App 启动:
  1. initRegistries()         ← 创建空 Registry 实例
  2. loadAllPlugins()         ← 扫描 src/plugins/*.plugin.ts
  3. forEach plugin:
       ToolRegistry.register(plugin)
       CommandRegistry.register(plugin.id, plugin.commands)
       ShortcutRegistry.register(plugin.id, plugin.shortcuts)
       SearchRegistry.register(plugin.id, plugin.searchKeywords)
       Router.addRoute(plugin.route)
  4. Sidebar 从 ToolRegistry.getAll() 渲染菜单
  5. Command Palette 从 CommandRegistry.getAll() 渲染命令列表

Plugin 激活:
  1. RecentRegistry.touch(pluginId)
  2. 如果 plugin.history.enabled → HistoryRegistry.record(...)
  3. Settings 从 plugin.settings 读取默认值

Plugin 卸载:
  1. 所有 Registry.unregister(pluginId)
  2. Router.removeRoute(plugin.route.path)
  3. Sidebar 自动更新 (响应式)
```

---

## 5. Service Layer（服务层）

### 5.1 Service API

```typescript
// src/core/services/

// ── ClipboardService ──
interface ClipboardService {
  write(text: string): Promise<void>
  read(): Promise<string>
  writeImage(data: Uint8Array): Promise<void>
}

// ── StorageService ──
interface StorageService {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
  keys(): Promise<string[]>
}

// ── ConfigService ──
interface ConfigService {
  get<T>(pluginId: string, key: string): Promise<T | null>
  set<T>(pluginId: string, key: string, value: T): Promise<void>
  getAll(pluginId: string): Promise<Record<string, any>>
  reset(pluginId: string): Promise<void>
}

// ── ThemeService ──
interface ThemeService {
  getMode(): 'dark' | 'light' | 'system'
  setMode(mode: 'dark' | 'light' | 'system'): void
  getAccentColor(): string
  setAccentColor(color: string): void
  onChanged(callback: (mode: string) => void): () => void  // unsubscribe
}

// ── WindowService ──
interface WindowService {
  setTitle(title: string): void
  setSize(width: number, height: number): void
  center(): void
  minimize(): void
  maximize(): void
  close(): void
  onCloseRequested(callback: () => Promise<boolean>): void
}

// ── NotificationService ──
interface NotificationService {
  toast(toast: ToastOptions): string     // → toastId
  dismiss(toastId: string): void
  success(title: string, description?: string): void
  error(title: string, description?: string): void
  info(title: string, description?: string): void
  warning(title: string, description?: string): void
}

// ── LoggerService ──
interface LoggerService {
  debug(pluginId: string, message: string, data?: any): void
  info(pluginId: string, message: string, data?: any): void
  warn(pluginId: string, message: string, data?: any): void
  error(pluginId: string, message: string, error?: Error): void
}

// ── UpdaterService ──
interface UpdaterService {
  checkForUpdates(): Promise<UpdateInfo | null>
  downloadUpdate(): Promise<void>
  installUpdate(): Promise<void>
  onUpdateAvailable(callback: (info: UpdateInfo) => void): void
}

// ── CommandService ──
interface CommandService {
  execute(commandId: string, ...args: any[]): Promise<any>
  registerHandler(commandId: string, handler: CommandHandler): void
  unregisterHandler(commandId: string): void
}

// ── AIService ──
interface AIService {
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>
  stream(messages: ChatMessage[], options?: ChatOptions): AsyncIterable<string>
  abort(): void
}
```

### 5.2 Service 实例化

所有 Service 通过依赖注入容器 (DI Container) 管理：

```typescript
// src/core/services/index.ts
import { createServiceContainer } from '@/core/di'

export const services = createServiceContainer({
  clipboard: () => new TauriClipboardService(),
  storage:    () => new TauriStorageService(),
  config:     () => new TauriConfigService(),
  theme:      () => new ThemeServiceImpl(),
  window:     () => new TauriWindowService(),
  notification: () => new NotificationServiceImpl(),
  logger:     () => new LoggerServiceImpl(),
  updater:    () => new TauriUpdaterService(),
  command:    () => new CommandServiceImpl(),
  ai:         () => new AIServiceImpl(),
})

// Feature 中使用:
import { services } from '@/core/services'
await services.clipboard.write('hello')
```

---

## 6. Dependency Rules（依赖规则）

### 6.1 依赖方向（单向）

```
Application ──────→ Plugins ──────→ Features ──────→ Patterns ──────→ Layouts ──────→ Components ──────→ Core ──────→ Foundation
      │                 │               │                │                │                │                  │              │
      └─────────────────┴───────────────┴────────────────┴────────────────┴────────────────┴──────────────────┴──────────────┘
                                          所有层都可以依赖 Foundation (Design Token, Types)
```

### 6.2 禁止项

| 规则 | 违规示例 | 后果 |
|------|----------|------|
| ❌ Feature → Feature | `import { useJwt } from '@/features/jwt'` inside `features/aes/` | 删除 JWT 导致 AES 崩溃 |
| ❌ Component → Feature | `import { useAes } from '@/features/aes'` inside `components/Button.vue` | 组件不再是通用组件 |
| ❌ Pattern → Plugin | `import { aesPlugin } from '@/plugins/aes.plugin'` inside `patterns/ToolPage.vue` | Pattern 耦合到具体工具 |
| ❌ Core → Feature | `import { AesView } from '@/features/aes'` inside `core/registry.ts` | Core 不应知道具体 Feature |
| ❌ Feature → Component（自定义样式） | `style="background: #1A1A1A"` | 破坏 Design System |
| ❌ 同层 import | `import { foo } from '@/features/jwt/logic'` in `features/aes/` | 循环依赖风险 |

### 6.3 允许项

| 规则 | 示例 |
|------|------|
| ✅ Feature → Core | `import { services } from '@/core/services'` |
| ✅ Feature → Pattern | `import { ToolPage } from '@/patterns/ToolPage.vue'` |
| ✅ Feature → Foundation | `import type { ToolConfig } from '@/foundation/types'` |
| ✅ Plugin → Feature | `import { AesView } from '@/features/aes'` |
| ✅ Plugin → Core | `import { ToolPlugin } from '@/core/plugin-types'` |

### 6.4 依赖图

```
┌─────────────────────────────────────────────────────────────┐
│                       Application                           │
│  main.ts, App.vue, plugin-loader.ts, router-setup.ts       │
└──────────┬──────────────────────────────────────────────────┘
           │ imports
┌──────────▼──────────────────────────────────────────────────┐
│                        Plugins                              │
│  aes.plugin.ts, jwt.plugin.ts, json.plugin.ts ...          │
│  → import { XxxView } from '@/features/xxx'                │
│  → import { ToolPlugin } from '@/core/plugin-types'        │
└──────────┬──────────────────────────────────────────────────┘
           │ imports
┌──────────▼──────────────────────────────────────────────────┐
│                       Features                              │
│  features/aes/, features/jwt/, features/json/ ...          │
│  → import { ToolPage } from '@/patterns'                   │
│  → import { services } from '@/core/services'              │
└──────────┬──────────────────────────────────────────────────┘
           │ imports
┌──────────▼──────────────────────────────────────────────────┐
│                       Patterns                              │
│  patterns/ToolPage.vue, patterns/ToolPageHeader.vue        │
│  → import { Card, Button, Input } from '@/components'     │
│  → import { WorkspaceLayout } from '@/layouts'             │
└──────────┬──────────────────────────────────────────────────┘
           │ imports
┌──────────▼──────────────────────┬───────────────────────────┐
│          Layouts                │        Components         │
│  WorkspaceLayout.vue            │  Button, Card, Input,     │
│  SplitView.vue                  │  Sidebar, Dialog, Toast.. │
└──────────┬──────────────────────┴───────────────────────────┘
           │ imports
┌──────────▼──────────────────────────────────────────────────┐
│                         Core                                │
│  registry/, services/, plugin-types.ts, di/, ipc.ts        │
│  event-bus.ts, command-bus.ts                               │
└──────────┬──────────────────────────────────────────────────┘
           │ imports
┌──────────▼──────────────────────────────────────────────────┐
│                      Foundation                             │
│  tokens.css, types.ts, i18n/, constants.ts                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Folder Structure（最终目录）

```
dev-toolbox/
│
├── src/                              # 前端源码
│   ├── main.ts                       # App 入口
│   ├── App.vue                       # 根组件
│   │
│   ├── foundation/                   # §1 Foundation
│   │   ├── tokens.css                # Design Token (CSS Variables)
│   │   ├── types.ts                  # 全局类型定义
│   │   ├── constants.ts              # 全局常量
│   │   └── i18n/                     # 国际化
│   │       ├── zh-CN.ts
│   │       └── en.ts
│   │
│   ├── core/                         # §2 Core
│   │   ├── registry/                 # 注册中心
│   │   │   ├── tool-registry.ts
│   │   │   ├── command-registry.ts
│   │   │   ├── shortcut-registry.ts
│   │   │   ├── search-registry.ts
│   │   │   ├── history-registry.ts
│   │   │   ├── recent-registry.ts
│   │   │   ├── favorite-registry.ts
│   │   │   └── index.ts
│   │   ├── services/                 # 服务层
│   │   │   ├── clipboard.ts
│   │   │   ├── storage.ts
│   │   │   ├── config.ts
│   │   │   ├── theme.ts
│   │   │   ├── window.ts
│   │   │   ├── notification.ts
│   │   │   ├── logger.ts
│   │   │   ├── updater.ts
│   │   │   ├── command.ts
│   │   │   ├── ai.ts
│   │   │   └── index.ts              # createServiceContainer()
│   │   ├── ipc.ts                    # Tauri IPC Bridge
│   │   ├── event-bus.ts              # 全局 Event Bus (mitt)
│   │   ├── command-bus.ts            # 命令总线
│   │   ├── plugin-types.ts           # ToolPlugin 接口定义
│   │   ├── plugin-loader.ts          # 插件自动加载
│   │   └── di.ts                     # 简易 DI Container
│   │
│   ├── components/                   # §3 Components (Design System)
│   │   ├── Button/
│   │   │   ├── Button.vue
│   │   │   └── index.ts
│   │   ├── IconButton/
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── Textarea/
│   │   ├── Card/
│   │   ├── Dialog/
│   │   ├── Toast/
│   │   ├── Badge/
│   │   ├── Tag/
│   │   ├── EmptyState/
│   │   ├── SearchBar/
│   │   ├── CommandPalette/
│   │   ├── SegmentedControl/
│   │   ├── Spinner/
│   │   ├── Sidebar/
│   │   └── index.ts                  # 统一导出
│   │
│   ├── layouts/                      # §4 Layouts
│   │   ├── WorkspaceLayout.vue       # Sidebar + Main + Inspector
│   │   ├── SplitView.vue
│   │   ├── ToolbarLayout.vue
│   │   └── index.ts
│   │
│   ├── patterns/                     # §5 Patterns
│   │   ├── ToolPage.vue              # 统一工具页模板
│   │   ├── ToolPageHeader.vue
│   │   ├── ToolPageInputCard.vue
│   │   ├── ToolPageOutputCard.vue
│   │   ├── ToolPageHistoryCard.vue
│   │   ├── ToolPageConfigCard.vue
│   │   ├── ToolPageActionBar.vue
│   │   └── index.ts
│   │
│   ├── features/                     # §6 Features
│   │   ├── aes/
│   │   │   ├── index.ts
│   │   │   ├── logic.ts
│   │   │   ├── composables.ts
│   │   │   ├── types.ts
│   │   │   ├── AesView.vue
│   │   │   └── __tests__/
│   │   │       └── logic.test.ts
│   │   ├── jwt/
│   │   │   └── ...
│   │   ├── json/
│   │   │   └── ...
│   │   ├── base64/
│   │   │   └── ...
│   │   ├── url/
│   │   │   └── ...
│   │   ├── timestamp/
│   │   │   └── ...
│   │   ├── hash/
│   │   │   └── ...
│   │   ├── cloud-encrypt/
│   │   │   └── ...
│   │   ├── curl/
│   │   │   └── ...
│   │   ├── regex/
│   │   │   └── ...
│   │   ├── sql/
│   │   │   └── ...
│   │   ├── ai/
│   │   │   └── ...
│   │   ├── sentry/
│   │   │   └── ...
│   │   ├── gitee/
│   │   │   └── ...
│   │   └── zentao/
│   │       └── ...
│   │
│   ├── plugins/                      # §7 Plugins
│   │   ├── aes.plugin.ts
│   │   ├── jwt.plugin.ts
│   │   ├── json.plugin.ts
│   │   ├── base64.plugin.ts
│   │   ├── url.plugin.ts
│   │   ├── timestamp.plugin.ts
│   │   ├── hash.plugin.ts
│   │   ├── cloud-encrypt.plugin.ts
│   │   ├── config.plugin.ts
│   │   ├── curl.plugin.ts            # 未来
│   │   ├── regex.plugin.ts           # 未来
│   │   ├── sql.plugin.ts             # 未来
│   │   └── ...
│   │
│   └── app/                          # §8 Application
│       ├── router-setup.ts           # 从 Plugin 动态构建路由
│       ├── sidebar-setup.ts          # 从 ToolRegistry 动态构建菜单
│       ├── command-palette-setup.ts  # 从 CommandRegistry 构建命令面板
│       ├── shortcut-binder.ts        # 全局快捷键绑定
│       └── lifecycle.ts              # App 启动/关闭生命周期
│
├── src-tauri/                        # Rust 后端
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   ├── commands/                 # Tauri Commands (按 Feature 组织)
│   │   │   ├── mod.rs
│   │   │   ├── aes_cmd.rs
│   │   │   ├── cloud_cmd.rs
│   │   │   └── ...
│   │   ├── services/                 # Rust Services
│   │   │   ├── mod.rs
│   │   │   ├── crypto.rs
│   │   │   ├── cloud_crypto.rs
│   │   │   └── ...
│   │   └── models/
│   │       └── mod.rs
│   ├── tauri.conf.json
│   ├── capabilities/
│   │   └── default.json
│   └── Cargo.toml
│
├── docs/                             # 文档
│   ├── design/
│   │   ├── design-system.md
│   │   └── design-system-v2.md
│   ├── architecture/
│   │   └── workspace-architecture-v1.md    ← 本文件
│   ├── releases/
│   └── checklists/
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 8. AI Rules（工程规范）

### 8.1 新增工具（强制性）

```yaml
新增工具必须:
  1. 创建 src/features/<tool-name>/  ← 按 Feature 标准目录
  2. 创建 src/plugins/<tool-name>.plugin.ts  ← 实现 ToolPlugin 接口
  3. Feature 组件使用 <ToolPage> 模板  ← 不得自行创造布局
  4. 业务逻辑写在 logic.ts  ← 纯函数，可单元测试
  5. Vue 逻辑写在 composables.ts  ← useXxx()

新增工具禁止:
  ❌ 修改 Sidebar               ← Sidebar 从 ToolRegistry 自动渲染
  ❌ 修改 Workspace             ← Workspace 是固定布局
  ❌ 修改 Router                ← router-setup.ts 从 Plugin 自动添加
  ❌ 修改 main.ts / App.vue     ← 入口文件保持不变
  ❌ 新增全局样式               ← 所有样式必须是已有 Token
  ❌ 新增组件                   ← 除非先在 design-system-v2.md 定义
  ❌ 新增颜色                   ← 除非先在 design-system-v2.md 定义
  ❌ 引用其他 Feature            ← Feature 之间零依赖
```

### 8.2 代码生成模板

AI 生成新工具代码时，必须使用以下模板：

```typescript
// ── src/features/<name>/logic.ts ──
export function process(input: string, config: Config): Result {
  // 纯函数，零副作用
}

// ── src/features/<name>/composables.ts ──
import { ref } from 'vue'
import { services } from '@/core/services'
import { process } from './logic'
import type { Config, Result } from './types'

export function useTool() {
  const input = ref('')
  const output = ref<string | null>(null)
  const config = ref<Config>({ /* defaults */ })
  const error = ref<string | null>(null)
  const loading = ref(false)

  async function execute() {
    error.value = null
    loading.value = true
    try {
      output.value = process(input.value, config.value)
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  return { input, output, config, error, loading, execute }
}

// ── src/features/<name>/<Name>View.vue ──
<script setup lang="ts">
import { useTool } from './composables'
const { input, output, config, error, loading, execute } = useTool()
</script>
<template>
  <ToolPage title="工具名称" description="工具描述">
    <template #config>...</template>
    <template #input>
      <textarea v-model="input" class="dt-textarea" />
    </template>
    <template #actions>
      <button class="btn-accent" @click="execute" :disabled="loading">执行</button>
    </template>
    <template #output v-if="output">
      <textarea :value="output" class="dt-textarea" readonly />
    </template>
  </ToolPage>
</template>

// ── src/plugins/<name>.plugin.ts ──
import type { ToolPlugin } from '@/core/plugin-types'

export const plugin: ToolPlugin = {
  id: '<name>',
  name: '<显示名称>',
  description: '<描述>',
  icon: '<emoji>',
  version: '1.0.0',
  category: 'utility',
  route: { path: '/<name>', component: () => import('@/features/<name>/<Name>View.vue') },
  commands: [],
  shortcuts: {},
  searchKeywords: [],
  permissions: [],
  settings: {},
  history: { enabled: true, maxItems: 20 },
}
```

### 8.3 Code Review Checklist

```
PR Review 必须检查:
  [ ] Feature 是否通过 Plugin 注册?
  [ ] 是否修改了 Sidebar / Router / Workspace / App.vue? (必须为 NO)
  [ ] 是否有跨 Feature 的 import? (必须为 NO)
  [ ] 是否使用了已有 Pattern (ToolPage)? (必须为 YES)
  [ ] 业务逻辑是否在 logic.ts 中? (必须为 YES)
  [ ] logic.ts 是否有单元测试? (必须为 YES)
  [ ] 是否新增了颜色/间距/字体硬编码? (必须为 NO)
  [ ] 是否新增了全局组件? 如有，是否先在 design-system-v2.md 定义? (必须为 YES)
  [ ] Plugin manifest 的 searchKeywords 是否填写? (必须为 YES)
  [ ] 删除该 Feature 目录 + Plugin 文件，应用是否还能正常运行? (必须为 YES)
```

### 8.4 长期维护保证

| 保证 | 机制 |
|------|------|
| 新增工具无需改核心 | Plugin 系统 + Registry + 动态路由 |
| 删除工具无副作用 | Feature 目录 + Plugin 文件独立，删除即生效 |
| 样式一致性 | 所有视觉属性通过 Design Token 引用，AI 零硬编码 |
| 功能隔离 | Feature 间禁止 import，跨 Feature 通信仅通过 Core Service |
| 可测试性 | logic.ts 纯函数，可直接 vitest |
| 可扩展至 100+ 工具 | 目录扁平 (`features/<name>/`)，Registry 性能 O(1) |
| 长期不腐烂 | AI Rules 强制 Code Review Checklist |

---

> **版本**: v1.0  
> **维护**: 本文件是工程架构的单一事实来源 (Single Source of Truth)。所有新增工具、重构、PR Review 均以此为准。  
> **配对文件**: `docs/design/design-system-v2.md`（设计规范）
