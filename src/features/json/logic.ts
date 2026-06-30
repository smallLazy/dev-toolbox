/**
 * JSON Plugin — Pure Logic (zero side effects, directly testable)
 *
 * All transformations are pure functions.
 * No Vue, no Tauri, no Monaco, no context access.
 */

import type { JsonConfig, JsonFormatResult, JsonValidateResult } from './types'

// ── Format ──────────────────────────────────────────────────────────────

export function formatJson(input: string, config: JsonConfig): JsonFormatResult {
  const parsed = safeParse(input)
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

// ── Minify ──────────────────────────────────────────────────────────────

export function minifyJson(input: string): JsonFormatResult {
  const parsed = safeParse(input)
  const minified = JSON.stringify(parsed)
  return {
    formatted: minified,
    lines: 1,
    size: new TextEncoder().encode(minified).length,
  }
}

// ── Validate ────────────────────────────────────────────────────────────

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

// ── Sort Keys ───────────────────────────────────────────────────────────

export function sortKeys(input: string): string {
  const parsed = safeParse(input)
  return JSON.stringify(sortKeysDeep(parsed), null, 2)
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

// ── Helpers ─────────────────────────────────────────────────────────────

function safeParse(input: string): unknown {
  const trimmed = input.trim()
  if (!trimmed) throw new Error('Input is empty')
  return JSON.parse(trimmed)
}

function extractPosition(msg: string): { line: number; column: number } {
  // Typical JSON.parse error: "Unexpected token X in JSON at position N"
  const match = msg.match(/position\s+(\d+)/)
  if (match) {
    const pos = parseInt(match[1], 10)
    return { line: 1, column: pos + 1 }
  }
  return { line: 1, column: 1 }
}

// ── Statistics ──────────────────────────────────────────────────────────

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
