---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---

# Dev Toolbox — 文档索引 (SSOT)

> **本文档是 Dev Toolbox 项目文档的单一可信源 (Single Source of Truth)。**
> 所有 AI Agent 和开发者应优先阅读本文档以了解文档结构和状态。
>
> 最后更新: 2026-07-08 | 文档总数: 60

---

## 文档状态说明

| 状态 | 含义 | 是否作为实现依据 |
|------|------|------------------|
| **active** | 当前有效，持续维护 | ✅ 是 |
| **deprecated** | 已被新文档替代，仅保留供参考 | ❌ 否 — 必须查看 `replaced_by` 指向的新文档 |
| **archive** | 历史迁移方案/设计，已完成使命 | ❌ 否 — 仅供参考，不得作为当前实现依据 |
| **snapshot** | 特定时间点的快照记录（发布说明、测试记录） | ❌ 否 — 历史记录，不反映当前状态 |

---

## 一、AI 开发指南 (`docs/ai/`) — 10 篇 · status: active

面向 AI Agent（Claude Code / Cursor / Copilot 等）的开发规则、决策记录和工作流。

| 文档 | 内容 | 行数 |
|------|------|------|
| **AI_OVERVIEW.md** | 项目入门简介：架构摘要、可以做什么/禁止做什么、阅读路径 | 102 |
| **AI_ARCHITECTURE.md** | 插件架构详解：8 层单向依赖、Core/SDK/Feature/Plugin 层职责 | 189 |
| **AI_PLUGIN_GUIDE.md** | 插件开发分步指南：Generator 创建 → logic.ts → tests → UI 集成 | 269 |
| **AI_UI_GUIDE.md** | UI 开发指南：Design Token 使用、标准布局、禁止事项 | 246 |
| **AI_CODE_REVIEW.md** | AI 代码审查清单：检查项、常见违规、审核流程 | 149 |
| **AI_RELEASE.md** | 发布检查清单：版本号、CHANGELOG、构建验证 | 134 |
| **AI_DECISIONS.md** | 架构决策记录：为什么要冻结 Core、为什么选择 Plugin 模式 | 199 |
| **AI_PROMPT_CONVENTION.md** | Prompt 格式规范：AI Agent 的 prompt 编写标准和模板 | 284 |
| **AI_CONTEXT_GRAPH.md** | 阅读顺序图：文档之间的依赖关系，推荐阅读路径 | 164 |
| **AI_DEVELOPMENT_RULES.md** | AI 开发规则 v1.0：编译前/后检查项、禁止修改的目录 | 100 |

---

## 二、架构 (`docs/architecture/`) — 1 篇 · status: active

| 文档 | 内容 | 行数 |
|------|------|------|
| **workspace-architecture-v1.md** | **SSOT 架构规范**：完整的 8 层架构定义、依赖方向、组件树、路由设计 | 827 |

---

## 三、设计 (`docs/design/`) — 10 篇 active + 1 篇 deprecated

### Active

| 文档 | 内容 | 行数 |
|------|------|------|
| **design-system-v2.md** | **Design System v2.0 SSOT**：Design Token 定义、组件规范、布局模式、Tool Layout Requirements (§8.5) | 1038 |
| **ui-guidelines-v1.md** | 页面布局规范：Sidebar、ToolLayout、Card、Section 结构 | 149 |
| **ui-copy-guidelines.md** | UI 文案规范：英文默认、Title Case、标准术语拼写 | 415 |
| **icon-guidelines-v1.md** | 图标系统规范：禁止 emoji、必须从 @/design/icons 导入 | 118 |
| **icon-generation-v1.md** | 应用图标生成方案（macOS / Windows / Linux） | 66 |
| **interaction-guidelines-v1.md** | 交互动效规范：transition、状态切换、动画细节 | 111 |
| **ui-polish-v1.md** | UI 打磨清单：对齐、间距、响应式、暗色模式等细节修复项 | 336 |
| **navigation-v1.md** | 导航架构：路由结构、Sidebar 分类、面包屑、Command Palette | 199 |
| **command-palette-v1.md** | Command Palette (⌘K) 产品设计规格 | 229 |
| **dashboard-v2.md** | Dashboard v2.0 首页设计：工具卡片、分类展示、搜索 | 213 |

### Deprecated

