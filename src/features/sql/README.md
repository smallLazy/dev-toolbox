# SQL IN Builder

> Build SQL IN lists from batch values — one value per line.

## Usage

1. Paste batch values (one per line) in the input area
2. Configure Value Type (String / Number), Output Layout, and options
3. Click **Convert** or press **⌘Enter** to build the SQL IN list

## Configuration

| Option | Description |
|--------|-------------|
| Value Type | String: wraps values in single quotes, escapes `'` → `''`. Number: validates numeric values, no quotes. |
| Output Layout | Single Line: comma-separated on one line. Multi Line: one value per line with indentation. |
| Wrap with parentheses | Surrounds the output with `(...)`. |
| Remove duplicates | Eliminates duplicate values, preserving first-occurrence order. |

## Output Examples

**String + Single Line + Wrap:** `('1001', '1002', '1003')`

**Number + Multi Line + Wrap:**
```
(
  1001,
  1002,
  1003
)
```

## Structure

```
features/sql/
├── SqlFeature.ts      ← Feature class (extends BaseFeature)
├── logic.ts           ← Pure business logic
├── composables.ts     ← Vue composable
├── types.ts           ← Type definitions
├── settings.ts        ← Settings schema
├── toolbar.ts         ← Toolbar configuration
├── history.ts         ← History configuration
├── SqlView.vue        ← Main view
├── index.ts           ← Public API
└── __tests__/
    ├── logic.test.ts       ← Pure logic unit tests
    └── composables.test.ts ← State + wiring tests

plugins/sql.plugin.ts ← Plugin manifest
```
