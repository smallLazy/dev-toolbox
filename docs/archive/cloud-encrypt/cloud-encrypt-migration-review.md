---
status: archive
last_reviewed: 2026-07-08
owner: dev-tools
reason: Historical migration plan — preserved for reference only
---
# Cloud Encrypt → Pipeline/Preset v2 — 实施前审查报告

> **日期**: 2026-07-01
> **审查范围**: 全仓库引用扫描、Feature 结构验证、Plugin 注册机制、路由/菜单系统、Frozen 层边界
> **审查结论**: 方案可行，发现 2 处需修正、3 处需关注、0 处阻塞

---

## 1. CloudEncrypt 实际引用点

### 1.1 前端引用（6 处，4 个文件）

| # | 文件 | 行 | 内容 | 类型 |
|---|------|----|------|------|
| 1 | `src/modules/cloud/CloudEncryptView.vue` | 全文 | Vue SFC 主视图 | 定义 |
| 2 | `src/modules/cloud/CloudEncryptView.vue` | 27 | `invoke<string>("cloud_encrypt", ...)` | Tauri 调用 |
| 3 | `src/router/index.ts` | 22-24 | `path: "/cloud-encrypt"`, lazy import | 路由定义 |
| 4 | `src/components/Sidebar.vue` | 34 | `label: 'Cloud Encrypt'`, `pluginId: 'cloud-encrypt'` | 菜单项 |
| 5 | `src/design/icons/index.ts` | 132 | `['cloud-encrypt']: Icons.Package` | 图标映射 |
| 6 | `src/design/icons/index.ts` | 216 | `?? Icons.Package` — fallback 也是 Package | 图标回退 |

**注意**: `getToolIcon()` 的 fallback 恰好是 `Icons.Package`，这意味着即使不注册 `'preset-php-compatible'` 图标映射，也会显示 Package 图标。但为明确起见，仍建议显式注册。

### 1.2 后端引用（5 个文件，7 处）

| # | 文件 | 行 | 内容 | 类型 |
|---|------|----|------|------|
| 1 | `src-tauri/src/services/cloud_crypto.rs` | 全文 (195行) | 核心编解码逻辑 | 定义 |
| 2 | `src-tauri/src/services/mod.rs` | 1 | `pub mod cloud_crypto;` | 模块声明 |
| 3 | `src-tauri/src/commands/cloud_cmd.rs` | 4 | `pub fn cloud_encrypt(...)` | Tauri command |
| 4 | `src-tauri/src/commands/mod.rs` | 2 | `pub mod cloud_cmd;` | 模块声明 |
| 5 | `src-tauri/src/lib.rs` | 5, 13 | `use commands::{..., cloud_cmd}`, `cloud_cmd::cloud_encrypt,` | 导入+注册 |

### 1.3 依赖关系

```
前端: CloudEncryptView.vue → invoke("cloud_encrypt") → [Tauri IPC]
                                                           ↓
后端: lib.rs → cloud_cmd::cloud_encrypt() → cloud_crypto::encode_payload() / decode_payload()
                                                  ↓                    ↓
                                           url_encode()          base64::STANDARD
                                           url_decode()          (Cargo.toml: base64 = "0.22")
```

### 1.4 关键发现

- **没有 `cloud-encrypt.plugin.ts`** — 在 `src/plugins/` 中不存在。Sidebar 硬编码的 `pluginId: 'cloud-encrypt'` 指向了一个不存在的 plugin，但 `workspaceStore.touchRecent('cloud-encrypt')` 调用不会崩溃（store 接受任意 pluginId，仅当匹配不到 tool meta 时在 recent 面板不展示图标/名称）。
- **`base64` Rust crate 不是 CloudEncrypt 独占** — `src-tauri/src/services/crypto.rs`（AES 加密）也使用了 `base64` crate（`models/mod.rs` 也有引用）。Phase 3 清理后，`Cargo.toml` 中的 `base64` 依赖**必须保留**。
- **没有脚本/CI/配置引用 CloudEncrypt** — `scripts/`、`package.json`、`tsconfig`、`main.ts`、`App.vue` 中均无 cloud 引用。

### 1.5 文档引用（可忽略）

