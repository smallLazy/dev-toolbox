# Diff Tool

Compare two texts line by line with unified diff output.

## Features

- LCS-based line-by-line diff algorithm
- Unified diff format output (standard `@@ -l,s +r,s @@` headers)
- Configurable context lines (3, 5, 10, or show all)
- Ignore whitespace option (treat whitespace-only differences as equal)
- Ignore case option (case-insensitive comparison)
- Keyboard shortcut: `Cmd/Ctrl + Enter`
- Copy output to clipboard
- Activity history support

## Usage

1. Enter the original text in the **Left Text** panel
2. Enter the modified text in the **Right Text** panel
3. Click **Compare** or press `Cmd/Ctrl + Enter`
4. View the unified diff in the **Diff Output** panel
5. Use **Context Lines** to control how much surrounding context is shown
6. Toggle **Ignore Whitespace** or **Ignore Case** for lenient comparison

## Structure

```
features/diff/
├── DiffFeature.ts        ← Feature class (extends BaseFeature)
├── DiffView.vue           ← Main view (ToolLayout + shared templates)
├── composables.ts         ← Vue composable (two-input state)
├── logic.ts               ← Pure business logic (LCS diff algorithm)
├── types.ts               ← Type definitions
├── settings.ts            ← Settings schema
├── toolbar.ts             ← Toolbar configuration
├── history.ts             ← History configuration
├── index.ts               ← Public API
└── __tests__/
    └── logic.test.ts      ← Unit tests (56 tests)

plugins/diff.plugin.ts     ← Plugin manifest
```
