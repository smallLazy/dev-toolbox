/**
 * SQL Plugin — Pure Logic
 *
 * SQL IN Builder: batch values → SQL IN list.
 * TODO: add formatSql() for SQL Formatter mode.
 */

import type {
  SqlConfig,
  SqlInConfig,
  SqlResult,
  SqlValidationResult,
} from './types'

// ── SQL IN Builder ───────────────────────────────────────────────────

/** Parse batch input into individual items */
export function parseSqlInItems(text: string, dedupe: boolean): string[] {
  const raw = text
    .split(/[\s,，;；]+/)
    .map((item) => item.trim())
    .filter(Boolean)

  if (!dedupe) return raw

  const seen = new Set<string>()
  return raw.filter((item) => {
    if (seen.has(item)) return false
    seen.add(item)
    return true
  })
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

/** Build the full SQL IN list string */
export function buildSqlInList(input: string, config: SqlInConfig): string {
  const items = parseSqlInItems(input, config.dedupe)
  if (items.length === 0) {
    throw new Error('No valid items found in input')
  }

  const separator = config.lineMode === 'single' ? ',' : ',\n'
  const body = items.map((item) => formatSqlInItem(item, config.valueType)).join(separator)
  return config.wrapWithParentheses ? `(${body})` : body
}

// ── Dispatch ─────────────────────────────────────────────────────────

export function transformSql(input: string, config: SqlConfig): SqlResult {
  // Future: if config.mode === 'format' → formatSql(...)
  const output = buildSqlInList(input, config.inConfig)
  return { input, output, config }
}

// ── Validation ──────────────────────────────────────────────────────

export function validateSqlInput(
  input: string,
  _config: SqlConfig,
): SqlValidationResult {
  const items = parseSqlInItems(input, false)
  if (items.length === 0) {
    return {
      valid: false,
      errors: [
        {
          field: 'input',
          code: 'EMPTY_INPUT',
          message: 'No valid items found in input',
        },
      ],
    }
  }
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