- `docs/design/cloud-encrypt-migration.md` — 本迁移方案文档
- `docs/design/icon-guidelines-v1.md` line 31 — 图标分配记录
- `docs/architecture/workspace-architecture-v1.md` lines 617, 642, 663, 668 — 目录结构文档（含已过时的 `cloud-encrypt.plugin.ts` 计划条目）
- `dist/assets/CloudEncryptView-*.js|css` — 构建产物（rebuild 后自动消失）

---

## 2. URL Feature 真实结构

### 2.1 文件清单（10 个文件）

```
src/features/url/
  __tests__/logic.test.ts     ← 测试文件
  composables.ts              ← useUrl() composable
  history.ts                  ← 历史记录工厂
  index.ts                    ← 公共 API barrel
  logic.ts                    ← 纯函数（172 行）
  settings.ts                 ← 设置 schema + defaults
  toolbar.ts                  ← 工具栏工厂
  types.ts                    ← 类型定义（42 行）
  UrlFeature.ts               ← extends BaseFeature
  UrlView.vue                 ← 主视图
```

### 2.2 关键类型（当前）

```typescript
// types.ts
export type UrlMode = 'encode' | 'decode'
export type UrlVariant = 'component' | 'uri'   // ← 需扩展为 'component' | 'uri' | 'php'

export interface UrlConfig extends FeatureConfig {
  mode: UrlMode
  variant: UrlVariant
}
```

### 2.3 关键函数签名（当前）

```typescript
// logic.ts
export function encodeUrl(input: string, variant: UrlVariant): string
export function decodeUrl(input: string, variant: UrlVariant): string
export function transformUrl(input: string, config: UrlConfig): UrlResult
export function validateUrlInput(input: string): UrlValidationResult
export function validateDecodeInput(input: string, variant: UrlVariant): UrlValidationResult
```

### 2.4 Settings schema（当前）

| Key | Type | Default |
|-----|------|---------|
| `defaultMode` | select | `'encode'` |
| `defaultVariant` | select | `'component'` |

### 2.5 修改点确认

- `types.ts` line 6: `UrlVariant` 类型联合增加 `'php'`
- `logic.ts`: 新增 `encodeUrlPhp()` / `decodeUrlPhp()`；`encodeUrl()` / `decodeUrl()` dispatch 增加 `'php'` case
- `settings.ts`: `defaultVariant` 的 select options 增加 `{ value: 'php', label: 'PHP (spaces→+)' }`
- `__tests__/logic.test.ts`: 新增 PHP variant 测试
- **不修改**: `UrlFeature.ts`, `composables.ts`, `index.ts`, `toolbar.ts`, `history.ts`, `UrlView.vue`

---

## 3. Base64 Feature 真实结构

### 3.1 文件清单（11 个文件，比 URL 多 README.md）

```
src/features/base64/
  __tests__/logic.test.ts     ← 测试文件
  Base64Feature.ts            ← extends BaseFeature
  Base64View.vue              ← 主视图
  composables.ts              ← useBase64() composable
  history.ts                  ← 历史记录工厂
  index.ts                    ← 公共 API barrel
  logic.ts                    ← 纯函数（122 行）
  README.md                   ← 文档
  settings.ts                 ← 设置 schema + defaults
  toolbar.ts                  ← 工具栏工厂
  types.ts                    ← 类型定义（35 行）
```

### 3.2 关键类型（当前）

```typescript
// types.ts
export interface Base64Config extends FeatureConfig {
  mode: 'encode' | 'decode'        // ← 内联字面量，无命名类型别名
  // 无 padding 字段
}
```

### 3.3 关键函数签名（当前）

```typescript
// logic.ts — 均只有 1 个参数！
export function encode(input: string): string
export function decode(input: string): string
export function validate(input: string): { valid: true } | { valid: false; errors: ... }
export function validateBase64(input: string): Base64ValidationResult
```

### 3.4 Settings schema（当前）

| Key | Type | Default |
|-----|------|---------|
| `defaultMode` | select | `'encode'` |

### 3.5 修改点确认

