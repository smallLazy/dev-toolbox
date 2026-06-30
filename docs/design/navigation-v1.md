# Navigation Architecture v1.0

> **设计目标**: 支持 300+ Plugin，用户 3 秒内找到任意工具。
> **参考**: Raycast (搜索优先), DevToys (分类折叠), JetBrains (快捷键导航)

---

## 1. Sidebar Hierarchy

```
┌──────────────────────┐
│ 🖥 Dev Toolbox        │
│──────────────────────│
│ 🔍 Search...    ⌘K  │
│──────────────────────│
│                      │
│ WORKSPACE            │
│  ⌂ Home              │
│  ★ Favorites    (3)  │  ← pin-top, max 8
│  ↻ Recent       (5)  │  ← auto, last 10
│                      │
│──────────────────────│
│                      │
│ ▼ Encoding      (8)  │  ← collapsible
│    Base64            │
│    URL               │
│    HTML              │
│    Unicode           │
│    ...               │
│                      │
│ ▶ Crypto       (12)  │  ← collapsed
│                      │
│ ▼ Formatter    (10)  │
│    JSON              │
│    YAML              │
│    SQL               │
│    Markdown          │
│    ...               │
│                      │
│ ▶ Converter     (6)  │
│ ▶ Network       (9)  │
│ ▶ Enterprise   (15)  │
│ ▶ AI            (4)  │
│                      │
│──────────────────────│
│ APPLICATION          │
│  ⚙ Settings          │
│──────────────────────│
│ v1.0.0               │
└──────────────────────┘
```

### States

| State | Category Header | Items |
|-------|----------------|-------|
| **Expanded** | ▼ Icon, label, count badge | Visible |
| **Collapsed** | ▶ Icon, label, count badge | Hidden |
| **Hover** | bg rgba(255,255,255,0.04) | — |
| **Empty** | Hidden entirely | — |

### Behavior

- **Default**: All categories expanded, Favorites expanded, Recent expanded
- **Memory**: Collapse state persisted per session
- **Search**: When searching, collapse all categories, show only matching items (flat list)
- **Count badge**: Auto-updated when plugins registered

---

## 2. Category System

### Categories

| ID | Label | Icon | Example Plugins |
|----|-------|------|----------------|
| `encoding` | Encoding | 🔤 | Base64, URL, HTML, Unicode, JWT |
| `crypto` | Crypto | 🔒 | AES, RSA, SM2, SM3, SM4 |
| `formatter` | Formatter | {} | JSON, YAML, XML, SQL, Markdown |
| `converter` | Converter | ⇄ | Timestamp, Color, UUID, Unit |
| `network` | Network | 🌐 | cURL, HTTP Client, GraphQL, WebSocket |
| `enterprise` | Enterprise | 🏢 | Sentry, Gitee, GitHub, Jira, 禅道, 企业微信 |
| `ai` | AI | 🤖 | Prompt, Translate, Review, Explain, Agent |
| `analyzer` | Analyzer | 🔍 | JWT Parser, Regex, Request Decoder |
| `utility` | Utility | 🛠 | Diff, QRCode, Hello, SQL IN |

### Plugin Manifest Extension

```typescript
definePlugin({
  category: 'formatter',       // required
  subcategory: 'data',          // optional
  tags: ['json', 'format'],     // auto-search
  keywords: ['pretty', 'beautify'],  // search boost
  priority: 1,                  // 0-10, higher = listed first
  experimental: false,          // hidden by default
})
```

### Auto-Grouping

Plugins without `category` → go to `utility`.
Unknown `category` → flagged by validation.

---

## 3. Dashboard Layout

```
┌──────────────────────────────────────┐
│                                      │
│  👋 Welcome back                     │
│  ⏰ Tuesday, July 30                  │
│                                      │
│  ┌──────────────────────────────────┐│
│  │ ★ Favorites               [Edit]││
│  │ ┌──────┐ ┌──────┐ ┌──────┐     ││
│  │ │ JSON │ │ AES  │ │ JWT  │     ││
│  │ └──────┘ └──────┘ └──────┘     ││
│  └──────────────────────────────────┘│
│                                      │
│  ┌──────────────────────────────────┐│
│  │ ↻ Recent                        ││
│  │ ┌──────┐ ┌──────┐ ┌──────┐     ││
│  │ │Base64│ │ URL  │ │ Hash │     ││
│  │ └──────┘ └──────┘ └──────┘     ││
│  └──────────────────────────────────┘│
│                                      │
│  ┌──────────────────────────────────┐│
│  │ Categories                       ││
│  │                                  ││
│  │ ▼ Encoding (8)                   ││
│  │   [Base64] [URL] [HTML] ...      ││
│  │                                  ││
│  │ ▼ Crypto (12)                    ││
│  │   [AES] [RSA] [SM2] [SM3] ...    ││
│  │   ...                            ││
│  └──────────────────────────────────┘│
└──────────────────────────────────────┘
```

---

## 4. Favorites System

```
Max: 8 items
Storage: localStorage key 'dw:favorites'
API:
  add(pluginId)
  remove(pluginId)
  toggle(pluginId) → boolean
  getAll() → string[]
  reorder(fromIndex, toIndex)
```

---

## 5. Search Architecture

### Indexed Fields

```
plugin.name         ← highest weight
plugin.category     ← category match
plugin.tags[]       ← tag exact match
plugin.keywords[]   ← fuzzy match
plugin.description  ← lower weight
plugin.id           ← exact match
```

### Search Flow

```
User types "encrypt"
  → matches: AES (name contains), RSA (tags: encrypt),
    Cloud Encrypt (name), SM2 (keywords: encrypt)
  → sort by relevance:
    1. Name exact match (AES → score 100)
    2. Name contains (Cloud Encrypt → score 60)
    3. Tag match (RSA → score 40)
    4. Keyword match (SM2 → score 20)
```

---

## 6. Keyboard Navigation

| Key | Action |
|-----|--------|
| `⌘K` | Open Search / Command Palette |
| `⌘1-9` | Jump to 1st-9th favorite |
| `↑↓` | Navigate search results |
| `Enter` | Open selected tool |
| `Esc` | Close search / clear filter |

---

> **版本**: v1.0
