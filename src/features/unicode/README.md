# Unicode Plugin

> Unicode Encode / Decode — encode text to Unicode escape sequences and decode them back.

## Usage

1. Enter text in the Input area
2. Select Mode: **Encode** or **Decode**
3. Select Variant: **JavaScript** (`\uXXXX`) or **Code Point** (`U+XXXX`)
4. Click **Run Encode** / **Run Decode** or press `⌘Enter`

## Structure

```
features/unicode/
├── UnicodeFeature.ts    ← Feature class (extends BaseFeature)
├── logic.ts              ← Pure business logic
├── composables.ts        ← Vue composable
├── types.ts              ← Type definitions
├── settings.ts           ← Settings schema
├── toolbar.ts            ← Toolbar configuration
├── history.ts            ← History configuration
├── UnicodeView.vue       ← Main view
├── index.ts              ← Public API
└── __tests__/
    ├── logic.test.ts     ← Unit tests
    └── composables.test.ts ← Composable & wiring tests

plugins/unicode.plugin.ts ← Plugin manifest
```

## Variants

### JavaScript (`\uXXXX`)

- **Encode**: Converts non-ASCII characters to `\uXXXX` (BMP) or surrogate pairs `\uDXXX\uDXXX` (supplementary planes). ASCII printable characters pass through unchanged.
- **Decode**: Converts `\uXXXX` sequences back to characters. Supports case-insensitive hex and validates surrogate pairs.

### Code Point (`U+XXXX`)

- **Encode**: Converts all characters to `U+XXXX` (BMP) or `U+XXXXXX` (supplementary planes) notation, space-separated.
- **Decode**: Converts `U+XXXX` / `U+XXXXXX` sequences back to characters. Validates code points are within Unicode range (0x0 - 0x10FFFF).