- `types.ts`: 新增 `Base64Padding` 类型；`Base64Config` 增加 `padding?: Base64Padding`
- `logic.ts`: `encode()` 增加第二个可选参数 `options?: { padding?: Base64Padding }`；`decode()` 增加 `options?: { autoPad?: boolean; fixSpaces?: boolean }`；`validateBase64()` 增加可选参数放宽无填充场景
- **⚠️ 签名变更影响评估**:
  - `encode()` 调用者：`Base64Feature.run()` line 65, `logic.test.ts` 全部 encode 调用。均为 `encode(input)` 单参数形式，增加可选第二参数**完全兼容**。
  - `decode()` 调用者：`Base64Feature.run()` line 66, `logic.test.ts` 全部 decode 调用。同理兼容。
- **不修改**: `composables.ts`, `index.ts`, `toolbar.ts`, `history.ts`, `Base64View.vue`（除非需要在 UI 中暴露 padding 开关）

---

## 4. workspaceStore / Plugin 注册机制

### 4.1 当前发现链路

```
Vite build:
  @/plugins/index.ts (barrel, 33 named re-exports)
    → 每个 .plugin.ts 的 default export = PluginInstance (definePlugin 返回值)

运行时 (App.vue onMounted → workspaceStore.init()):
  import * as pluginModules from '@/plugins'
    → Object.values(pluginModules) as PluginInstance[]
      → extractMetadata(instance) → ToolMeta { id, name, icon, category, path, commands, searchKeywords }
        → tools[] 数组
```

### 4.2 添加 preset plugin 的步骤

要新增 `preset-php-compatible`，需要：

| 步骤 | 操作 | 效果 |
|------|------|------|
| A | 创建 `src/plugins/preset-php-compatible.plugin.ts` | 定义 plugin manifest |
| B | 在 `src/plugins/index.ts` 增加 re-export 行 | Vite 打包时包含此 plugin |
| C | 在 `src/router/index.ts` 增加 route | Vue Router 可导航到此路径 |
| D | 在 `src/components/Sidebar.vue` 增加 MenuItem | 侧边栏出现可点击条目 |
| E | (可选) 在 `src/design/icons/index.ts` 的 `TOOL_ICONS` 增加映射 | 侧边栏/命令面板显示正确图标 |

**步骤 A+B 的效果**（无需 C/D）：
- ✅ `workspaceStore.tools` 包含此 Preset
- ✅ Command Palette (Cmd+K) 可搜索到
- ✅ `touchRecent()` 可记录
- ❌ 无法通过侧边栏导航
- ❌ 路由不存在，点击会 404

**步骤 A+B+C+D 的效果**（完整注册）：
- ✅ 全部可用

### 4.3 关键边界

- `definePlugin()` **不自动注册 Vue Router 路由** — `PluginInstaller` 解析 route 但不调用 `router.addRoute()`
- `definePlugin()` 的 `context.search.register()` 是 **no-op** — 关键词搜索完全依赖 workspaceStore 的 `extractMetadata()` 读取 `def.keywords`
- Sidebar **不读取 workspaceStore.tools** 来构建菜单 — 它是硬编码数组

---

## 5. src/presets/ 是否会被正确识别

### 5.1 路由识别

**不会自动识别。** 必须手动在 `src/router/index.ts` 增加：

```typescript
{
  path: '/preset/php-compatible',
  name: 'preset-php-compatible',
  component: () => import('@/presets/PresetView.vue'),
  meta: { preset: 'php-compatible' },
}
```

### 5.2 菜单识别

**不会自动识别。** 必须手动在 `src/components/Sidebar.vue` 的 `categories` 数组中增加条目。

当前 Encoding 分类（lines 29-35）含 4 个条目：Base64, URL, JWT, Cloud Encrypt。迁移时将第 4 条替换。

### 5.3 搜索/命令面板识别

**会自动识别**（前提：步骤 A+B 完成）。因为 workspaceStore 从 barrel export 发现所有 plugin。

### 5.4 最近使用识别

**会自动识别**（前提：步骤 A+B 完成，且用户通过某种方式导航到此 Preset 后 `touchRecent()` 被调用）。

### 5.5 PresetView 如何获取 preset 定义

有两种方式：

