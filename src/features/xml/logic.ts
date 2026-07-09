/**
 * XML Plugin — Pure Logic
 *
 * ALL business logic is here. Pure functions. Zero side effects.
 * Directly unit-testable. No Vue, no Tauri, no context access.
 *
 * Uses xml-formatter for pretty-printing and DOMParser for validation.
 * Minify uses xml-formatter's built-in minify or falls back to regex.
 */

import formatXml from 'xml-formatter'
import type { XmlConfig, XmlMode, XmlTransformResult, XmlStats } from './types'

/** Example XML for the "Load Sample" button. */
export const EXAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<root>
<person id="1"><name>Alice</name><email>alice@example.com</email></person>
<person id="2"><name>Bob</name><email>bob@example.com</email></person>
</root>`

// ── Indent Mapping ─────────────────────────────────────────────────────────

function toIndentString(indentSize: XmlConfig['indentSize']): string {
  if (indentSize === 'tab') return '\t'
  return ' '.repeat(indentSize)
}

// ── XML Validation ─────────────────────────────────────────────────────────

/**
 * Validate XML syntax using DOMParser.
 * Returns null if valid, or an error message if invalid.
 *
 * Uses DOMParser (available in browsers and Tauri webviews).
 * In test environments without DOMParser, this function is designed
 * to be safely mockable — tests that need validation can mock this
 * specific function.
 */
export function validateXml(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null // empty is not an error for validation

  // Use DOMParser for XML validation
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser()
    const doc = parser.parseFromString(trimmed, 'application/xml')
    const parserError = doc.querySelector('parsererror')

    if (parserError) {
      const text = parserError.textContent || ''
      // Extract the meaningful part of the parser error
      const lines = text.split('\n').filter(l => l.trim())
      // Remove boilerplate prefix like "This page contains the following errors:"
      const cleaned = lines
        .filter(l => !l.includes('This page contains'))
        .map(l => l.trim())
        .join(' ')
      return cleaned || 'Invalid XML syntax'
    }
    return null
  }

  // Fallback: if DOMParser is unavailable (e.g. some test environments),
  // try parsing with xml-formatter which will throw on invalid input.
  try {
    formatXml(trimmed, { throwOnFailure: true, strictMode: true })
    return null
  } catch (e) {
    return (e as Error).message || 'Invalid XML syntax'
  }
}

// ── Format ─────────────────────────────────────────────────────────────────

/**
 * Format (pretty-print) XML with specified indentation.
 * Returns the formatted XML, or throws on invalid input.
 */
export function formatXmlSafe(input: string, config: XmlConfig): string {
  const trimmed = input.trim()
  if (!trimmed) return ''

  return formatXml(trimmed, {
    indentation: toIndentString(config.indentSize),
    collapseContent: true,
    lineSeparator: '\n',
    throwOnFailure: true,
    strictMode: true,
  })
}

// ── Minify ─────────────────────────────────────────────────────────────────

/**
 * Minify (compress) XML.
 *
 * Uses xml-formatter's built-in minify function. This removes insignificant
 * whitespace between XML nodes while preserving content text.
 *
 * Note: The minify operation strips whitespace between elements.
 * Whitespace inside text nodes is preserved.
 */
export function minifyXml(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''

  return formatXml.minify(trimmed, {
    collapseContent: true,
    throwOnFailure: true,
  })
}

// ── Stats ──────────────────────────────────────────────────────────────────

/** Get statistics about XML content. */
export function getXmlStats(input: string): XmlStats {
  return {
    chars: input.length,
    lines: input.split('\n').length,
    bytes: new TextEncoder().encode(input).length,
  }
}

// ── Unified Transform ──────────────────────────────────────────────────────

/**
 * Unified transform entry point.
 * Dispatches to the correct operation based on mode.
 * Never throws — always returns XmlTransformResult.
 */
export function transformXml(
  input: string,
  mode: XmlMode,
  config: XmlConfig,
): XmlTransformResult {
  const trimmed = input.trim()

  // Empty input → safe no-op
  if (!trimmed) {
    return { success: false, output: null, error: null, stats: null }
  }

  try {
    switch (mode) {
      case 'format': {
        const formatted = formatXmlSafe(trimmed, config)
        return {
          success: true,
          output: formatted,
          error: null,
          stats: getXmlStats(formatted),
        }
      }
      case 'minify': {
        const minified = minifyXml(trimmed)
        return {
          success: true,
          output: minified,
          error: null,
          stats: getXmlStats(minified),
        }
      }
      case 'validate': {
        const err = validateXml(trimmed)
        if (err) {
          return { success: false, output: null, error: err, stats: null }
        }
        // On valid: return formatted output for review
        const formatted = formatXmlSafe(trimmed, config)
        return {
          success: true,
          output: formatted,
          error: null,
          stats: getXmlStats(formatted),
        }
      }
      default:
        return { success: false, output: null, error: `Unknown mode: ${mode}`, stats: null }
    }
  } catch (e) {
    return {
      success: false,
      output: null,
      error: (e as Error).message || 'XML processing failed',
      stats: null,
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Legacy compat — used by XmlFeature.ts
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Core transformation — used by XmlFeature.
 * Formats XML with default settings.
 */
export function process(input: string, config: XmlConfig): string {
  if (!input.trim()) return ''
  return formatXmlSafe(input, config)
}

/**
 * Validate input before processing — used by XmlFeature.
 */
export function validate(input: string): { valid: boolean; message?: string } {
  if (!input || !input.trim()) {
    return { valid: false, message: 'Input is empty' }
  }
  const err = validateXml(input)
  if (err) {
    return { valid: false, message: err }
  }
  return { valid: true }
}

/**
 * Get statistics about the input — used by XmlFeature.
 */
export function getStats(input: string): { lines: number; size: number } {
  return {
    lines: input.split('\n').length,
    size: new TextEncoder().encode(input).length,
  }
}

/**
 * Format size for display.
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
