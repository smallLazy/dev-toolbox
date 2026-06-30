# Feature SDK v1.0 — Developer Workspace

> **定位**: Core Framework 之上的工具开发抽象层。所有 Feature 必须继承本 SDK。
> **规则**: Feature 禁止直接访问 Core / Registry / Service。只能通过 FeatureContext。
> **版本**: v1.0, Framework Freeze — Core 不可修改。

---

## 1. Architecture

```
Application
    ↓
Core Framework  ← 已冻结。仅允许 Bug 修复。
    ↓
Feature SDK     ← 本层。所有 Feature 的唯一依赖。
    ↓
Plugin SDK      ← (未来) 第三方插件扩展点
    ↓
Built-in Plugins ← AES, JSON, JWT, Base64...
    ↓
Third-party Plugins ← (未来) 社区插件
```

### 依赖规则

```
✅ Feature → FeatureSDK        ← 允许
✅ FeatureSDK → Core           ← SDK 封装 Core
❌ Feature → Core              ← 禁止！必须通过 SDK
❌ Feature → Registry           ← 禁止！通过 Context
❌ Feature → Service            ← 禁止！通过 Context
❌ Feature → Feature            ← 禁止！零交叉依赖
```

---

## 2. Core Concepts

### 2.1 BaseFeature

每个工具继承 `BaseFeature`，获得统一生命周期：

```
            new BaseFeature(config)
                    │
                    ▼
              initialize()
                    │
                    ▼
              activate()    ← 用户首次打开工具
                    │
                    ▼
         ┌──────────────────┐
         │   run() loop      │  ← 用户交互
         │   validate()      │
         │   transform()     │
         │   preview()       │
         └──────────────────┘
                    │
                    ▼
              deactivate()  ← 用户离开工具
                    │
                    ▼
              dispose()     ← 插件卸载
```

### 2.2 FeatureContext

Feature 唯一的能力入口。通过 `this.context` 访问：

```typescript
interface FeatureContext {
  readonly clipboard: FeatureClipboard
  readonly storage: FeatureStorage
  readonly logger: FeatureLogger
  readonly notification: FeatureNotification
  readonly theme: FeatureTheme
  readonly history: FeatureHistory
  readonly settings: FeatureSettings
  readonly plugin: PluginMetadata
}
```

### 2.3 Feature State Machine

```
idle → loading → success
              → error
              → empty
```

```typescript
type FeaturePhase = 'idle' | 'loading' | 'success' | 'error' | 'empty'

interface FeatureState<T = string> {
  phase: FeaturePhase
  input: T
  output: T | null
  error: string | null
  progress: number | null   // 0-100 for long operations
}
```

---

## 3. API Reference

### 3.1 BaseFeature

```typescript
abstract class BaseFeature<TConfig extends Record<string, unknown>, TInput = string, TOutput = string> {
  // ── Lifecycle ──
  abstract initialize(): Promise<void>
  abstract activate(): Promise<void>
  abstract deactivate(): Promise<void>
  abstract dispose(): Promise<void>

  // ── Persistence ──
  abstract saveState(): FeatureState<TOutput>
  abstract loadState(state: FeatureState<TOutput>): void
  abstract reset(): void

  // ── Core Actions ──
  abstract run(input: TInput, config: TConfig): Promise<TOutput>
  abstract validate(input: TInput): ValidationResult
  abstract transform(input: TInput, config: TConfig): TInput
  abstract preview(input: TInput, config: TConfig): TOutput | null
  abstract cancel(): void

  // ── Context ──
  protected readonly context: FeatureContext

  // ── State ──
  protected state: FeatureState<TOutput>
  readonly config: TConfig
  readonly metadata: PluginMetadata
}
```

### 3.2 FeatureContext

```typescript
interface FeatureContext {
  readonly id: string
  readonly clipboard: FeatureClipboard
  readonly storage: FeatureStorage
  readonly logger: FeatureLogger
  readonly notification: FeatureNotification
  readonly theme: FeatureTheme
  readonly history: FeatureHistory
  readonly settings: FeatureSettings<TConfig>
  readonly plugin: PluginMetadata
  readonly eventBus: FeatureEventBus
}
```

### 3.3 FeatureClipboard

```typescript
interface FeatureClipboard {
  copy(text: string): Promise<void>
  paste(): Promise<string>
  copyInput(): Promise<void>
  copyOutput(): Promise<void>
  pasteInput(): Promise<void>
}
```

### 3.4 FeatureHistory

```typescript
interface FeatureHistory<T = Record<string, unknown>> {
  add(entry: T): HistoryEntry<T>
  remove(id: string): void
  clear(): void
  restore(id: string): T | undefined
  getAll(): HistoryEntry<T>[]
  search(query: string): HistoryEntry<T>[]
  readonly capacity: number
  readonly count: number
}

interface HistoryEntry<T> {
  id: string
  timestamp: number
  data: T
}
```

### 3.5 FeatureSettings

