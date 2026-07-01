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
 * - php: PHP urlencode — A-Z a-z 0-9 - _ . ~ pass through; space → '+'; all others → %XX (uppercase)
 */
export function encodeUrl(input: string, variant: UrlVariant): string {
  if (variant === 'uri') {
    return encodeURI(input)
  }
  if (variant === 'php') {
    return encodeUrlPhp(input)
  }
  return encodeURIComponent(input)
}

// ── Decoding ────────────────────────────────────────────────────────

/**
 * Decode input using the specified variant.
 *
 * - component: decodeURIComponent — decodes all percent-encoded sequences
 * - uri: decodeURI — decodes percent-encoded sequences but preserves URI structure
 * - php: PHP urldecode — '+' → ' '; %XX → decoded byte; other chars pass through
 *
 * Both decodeURI and decodeURIComponent throw URIError on malformed percent
 * encoding (e.g. %ZZ, truncated sequences like %E0%A4%A).
 */
export function decodeUrl(input: string, variant: UrlVariant): string {
  if (variant === 'uri') {
    return decodeURI(input)
  }
  if (variant === 'php') {
    return decodeUrlPhp(input)
  }
  return decodeURIComponent(input)
}

// ── PHP urlencode / urldecode ───────────────────────────────────────

/**
 * PHP-compatible urlencode.
 *
 * Byte-level encoding matching PHP's urlencode() and the Rust cloud_crypto
 * url_encode() implementation exactly:
 *
 *   - A-Z a-z 0-9 - _ . ~  →  pass through unchanged
 *   - Space (0x20)          →  '+'
 *   - All other bytes       →  '%XX' (uppercase hex)
 *
 * This is deliberately hand-written (not encodeURIComponent + replace)
 * to match the Rust behavior character-for-character, including for
 * ! * ' ( ) which encodeURIComponent would NOT encode.
 */
export function encodeUrlPhp(input: string): string {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(input)
  const parts: string[] = []

  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i]
    if (
      (byte >= 0x41 && byte <= 0x5a) || // A-Z
      (byte >= 0x61 && byte <= 0x7a) || // a-z
      (byte >= 0x30 && byte <= 0x39) || // 0-9
      byte === 0x2d || // -
      byte === 0x5f || // _
      byte === 0x2e || // .
      byte === 0x7e    // ~
    ) {
      parts.push(String.fromCharCode(byte))
    } else if (byte === 0x20) {
      // Space → '+'
      parts.push('+')
    } else {
      // Everything else → %XX uppercase
      parts.push('%' + byte.toString(16).toUpperCase().padStart(2, '0'))
    }
  }

  return parts.join('')
}

/**
 * PHP-compatible urldecode.
 *
 * Byte-level decoding matching the Rust cloud_crypto url_decode()
 * implementation:
 *
 *   - '+'  →  ' ' (space)
 *   - '%XX' → decoded byte (uppercase or lowercase hex accepted)
 *   - Invalid % sequence → '%' is kept, advance 1 byte
 *   - Other bytes → pass through
 *
 * The resulting bytes are decoded as UTF-8.
 * Throws on invalid UTF-8 sequences (malformed byte stream).
 */
export function decodeUrlPhp(input: string): string {
  const inputBytes = new TextEncoder().encode(input)
  const result: number[] = []
  let i = 0

  while (i < inputBytes.length) {
    const byte = inputBytes[i]
    if (byte === 0x2b) {
      // '+' → ' '
      result.push(0x20)
      i += 1
    } else if (byte === 0x25 && i + 2 < inputBytes.length) {
      // '%XX' → decode hex
      const hexStr = String.fromCharCode(inputBytes[i + 1], inputBytes[i + 2])
      const hexVal = parseInt(hexStr, 16)
      if (!isNaN(hexVal)) {
        result.push(hexVal)
        i += 3
      } else {
        // Invalid hex — keep '%'
        result.push(0x25)
        i += 1
      }
    } else {
      result.push(byte)
      i += 1
    }
  }

  // Decode UTF-8 bytes to string.
  // Use fatal: false to match Rust's String::from_utf8_lossy behavior —
  // invalid UTF-8 sequences are replaced with U+FFFD replacement characters.
  const decoder = new TextDecoder('utf-8', { fatal: false })
  return decoder.decode(new Uint8Array(result))
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
