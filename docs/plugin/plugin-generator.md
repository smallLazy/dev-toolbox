# Plugin Generator v1.0 — Developer Workspace

> **定位**: Platform 官方唯一推荐的插件创建方式。禁止手写插件目录。
> **命令**: `dw create-plugin <name> [--template=<type>]`
> **原则**: 100% 自动合规。零手工配置。

---

## 1. Quick Start

```bash
# 创建一个 Transform 工具 (默认模板)
dw create-plugin aes

# 创建一个 Editor 工具
dw create-plugin json --template=editor

# 创建一个 Enterprise 工具
dw create-plugin sentry --template=enterprise
```

生成后立即可以 `npm run tauri dev` 运行。

---

## 2. Template Types

| Template | 用途 | 示例 |
|----------|------|------|
| `transform` | 输入→转换→输出 | AES, Base64, Hash, Cloud Encrypt, URL Encode |
| `editor` | 编辑器 + 格式化 | JSON, SQL, YAML, Markdown |
| `converter` | 两种格式互转 | Timestamp, Color, Unit Converter |
| `inspector` | 解析+结构化展示 | JWT, Regex, X.509 Certificate |
| `viewer` | 文件预览+元数据 | Image, PDF, Font Viewer |
| `ai` | AI 对话+流式输出 | Chat, Completion, Embedding |
| `network` | HTTP 请求+响应 | cURL, GraphQL, WebSocket |
| `enterprise` | 外部服务集成 | Sentry, Gitee, Zentao, Jira |

---

## 3. Generated Structure

```
features/<name>/
├── <Name>Feature.ts      ← extends BaseFeature (12 methods, auto-implemented)
├── logic.ts              ← pure functions (format, convert, validate...)
├── composables.ts        ← Vue composable (bridge Feature→View)
├── types.ts              ← types (Config, State, Result...)
├── settings.ts           ← settings schema + defaults
├── toolbar.ts            ← toolbar configuration
├── history.ts            ← history configuration
├── <Name>View.vue        ← main view (Card+Section, Design System only)
├── index.ts              ← public API
├── __tests__/
│   └── logic.test.ts     ← unit test skeleton (5+ tests)
├── README.md             ← plugin documentation
└── CHANGELOG.md           ← version changelog

plugins/<name>.plugin.ts  ← definePlugin() manifest (auto-filled)
```

---

## 4. Template-Specific Content

### Transform
- Config card: mode switch + algorithm select + encoding selects
- Input card + Output card
- Action: single primary button
- Composable: useTransform()

### Editor
- Monaco Editor placeholder
- Mode toggle: format / minify / validate
- Stats display (lines, size)
- Toolbar: copy, paste, clear, swap, export
- Composable: useEditor()

### Converter
- Dual input: source + target mode
- Convert button (bidirectional)
- Output area with copy
- Composable: useConverter()

### Inspector
- Single input (textarea)
- Parse button
- Sectioned output (Header/Body/Signature style)
- Read-only display
- Composable: useInspector()

### Viewer
- File picker / drag-drop zone
- Preview area
- Metadata panel
- Composable: useViewer()

### AI
- Prompt input (textarea)
- Model selector
- Streaming output area
- History sidebar
- Composable: useAI()

### Network
- URL + method + headers + body inputs
- Response status + headers + body viewer
- Request history
- Composable: useNetwork()

### Enterprise
- Service configuration card
- API key input (secure)
- Dashboard-like view
- Connection status indicator
- Composable: useEnterprise()

---

## 5. Automatic Registrations

Generator auto-fills:

| Field | Generation |
|-------|-----------|
| `id` | kebab-case of `<name>` |
| `name` | Title Case of `<name>` |
| `icon` | Mapped from template type |
| `route` | `/<name>` |
| `category` | Mapped from template type |
| `commands` | 2-3 commands based on template |
| `shortcuts` | 1-2 shortcuts based on template |
| `keywords` | 5-10 auto-generated keywords |
| `permissions` | Based on template needs |
| `settings` | 2-4 settings based on template |
| `history` | enabled: true, maxItems: 20 |

---

## 6. Icon Mapping

| Template | Icon |
|----------|------|
| `transform` | 🔐 |
| `editor` | 📝 |
| `converter` | 🔄 |
| `inspector` | 🔍 |
| `viewer` | 👁 |
| `ai` | 🤖 |
| `network` | 🌐 |
| `enterprise` | 🏢 |

---

## 7. Category Mapping

| Template | Category |
|----------|----------|
| `transform` | `crypto` |
| `editor` | `formatter` |
| `converter` | `converter` |
| `inspector` | `analyzer` |
| `viewer` | `utility` |
| `ai` | `ai` |
| `network` | `network` |
| `enterprise` | `utility` |

---

## 8. Validation

Post-generation validation checks:

```yaml
checks:
  - Feature extends BaseFeature?          ✅ auto
  - Plugin uses definePlugin()?           ✅ auto
  - Zero Core imports?                     ✅ auto
  - Zero Registry imports?                 ✅ auto
  - Zero Service imports?                  ✅ auto
  - All colors from Design Tokens?         ✅ auto
  - Card+Section layout?                   ✅ auto
  - logic.ts has 5+ unit tests?           ⚠️ manual
  - All abstract methods implemented?      ✅ auto
```

---

## 9. Reference Plugin Mapping

| Template | Reference Plugin |
|----------|-----------------|
| `transform` | `features/aes/` (existing AES plugin) |
| `editor` | `features/json/` (reference implementation) |
| `converter` | `modules/timestamp/` (conversion pattern) |
| `inspector` | `modules/jwt/` (parse+display pattern) |
| `viewer` | (new template) |
| `ai` | (new template) |
| `network` | (new template) |
| `enterprise` | (new template) |

---

> **版本**: v1.0  
> **维护**: 新增插件必须通过 Generator 创建。禁止手写目录。
