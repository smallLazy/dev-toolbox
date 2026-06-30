# Plugin SDK v1.0 — Developer Workspace

> **定位**: 插件开发者唯一需要接触的 API。零 Core 知识即可创建插件。
> **原则**: 声明式定义，全自动注册。开发者只需描述"是什么"，SDK 负责"怎么注册"。
> **规则**: 禁止直接访问 Registry / PluginManager / Router / Core。

---

## 1. One-Minute Plugin

```typescript
import { definePlugin } from '@/sdk/plugin'
import { MyToolFeature } from '@/features/my-tool'

export default definePlugin({
  id: 'my-tool',
  name: 'My Tool',
  icon: '🔧',
  route: '/my-tool',
  feature: () => import('@/features/my-tool/MyToolView.vue'),

  commands: [
    { id: 'execute', label: 'Execute', shortcut: 'Cmd+Shift+X' },
  ],

  keywords: ['tool', 'my', '工具'],
  permissions: ['clipboard:read'],
})
```

**That's it.** No manual registration. No Router setup. No Registry calls.  
SDK auto-registers: route, commands, shortcuts, search keywords, permissions.

---

## 2. Architecture

```
Plugin Developer
      │
      ▼
  definePlugin()        ← ONLY touchpoint
      │
      ▼
  Plugin SDK            ← Auto: install → register → activate
      │
      ▼
  Feature SDK           ← Auto: initialize → activate → deactivate → dispose
      │
      ▼
  Core Framework        ← Hidden from plugin developer
```

### What's Automatic

| Action | Without SDK | With `definePlugin()` |
|--------|-------------|----------------------|
| Router registration | `router.addRoute(...)` | **Auto** |
| Command registration | `commandRegistry.register(...)` | **Auto** |
| Shortcut binding | `shortcutRegistry.register(...)` | **Auto** |
| Search indexing | `searchRegistry.register(...)` | **Auto** |
| Sidebar menu | Manual sidebar config | **Auto** |
| Settings schema | Manual config | **Auto** from manifest |
| History setup | Manual enable | **Auto** from manifest |
| Lifecycle management | Manual hooks | **Auto** (with overrides) |
| Permission check | Manual | **Auto** (future) |

---

## 3. API Reference

### 3.1 `definePlugin(config)`

The single entry point. Returns a fully initialized `PluginInstance`.

```typescript
function definePlugin<TFeature, TConfig, TInput, TOutput>(
  config: PluginDefinition<TFeature, TConfig, TInput, TOutput>
): PluginInstance<TFeature, TConfig, TInput, TOutput>
```

### 3.2 `PluginDefinition`

```typescript
interface PluginDefinition<TFeature, TConfig, TInput, TOutput> {
  // ── Required ──
  id: string
  name: string
  icon: string
  route: string | { path: string; component: () => Promise<Component> }

  // ── Feature ──
  feature?: new (ctx: PluginContext<TConfig>) => TFeature
  component?: () => Promise<Component>

  // ── Optional ──
  version?: string                    // default: '1.0.0'
  description?: string                // default: ''
  category?: PluginCategory           // default: 'utility'
  commands?: CommandDef[]
  shortcuts?: ShortcutDef[]
  keywords?: string[]
  permissions?: string[]
  settings?: Record<string, SettingFieldDef>
  history?: HistoryConfig | false     // default: { enabled: true, maxItems: 20 }
  dependencies?: string[]             // other plugin IDs
  minimumVersion?: string             // workspace minimum version

  // ── Lifecycle Hooks (optional) ──
  onInstall?: (ctx: PluginContext<TConfig>) => Promise<void>
  onRegister?: (ctx: PluginContext<TConfig>) => Promise<void>
  onActivate?: (ctx: PluginContext<TConfig>) => Promise<void>
  onDeactivate?: (ctx: PluginContext<TConfig>) => Promise<void>
  onDispose?: (ctx: PluginContext<TConfig>) => Promise<void>
}
```

### 3.3 `PluginInstance`

```typescript
interface PluginInstance<TFeature, TConfig, TInput, TOutput> {
  readonly id: string
  readonly definition: PluginDefinition<TFeature, TConfig, TInput, TOutput>
  readonly context: PluginContext<TConfig>

  // Lifecycle (auto-managed, but callable)
  install(): Promise<void>
  register(): Promise<void>
  activate(): Promise<void>
  deactivate(): Promise<void>
  dispose(): Promise<void>

  // Feature access
  readonly feature: TFeature | null
  readonly isActive: boolean
}
```

### 3.4 `PluginContext`

```typescript
interface PluginContext<TConfig = Record<string, unknown>> {
  readonly id: string
  readonly name: string
  readonly version: string

  // Capabilities
  readonly clipboard: ClipboardAPI
  readonly storage: StorageAPI
  readonly logger: LoggerAPI
  readonly notification: NotificationAPI
  readonly theme: ThemeAPI
  readonly window: WindowAPI
  readonly history: HistoryAPI
  readonly favorites: FavoritesAPI
  readonly recent: RecentAPI
  readonly search: SearchAPI
  readonly ai: AIAPI
  readonly workspace: WorkspaceAPI

  // Feature Context (delegates to Feature SDK)
  readonly feature: FeatureContext<TConfig>
}
```

### 3.5 Builder Functions

```typescript
// Command builder
function createCommand(def: {
  id: string; label: string; shortcut?: string;
  description?: string; palette?: boolean
}): CommandDef

// Shortcut builder
function createShortcut(def: {
  commandId: string; default: string; mac?: string; win?: string
}): ShortcutDef

// Permission builder
function createPermission(id: string): PermissionDef

// Settings builder
function createSetting(def: {
  key: string; type: 'select' | 'toggle' | 'input' | 'number';
  label: string; default: unknown; options?: string[]; description?: string
}): SettingFieldDef
```

---

## 4. Lifecycle

```
definePlugin(config)
       │
       ▼  install()     ← onInstall hook (if provided)
       │                  Feature SDK initialized
       ▼  register()    ← onRegister hook
       │                  Route added, Commands registered, Sidebar populated
       ▼  activate()    ← onActivate hook (user opens tool)
       │                  Feature SDK activated
       ▼  [ACTIVE]      ← User interacts with tool
       ▼  deactivate()  ← onDeactivate hook (user leaves tool)
       ▼  dispose()     ← onDispose hook (plugin unloaded)
```

---

## 5. AI Rules

```
新增插件:
  1. 使用 definePlugin()
  2. 禁止 new Plugin()
  3. 禁止 new PluginManager()
  4. 禁止直接操作 Registry
  5. 禁止直接注册 Route
  6. 能力通过 context 获取
```

### Code Review Checklist

```
[ ] 使用 definePlugin() 声明?
[ ] 未直接 import PluginManager / Registry / Router?
[ ] route 使用字符串路径或 lazy component?
[ ] commands/shortcuts/keywords 已填写?
[ ] settings 使用 SettingFieldDef 格式?
[ ] 未手动管理生命周期?
```

---

> **版本**: v1.0  
> **维护**: 本文件是 Plugin SDK 的单一事实来源。