**方式 A（推荐）**: 通过 route meta + preset barrel
```typescript
// PresetView.vue
import { useRoute } from 'vue-router'
import * as presets from '@/presets'

const route = useRoute()
const presetId = route.meta.preset as string
const preset = presets[presetId + 'Preset'] // 或使用 Map
```

**方式 B**: 每个 Preset 独立路由指向专用组件
```typescript
// router 中
{ path: '/preset/php-compatible', component: () => import('@/presets/PhpCompatibleView.vue') }
```
不推荐 — 会导致每个 Preset 需要独立 View 文件。

PresetView.vue 需要内部维护 preset 注册表或通过 props/route meta 接收 preset ID。

---

## 6. src/shared/pipeline/ import 路径可行性

### 6.1 路径别名

项目使用 Vite，`@/` 映射到 `src/`（标准 Vue/TS 项目配置）。

```
@/shared/pipeline/types  →  src/shared/pipeline/types.ts  ✅
@/shared/pipeline         →  src/shared/pipeline/index.ts  ✅
```

### 6.2 现有先例

`src/shared/clipboard.ts` 已存在，且被以下文件成功 import：
- `src/sdk/feature/FeatureContext.ts` — `import { copyText } from '@/shared/clipboard'`
- `src/features/base64/composables.ts` — `import { copyText } from '@/shared/clipboard'`
- `src/features/url/composables.ts` — 同上
- `src/features/hash/composables.ts` — 同上

**路径可行，已验证。**

### 6.3 import 路径清单

| 导入方 | import | 路径 |
|--------|--------|------|
| `php-compatible.preset.ts` | `PipelinePreset` type | `@/shared/pipeline/types` |
| `composables.ts` | `runPipeline`, `PipelineResult`, `PipelineError` | `@/shared/pipeline` |
| `PresetView.vue` | `PipelinePreset` type | `@/shared/pipeline/types` |
| `pipelineRunner.test.ts` | `runPipeline`, types | `../pipelineRunner` (相对路径) |
| 任何 Feature 的 logic.ts | **不会 import** | — (Pipeline 是 Preset 层的概念) |

### 6.4 与 Frozen 层隔离

`src/shared/pipeline/` 不 import 任何 `src/sdk/` 或 `src/core/` 的内容。它是纯 TypeScript 工具模块，仅依赖：
- 自身 types
- `src/features/*/logic.ts` 的纯函数（在 Preset 定义层 import，不在 pipelineRunner 层）

**零 SDK/Core 触碰。**

---

## 7. Sidebar 修改范围

### 7.1 是否属于 Frozen

`src/components/Sidebar.vue` **不属于** CLAUDE.md 的 Frozen 层。理由：
- CLAUDE.md 的 Never Modify 列表中 `src/components/` 指的是 **Design System components**（如 `Button`、`Card`、`Section` 等可复用 UI 组件）
- `Sidebar.vue` 是应用级布局组件，不是设计系统组件
- 它是**当前唯一需要手动维护导航条目的地方**（与 `router/index.ts` 一样属于应用配置）

### 7.2 修改范围

仅修改 `categories` 数组中的一个条目：

```
旧: { path: '/cloud-encrypt', label: 'Cloud Encrypt', icon: 'Package',
      keywords: 'base_encryption filter urlencode', category: 'encoding',
      pluginId: 'cloud-encrypt' }

新: { path: '/preset/php-compatible', label: 'PHP Compatible', icon: 'Package',
      keywords: 'php base_encryption filter urlencode base64 cloud encrypt 参数编码',
      category: 'encoding', pluginId: 'preset-php-compatible' }
```

**单行替换，不改变 Sidebar 的渲染逻辑、样式、collapsible 行为。**

---

## 8. router/index.ts 修改范围

### 8.1 是否属于 Frozen

**不属于。** 路由表是应用配置，类似 `Sidebar.vue`。CLAUDE.md 标记的是 `src/router/` 的**路由系统机制**（如路由守卫、动态路由注册逻辑），但当前 `src/router/index.ts` 只包含静态路由数组，不包含任何机制代码。

### 8.2 修改范围

