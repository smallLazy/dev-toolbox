/**
 * JSON Plugin — Pure Logic (zero side effects, directly testable)
 *
 * All transformations are pure functions.
 * No Vue, no Tauri, no Monaco, no context access.
 *
 * Architecture:
 *   - NEW safe functions (v1):  parseJson, transformJson, getJsonStats
 *     → Called by composables — never throw, always return structured results
 *   - OLD functions (compat):   formatJson, minifyJson, validateJson, getStats
 *     → Called by JsonFeature.ts — kept for backward compatibility
 */

import type { JsonConfig, JsonFormatResult, JsonValidateResult, JsonTransformResult, JsonStats, JsonMode } from './types'

// ── Constants ─────────────────────────────────────────────────────────────────

/** Example JSON for the "Example" button. Compact so users can see Format in action. */
export const EXAMPLE_JSON = '{"name":"Dev Toolbox","version":"1.0.0","features":["format","minify","validate"],"local":true}'

// ═══════════════════════════════════════════════════════════════════════════
// NEW — Safe, structured functions (v1 composable path)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Safe JSON.parse — never throws.
 * Returns a discriminated union so callers can branch without try/catch.
 */
export function parseJson(input: string): { success: true; data: unknown } | { success: false; error: string } {
  const trimmed = input.trim()
  if (!trimmed) {
    return { success: false, error: 'Input is empty' }
  }
  try {
    const data = JSON.parse(trimmed)
    return { success: true, data }
  } catch (e) {
    const msg = (e as SyntaxError).message || 'Unknown JSON parse error'
    return { success: false, error: formatJsonError(trimmed, msg) }
  }
}

/**
 * Unified transform entry point.
 * Dispatches to the correct operation based on mode.
 * Never throws — always returns JsonTransformResult.
 */
export function transformJson(input: string, mode: JsonMode, config?: JsonConfig): JsonTransformResult {
  const trimmed = input.trim()

  // Empty input → safe no-op
  if (!trimmed) {
    return { success: false, output: null, error: null, stats: null }
  }

  switch (mode) {
    case 'format':
      return formatJsonSafe(trimmed, config)
    case 'minify':
      return minifyJsonSafe(trimmed)
    case 'validate':
      return validateJsonSafe(trimmed)
    default:
      return { success: false, output: null, error: `Unknown mode: ${mode}`, stats: null }
  }
}

/**
 * Richer statistics about JSON content.
 * Returns chars, lines, bytes, and when the input is valid JSON also type/keys/items.
 */
export function getJsonStats(input: string): JsonStats {
  const bytes = new TextEncoder().encode(input).length
  const lines = input.split('\n').length
  const chars = input.length

  const parsed = parseJson(input)
  if (!parsed.success) {
    return { chars, lines, bytes }
  }

  const data = parsed.data
  const type = detectJsonType(data)
  const stats: JsonStats = { chars, lines, bytes, type }

  if (type === 'object' && data !== null && typeof data === 'object') {
    stats.keys = Object.keys(data as Record<string, unknown>).length
  }
  if (type === 'array' && Array.isArray(data)) {
    stats.items = (data as unknown[]).length
  }

  return stats
}

/**
 * Format a JSON parse error message with line/column information.
 *
 * Extracts the character position from JSON.parse error messages
 * (e.g. "Unexpected token } in JSON at position 128") and computes
 * the corresponding line and column from the input string.
 *
 * Falls back to a plain "Invalid JSON: ..." message when position
 * cannot be extracted.
 */
export function formatJsonError(input: string, errorMessage: string): string {
  // Already enriched — don't double-wrap
  if (errorMessage.startsWith('Invalid JSON')) {
    return errorMessage
  }
  const posMatch = errorMessage.match(/position\s+(\d+)/i)
  if (!posMatch) {
    return `Invalid JSON: ${errorMessage}`
  }
  const position = parseInt(posMatch[1], 10)
  const before = input.slice(0, position)
  const line = (before.match(/\n/g) || []).length + 1
  const lastNewline = before.lastIndexOf('\n')
  const column = lastNewline === -1 ? position + 1 : position - lastNewline
  return `Invalid JSON at line ${line}, column ${column}: ${errorMessage}`
}

// ── Internal safe implementations ──────────────────────────────────────────

function formatJsonSafe(input: string, config?: JsonConfig): JsonTransformResult {
  const parsed = parseJson(input)
  if (!parsed.success) {
    return { success: false, output: null, error: parsed.error, stats: null }
  }
  try {
    const indentSize = config?.indentSize ?? 2
    const data = config?.sortKeys ? sortKeysDeep(parsed.data) : parsed.data
    const formatted = JSON.stringify(data, null, indentSize)
    const stats = getJsonStats(formatted)
    return { success: true, output: formatted, error: null, stats }
  } catch (e) {
    return { success: false, output: null, error: (e as Error).message || 'Format failed', stats: null }
  }
}