| 文档 | 状态 | 替代 |
|------|------|------|
| **design-system.md** | ⚠️ deprecated | → `docs/design/design-system-v2.md` (Design System v2.0) |

> **注意**: `design-system.md` 是 v1 设计规范，已被 v2 完全替代。v1 仅保留供历史参考，**不得作为当前实现依据**。

---

## 四、开发规范 (`docs/development/`) — 1 篇 · status: active

| 文档 | 内容 | 行数 |
|------|------|------|
| **tool-development-guidelines.md** | **工具开发完整流程**：5 步工作流、Tool Layout 要求、Definition of Done、Completion Report 模板 | 919 |

---

## 五、平台 (`docs/platform/`) — 1 篇 · status: active

| 文档 | 内容 | 行数 |
|------|------|------|
| **platform-freeze-v1.md** | **平台冻结声明**：Core / SDK / Registry / Architecture / Design System 的冻结范围 | 53 |

---

## 六、SDK (`docs/sdk/`) — 2 篇 · status: active

| 文档 | 内容 | 行数 |
|------|------|------|
| **feature-sdk-v1.md** | Feature SDK API：BaseFeature 类、FeatureContext 能力、生命周期 | 415 |
| **plugin-sdk-v1.md** | Plugin SDK API：definePlugin() 函数、PluginManifest 类型 | 236 |

---

## 七、插件开发 (`docs/plugin/`) — 1 篇 · status: active

| 文档 | 内容 | 行数 |
|------|------|------|
| **plugin-generator.md** | Plugin Generator 使用指南：`npm run create-plugin`、模板类型、生成目录结构 | 205 |

---

## 八、插件规格 (`docs/plugin-specs/`) — 15 篇 · status: active

| 文档 | 内容 | 行数 |
|------|------|------|
| **plugin-spec-template.md** | 插件规格模板 | 227 |
| **base64-spec.md** | Base64 插件完整规格 | 615 |
| **timestamp-spec.md** | Timestamp 插件规格 | 133 |
| **uuid-spec.md** | UUID 插件规格 | 94 |
| **crypto-spec.md** | AES 加密插件规格 | — |
| **diff-spec.md** | Diff 文本对比插件规格 | — |
| **hash-spec.md** | Hash 哈希插件规格 | — |
| **html-encode-spec.md** | HTML 编解码插件规格 | — |
| **json-spec.md** | JSON Formatter 插件规格 | — |
| **jwt-spec.md** | JWT 解析插件规格 | — |
| **qrcode-spec.md** | QR Code 生成插件规格 | — |
| **sql-spec.md** | SQL 插件规格 | — |
| **unicode-spec.md** | Unicode 编解码插件规格 | — |
| **url-spec.md** | URL 编解码插件规格 | — |
| **xml-spec.md** | XML Formatter 插件规格 | — |

---

## 九、产品管理 (`docs/product/`) — 10 篇 · status: active

| 文档 | 内容 | 行数 |
|------|------|------|
| **plugin-definition-of-done-v1.md** | **Plugin DoD 清单**：插件合并前必须通过的检查项 | 68 |
| **plugin-development-workflow-v1.md** | 插件开发工作流：从 idea 到 release 的完整流程 | 97 |
| **official-plugin-lifecycle-v1.md** | 官方插件生命周期：Planned → In Development → Beta → Stable → Deprecated | 83 |
| **official-plugin-quality-v1.md** | 官方插件质量标准：代码、测试、UI、文档四维度 | 56 |
| **official-plugin-roadmap-v1.md** | 官方插件路线图：按分类规划的各工具开发优先级 | 100 |
| **plugin-priority-matrix-v1.md** | 插件优先级矩阵：按用户价值 vs 开发成本评估 | 68 |
| **product-metrics-v1.md** | 产品指标定义：激活率、留存率、使用时长等 | 42 |
| **beta-checklist-v1.md** | Beta 版本发布前检查清单 | 86 |
| **release-roadmap-v1.md** | 版本发布路线图：v0.x → v1.0 的里程碑规划 | 58 |
| **release-notes-template.md** | Release Notes 模板 | 96 |

---

## 十、发布工程 (`docs/release/`) — 2 篇 · status: active