```typescript
// 修改: CloudEncrypt 路由 → redirect
{
  path: '/cloud-encrypt',
  redirect: '/preset/php-compatible',  // 原为 component lazy import
},

// 新增: Preset 路由
{
  path: '/preset/php-compatible',
  name: 'preset-php-compatible',
  component: () => import('@/presets/PresetView.vue'),
  meta: { preset: 'php-compatible' },
},
```

**两条路由条目变更，不修改 `createRouter`、`createWebHistory`、路由守卫。**

---

## 9. Phase 1/2/3 遗漏文件

### 9.1 已确认遗漏

| # | 遗漏项 | 说明 | Phase |
|---|--------|------|-------|
| 1 | `src/design/icons/index.ts` — `TOOL_ICONS` 增加 `'preset-php-compatible'` 映射 | 需要显式映射或依赖 fallback。建议显式映射以明确意图。 | Phase 2 |
| 2 | `src/features/url/UrlView.vue` — UI 增加 PHP variant 选项 | 当前设计只覆盖了 logic/types/settings。**如果要在 URL Feature 的 UI 中让用户选择 PHP 变体**，需要在 UrlView.vue 的 variant segmented control 中增加第三个按钮。如果 PHP variant 仅在 Preset 内部使用（不暴露给 URL Feature 用户），则不需要修改。需要决策。 | Phase 1 或不做 |
| 3 | `src/features/base64/Base64View.vue` — UI 增加 padding 选项 | 同上。如果 `padding: 'none'` 仅在 Preset 内部使用，则不需要在 UI 暴露。需要决策。 | Phase 1 或不做 |
| 4 | `src/presets/` — `__tests__/` 目录 | Preset 集成测试（PHP Compatible roundtrip 对照测试）应放在 `src/presets/__tests__/` 或 `src/shared/pipeline/__tests__/` | Phase 2 |
| 5 | `docs/architecture/workspace-architecture-v1.md` — 更新过时条目 | line 617 `cloud-encrypt/` 目录和 line 642 `cloud-encrypt.plugin.ts` 条目需更新或标记为 historical | Phase 3 |
| 6 | `docs/design/icon-guidelines-v1.md` — 更新图标映射 | line 31 `cloud-encrypt → Package` 需更新或添加 `preset-php-compatible → Package` | Phase 2 |

### 9.2 需决策的 UX 问题

| 决策点 | 选项 A | 选项 B | 建议 |
|--------|--------|--------|------|
| URL Feature UI 是否暴露 PHP variant | 在 UrlView.vue 增加 "PHP" 按钮 | PHP 变体仅 Preset 内部使用，URL Feature UI 不变 | **选项 B** — 保持 URL Feature UI 简洁；PHP 变体是给开发者用的特定兼容模式，普通用户不需要 |
| Base64 Feature UI 是否暴露 padding 选项 | 在 Base64View.vue 增加 "Padding: Standard / None" | 仅 Preset 内部使用 | **选项 B** — no-padding 是特定管道的需求，不应增加 Base64 Feature 的认知负担 |

**如果选择选项 B**，Phase 1 的文件修改可以缩减——不需要修改 `UrlView.vue` 和 `Base64View.vue`。

---

## 10. Frozen 层和高风险文件

### 10.1 绝对不触碰

| 文件/目录 | 原因 |
|-----------|------|
| `src/core/**` | Frozen — Prime Directive |
| `src/sdk/**` (所有现有文件) | Frozen — Feature SDK + Plugin SDK |
| `src/sdk/feature/index.ts` | Frozen — SDK barrel，不增加 re-export |
| `src/sdk/plugin/index.ts` | Frozen — Plugin SDK barrel |
| `src/sdk/plugin/PluginContext.ts` | Frozen — no-op search.register() 不能修改 |
| `src/components/**` (除 Sidebar.vue) | Frozen — 设计系统组件 |
| `src/layouts/**` | Frozen |
| `src/patterns/**` | Frozen |

### 10.2 高风险文件（修改需谨慎）

