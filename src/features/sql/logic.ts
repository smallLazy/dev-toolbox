/**
 * SQL Plugin — Pure Logic
 *
 * SQL IN Builder: batch values → SQL IN list.
 */

import type {
  SqlConfig,
  SqlInConfig,
  SqlResult,
  SqlBuildOutcome,
  SqlValidationResult,
} from './types'

// ── SQL IN Builder ───────────────────────────────────────────────────

/**
 * Parse batch input into individual items.
 * Line-by-line: each line is one item. Trim whitespace, skip empty lines.
 * Does NOT split on commas, spaces, or semicolons within a line.
 */
export function parseSqlInItems(text: string, dedupe: boolean): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (!dedupe) return lines

  const seen = new Set<string>()
  return lines.filter((item) => {
    if (seen.has(item)) return false
    seen.add(item)
    return true
  })
}

/**
 * Check whether a string represents a valid number for SQL IN purposes.
 * Accepts integers and decimals, with optional negative sign.
 * Examples: "1001", "-1", "3.14", "0", "-0.5"
 * Rejects: "abc", "12a", ".5", "1.2.3", ""
 */
export function isValidNumber(s: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(s)
}

/** Format a single item for SQL IN list */
export function formatSqlInItem(
  item: string,
  valueType: 'string' | 'number',
): string {
  if (valueType === 'number') return item
  // String: wrap in single quotes, escape internal single quotes SQL-style
  return `'${item.replace(/'/g, "''")}'`
}

/**
 * Build the full SQL IN list string.
 *
 * Returns a discriminated union:
 * - { success: true, output, itemCount }  — valid output
 * - { success: false, empty: true }       — no items (safe no-op, not an error)
 * - { success: false, error }             — validation failure (invalid number)
 */
export function buildSqlInList(input: string, config: SqlInConfig): SqlBuildOutcome {
  // Number validation with line tracking (before dedupe, for accurate line numbers)
  if (config.valueType === 'number') {
    const rawLines = input.split(/\r?\n/)
    for (let i = 0; i < rawLines.length; i++) {
      const trimmed = rawLines[i].trim()
      if (trimmed === '') continue
      if (!isValidNumber(trimmed)) {
        return { success: false, error: `Invalid number at line ${i + 1}: ${trimmed}` }
      }
    }
  }

  const items = parseSqlInItems(input, config.dedupe)
  if (items.length === 0) {
    return { success: false, empty: true }
  }

  const formatted = items.map((item) => formatSqlInItem(item, config.valueType))

  if (config.lineMode === 'multi') {
    if (config.wrapWithParentheses) {
      const body = formatted.map((v) => `  ${v}`).join(',\n')
      return { success: true, output: `(\n${body}\n)`, itemCount: items.length }
    }
    // Multi-line, no wrap: no leading spaces
    const body = formatted.join(',\n')
    return { success: true, output: body, itemCount: items.length }
  }

  // Single line: space after comma
  const body = formatted.join(', ')
  const output = config.wrapWithParentheses ? `(${body})` : body
  return { success: true, output, itemCount: items.length }
}

// ── Dispatch ─────────────────────────────────────────────────────────

export function transformSql(input: string, config: SqlConfig): SqlResult {
  const outcome = buildSqlInList(input, config.inConfig)
  if (outcome.success) {
    return { input, output: outcome.output, config, itemCount: outcome.itemCount }
  }
  if ('empty' in outcome && outcome.empty) {
    return { input, output: null, config }
  }
  return { input, output: null, config, error: (outcome as { error: string }).error }
}

// ── Validation ──────────────────────────────────────────────────────

export function validateSqlInput(
  input: string,
  _config: SqlConfig,
): SqlValidationResult {
  // Empty input is not an error — the UI layer handles it as safe no-op.
  // This function exists for cases where the Feature.validate() contract is needed.
  return { valid: true }
}

// ── Statistics ──────────────────────────────────────────────────────

export function getStats(input: string): { lines: number; size: number } {
  return {
    lines: input.split('\n').length,
    size: new TextEncoder().encode(input).length,
  }
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