| 文档 | 内容 | 行数 |
|------|------|------|
| **release-engineering-v1.md** | 发布工程规范：CI/CD 流程、构建签名、渠道分发 | 177 |
| **desktop-distribution-v1.md** | 桌面分发方案：Tauri 打包、macOS/Windows/Linux 分发策略、自动更新 | 315 |

---

## 十一、历史发布 (`docs/releases/`) — 2 篇 · status: snapshot

> ⚠️ 以下文档为特定时间点的发布快照，**不反映当前状态**，不随项目演进更新。

| 文档 | 内容 | 行数 |
|------|------|------|
| **v0.1.0-beta.1.md** | v0.1.0-beta.1 发布说明（2026-06-29） | 197 |
| **v0.1.0-beta.1-gui-test.md** | v0.1.0-beta.1 手动 GUI 测试记录（2026-06-29） | 276 |

---

## 十二、QA 清单 (`docs/checklists/`) — 1 篇 · status: snapshot

| 文档 | 内容 | 行数 |
|------|------|------|
| **v0.1.0-beta.1-manual-checklist.md** | v0.1.0-beta.1 人工验收清单（2026-06-29） | 136 |

---

## 十三、归档 (`docs/archive/`) — 2 篇 · status: archive · 仅供参考 historical reference

> ⚠️ 以下文档为历史迁移方案/审查记录，**已完成使命，仅供参考**。不得作为当前实现依据。

| 文档 | 内容 | 行数 |
|------|------|------|
| **cloud-encrypt/cloud-encrypt-migration.md** | Cloud Encrypt → Pipeline/Preset 长期迁移设计方案（2026-07-01） | 1173 |
| **cloud-encrypt/cloud-encrypt-migration-review.md** | 上述迁移方案的实施前审查报告（2026-07-01） | 640 |

---

## 总结

| 分类 | 文档数 | 状态 | 面向对象 |
|------|--------|------|----------|
| AI 开发指南 | 10 | active | AI Agent |
| 架构 | 1 | active | 所有人（SSOT） |
| 设计 | 11 (10 active + 1 deprecated) | mixed | 开发者 + AI |
| 开发规范 | 1 | active | 开发者 + AI |
| 平台 | 1 | active | 所有人 |
| SDK | 2 | active | 开发者 + AI |
| 插件开发 | 1 | active | 开发者 + AI |
| 插件规格 | 15 | active | 开发者 |
| 产品管理 | 10 | active | PM + 开发者 |
| 发布工程 | 2 | active | DevOps |
| 历史发布 | 2 | snapshot | — |
| QA 清单 | 1 | snapshot | — |
| 归档 | 2 | archive | — |
| **总计** | **60** | — | — |

---

## AI Agent 必读（按优先级）

### 第一优先 — 项目规则与边界

1. `docs/DOCS_INDEX.md` (本文档) — 了解文档结构和状态
2. `docs/ai/AI_OVERVIEW.md` — 项目入门简介
3. `docs/platform/platform-freeze-v1.md` — 冻结范围
4. `docs/ai/AI_DEVELOPMENT_RULES.md` — AI 开发规则总结

### 第二优先 — 架构与设计

5. `docs/architecture/workspace-architecture-v1.md` — 完整架构 SSOT
6. `docs/ai/AI_ARCHITECTURE.md` — 架构 AI 导读
7. `docs/design/design-system-v2.md` — Design System SSOT
8. `docs/design/ui-copy-guidelines.md` — UI 文案规范

### 第三优先 — 开发流程

9. `docs/ai/AI_PLUGIN_GUIDE.md` — 插件开发指南
10. `docs/ai/AI_UI_GUIDE.md` — UI 开发指南
11. `docs/development/tool-development-guidelines.md` — 工具开发完整流程
12. `docs/sdk/feature-sdk-v1.md` + `docs/sdk/plugin-sdk-v1.md` — SDK API
13. `docs/product/plugin-definition-of-done-v1.md` — DoD 清单

### 参考 — 查阅但不作为实现依据

- `docs/ai/AI_DECISIONS.md` — 理解决策背景
- `docs/ai/AI_CONTEXT_GRAPH.md` — 文档依赖关系图
- `docs/archive/**` — 历史方案，仅供参考
- `docs/releases/**` — 历史发布记录
- `docs/design/design-system.md` — ⚠️ deprecated, 查看 v2