| 文件 | 风险 | 缓解措施 |
|------|------|----------|
| `src/stores/workspace.ts` | 所有工具依赖此 store | **不修改** — Preset 通过 plugin barrel 自动被发现 |
| `src/router/index.ts` | 所有页面依赖路由表 | 只做条目增改，不修改路由机制 |
| `src/components/Sidebar.vue` | 所有导航依赖此组件 | 只改一个 MenuItem 对象，不修改渲染逻辑 |
| `src/design/icons/index.ts` | 图标系统，所有 plugin 引用 | 只增加一行 TOOL_ICONS 映射 |

---

## 11. 最终实施文件清单（按 Phase 拆分）

### Phase 1 — 扩展 Feature 变体

| 操作 | 文件 | 说明 |
|------|------|------|
| 修改 | `src/features/url/types.ts` | `UrlVariant` 增加 `'php'`（line 6） |
| 修改 | `src/features/url/logic.ts` | 新增 `encodeUrlPhp()` + `decodeUrlPhp()`；dispatch 增加 php case |
| 修改 | `src/features/url/settings.ts` | `defaultVariant` select 增加 `{ value: 'php', label: 'PHP (spaces→+)' }` |
| 修改 | `src/features/url/__tests__/logic.test.ts` | 新增 PHP variant 测试 (10+ cases) |
| 修改 | `src/features/base64/types.ts` | 新增 `Base64Padding`；`Base64Config` 增加 `padding?` |
| 修改 | `src/features/base64/logic.ts` | `encode()` 增加 options 参数；`decode()` 增加 options 参数；`validateBase64()` 放宽无填充 |
| 修改 | `src/features/base64/settings.ts` | 新增 `defaultPadding` select 字段 |
| 修改 | `src/features/base64/Base64Feature.ts` | `run()` 传递 `config.padding` |
| 修改 | `src/features/base64/__tests__/logic.test.ts` | 新增 no-padding/auto-pad/fixSpaces 测试 (12+ cases) |
| **不修改** | `src/features/url/UrlView.vue` | PHP variant 不在 UI 暴露（Preset 内用） |
| **不修改** | `src/features/base64/Base64View.vue` | padding 选项不在 UI 暴露（Preset 内用） |

### Phase 2 — Pipeline (shared) + Preset + 迁移

| 操作 | 文件 | 说明 |
|------|------|------|
| **新建** | `src/shared/pipeline/types.ts` | `PipelineStep`, `PipelinePreset`, `PipelineResult`, `PipelineError` |
| **新建** | `src/shared/pipeline/pipelineRunner.ts` | `runPipeline()` 实现 |
| **新建** | `src/shared/pipeline/index.ts` | barrel export |
| **新建** | `src/shared/pipeline/__tests__/pipelineRunner.test.ts` | 单元测试 (8+ cases) |
| **新建** | `src/presets/php-compatible.preset.ts` | PHP Compatible Preset 定义 |
| **新建** | `src/presets/composables.ts` | `usePreset()` composable |
| **新建** | `src/presets/PresetView.vue` | 通用 Preset 视图组件 |
| **新建** | `src/presets/index.ts` | Preset barrel export |
| **新建** | `src/presets/__tests__/php-compatible.test.ts` | Preset 集成测试 + Rust 对照测试 (12+ cases) |
| **新建** | `src/plugins/preset-php-compatible.plugin.ts` | Plugin manifest（让 workspaceStore 发现） |
| 修改 | `src/plugins/index.ts` | 增加 `export { default as presetPhpCompatible } from './preset-php-compatible.plugin'` |
| 修改 | `src/router/index.ts` | 新增 `/preset/php-compatible`；`/cloud-encrypt` 改为 redirect |
| 修改 | `src/components/Sidebar.vue` | line 34: Cloud Encrypt → PHP Compatible |
| 修改 | `src/design/icons/index.ts` | `TOOL_ICONS` 增加 `'preset-php-compatible': Icons.Package` |
| 修改 | `docs/design/icon-guidelines-v1.md` | 更新 cloud-encrypt → preset-php-compatible 图标记录 |
| 标记 | `src/modules/cloud/CloudEncryptView.vue` | 文件头增加 `@deprecated` JSDoc 注释 |

### Phase 3 — 清理 Rust 后端 + 移除旧代码