```typescript
interface FeatureSettings<T extends Record<string, unknown>> {
  load(): Promise<T>
  save(config: Partial<T>): Promise<void>
  reset(): Promise<void>
  get<K extends keyof T>(key: K): Promise<T[K]>
  set<K extends keyof T>(key: K, value: T[K]): Promise<void>
  readonly schema: SettingField[]
  readonly defaults: T
}
```

### 3.6 FeatureResult

```typescript
type FeatureResult<T> =
  | { kind: 'success'; data: T }
  | { kind: 'error'; message: string; code?: string }
  | { kind: 'empty'; message?: string }
  | { kind: 'loading'; progress?: number }

type ValidationResult =
  | { valid: true }
  | { valid: false; errors: ValidationError[] }

interface ValidationError {
  field: string
  message: string
  code?: string
}
```

### 3.7 FeatureToolbar

```typescript
interface FeatureToolbarActions {
  copy: boolean
  paste: boolean
  clear: boolean
  swap: boolean
  favorite: boolean
  history: boolean
  settings: boolean
  refresh: boolean
  export: boolean
  import: boolean
}
```

### 3.8 FeatureInput / FeatureOutput

```typescript
interface FeatureInputModel<T = string> {
  value: T
  encoding?: string
  format?: string
  metadata?: Record<string, unknown>
  validate(): ValidationResult
  isEmpty(): boolean
}

interface FeatureOutputModel<T = string> {
  value: T | null
  encoding?: string
  format?: string
  metadata?: Record<string, unknown>
  readonly isEmpty: boolean
  readonly isSuccess: boolean
}
```

---

## 4. Usage Pattern

### 4.1 Creating a New Feature

```typescript
// src/features/my-tool/MyToolFeature.ts
import { BaseFeature } from '@/sdk/feature'
import type { FeatureConfig } from '@/sdk/feature'

interface MyToolConfig extends FeatureConfig {
  algorithm: 'sha256' | 'md5'
}

export class MyToolFeature extends BaseFeature<MyToolConfig> {
  // Must implement these 9 methods:

  async initialize(): Promise<void> {
    await this.context.settings.load()
  }

  async activate(): Promise<void> {
    this.context.history.clear() // fresh session
  }

  async deactivate(): Promise<void> {
    this.saveState()
  }

  async dispose(): Promise<void> {
    this.reset()
  }

  // Core logic — the ONLY method that does real work
  async run(input: string, config: MyToolConfig): Promise<string> {
    // Pure transformation
    return hash(input, config.algorithm)
  }

  // Input validation
  validate(input: string): ValidationResult {
    if (!input.trim()) {
      return { valid: false, errors: [{ field: 'input', message: 'Input is empty' }] }
    }
    return { valid: true }
  }

  transform(input: string, config: MyToolConfig): string {
    return input.trim()
  }

  preview(input: string, config: MyToolConfig): string | null {
    if (input.length > 100) return input.slice(0, 100) + '...'
    return null
  }

  cancel(): void {
    // Abort any async work
  }

  saveState(): FeatureState<string> { ... }
  loadState(state: FeatureState<string>): void { ... }
  reset(): void { ... }
}
```

### 4.2 Vue Composable — Minimal

```typescript
// src/features/my-tool/composables.ts
import { ref } from 'vue'
import { MyToolFeature } from './MyToolFeature'

export function useMyTool(context: FeatureContext) {
  const feature = new MyToolFeature(context)
  const output = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)

  async function execute(input: string) {
    const validation = feature.validate(input)
    if (!validation.valid) {
      error.value = validation.errors[0].message
      return
    }
    loading.value = true
    try {
      output.value = await feature.run(input, feature.config)
      await feature.context.history.add({ input, output: output.value })
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  return { output, error, loading, execute }
}
```

---

## 5. Hello Plugin — SDK Migration

Hello Plugin 升级为继承 BaseFeature：

```typescript
// src/features/hello/HelloFeature.ts
export class HelloFeature extends BaseFeature<HelloConfig> {
  async initialize() { ... }
  async run(input: string, config: HelloConfig): Promise<string> {
    // Pure logic from logic.ts
    return getGreeting(input)
  }
  validate(input: string): ValidationResult { ... }
  // ... all 9 methods
}
```

---

## 6. AI Rules

### 新增 Feature 规则

```
1. 继承 BaseFeature<TConfig, TInput, TOutput>
2. 实现全部 9 个抽象方法（不可省略）
3. run() 必须是纯函数（无副作用，可单独测试）
4. validate() 必须返回 ValidationResult
5. 通过 this.context 获取所有能力，禁止 import Core
6. Feature 之间禁止互相引用
7. 禁止 new Service() — 只能通过 this.context
```

### Code Review Checklist

```
[ ] 继承 BaseFeature?
[ ] 实现全部 9 个 abstract 方法?
[ ] run() 是纯函数?
[ ] validate() 返回 ValidationResult?
[ ] 通过 this.context 访问能力（非直接 import Core）?
[ ] 无跨 Feature import?
[ ] 有 >= 5 个单元测试覆盖 run() / validate()?
```

---

> **版本**: v1.0  
> **维护**: 本文件是 Feature SDK 的单一事实来源。所有新增 Feature 必须遵守本规范。
