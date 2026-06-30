/**
 * URL Plugin — Pure Logic
 *
 * ALL business logic is here. Pure functions. Zero side effects.
 * Directly unit-testable. No Vue, no Tauri, no context access.
 */

import type {
  UrlMode,
  UrlVariant,
  UrlConfig,
  UrlResult,
  UrlValidationResult,
  UrlValidationError,
  TextStats,
} from './types'

// ── Encoding ────────────────────────────────────────────────────────

/**
 * Encode input using the specified variant.
 *
 * - component: encodeURIComponent — encodes all special chars including / ? & = #
 * - uri: encodeURI — preserves URI structure chars ( / ? & = # : ; , @ ) but encodes spaces and non-ASCII
 */
export function encodeUrl(input: string, variant: UrlVariant): string {
  if (variant === 'uri') {
    return encodeURI(input)
  }
  return encodeURIComponent(input)
}

// ── Decoding ────────────────────────────────────────────────────────

/**
 * Decode input using the specified variant.
 *
 * - component: decodeURIComponent — decodes all percent-encoded sequences
 * - uri: decodeURI — decodes percent-encoded sequences but preserves URI structure
 *
 * Both decodeURI and decodeURIComponent throw URIError on malformed percent
 * encoding (e.g. %ZZ, truncated sequences like %E0%A4%A).
 */
export function decodeUrl(input: string, variant: UrlVariant): string {
  if (variant === 'uri') {
    return decodeURI(input)
  }
  return decodeURIComponent(input)
}

// ── Transform ───────────────────────────────────────────────────────

/**
 * Main transform — dispatches encode or decode based on config.
 */
export function transformUrl(input: string, config: UrlConfig): UrlResult {
  const output =
    config.mode === 'encode'
      ? encodeUrl(input, config.variant)
      : decodeUrl(input, config.variant)

  return { input, output, config }
}

// ── Validation ──────────────────────────────────────────────────────

/**
 * Validate user input before encoding/decoding.
 *
 * Checks:
 * - Empty input (after trim)
 * - Maximum size (50MB, consistent with Base64)
 */
export function validateUrlInput(input: string): UrlValidationResult {
  const errors: UrlValidationError[] = []

  const trimmed = input.trim()
  if (trimmed.length === 0) {
    errors.push({
      field: 'input',
      code: 'EMPTY_INPUT',
      message: 'Input is empty',
    })
  }

  const bytes = new TextEncoder().encode(input).length
  const MAX_SIZE = 50 * 1024 * 1024
  if (bytes > MAX_SIZE) {
    errors.push({
      field: 'input',
      code: 'INPUT_TOO_LARGE',
      message: `Input exceeds maximum size of 50MB`,
    })
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true }
}

/**
 * Validate that a string is safe to decode.
 *
 * Checks for obviously malformed percent-encoding by attempting the decode.
 * Since decodeURIComponent throws URIError on malformed input, we catch and
 * return a user-friendly error.
 */
export function validateDecodeInput(input: string, variant: UrlVariant): UrlValidationResult {
  const errors: UrlValidationError[] = []

  try {
    // Attempt decode to catch malformed percent encoding
    decodeUrl(input, variant)
  } catch (e) {
    if (e instanceof URIError) {
      // Try to find the position of the invalid percent sequence
      const msg = e.message
      let message = 'Invalid URL encoding: malformed percent sequence'

      // decodeURIComponent errors look like: "URIError: URI malformed"
      // Try to extract the offending sequence position
      const percentMatch = input.match(/%[^0-9A-Fa-f]|%[0-9A-Fa-f]$|%[0-9A-Fa-f][^0-9A-Fa-f]/)
      if (percentMatch && percentMatch.index !== undefined) {
        message = `Invalid URL encoding: malformed percent sequence at position ${percentMatch.index}`
      }

      errors.push({
        field: 'input',
        code: 'MALFORMED_PERCENT_ENCODING',
        message,
        position: percentMatch?.index,
      })
    } else {
      errors.push({
        field: 'input',
        code: 'DECODE_ERROR',
        message: `Decode failed: ${(e as Error).message}`,
      })
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true }
}

// ── Statistics ──────────────────────────────────────────────────────

/**
 * Get statistics about the input string.
 */
export function getStats(input: string): TextStats {
  return {
    chars: input.length,
    lines: input.split('\n').length,
    bytes: new TextEncoder().encode(input).length,
  }
}

/**
 * Format byte count for display (e.g. "1.2 KB").
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