| 操作 | 文件 | 说明 |
|------|------|------|
| 修改 | `src-tauri/src/commands/cloud_cmd.rs` | body 改为空实现 + `warn!`（Deprecation 过渡） |
| **删除** | `src-tauri/src/services/cloud_crypto.rs` | Phase 3.2（deprecation 一个版本后） |
| **删除** | `src-tauri/src/commands/cloud_cmd.rs` | Phase 3.2 |
| 修改 | `src-tauri/src/commands/mod.rs` | 移除 `pub mod cloud_cmd` |
| 修改 | `src-tauri/src/services/mod.rs` | 移除 `pub mod cloud_crypto` |
| 修改 | `src-tauri/src/lib.rs` | 移除 `cloud_cmd` import 和 invoke_handler 注册 |
| **保留** | `src-tauri/Cargo.toml` — `base64` 依赖 | `crypto.rs`（AES）仍使用 base64 crate |
| **删除** | `src/modules/cloud/CloudEncryptView.vue` | Phase 3.2 |
| **删除** | `src/modules/cloud/` 目录（如为空） | Phase 3.2 |
| 修改 | `src/router/index.ts` | 移除 `/cloud-encrypt` redirect（或替换为 404 友好页） |
| 修改 | `docs/architecture/workspace-architecture-v1.md` | 更新 cloud 相关条目 |

### 汇总

| Phase | 新建 | 修改 | 删除 | 不修改 |
|-------|------|------|------|--------|
| 1 | 0 | 9 | 0 | 2 (UrlView, Base64View) |
| 2 | 10 | 5 (+2 docs) | 0 | 0 |
| 3 | 0 | 4 | 4 | 1 (Cargo.toml) |
| **合计** | **10** | **18+2** | **4** | **3** |

---

## 12. 每个 Phase 的验证命令

### Phase 1 验证

```bash
# 1. 类型检查
npx vue-tsc --noEmit

# 2. URL Feature 测试（仅运行 url 相关）
npx vitest run src/features/url/

# 3. Base64 Feature 测试（仅运行 base64 相关）
npx vitest run src/features/base64/

# 4. 全量测试
npm test

# 5. 架构验证（确保无跨 Feature import）
npx tsx scripts/ci/validate-architecture.ts

# 6. 确认无硬编码 hex/px（新增代码）
git diff --name-only | xargs grep -n '#[0-9A-Fa-f]\{6\}' || echo "OK: no hardcoded hex"
git diff --name-only | xargs grep -n '[0-9]\+px' || echo "OK: no hardcoded px"
```

### Phase 2 验证

```bash
# 1. 类型检查
npx vue-tsc --noEmit

# 2. Pipeline Runner 测试
npx vitest run src/shared/pipeline/

# 3. Preset 集成测试（含 Rust 对照）
npx vitest run src/presets/

# 4. 全量测试（确保无回归）
npm test

# 5. 全 CI 验证
npm run validate

# 6. Rust 对照测试：手动验证
#    - 用旧 CloudEncrypt 编码 50+ 条测试向量
#    - 用新 Preset 编码相同测试向量
#    - diff 对比输出

# 7. 路由验证：手动确认
#    - 访问 /cloud-encrypt → 自动跳转到 /preset/php-compatible
#    - 侧边栏点击 PHP Compatible → 正常导航
#    - Cmd+K 搜索 "cloud encrypt" → 显示 PHP Compatible

# 8. 构建验证
npm run build
cargo build  # (src-tauri/)
```

### Phase 3 验证

```bash
# 1. Rust 编译
cargo check   # (src-tauri/)
cargo test    # (src-tauri/)

# 2. 前端全量验证
npx vue-tsc --noEmit
npm test
npm run validate

# 3. 全量构建
npm run tauri build  # 或 npm run build + cargo build

# 4. 残留引用检查
git grep -i "cloud.encrypt\|cloud_encrypt\|cloudEncrypt" -- ':!docs/' ':!dist/'
# 预期: 仅在 docs/design/cloud-encrypt-migration.md 中有引用（历史记录）

# 5. 死代码检查
git grep "cloud_crypto\|cloud_cmd" src-tauri/
# 预期: 无结果

# 6. Tauri 启动验证
npm run tauri dev
# 确认无 cloud_encrypt 相关 panic/error
```