function minifyJsonSafe(input: string): JsonTransformResult {
  const parsed = parseJson(input)
  if (!parsed.success) {
    return { success: false, output: null, error: parsed.error, stats: null }
  }
  try {
    const minified = JSON.stringify(parsed.data)
    const stats = getJsonStats(minified)
    return { success: true, output: minified, error: null, stats }
  } catch (e) {
    return { success: false, output: null, error: (e as Error).message || 'Minify failed', stats: null }
  }
}

function validateJsonSafe(input: string): JsonTransformResult {
  const parsed = parseJson(input)
  if (!parsed.success) {
    return { success: false, output: null, error: parsed.error, stats: null }
  }
  // On success: return pretty-printed JSON so the user can review the structure.
  // Stats (type, keys, items) are still available via result.stats.
  try {
    const formatted = JSON.stringify(parsed.data, null, 2)
    const stats = getJsonStats(formatted)
    return { success: true, output: formatted, error: null, stats }
  } catch (e) {
    return { success: false, output: null, error: (e as Error).message || 'Validate failed', stats: null }
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function detectJsonType(data: unknown): JsonStats['type'] {
  if (data === null) return 'null'
  if (Array.isArray(data)) return 'array'
  const t = typeof data
  if (t === 'object') return 'object'
  if (t === 'string') return 'string'
  if (t === 'number') return 'number'
  if (t === 'boolean') return 'boolean'
  return undefined
}

function sortKeysDeep(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortKeysDeep)
  }
  if (obj !== null && typeof obj === 'object') {
    const sorted: Record<string, unknown> = {}
    const keys = Object.keys(obj as Record<string, unknown>).sort()
    for (const key of keys) {
      sorted[key] = sortKeysDeep((obj as Record<string, unknown>)[key])
    }
    return sorted
  }
  return obj
}

// ═══════════════════════════════════════════════════════════════════════════
// OLD — Compatibility functions (JsonFeature.ts path)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format JSON with indentation.
 * ⚠️ Throws on invalid/empty input — used by JsonFeature.ts.
 * New code should use transformJson(input, 'format') instead.
 */
export function formatJson(input: string, config: JsonConfig): JsonFormatResult {
  const parsed = safeParseLegacy(input)
  const formatted = JSON.stringify(
    config.sortKeys ? sortKeysDeep(parsed) : parsed,
    null,
    config.indentSize
  )
  return {
    formatted,
    lines: formatted.split('\n').length,
    size: new TextEncoder().encode(formatted).length,
  }
}

/**
 * Minify JSON to a single line.
 * ⚠️ Throws on invalid/empty input — used by JsonFeature.ts.
 * New code should use transformJson(input, 'minify') instead.
 */
export function minifyJson(input: string): JsonFormatResult {
  const parsed = safeParseLegacy(input)
  const minified = JSON.stringify(parsed)
  return {
    formatted: minified,
    lines: 1,
    size: new TextEncoder().encode(minified).length,
  }
}

/**
 * Validate JSON syntax.
 * ✅ Already safe — returns JsonValidateResult without throwing.
 */
export function validateJson(input: string): JsonValidateResult {
  try {
    JSON.parse(input)
    return { valid: true, errors: [] }
  } catch (e) {
    const msg = (e as SyntaxError).message
    const pos = extractPosition(msg)
    return {
      valid: false,
      errors: [{ line: pos.line, column: pos.column, message: msg }],
    }
  }
}

/**
 * Sort object keys alphabetically.
 */
export function sortKeys(input: string): string {
  const parsed = safeParseLegacy(input)
  return JSON.stringify(sortKeysDeep(parsed), null, 2)
}

/**
 * Basic stats: lines and byte size.
 * New code should use getJsonStats() for richer stats.
 */
export function getStats(input: string): { lines: number; size: number } {
  return {
    lines: input.split('\n').length,
    size: new TextEncoder().encode(input).length,
  }
}

/**
 * Format byte count to human-readable string.
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Legacy helpers (used by old compat functions) ──────────────────────────

function safeParseLegacy(input: string): unknown {
  const trimmed = input.trim()
  if (!trimmed) throw new Error('Input is empty')
  return JSON.parse(trimmed)
}

function extractPosition(msg: string): { line: number; column: number } {
  const match = msg.match(/position\s+(\d+)/)
  if (match) {
    const pos = parseInt(match[1], 10)
    return { line: 1, column: pos + 1 }
  }
  return { line: 1, column: 1 }
}
