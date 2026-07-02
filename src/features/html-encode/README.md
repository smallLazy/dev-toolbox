# HTML Encode Plugin

> Encode and decode HTML entities.

## Usage

1. Open the HTML Encode tool from the sidebar
2. Enter HTML or text in the Input field
3. Select **Encode** or **Decode** mode
4. Click **Run Encode** / **Run Decode** or press **Cmd+Enter**
5. Use **Copy Output** / **Clear** / **Swap I/O** as needed

## Supported Entities

**Encode:**
| Character | Entity |
|-----------|--------|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&#39;` |

**Decode:**
| Entity | Character |
|--------|-----------|
| `&amp;` | `&` |
| `&lt;` | `<` |
| `&gt;` | `>` |
| `&quot;` | `"` |
| `&#39;` | `'` |
| `&#x27;` | `'` |
| `&#x2F;` | `/` |
| `&#47;` | `/` |

## Structure

```
features/html-encode/
├── HtmlEncodeFeature.ts    ← Feature class (extends BaseFeature)
├── logic.ts                ← Pure business logic
├── composables.ts          ← Vue composable
├── types.ts                ← Type definitions
├── settings.ts             ← Settings schema
├── toolbar.ts              ← Toolbar configuration
├── history.ts              ← History configuration
├── HtmlEncodeView.vue      ← Main view
├── index.ts                ← Public API
└── __tests__/
    ├── logic.test.ts       ← Pure logic tests
    └── composables.test.ts ← State + wiring tests
```