---

## 13. 潜在阻塞点和替代方案

### 阻塞点 #1: JS `encodeURIComponent` vs Rust `url_encode` 行为差异

**严重程度**: 🔴 高
**描述**: Rust 的 `url_encode()` 手写实现保留字符集为 `A-Za-z0-9-_.~`；JS `encodeURIComponent` 保留集为 `A-Za-z0-9-_.!~*'()`。两者对 `!` `*` `'` `(` `)` 的编码行为不同。

**影响**: Preset 输出可能与旧 CloudEncrypt Rust 实现不一致。

**替代方案**:
1. **推荐**: TS 侧也手写 `encodeUrlPhp` 逐字节匹配 Rust 逻辑（约 20 行），不依赖 `encodeURIComponent().replace()`
2. 使用对照测试向量找出差异字符，仅替换有差异的部分
3. 如果差异字符在实际使用场景中不出现（如 `!*'()` 不常出现在 URL query 中），可以接受微小差异并文档化

**Phase 2 对照测试必须覆盖此场景。**

### 阻塞点 #2: `atob()` 对无填充 Base64 的兼容性

**严重程度**: 🟡 中
**描述**: `atob()` 在规范上要求输入为 4 的倍数长度。无填充 Base64 的长度 `len % 4` 可能为 2 或 3。现代浏览器（Chrome/Firefox/Safari）对无填充 Base64 的 `atob()` 行为不一致。

**影响**: 解码无填充 Base64 时可能抛出 `InvalidCharacterError`。

**替代方案** (已在设计中):
- `decode(input, { autoPad: true })` 在调用 `atob()` 前先补全 `=` 至 4 的倍数
- 这是设计中的既定方案，**不是新发现**

### 阻塞点 #3: PresetView 如何获取 Preset 定义

**严重程度**: 🟡 中
**描述**: PresetView.vue 是通用组件，需要知道自己渲染哪个 Preset。

**替代方案**:
- **推荐 A**: `route.meta.preset = 'php-compatible'` → PresetView import `@/presets` barrel → 按 ID 索引
- 替代 B: 为每个 Preset 创建专用路由组件（不通用，不推荐）

### 阻塞点 #4: Cargo.toml base64 依赖不能移除

**严重程度**: 🟢 低（仅是方案修正）
**描述**: `src-tauri/src/services/crypto.rs`（AES 加密）也使用 `base64` crate。Phase 3 不能移除此依赖。

**替代方案**: 无需替代。保持 Cargo.toml 不变，仅删除 cloud 相关文件。

### 阻塞点 #5: workspaceStore 对未知 pluginId 的容错

**严重程度**: 🟢 低
**描述**: 当前 Sidebar 硬编码了 `pluginId: 'cloud-encrypt'`，但没有对应的 plugin 文件。`workspaceStore.touchRecent('cloud-encrypt')` 会向 `recentIds` 数组推入一个不存在的 pluginId。这不会崩溃，但会在 recent 列表中显示为 "Unknown" 或空条目。

**影响**: 已有的 recent 数据中可能存在 `'cloud-encrypt'` 条目。迁移后 `'preset-php-compatible'` 不会自动继承旧 recent。

**替代方案**: 在 `workspaceStore.touchRecent()` 或 `init()` 中加入迁移映射（可选项，不强制）。

---

## 总结

| 维度 | 结论 |
|------|------|
| 方案可行性 | ✅ 可行，无架构层面阻塞 |
| 需要修正的设计 | 1) Cargo.toml base64 依赖保留；2) 手写 `encodeUrlPhp` 匹配 Rust 行为 |
| 需要决策的 UX | PHP variant 和 no-padding 是否在 URL/Base64 Feature UI 暴露（建议：不暴露） |
| 遗漏文件 | 6 个（见 §9），已全部纳入 Phase 最终清单 |
| Frozen 合规 | ✅ 零 Core/SDK 触碰 |
| 最大风险 | JS vs Rust URL 编码差异 — Phase 2 对照测试是关键 |
| 总文件数 | 新建 10，修改 18+2 docs，删除 4，不修改 3（见 §11 汇总） |
