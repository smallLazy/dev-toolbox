/**
 * HtmlEncode Plugin — Pure Logic
 *
 * ALL business logic is here. Pure functions. Zero side effects.
 * Directly unit-testable. No Vue, no Tauri, no context access.
 *
 * Design decisions:
 *   - HTML Encode: & must be encoded FIRST to avoid corrupting already-escaped
 *     sequences. For example, encoding "&lt;" should produce "&amp;lt;", not "&lt;"
 *     (which would be ambiguous). This is standard double-encoding behavior.
 *   - HTML Decode: lenient by design. Unknown entities like &unknown; are
 *     left as-is. Incomplete entities like &incomplete are left as-is.
 *     decodeHtml() never throws — it always returns a string.
 */

import type { HtmlMode, TryDecodeHtmlResult } from './types'

// ── Character entity map (HTML5 named entities we support) ────────────

const ENCODE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

// Regex to match any character that needs encoding
const ENCODE_RE = /[&<>"']/g

const DECODE_MAP: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  '#39': "'",
  '#x27': "'",
  '#x2F': '/',
  '#47': '/',
}

// Regex to match HTML entities.
// Named entities (alpha) REQUIRE trailing semicolon.
// Numeric entities (#ddd, #xHHH) accept optional semicolon (HTML spec allows both).
// Bare & with no valid entity is not matched.
const ENTITY_RE = /&(?:#x?[0-9a-fA-F]+;?|[a-zA-Z]+;)/g

// ── Encode ────────────────────────────────────────────────────────────

/**
 * Encode special HTML characters to their entity equivalents.
 *
 * Characters encoded:
 *   & → &amp;   (encoded FIRST to avoid corrupting entities)
 *   < → &lt;
 *   > → &gt;
 *   " → &quot;
 *   ' → &#39;
 *
 * Already-encoded input will be double-encoded — this is expected behavior.
 * For example, "&lt;" → "&amp;lt;".
 *
 * @param input - Raw text to HTML-encode
 * @returns HTML-entity-encoded string
 */
export function encodeHtml(input: string): string {
  if (!input) return ''
  return input.replace(ENCODE_RE, (ch) => ENCODE_MAP[ch])
}

// ── Decode ────────────────────────────────────────────────────────────

/**
 * Decode HTML entities back to their character equivalents.
 *
 * Supported entities:
 *   &amp; → &        &lt; → <         &gt; → >
 *   &quot; → "        &#39; → '       &#x27; → '
 *   &#x2F; → /        &#47; → /
 *
 * Lenient behavior:
 *   - Unknown entities (e.g., &unknown;) are left as-is
 *   - Incomplete entities (e.g., &incomplete without trailing ;) are left as-is
 *   - This function NEVER throws — it always returns a string
 *
 * @param input - HTML-entity-encoded string to decode
 * @returns Decoded string with entities replaced
 */
export function decodeHtml(input: string): string {
  if (!input) return ''
  return input.replace(ENTITY_RE, (match) => {
    // Skip if match is just "&" (bare ampersand, shouldn't happen with regex)
    if (match === '&') return match

    // Extract entity name/value (remove leading & and trailing ;)
    const isClosed = match.endsWith(';')
    const entity = isClosed ? match.slice(1, -1) : match.slice(1)

    if (!entity) return match

    // Check decode map
    if (DECODE_MAP[entity] !== undefined) {
      return DECODE_MAP[entity]
    }

    // Try to decode numeric entities dynamically
    if (entity.startsWith('#')) {
      try {
        let codePoint: number
        if (entity.startsWith('#x') || entity.startsWith('#X')) {
          codePoint = parseInt(entity.slice(2), 16)
        } else {
          codePoint = parseInt(entity.slice(1), 10)
        }
        if (!isNaN(codePoint) && codePoint > 0) {
          return String.fromCodePoint(codePoint)
        }
      } catch {
        // Invalid numeric entity — leave as-is
      }
    }

    // Unknown or unclosed entity — leave as-is
    return match
  })
}

/**
 * Safe decode that never throws.
 *
 * Since decodeHtml() is lenient by design and never throws,
 * tryDecodeHtml always returns { success: true, value: string }.
 *
 * This function exists primarily for API consistency with Base64/URL
 * tools that use the same pattern.
 *
 * @param input - HTML-entity-encoded string to decode
 * @returns Always { success: true, value: decodedString }
 */
export function tryDecodeHtml(input: string): TryDecodeHtmlResult {
  return { success: true, value: decodeHtml(input) }
}

// ── Transform (mode dispatch) ─────────────────────────────────────────

/**
 * Transform input based on mode.
 * Pure function — no side effects, no config mutation.
 *
 * @param input - Input string
 * @param mode - 'encode' or 'decode'
 * @returns Transformed string
 */
export function transformHtml(input: string, mode: HtmlMode): string {
  return mode === 'encode' ? encodeHtml(input) : decodeHtml(input)
}

// ── Stats ─────────────────────────────────────────────────────────────

/**
 * Get statistics about a string.
 */
export function getStats(input: string): { chars: number; lines: number; bytes: number } {
  return {
    chars: input.length,
    lines: input === '' ? 0 : input.split('\n').length,
    bytes: new TextEncoder().encode(input).length,
  }
}

/**
 * Format byte size for human-readable display.
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Validation ────────────────────────────────────────────────────────

/**
 * Validate input before processing.
 */
export function validate(input: string): { valid: boolean; message?: string } {
  if (!input || !input.trim()) {
    return { valid: false, message: 'Input is empty' }
  }
  return { valid: true }
}
