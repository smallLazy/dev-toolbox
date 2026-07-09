---
status: archive
last_reviewed: 2026-07-08
owner: dev-tools
reason: Historical migration plan — preserved for reference only
---
# Cloud Encrypt → Pipeline/Preset 长期迁移设计方案

> **状态**: Draft
> **日期**: 2026-07-01
> **范围**: Cloud Encrypt 模块、URL Feature、Base64 Feature、Feature SDK
> **原则**: 不修改 Core / SDK / Components / Router（除路由表条目），不删除文件（标记 deprecated）
> **架构约束**: `src/sdk/` 是 Frozen 层，本次迁移不在其下新增任何目录或修改任何文件。Pipeline 代码放在应用层 `src/shared/pipeline/`，待稳定后通过独立 RFC/ADR 升格至 SDK。

---

## 目录

0. [架构调整：Pipeline 放在 src/shared/pipeline/](#0-架构调整pipeline-放在-srcsharedpipeline)
1. [当前 Cloud Encrypt 实现路径和依赖关系](#1-当前-cloud-encrypt-实现路径和依赖关系)
2. [URL Feature 是否支持 PHP urlencode](#2-url-feature-是否支持-php-urlencode)
3. [Base64 Feature 是否支持 no-padding/auto-padding](#3-base64-feature-是否支持-no-paddingauto-padding)
4. [Pipeline/Preset 最小可行设计](#4-pipelinepreset-最小可行设计)
5. [Preset 数据结构建议](#5-preset-数据结构建议)
6. [pipelineRunner 设计](#6-pipelinerunner-设计)
7. [UI 入口设计](#7-ui-入口设计)
8. [旧 Cloud Encrypt 路由如何兼容迁移](#8-旧-cloud-encrypt-路由如何兼容迁移)
9. [旧 Rust Tauri command 如何清理](#9-旧-rust-tauri-command-如何清理)
10. [需要修改的文件清单](#10-需要修改的文件清单)
11. [测试清单](#11-测试清单)
12. [分阶段实施计划](#12-分阶段实施计划)
13. [每个阶段的风险和回滚方式](#13-每个阶段的风险和回滚方式)

---

## 0. 架构调整：Pipeline 放在 `src/shared/pipeline/`

### 0.1 调整原因

`src/sdk/` 是 Frozen 层。本次 Cloud Encrypt 迁移不应引入 SDK 级变更。Pipeline 第一版只是应用层共享 runner，用于执行内置 Preset，不是稳定的 Feature SDK 契约。因此 Pipeline 代码放在 `src/shared/pipeline/`。

### 0.2 调整后的目录结构

```
src/
├── shared/                          ← 已有目录（当前含 clipboard.ts）
│   └── pipeline/                    ← ★ 新增：应用层共享管道执行器
│       ├── index.ts
│       ├── types.ts                 ← PipelineStep, PipelinePreset, PipelineResult, PipelineError
│       ├── pipelineRunner.ts        ← runPipeline()
│       └── __tests__/
│           └── pipelineRunner.test.ts
│
├── presets/                         ← ★ 新增：内置 Preset + 通用视图
│   ├── index.ts                     ← barrel export
│   ├── php-compatible.preset.ts     ← 第一个 Preset（替代 CloudEncrypt）
│   ├── PresetView.vue               ← 通用 Preset 视图组件
│   └── composables.ts              ← usePreset()
│
├── features/                        ← 已有：仅扩展变体，不新增 Feature
│   ├── url/                         ← 扩展：增加 PHP variant
│   └── base64/                      ← 扩展：增加 no-padding / auto-pad
│
├── modules/cloud/                   ← Phase 3 删除（标记 deprecated）
│   └── CloudEncryptView.vue
│
└── sdk/                             ← ★ 零修改：不新增目录，不修改任何文件
```

### 0.3 Import 路径一览

| 导入方 | 导入内容 | 路径 |
|--------|----------|------|
| `php-compatible.preset.ts` | `PipelinePreset` 类型 | `@/shared/pipeline/types` |
| `php-compatible.preset.ts` | `encodeUrl`, `decodeUrl` | `@/features/url/logic` |
| `php-compatible.preset.ts` | `encode`, `decode` (base64) | `@/features/base64/logic` |
| `composables.ts` | `runPipeline`, `PipelineResult` | `@/shared/pipeline` |
| `PresetView.vue` | `usePreset` | `@/presets/composables` |
| `PresetView.vue` | `PipelinePreset` | `@/shared/pipeline/types` |

**注意**：以下 import 路径**不会出现**：
- ❌ `from '@/sdk/pipeline/...'` — 不存在
- ❌ `from '@/sdk/feature'` re-export pipeline — 不修改 SDK barrel

### 0.4 未来升格路径

当 Pipeline 满足以下条件时，通过独立 RFC/ADR 从 `src/shared/pipeline/` 升格至 `src/sdk/pipeline/`：
1. ≥ 3 个 Preset 稳定运行 ≥ 2 个版本周期
2. API 签名无破坏性变更需求
3. 类型被多个 Feature 引用
4. 有独立 RFC 文档记录升格理由和契约承诺

---

## 1. 当前 Cloud Encrypt 实现路径和依赖关系

### 1.1 文件分布

```
前端 (Vue + TypeScript):
  src/modules/cloud/CloudEncryptView.vue       ← 主视图，独立的 Vue SFC
  src/router/index.ts                          ← 硬编码路由 /cloud-encrypt (line 22-25)
  src/components/Sidebar.vue                   ← 硬编码菜单项 (line 34)
  src/design/icons/index.ts                    ← Package 图标映射 (line 132)

后端 (Rust / Tauri):
  src-tauri/src/lib.rs                        ← invoke_handler 注册 (line 13)
  src-tauri/src/commands/mod.rs               ← pub mod cloud_cmd
  src-tauri/src/commands/cloud_cmd.rs          ← #[tauri::command] cloud_encrypt()
  src-tauri/src/services/mod.rs               ← pub mod cloud_crypto
  src-tauri/src/services/cloud_crypto.rs       ← 核心编解码逻辑 (195 行)
  src-tauri/Cargo.toml                         ← base64 crate 依赖
```

### 1.2 依赖链路

```
用户输入
  → CloudEncryptView.vue (Vue SFC, 自定义状态管理)
    → import("@tauri-apps/api/core").invoke("cloud_encrypt", { mode, input })
      → cloud_cmd::cloud_encrypt() [Rust]
        → cloud_crypto::encode_payload() 或 decode_payload() [Rust]
          → url_encode() → base64::STANDARD.encode() → trim '='
          → url_decode() ← base64::STANDARD.decode() ← re-pad '='
```

### 1.3 与 Feature SDK 的架构割裂

| 维度 | Feature SDK Features (url/base64) | CloudEncrypt |
|------|-----------------------------------|--------------|
| 基类 | extends `BaseFeature` | 无（独立 Vue SFC） |
| 上下文 | `FeatureContext` (clipboard/history/settings/logger) | 无 |
| 状态管理 | reactive refs + composable 模式 | 手动 `ref()` |
| 错误处理 | `ValidationResult` 结构化错误 | 字符串 errorMsg + setTimeout 自动消失 |
| 工具栏 | `FeatureToolbar` (copy/paste/clear/swap) | 无工具栏，仅执行+切换按钮 |
| 历史记录 | `FeatureHistory` 自动记录 | 无 |
| 设置 | `FeatureSettings` 持久化 | 无 |
| 路由注册 | `definePlugin()` (声明式，route 字段) | 手动 `router/index.ts` |
| 菜单注册 | 硬编码在 `Sidebar.vue` | 硬编码在 `Sidebar.vue` |
| 搜索/命令面板 | 通过 `workspaceStore` 自动收录 | 无 plugin 文件，不在 workspaceStore 中 |
| 纯函数 | `logic.ts` (可独立单测) | 逻辑在 Rust 端，JS 端无纯函数 |
| 测试 | vitest 单测 (`logic.test.ts`) | 仅 Rust 端 `#[cfg(test)]` |

### 1.4 CloudEncrypt 的实际变换

```
编码管道:
  原始内容 → PHP urlencode (空格→+) → Base64 STANDARD → 去除 '=' 填充

解码管道:
  已编码字符串 → 替换空格为 + → 补 '=' 至 4 的倍数 → Base64 解码 → PHP urldecode
```

**关键发现**: 这不是加密。模板里自己写了 "非加密算法，仅做编码混淆"。Cloud Encrypt 这个名称具有误导性 — 实际是 "PHP 兼容的 URL→Base64 双级编码管道"。

---

## 2. URL Feature 是否支持 PHP urlencode

### 2.1 当前实现

`src/features/url/logic.ts` 仅支持两种变体：

| 变体 | 实现 | 空格编码 | 特殊字符 (/?&=#) |
|------|------|----------|-------------------|
| `component` | `encodeURIComponent()` | `%20` | 全部编码 |
| `uri` | `encodeURI()` | `%20` | 保留不编码 |

### 2.2 PHP urlencode 的差异

PHP 的 `urlencode()` 与 JS 标准实现的**唯一区别**是空格编码：
- JS `encodeURIComponent`: 空格 → `%20`（RFC 3986）
- PHP `urlencode`: 空格 → `+`（RFC 1866 / application/x-www-form-urlencoded）

其他字符的编码行为完全一致（均使用 `%XX` 十六进制大写）。

### 2.3 扩展方案

**新增 `UrlVariant` 枚举值 `'php'`**：

```typescript
// types.ts — 新增 variant
export type UrlVariant = 'component' | 'uri' | 'php'
```

**新增纯函数 `encodeUrlPhp()` / `decodeUrlPhp()`**：

```typescript
// logic.ts — 新增
export function encodeUrlPhp(input: string): string {
  // 先做标准 encodeURIComponent，再把 %20 替换为 +
  return encodeURIComponent(input).replace(/%20/g, '+')
}

export function decodeUrlPhp(input: string): string {
  // 先把 + 替换为 %20，再用标准 decodeURIComponent
  return decodeURIComponent(input.replace(/\+/g, ' '))
}
```

**修改 `encodeUrl()` / `decodeUrl()` 分发逻辑**：

```typescript
// logic.ts — 在 switch/variant 分支中增加 php case
export function encodeUrl(input: string, variant: UrlVariant): string {
  if (variant === 'php') return encodeUrlPhp(input)
  // ... 原有逻辑
}
```

**修改 `settings.ts`**：`defaultVariant` 的 select options 增加 `{ value: 'php', label: 'PHP (空格→+)' }`。

**改动范围**：
- `src/features/url/types.ts` — 类型扩展 (1 行)
- `src/features/url/logic.ts` — 新增 2 个纯函数 + 修改分发 (约 20 行)
- `src/features/url/settings.ts` — schema 加 option (约 3 行)
- `src/features/url/__tests__/logic.test.ts` — 新测试 (约 40 行)

**零破坏性**：现有 `component` / `uri` 行为完全不变。新 `php` variant 是纯增量。

---

## 3. Base64 Feature 是否支持 no-padding/auto-padding

### 3.1 当前实现

`src/features/base64/logic.ts`：

- `encode()`: 标准 RFC 4648，**始终输出 `=` 填充**（`btoa` 的行为）
- `decode()`: 标准 RFC 4648，**输入必须带正确 `=` 填充**（`atob` 的行为）
- `validateBase64()`: **严格验证** — 拒绝长度非 4 的倍数的输入，拒绝多/少填充

### 3.2 CloudEncrypt 的 Base64 变体差异

| 行为 | 当前 Base64 Feature | CloudEncrypt 需要的 |
|------|--------------------|--------------------|
| 编码输出 `=` | 始终输出 | **去除** `=` |
| 解码输入 `=` | 必须有 | **可缺失** — 自动补 `=` |
| 解码前预处理 | 无 | 空格 → `+`（URL 传输中 `+` 常被转空格） |

### 3.3 扩展方案

**新增 `Base64Variant` 类型和 `padding` 选项**：

```typescript
// types.ts — 新增
export type Base64Padding = 'standard' | 'none'
export type Base64Variant = 'standard' | 'urlsafe'  // 为未来预留

export interface Base64Config extends FeatureConfig {
  mode: 'encode' | 'decode'
  padding?: Base64Padding  // 新增，默认 'standard'
}
```

**修改 `encode()` 支持去除填充**：

```typescript
// logic.ts — 新增参数
export function encode(input: string, options?: { padding?: Base64Padding }): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  const b64 = btoa(binary)
  if (options?.padding === 'none') {
    return b64.replace(/=+$/, '')
  }
  return b64
}
```

**修改 `decode()` 支持自动补填充 + 空格修复**：

```typescript
// logic.ts — 新增参数
export function decode(input: string, options?: { autoPad?: boolean; fixSpaces?: boolean }): string {
  let fixed = input
  if (options?.fixSpaces) {
    fixed = fixed.replace(/ /g, '+')
  }
  if (options?.autoPad) {
    // 补 '=' 至 4 的倍数
    while (fixed.length % 4 !== 0) {
      fixed += '='
    }
  }
  const binary = atob(fixed)
  // ... 后续不变
}
```

**修改 `validateBase64()` 放宽无填充场景**：当 `options.padding === 'none'` 时不验证长度和填充。

**修改 `settings.ts`**：新增 `defaultPadding` select 字段。

**注：与 URL Feature 的 PHP variant 关系**

在 Pipeline 模式下，Base64 decode 的 `fixSpaces` 需求本质上来自上游 URL encode (PHP variant) 的 `+` → 空格问题。但考虑以下场景：
- 用户可能独立使用 "Base64(no-padding)" 编码
- Base64 的 `fixSpaces` 是一个独立有用的健壮性特性（MIME Base64 本身也允许空格）

因此建议 `fixSpaces` 作为 Base64 decode 的独立选项而非紧耦合于 Pipeline。

**改动范围**：
- `src/features/base64/types.ts` — 类型扩展 (约 5 行)
- `src/features/base64/logic.ts` — 修改 4 个函数签名 + 逻辑 (约 40 行)
- `src/features/base64/settings.ts` — schema 加 field (约 5 行)
- `src/features/base64/Base64Feature.ts` — run() 传 options (约 10 行)
- `src/features/base64/__tests__/logic.test.ts` — 新测试 (约 60 行)

**零破坏性**：所有新参数均为 optional，默认行为 = 标准 RFC 4648，现有调用全部兼容。

---

## 4. Pipeline/Preset 最小可行设计

### 4.1 核心概念

```
Preset = 命名管道 (Named Pipeline)
       = 一组 Step 的线性序列
       = 每个 Step 调用一个已有的 Feature 纯函数

PipelineRunner = 执行引擎
               = 按序执行 Steps
               = 每个 Step 的 output 成为下一个 Step 的 input
```

### 4.2 为什么不是「新建 Feature」

- Pipeline 不引入新的原子变换逻辑 — 它是组合
- Preset 可以定义在**数据层**，不需要新建 `src/features/cloud-encrypt/`
- 便于未来扩展更多 Preset（如 JSON→Base64、URL Decode→JSON Pretty Print 等）

### 4.3 最小可行范围

**Phase 2 交付**（见分阶段计划）：

1. **Preset 数据定义** — `src/presets/` 目录，每个 Preset 一个 `.ts` 文件
2. **pipelineRunner** — `src/shared/pipeline/` — 应用层共享执行引擎（非 SDK 契约）
3. **PresetView.vue** — 通用 UI 组件，接收 Preset 定义渲染界面
4. **Preset 注册** — `src/presets/index.ts` barrel，被 workspaceStore 发现
5. **php-compatible 预设** — 第一个 Preset，替代 CloudEncrypt

**不做什么**：
- 不做可视化管道编辑器（那是 P3+ 的事）
- 不做动态管道（用户自由拖拽 Step）
- 不做条件分支（管道是线性的）
- 不做 Feature 间事件通信

### 4.4 Preset 与 Feature 的关系

```
Feature（原子操作）
  → 有自己的 View、Composable、Toolbar、History
  → 用户直接交互

Preset（管道组合）
  → 复用 Feature 的纯函数 (logic.ts)
  → 有简化的 View（无独立 toolbar/history/settings，复用最后一个 Feature 的）
  → 用户一键执行全管道
```

---

## 5. Preset 数据结构建议

### 5.1 TypeScript 类型定义

```typescript
// src/shared/pipeline/types.ts

/** 单个管道步骤 — 调用一个已有 Feature 的纯函数 */
export interface PipelineStep {
  /** 步骤标识（用于日志/错误定位） */
  readonly id: string

  /** 人类可读标签 */
  readonly label: string

  /**
   * 执行函数。
   * 接收上一步的输出字符串，返回处理后的字符串。
   * 输入输出均为 string，因为管道是文本→文本的线性变换。
   *
   * 实现约定:
   *   - 必须从对应 Feature 的 logic.ts 导入纯函数
   *   - 不得有副作用（不访问 DOM / FS / Network）
   *   - 异常直接抛出，由 pipelineRunner 捕获
   */
  readonly execute: (input: string) => string

  /**
   * 可选: 验证输入是否适合此步骤。
   * 如果返回 false，管道在此步骤前终止并报错。
   */
  readonly validate?: (input: string) => boolean
}

/** 一个 Preset = 命名管道 = 有序 Steps */
export interface PipelinePreset {
  /** 唯一标识，如 'php-compatible-encode' */
  readonly id: string

  /** 显示名称，如 'PHP Compatible Encode' */
  readonly name: string

  /** 描述（显示在 UI subtitle） */
  readonly description: string

  /** 图标（从 @/design/icons 引用） */
  readonly icon: string

  /** 分类（必须与现有 Sidebar categories 对应） */
  readonly category: string

  /** 版本 */
  readonly version: string

  /** 路由路径，如 '/preset/php-compatible' */
  readonly route: string

  /** 模式: encode 或 decode */
  readonly mode: 'encode' | 'decode'

  /** 编码步骤（按序执行） */
  readonly encodeSteps: PipelineStep[]

  /** 解码步骤（按序执行，逆向） */
  readonly decodeSteps: PipelineStep[]

  /** 搜索关键词（CN + EN） */
  readonly keywords: string[]

  /** 来源标记: 迁移自旧功能时使用 */
  readonly deprecated?: {
    /** 旧路由路径 */
    readonly oldRoute: string
    /** 旧功能名称 */
    readonly oldName: string
    /** 迁移提示文本 */
    readonly migrationNote: string
  }
}
```

### 5.2 PHP Compatible Preset 具体定义

```typescript
// src/presets/php-compatible.preset.ts

import type { PipelinePreset } from '@/shared/pipeline/types'
import { encodeUrl, decodeUrl } from '@/features/url/logic'
import { encode as base64Encode, decode as base64Decode } from '@/features/base64/logic'

export const phpCompatiblePreset: PipelinePreset = {
  id: 'php-compatible',
  name: 'PHP Compatible',
  description: 'PHP base_encryption / filter 兼容管道 — URL Encode(PHP) → Base64(无填充)',
  icon: 'Package',  // 继承旧 CloudEncrypt 图标，保持用户认知
  category: 'encoding',
  version: '1.0.0',
  route: '/preset/php-compatible',
  mode: 'encode',

  encodeSteps: [
    {
      id: 'url-encode-php',
      label: 'URL Encode (PHP)',
      execute: (input: string) => encodeUrl(input, 'php'),
    },
    {
      id: 'base64-encode-no-pad',
      label: 'Base64 Encode (No Padding)',
      execute: (input: string) => base64Encode(input, { padding: 'none' }),
    },
  ],

  decodeSteps: [
    {
      id: 'base64-decode-auto-pad',
      label: 'Base64 Decode (Auto Padding)',
      execute: (input: string) => base64Decode(input, { autoPad: true, fixSpaces: true }),
    },
    {
      id: 'url-decode-php',
      label: 'URL Decode (PHP)',
      execute: (input: string) => decodeUrl(input, 'php'),
    },
  ],

  keywords: [
    'php', 'base_encryption', 'filter', 'urlencode', 'base64', 'cloud encrypt',
    'PHP编码', 'PHP解码', '参数编码', '请求编码', 'base加密',
  ],

  deprecated: {
    oldRoute: '/cloud-encrypt',
    oldName: 'Cloud Encrypt',
    migrationNote:
      'Cloud Encrypt 已迁移为 Pipeline Preset「PHP Compatible」。' +
      '功能完全等价：URL Encode (PHP) → Base64 (无填充)。',
  },
}
```

### 5.3 注册 Barrel

```typescript
// src/presets/index.ts
export { phpCompatiblePreset } from './php-compatible.preset'
// 未来 Preset 在此注册
```

---

## 6. pipelineRunner 设计

### 6.1 模块位置

```
src/shared/pipeline/
  index.ts              ← barrel export
  types.ts              ← 类型定义（PipelineStep, PipelinePreset, PipelineResult, PipelineError）
  pipelineRunner.ts      ← 核心执行函数
  __tests__/
    pipelineRunner.test.ts
```

> **为什么是 `src/shared/` 而非 `src/sdk/`**：`src/sdk/` 是 Frozen 层，本次迁移不引入 SDK 级变更。Pipeline 第一版是应用层共享工具，仅服务于内置 Preset，不是稳定的 Feature SDK 契约。待稳定后通过独立 RFC/ADR 升格。

### 6.2 pipelineRunner 签名与行为

```typescript
// src/shared/pipeline/pipelineRunner.ts

import type { PipelineStep, PipelinePreset } from './types'

export interface PipelineResult {
  /** 最终输出 */
  output: string

  /** 每步的中间输出（用于调试/展示） */
  steps: Array<{
    stepId: string
    label: string
    output: string
    durationMs: number
  }>

  /** 总执行时间 (ms) */
  totalDurationMs: number
}

export interface PipelineError {
  message: string
  stepId: string   // 在哪个步骤失败
  stepLabel: string
  cause: Error
}

/**
 * 执行管道编码或解码
 *
 * @param preset  - Preset 定义
 * @param mode    - 'encode' | 'decode'
 * @param input   - 原始输入
 * @returns       - PipelineResult（成功）或抛出 PipelineError（失败）
 *
 * 行为:
 *   1. 对每个 Step 按序调用 execute(input)
 *   2. 每个 Step 的 output 成为下一个 Step 的 input
 *   3. 记录每步的中间输出和耗时
 *   4. 任一步骤抛出异常 → 包装为 PipelineError 并终止
 *   5. 输入为空字符串 → 返回空 PipelineResult
 */
export function runPipeline(
  preset: PipelinePreset,
  mode: 'encode' | 'decode',
  input: string,
): PipelineResult
```

### 6.3 实现要点

```
runPipeline(preset, mode, input):
  1. 选择 steps = mode === 'encode' ? preset.encodeSteps : preset.decodeSteps
  2. 如果 steps 为空 → throw PipelineError("No steps defined")
  3. 如果 input 为空 → 返回 { output: '', steps: [], totalDurationMs: 0 }
  4. currentInput = input
  5. for each step in steps:
     a. 可选: 如果 step.validate 存在且返回 false → throw PipelineError
     b. t0 = performance.now()
     c. currentInput = step.execute(currentInput)
     d. t1 = performance.now()
     e. 记录 { stepId, label, output: currentInput, durationMs: t1 - t0 }
  6. 返回 PipelineResult
```

### 6.4 设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| Steps 类型 | 同步函数 `string → string` | 编码操作均为 CPU 密集型纯函数，无需异步 |
| 无异步支持 | v1 不同步 | Base64/URL/JSON 等编码操作无 I/O，引入 async 增加不必要的复杂度 |
| 中间结果暴露 | 全部暴露在 `steps[]` | 方便前端展示「管道调试」视图（未来 P3） |
| 错误传播 | 包装 + 抛出 | 保留 stepId 用于 UI 精准报错 |
| 放在 `src/shared/pipeline/` 下 | ✅ | 不在 Frozen 层，属于应用层共享工具；未来通过 RFC/ADR 升格至 SDK |

---

## 7. UI 入口设计

### 7.1 Preset 通用视图 (PresetView.vue)

```
┌──────────────────────────────────────────────┐
│ ← PHP Compatible           [编码] [解码]      │  ← 模式切换 segmented control
│                                              │
│ PHP base_encryption / filter 兼容管道         │  ← 描述
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 输入                          [清空]      │ │  ← textarea + toolbar
│ │                                            │ │
│ │                                            │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ [执行]  [从剪贴板粘贴]                         │  ← 操作按钮
│                                              │
│ ┌──── 管道预览 ────────────────────────────┐ │
│ │ 原始内容                                   │ │
│ │   ↓ URL Encode (PHP)                      │ │  ← 折叠/展开
│ │ 中间结果...                                │ │
│ │   ↓ Base64 Encode (No Padding)            │ │
│ │ 最终输出                                   │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 输出                          [复制]      │ │  ← 只读 textarea + copy button
│ │                                            │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ⓘ 此功能等价于旧版「Cloud Encrypt」。          │  ← 迁移提示 (deprecated 信息)
│   URL Encode(PHP) → Base64(No Padding)       │
└──────────────────────────────────────────────┘
```

### 7.2 实现方式

```typescript
// src/presets/PresetView.vue (通用组件)

// Props:
//   preset: PipelinePreset   ← 从路由参数解析

// 使用 usePreset(preset) composable:
//   - 复用 pipelineRunner 执行
//   - 管理 input/output/error/loading/mode 响应式状态
//   - 暴露 execute() / clear() / swap() / copy()
//   - 没有独立 toolbar/history/settings（简化版）
```

### 7.3 Preset 的 Composable (usePreset)

```typescript
// src/presets/composables.ts

export function usePreset(preset: PipelinePreset) {
  const input = ref('')
  const output = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)
  const mode = ref<'encode' | 'decode'>(preset.mode)
  const pipelineResult = ref<PipelineResult | null>(null)

  async function execute() {
    // 调用 runPipeline(preset, mode.value, input.value)
  }

  // ... clear, swap, copy 方法
  return { input, output, error, loading, mode, pipelineResult, execute }
}
```

### 7.4 路由注册

```typescript
// src/router/index.ts — 新增两条路由

// 新 Preset 路由
{
  path: '/preset/php-compatible',
  name: 'preset-php-compatible',
  component: () => import('@/presets/PresetView.vue'),
  meta: { preset: 'php-compatible' },  // ← 传递给 PresetView
},

// 旧 Cloud Encrypt 重定向（见 §8）
{
  path: '/cloud-encrypt',
  redirect: '/preset/php-compatible',
},
```

### 7.5 侧边栏菜单

```typescript
// src/components/Sidebar.vue — 替换 CloudEncrypt 条目

// 旧条目 (删除):
// { path: '/cloud-encrypt', label: 'Cloud Encrypt', icon: 'Package', ... }

// 新条目 (替换):
{
  path: '/preset/php-compatible',
  label: 'PHP Compatible',
  icon: 'Package',
  keywords: 'php base_encryption filter urlencode base64 cloud encrypt ...',
  category: 'encoding',
  pluginId: 'preset-php-compatible',
},
```

---

## 8. 旧 Cloud Encrypt 路由如何兼容迁移

### 8.1 三阶段兼容策略

```
Phase 2 部署时:
  /cloud-encrypt  →  302 redirect →  /preset/php-compatible
  侧边栏           →  替换为 PHP Compatible（Encoding 分类）
  命令面板         →  Cloud Encrypt 关键词搜索 → 显示 PHP Compatible
  旧书签/外部链接  →  自动跳转到新页面（用户无感）

Phase 3 (一个版本后):
  保留 redirect 路由 + 增加 toast 提示:
  "Cloud Encrypt 已迁移至 PHP Compatible，请更新书签"

Phase 4 (两个版本后):
  移除 /cloud-encrypt 路由，仅保留 redirect（404 友好提示页）
```

### 8.2 具体实现

**路由重定向（Phase 2）**：

```typescript
// src/router/index.ts

// 方案 A: Vue Router redirect（推荐）
{
  path: '/cloud-encrypt',
  redirect: '/preset/php-compatible',
},

// 方案 B: 带 query 标记（如需统计迁移流量）
{
  path: '/cloud-encrypt',
  redirect: to => {
    return { path: '/preset/php-compatible', query: { from: 'cloud-encrypt' } }
  },
},
```

**PresetView 中的迁移提示**：
- 检测 `route.query.from === 'cloud-encrypt'`
- 显示 dismissable banner：「Cloud Encrypt 已升级为 PHP Compatible 管道预设，功能完全一致」

**命令面板/搜索**：
- `phpCompatiblePreset.keywords` 中包含 `'cloud encrypt'` 和 `'cloud-encrypt'`
- 用户搜索 "cloud" 时仍能找到此功能

**workSpaceStore 兼容性**：
- 需要 `workspaceStore.touchRecent('preset-php-compatible')` 而非 `'cloud-encrypt'`
- 旧 recent 条目中的 `'cloud-encrypt'` → 在 `touchRecent` 中做映射，或第一次访问后自然替换

---

## 9. 旧 Rust Tauri command 如何清理

### 9.1 依赖关系

```
lib.rs
  └── invoke_handler![cloud_cmd::cloud_encrypt]  ← Tauri 命令注册
       └── commands/cloud_cmd.rs
            └── services/cloud_crypto.rs          ← 实际实现
                 └── Cargo.toml: base64 crate     ← 外部依赖
```

此外 `services/crypto.rs`（AES 加密，不是 cloud_crypto）是另一个独立的 service，**不受影响**。

### 9.2 清理策略

**原则**: 先确保前端不再调用，再移除后端。遵循 Deprecate → Remove 两步走。

```
Phase 2: 标记 deprecated
  - cloud_cmd.rs: 保留函数，body 改为空实现 + warn! log
  - lib.rs: 保留 invoke_handler 注册（否则编译报错）
  - 前端: 不再调用 invoke("cloud_encrypt", ...)

Phase 3 (一个版本后): 移除
  - 删除 src-tauri/src/services/cloud_crypto.rs
  - 删除 src-tauri/src/commands/cloud_cmd.rs
  - 修改 src-tauri/src/commands/mod.rs: 移除 pub mod cloud_cmd
  - 修改 src-tauri/src/services/mod.rs: 移除 pub mod cloud_crypto
  - 修改 src-tauri/src/lib.rs: 移除 invoke_handler 中的 cloud_cmd::cloud_encrypt 条目
  - 检查 Cargo.toml: 如果 base64 crate 仅被 cloud_crypto 使用，则移除该依赖
  - 运行 cargo check / cargo test 确认编译通过
```

### 9.3 Cargo.toml 影响分析

需要检查 `base64` crate 是否被其他模块依赖：

```bash
grep -r "base64" src-tauri/src --include="*.rs"
```

如果仅 `cloud_crypto.rs` 使用，则 `Cargo.toml` 中的 `base64` 依赖一并移除。如果 `crypto.rs`（AES）也使用，则保留。

---

## 10. 需要修改的文件清单

### Phase 1: 扩展 Feature 变体

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/features/url/types.ts` | 修改 | `UrlVariant` 增加 `'php'` |
| `src/features/url/logic.ts` | 修改 | 新增 `encodeUrlPhp()` / `decodeUrlPhp()`，分发逻辑增加 `php` case |
| `src/features/url/settings.ts` | 修改 | `defaultVariant` schema 增加 `php` option |
| `src/features/url/__tests__/logic.test.ts` | 修改 | 增加 PHP variant encode/decode/roundtrip 测试 |
| `src/features/base64/types.ts` | 修改 | 新增 `Base64Padding` 类型，`Base64Config` 增加 `padding?` |
| `src/features/base64/logic.ts` | 修改 | `encode()` 增加 `padding` option，`decode()` 增加 `autoPad`/`fixSpaces` option，`validateBase64()` 放宽无填充校验 |
| `src/features/base64/settings.ts` | 修改 | 新增 `defaultPadding` select 字段 |
| `src/features/base64/Base64Feature.ts` | 修改 | `run()` 将 `config.padding` 传入 logic 函数 |
| `src/features/base64/__tests__/logic.test.ts` | 修改 | 增加 no-padding encode / auto-pad decode / fixSpaces decode / roundtrip 测试 |

### Phase 2: 建设 Pipeline (shared) + Preset + 迁移

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/shared/pipeline/types.ts` | **新建** | `PipelineStep`, `PipelinePreset`, `PipelineResult`, `PipelineError` |
| `src/shared/pipeline/pipelineRunner.ts` | **新建** | `runPipeline()` 核心执行函数 |
| `src/shared/pipeline/index.ts` | **新建** | Barrel export |
| `src/shared/pipeline/__tests__/pipelineRunner.test.ts` | **新建** | Pipeline 执行/错误传播/空输入/单步/多步 测试 |
| `src/presets/php-compatible.preset.ts` | **新建** | PHP Compatible Preset 定义 |
| `src/presets/PresetView.vue` | **新建** | 通用 Preset 视图组件 |
| `src/presets/composables.ts` | **新建** | `usePreset()` composable |
| `src/presets/index.ts` | **新建** | Preset barrel export |
| `src/router/index.ts` | 修改 | 新增 `/preset/php-compatible` 路由；`/cloud-encrypt` 改为 redirect |
| `src/components/Sidebar.vue` | 修改 | Cloud Encrypt 条目替换为 PHP Compatible |
| `src/modules/cloud/CloudEncryptView.vue` | 标记 | 添加注释 `@deprecated since vX.X — migrated to /preset/php-compatible` |
| `src/plugins/preset-php-compatible.plugin.ts` | **新建** | 让 workspaceStore 发现此 Preset |
| `docs/design/cloud-encrypt-migration.md` | **新建** | 本文档 |
| `CHANGELOG.md` | 修改 | 记录迁移 |

> **注意**: Phase 2 不修改 `src/sdk/feature/index.ts` 或任何 SDK 文件。Preset 和 PresetView 直接 `import ... from '@/shared/pipeline'`。

### Phase 3: 清理 Rust 后端 + 移除旧代码

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/modules/cloud/CloudEncryptView.vue` | **删除** | 确认无其他引用后删除 |
| `src-tauri/src/services/cloud_crypto.rs` | **删除** | 移除 Rust 实现 |
| `src-tauri/src/commands/cloud_cmd.rs` | **删除** | 移除 Tauri command |
| `src-tauri/src/commands/mod.rs` | 修改 | 移除 `pub mod cloud_cmd` |
| `src-tauri/src/services/mod.rs` | 修改 | 移除 `pub mod cloud_crypto` |
| `src-tauri/src/lib.rs` | 修改 | 移除 `cloud_cmd::cloud_encrypt` 注册 |
| `src-tauri/Cargo.toml` | 修改 | 移除 `base64` 依赖（如无其他使用者） |

### 不修改的文件

| 文件 | 原因 |
|------|------|
| `src/core/**` | Frozen — Prime Directive |
| `src/sdk/**` (所有现有文件) | Frozen — 不在 SDK 下新增目录或修改任何文件 |
| `src/sdk/feature/index.ts` | Frozen — 不在此次迁移中增加 re-export |
| `src/components/**` (除 Sidebar.vue) | Frozen — 设计系统组件 |
| `src/design/icons/index.ts` | 保留 Package 图标映射（Preset 继续使用） |
| `src/stores/workspace.ts` | 不改动 — Preset 通过 plugin 文件注册 |
| `src/layouts/**` | Frozen |
| `src/patterns/**` | Frozen |

---

## 11. 测试清单

### 11.1 URL Feature — PHP Variant

```
□ encodeUrlPhp: ASCII 文本空格 → '+'
□ encodeUrlPhp: 中文 UTF-8 编码后空格 → '+'
□ encodeUrlPhp: 特殊字符保持 %XX 编码
□ encodeUrlPhp: 无空格输入完全等于 encodeURIComponent
□ decodeUrlPhp: '+' → 空格
□ decodeUrlPhp: '%20' → 空格（健壮性）
□ decodeUrlPhp: 混合 '+' 和 '%20' → 均为空格
□ decodeUrlPhp: 中文百分号编码正确还原
□ URL(PHP) roundtrip: 含空格/中文/特殊字符的完整往返
□ URL(PHP) 与 URL(component) 空格行为差异对比
```

### 11.2 Base64 Feature — No Padding / Auto Pad

```
□ encode(padding: 'none'): 标准输入不输出 '='
□ encode(padding: 'none'): 与 encode(padding: 'standard') 对比仅差 '='
□ decode(autoPad: true): 无填充字符串正确解码
□ decode(autoPad: true): 缺 1 个 '=' 的字符串正确解码
□ decode(autoPad: true): 缺 2 个 '=' 的字符串正确解码
□ decode(autoPad: true): 标准带填充字符串也正确解码（兼容）
□ decode(fixSpaces: true): 空格被替换为 '+'
□ decode(fixSpaces: true, autoPad: true): 空格+无填充同时修复
□ no-padding + auto-pad roundtrip: 完整往返
□ validateBase64: 无填充时仍拒绝非法字符
□ validateBase64: 无填充时接受长度非 4 的倍数（或新增独立验证函数）
```

### 11.3 Pipeline Runner

```
□ runPipeline: 单步管道正确执行
□ runPipeline: 多步管道输出 = 逐步组合结果
□ runPipeline: 空输入返回空 PipelineResult
□ runPipeline: 空 steps 抛出 PipelineError
□ runPipeline: 中间步骤抛出异常 → 包装为 PipelineError
□ runPipeline: PipelineError 包含正确的 stepId / stepLabel
□ runPipeline: steps[] 包含每步中间输出和耗时
□ runPipeline: encode/decode mode 选择正确的 steps
□ runPipeline: 性能 — 1MB 输入 3 步管道 < 500ms
```

### 11.4 PHP Compatible Preset (集成测试)

```
□ Encode: "hello world" → "aGVsbG8rd29ybGQ" (确认无 '=')
□ Encode: 中文 "你好世界" → Base64(URL-Encoded(PHP)) 结果正确
□ Encode: JSON 字符串 → 正确编码
□ Decode: 编码结果 decode 回原始输入
□ Decode: 带空格的输入（模拟 URL 传输）→ 正确解码
□ Decode: 无 '=' 填充的输入 → 正确解码
□ Decode: 带 '=' 填充的输入 → 也正确解码（兼容）
□ Full roundtrip: encode → decode = identity (含各种 edge case)
□ 与旧 CloudEncrypt Rust 实现结果对照（等价性验证）
```

### 11.5 路由兼容

```
□ /cloud-encrypt → 302 → /preset/php-compatible
□ /cloud-encrypt?from=old → redirect 携带 query 参数
□ 侧边栏点击 PHP Compatible → 导航到 /preset/php-compatible
□ 搜索 "cloud encrypt" → 命令面板显示 PHP Compatible
□ 搜索 "base_encryption" → 命令面板显示 PHP Compatible
□ Sidebar 不再显示 "Cloud Encrypt" 条目
```

### 11.6 Rust 清理后

```
□ cargo check 无错误
□ cargo test 全通过
□ cargo build 成功
□ tauri dev 启动无 cloud_encrypt 相关 panic
```

---

## 12. 分阶段实施计划

### Phase 1 — 扩展 Feature 变体（S 工作量，1-2 天）

**目标**: url/base64 Feature 获得 PHP variant 和 no-padding 能力，为 Pipeline 提供原子操作。

| 任务 | 估时 | 前置 |
|------|------|------|
| 1.1 url types.ts: 增加 `'php'` variant | 5min | - |
| 1.2 url logic.ts: 新增 `encodeUrlPhp()` / `decodeUrlPhp()` | 30min | 1.1 |
| 1.3 url logic.ts: 修改 `encodeUrl()` / `decodeUrl()` 分发 | 15min | 1.2 |
| 1.4 url settings.ts: schema 增加 php option | 10min | 1.1 |
| 1.5 url 测试: PHP variant 全覆盖 | 45min | 1.3 |
| 1.6 base64 types.ts: 增加 `Base64Padding` 等类型 | 10min | - |
| 1.7 base64 logic.ts: `encode()` 支持 `padding: 'none'` | 20min | 1.6 |
| 1.8 base64 logic.ts: `decode()` 支持 `autoPad` + `fixSpaces` | 30min | 1.6 |
| 1.9 base64 logic.ts: `validateBase64()` 放宽无填充 | 20min | 1.6 |
| 1.10 base64 settings.ts: 增加 `defaultPadding` | 10min | 1.6 |
| 1.11 base64 Base64Feature.ts: `run()` 传 options | 15min | 1.7-1.9 |
| 1.12 base64 测试: no-padding/auto-pad/fixSpaces 全覆盖 | 60min | 1.7-1.9 |
| 1.13 运行 `npx vue-tsc --noEmit && npm test` 确认绿 | 15min | 全部 |

**验收标准**:
- `npm test` 全绿（包括新测试）
- `npx vue-tsc --noEmit` 无错误
- url/base64 现有功能零退化
- PHP variant 和 no-padding 独立可用

**风险**: 低。纯增量扩展，所有新参数 optional。

---

### Phase 2 — Pipeline (shared) + PHP Compatible Preset + 迁移（M 工作量，3-4 天）

**目标**: Pipeline 基础设施就绪（在 `src/shared/pipeline/` 下），PHP Compatible Preset 上线，Cloud Encrypt 路由重定向。不修改 SDK。

| 任务 | 估时 | 前置 |
|------|------|------|
| 2.1 `src/shared/pipeline/types.ts` | 30min | - |
| 2.2 `src/shared/pipeline/pipelineRunner.ts` | 60min | 2.1 |
| 2.3 `src/shared/pipeline/index.ts` barrel | 5min | 2.2 |
| 2.4 `src/shared/pipeline/__tests__/pipelineRunner.test.ts` | 60min | 2.2 |
| 2.5 `src/presets/php-compatible.preset.ts` | 30min | Phase 1, 2.1 |
| 2.6 `src/presets/composables.ts` (`usePreset`) | 45min | 2.2, 2.5 |
| 2.7 `src/presets/PresetView.vue` (通用 UI) | 90min | 2.6 |
| 2.8 `src/presets/index.ts` barrel | 5min | 2.5 |
| 2.9 `src/plugins/preset-php-compatible.plugin.ts` | 20min | 2.5 |
| 2.10 路由: 新增 `/preset/php-compatible`，`/cloud-encrypt` → redirect | 15min | 2.7 |
| 2.11 Sidebar: Cloud Encrypt → PHP Compatible | 15min | 2.5 |
| 2.12 PresetView 迁移提示 banner (检测 `?from=cloud-encrypt`) | 20min | 2.7 |
| 2.13 集成测试: PHP Compatible Preset 完整往返 | 45min | 2.5-2.7 |
| 2.14 对照测试: Preset 输出 vs 旧 CloudEncrypt Rust 输出 | 45min | 2.13 |
| 2.15 运行 `npm run validate` 全 CI 检查 | 30min | 全部 |

**验收标准**:
- `/preset/php-compatible` 页面功能完整
- 编码/解码结果与旧 CloudEncrypt Rust 实现**逐字节一致**
- `/cloud-encrypt` 自动跳转到新页面
- 侧边栏显示 PHP Compatible，搜索 "cloud encrypt" 能找到
- `npm run validate` 全绿

**风险**: 中。对照测试必须通过，确保行为等价。

---

### Phase 3 — 清理 Rust 后端 + 移除旧代码（S 工作量，1 天）

**目标**: 移除 CloudEncrypt 旧代码，减少维护负担。

| 任务 | 估时 | 前置 |
|------|------|------|
| 3.1 `cloud_cmd.rs`: 替换为空实现 + `warn!` 日志（Deprecation 过渡） | 10min | Phase 2 部署确认 |
| 3.2 等待一个版本周期，确认无调用 | - | 3.1 |
| 3.3 删除 `src-tauri/src/services/cloud_crypto.rs` | - | 3.2 |
| 3.4 删除 `src-tauri/src/commands/cloud_cmd.rs` | - | 3.3 |
| 3.5 修改 `commands/mod.rs`、`services/mod.rs`、`lib.rs` | 10min | 3.3-3.4 |
| 3.6 检查并移除 `Cargo.toml` 中 `base64` 依赖（如孤立） | 5min | 3.5 |
| 3.7 `cargo check && cargo test` 确认编译/测试 | 15min | 3.5-3.6 |
| 3.8 删除 `src/modules/cloud/CloudEncryptView.vue` | 5min | Phase 2 |
| 3.9 删除 `src/modules/cloud/` 目录（如为空） | 5min | 3.8 |
| 3.10 移除 `/cloud-encrypt` redirect 路由 | 5min | 3.8 |
| 3.11 `npm run validate` 确认全绿 | 15min | 全部 |

**验收标准**:
- `cargo check && cargo test` 全绿
- `npm run validate` 全绿
- `src/modules/cloud/` 目录不存在
- `git grep cloud_encrypt` 仅在 docs/migration 文档中有引用

**风险**: 低。此阶段在 Phase 2 稳定运行一个版本后执行，所有调用路径已确认迁移。

---

## 13. 每个阶段的风险和回滚方式

### Phase 1 风险

| 风险 | 概率 | 影响 | 缓解措施 | 回滚方式 |
|------|------|------|----------|----------|
| PHP variant 编码行为与 PHP `urlencode()` 不一致 | 低 | 中 | 用 PHP 实际输出做对照测试；只覆盖空格→`+` 差异（这是唯一区别） | 移除 `'php'` variant 值，不影响 component/uri |
| base64 no-padding 破坏现有用户 | 极低 | 低 | `padding` 参数 optional，默认 `'standard'` 行为不变 | 回退 commit |
| `atob()` 对未补全 padding 的输入行为不一致 | 中 | 高 | `atob` 在某些浏览器可能拒绝无填充输入 — 必须在 `autoPad` 模式下先补 `=` 再调用 `atob` | `decode()` 中 `autoPad` 逻辑确保先补全后解码 |

### Phase 2 风险

| 风险 | 概率 | 影响 | 缓解措施 | 回滚方式 |
|------|------|------|----------|----------|
| Preset 输出与 Rust 输出不一致 | 中 | 高 | Phase 2 任务 2.14 对照测试：用 50+ 条测试向量（ASCII/Unicode/特殊字符/长文本/JSON）对比 Rust 和 TS 输出，逐字节断言 | 修复差异后重新部署；如差异无法调和则暂停迁移，保留旧 CloudEncrypt |
| `encodeURIComponent` vs Rust 手写 `url_encode` 行为差异 | 中 | 高 | Rust `url_encode` 保留字符集为 `A-Za-z0-9-_.~` 且空格→`+`；JS `encodeURIComponent` 保留集略不同（不编码 `-_.!~*'()`）。**必须做对照测试**，如不一致则 TS 侧也手写 `urlEncodePhp` 严格匹配 Rust 行为 | 如对照测试失败，手写 `urlEncodePhp` 逐字节匹配 Rust 逻辑 |
| PipelineRunner 性能 | 低 | 低 | 纯同步函数链，O(input_size) × O(steps)。1MB 输入 3 步管道应在 500ms 内完成 | 如性能不达标，加 Web Worker 异步执行（P3） |
| PresetView UI 体验降级（相比旧 CloudEncrypt） | 中 | 中 | PresetView 必须提供 ≥ 旧 CloudEncrypt 的功能（输入→执行→输出），且额外展示管道步骤 | UI 改进迭代，必要时先保留旧 CloudEncrypt 并存一个版本 |
| 路由 redirect 与浏览器后退行为冲突 | 低 | 低 | 使用 `redirect` 而非 `alias`；redirect 是服务端级跳转，浏览器历史不堆积 | 改回 alias 或使用 `router.replace` |
| workspaceStore 不识别 Preset（未注册 plugin） | 中 | 中 | 需要创建 `preset-php-compatible.plugin.ts` 或扩展 workspaceStore 支持 preset barrel。**前置验证**：Phase 2 开始前确认 workspaceStore 能否发现 Preset | 如无法自动发现，手动在 workspaceStore 中注册 Preset（最小修改） |

### Phase 3 风险

| 风险 | 概率 | 影响 | 缓解措施 | 回滚方式 |
|------|------|------|----------|----------|
| Rust `base64` crate 被其他模块依赖 | 低 | 中 | Phase 3 任务 3.6 先检查，确认无其他引用再移除 | 保留 Cargo.toml 中 base64 依赖 |
| 第三方/外部脚本仍调用 `invoke("cloud_encrypt")` | 极低 | 低 | Phase 3 的 Deprecation 版保留空实现 + `warn!`，给外部一个版本周期迁移 | 恢复 cloud_cmd.rs 实现（Git revert） |

---

## 附录 A: 对照测试向量 (Phase 2 关键)

以下测试向量用于验证 TS Preset 输出与 Rust CloudEncrypt 输出一致：

```
输入                              → 预期编码结果
"hello world"                     → "aGVsbG8rd29ybGQ"  (无 '=')
"hello+world=test"                → URL(+ → %2B, = → %3D) → Base64 → no pad
"测试中文"                         → URL(%E6%B5%8B%E8%AF%95) → Base64 → no pad
""                                → ""
"a"                               → 单字符
"{}"                              → URL → Base64
'{"code":"set_password","type":1}' → PHP base_encryption 等价输出
"special chars: !@#$%^&*()"      → URL Encode → Base64 → no pad
"key=value&foo=bar"              → URL(PHP) → Base64 → no pad
重复 1000 次的 "hello world "     → 中等长度输入
```

---

## 附录 B: Frozen 层合规说明

### B.1 `src/sdk/` 是 Frozen 层

CLAUDE.md 明确标记 `src/sdk/` 为 Never Modify 层：

```
❌ src/sdk/            ← Feature SDK + Plugin SDK (Frozen)
```

本次迁移严格遵循此规则：

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 修改 `src/sdk/**` 现有文件 | ❌ 不做 | 零修改 |
| 在 `src/sdk/` 下新增子目录 | ❌ 不做 | 不在 Frozen 层新增 `src/sdk/pipeline/` |
| 在 `src/sdk/feature/index.ts` 增加 re-export | ❌ 不做 | 不修改任何 SDK barrel |
| Pipeline 代码位置 | `src/shared/pipeline/` | 应用层共享工具，非 SDK 契约 |

### B.2 `src/shared/` 定位

`src/shared/` 是项目已有的应用层共享目录（当前含 `clipboard.ts`）。其定位：

- **不是 Core** — 不提供框架级抽象
- **不是 SDK** — 不提供 Feature/Plugin 契约
- **是应用层共享工具** — 供 features、presets、composables 等应用层代码 import

`src/shared/pipeline/` 继承这一层级定位：它是应用层共享的管道执行工具，仅服务于内置 Preset。

### B.3 未来升格路径

当以下条件全部满足时，通过独立 RFC/ADR 将 Pipeline 从 `src/shared/pipeline/` 升格至 `src/sdk/pipeline/`：

1. Pipeline 在 ≥ 3 个 Preset 中稳定运行 ≥ 2 个版本周期
2. pipelineRunner 的 API 签名经过实际使用验证无需破坏性变更
3. PipelineStep/PipelinePreset 类型被多个 Feature 引用
4. 有独立的 RFC 文档记录升格理由和契约承诺

升格操作：
```
src/shared/pipeline/*  →  src/sdk/pipeline/*
```
同时更新 `src/sdk/index.ts` barrel，所有 `import ... from '@/shared/pipeline'` 替换为 `import ... from '@/sdk/pipeline'`。

### B.4 与 CLAUDE.md 规则对照

| CLAUDE.md 规则 | 遵守情况 |
|----------------|----------|
| 不修改 `src/core/` | ✅ 零修改 |
| 不修改 `src/sdk/` | ✅ 零修改（不在其下新增目录或文件） |
| 不修改 `src/components/` (设计系统) | ✅ 仅修改 `Sidebar.vue`（非设计系统组件） |
| 不修改 `src/layouts/` `src/patterns/` | ✅ |
| Features 不互相导入 | ✅ Preset 从 `logic.ts` 导入纯函数（允许，logic.ts 是纯函数库） |
| 使用 Design Tokens | ✅ PresetView.vue 使用 `var(--*-*)` |
| 不硬编码颜色/间距/字号 | ✅ |
| logic.ts 纯函数 | ✅ pipelineRunner + logic.ts 函数均为纯函数 |
| 写 5+ 单元测试 | ✅ 每个扩展点都有测试规划 |
| 不在 Frozen 层新增代码 | ✅ Pipeline 放在 `src/shared/pipeline/` |

---

> **下一步**: 请审阅本设计。确认 Pipeline 放在 `src/shared/pipeline/` 且不修改 `src/sdk/` 的架构决策，以及 Phase 1 → 2 → 3 的分阶段计划。各 Phase 之间应有充分的验证窗口。
