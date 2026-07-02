/**
 * Unicode Plugin — Pure Logic
 *
 * ALL business logic is here. Pure functions. Zero side effects.
 * Directly unit-testable. No Vue, no Tauri, no context access.
 *
 * Supports two variants:
 * - javascript: \uXXXX and surrogate pair encoding (for JS/JSON strings)
 * - code-point: U+XXXX and U+XXXXXX encoding (for spec/documentation)
 */

import type {
  UnicodeMode,
  UnicodeVariant,
  UnicodeConfig,
  UnicodeResult,
  TextStats,
  TryDecodeUnicodeResult,
} from './types'

// ── JavaScript Variant: \uXXXX ────────────────────────────────────────

/**
 * Encode input using JavaScript \uXXXX escape sequences.
 *
 * Rules:
 * - ASCII printable characters (0x20-0x7E, except backslash) pass through unchanged
 * - Backslash is escaped as \\
 * - Non-ASCII characters (U+0080 and above) are encoded as \uXXXX (BMP)
 *   or surrogate pairs \uDXXX\uDXXX (supplementary planes)
 *
 * Examples:
 *   hello → hello
 *   你好 → 你好
 *   😀 → 😀
 */
export function encodeJsUnicode(input: string): string {
  const parts: string[] = []

  for (let i = 0; i < input.length; i++) {
    const cp = input.codePointAt(i)!

    // ASCII printable (space through ~) except backslash
    if (cp >= 0x20 && cp <= 0x7e && cp !== 0x5c) {
      parts.push(input[i])
      continue
    }

    // Backslash
    if (cp === 0x5c) {
      parts.push('\\\\')
      continue
    }

    // Non-ASCII: BMP characters fit in \uXXXX
    if (cp <= 0xffff) {
      parts.push('\\u' + cp.toString(16).toUpperCase().padStart(4, '0'))
    } else {
      // Supplementary plane: encode as surrogate pair \uDXXX\uDXXX
      const high = 0xd800 + Math.floor((cp - 0x10000) / 0x400)
      const low = 0xdc00 + ((cp - 0x10000) % 0x400)
      parts.push(
        '\\u' + high.toString(16).toUpperCase().padStart(4, '0') +
        '\\u' + low.toString(16).toUpperCase().padStart(4, '0')
      )
      // Skip the low surrogate in the loop (codePointAt advances by 2)
      i++ // skip the next char (low surrogate)
    }
  }

  return parts.join('')
}

/**
 * Decode JavaScript \uXXXX escape sequences to plain text.
 *
 * Rules:
 * - \uXXXX (case-insensitive hex) is decoded to the corresponding character
 * - Surrogate pairs \uDXXX\uDXXX are combined into the correct supplementary character
 * - \\ is decoded to a single backslash
 * - Other characters pass through unchanged
 *
 * Throws on:
 * - Invalid hex digits (\uZZZZ)
 * - Truncated sequences (\u123 or \u12)
 * - Unpaired surrogates (high without low, low without high)
 *
 * Examples:
 *   你好 → 你好
 *   😀 → 😀
 */
export function decodeJsUnicode(input: string): string {
  const chars: number[] = []
  let i = 0

  while (i < input.length) {
    if (input[i] === '\\') {
      i++

      // End of string after backslash
      if (i >= input.length) {
        throw new Error('Invalid Unicode escape: unexpected end of input after backslash')
      }

      // Escaped backslash
      if (input[i] === '\\') {
        chars.push(0x5c) // backslash code point
        i++
        continue
      }

      // \uXXXX sequence
      if (input[i] === 'u') {
        i++
        const hexStart = i

        // Need exactly 4 hex digits
        if (i + 4 > input.length) {
          throw new Error(
            `Invalid Unicode escape: truncated \\u sequence at position ${hexStart - 1}`
          )
        }

        const hexStr = input.slice(i, i + 4)
        if (!/^[0-9A-Fa-f]{4}$/.test(hexStr)) {
          throw new Error(
            `Invalid Unicode escape: invalid hex digits "\\u${hexStr}" at position ${hexStart - 1}`
          )
        }

        const codeUnit = parseInt(hexStr, 16)
        chars.push(codeUnit)
        i += 4
        continue
      }

      // Unknown escape sequence
      throw new Error(
        `Invalid Unicode escape: unexpected escape character '${input[i]}' at position ${i - 1}`
      )
    } else {
      chars.push(input.codePointAt(i)!)
      // If this is a high surrogate in the raw input (shouldn't happen without \u),
      // still advance correctly
      if (input.codePointAt(i)! > 0xffff) {
        i += 2
      } else {
        i++
      }
    }
  }

  // Validate surrogate pairs
  for (let j = 0; j < chars.length; j++) {
    if (chars[j] >= 0xd800 && chars[j] <= 0xdbff) {
      // High surrogate: must be followed by a low surrogate
      if (j + 1 >= chars.length) {
        throw new Error(
          `Invalid Unicode escape: unpaired high surrogate \\u${chars[j].toString(16).toUpperCase().padStart(4, '0')} at end of input`
        )
      }
      if (chars[j + 1] < 0xdc00 || chars[j + 1] > 0xdfff) {
        throw new Error(
          `Invalid Unicode escape: high surrogate \\u${chars[j].toString(16).toUpperCase().padStart(4, '0')} not followed by low surrogate`
        )
      }
      j++ // skip low surrogate
    } else if (chars[j] >= 0xdc00 && chars[j] <= 0xdfff) {
      // Low surrogate without preceding high surrogate
      throw new Error(
        `Invalid Unicode escape: unpaired low surrogate \\u${chars[j].toString(16).toUpperCase().padStart(4, '0')} at position ${j}`
      )
    }
  }

  // Convert code points to string
  return String.fromCodePoint(...chars)
}

// ── Code Point Variant: U+XXXX ────────────────────────────────────────

/**
 * Encode input using U+XXXX / U+XXXXXX code point notation.
 *
 * Rules:
 * - Every character is encoded as U+XXXX (BMP) or U+XXXXXX (supplementary planes)
 * - Code points are space-separated
 * - Hex digits use uppercase letters
 *
 * Examples:
 *   你好 → U+4F60 U+597D
 *   😀 → U+1F600
 *   A → U+0041
 */
export function encodeCodePoint(input: string): string {
  const parts: string[] = []

  for (let i = 0; i < input.length; i++) {
    const cp = input.codePointAt(i)!

    if (cp <= 0xffff) {
      parts.push('U+' + cp.toString(16).toUpperCase().padStart(4, '0'))
    } else {
      parts.push('U+' + cp.toString(16).toUpperCase())
      i++ // skip low surrogate
    }
  }

  return parts.join(' ')
}

/**
 * Decode U+XXXX / U+XXXXXX code point notation to plain text.
 *
 * Rules:
 * - U+XXXX or U+XXXXXX (case-insensitive) is decoded
 * - Code points can be separated by spaces (one or more)
 * - Validates code points are within Unicode range (0x0 - 0x10FFFF)
 * - Characters not part of a U+... sequence pass through unchanged
 *
 * Throws on:
 * - Invalid hex digits (U+ZZZZ)
 * - Code point exceeds U+10FFFF
 * - Malformed U+ prefix
 *
 * Examples:
 *   U+4F60 U+597D → 你好
 *   U+1F600 → 😀
 *   U+0041 → A
 */
export function decodeCodePoint(input: string): string {
  const trimmed = input.trim()
  if (trimmed.length === 0) return ''

  const codePoints: number[] = []
  const parts = trimmed.split(/\s+/)

  for (const part of parts) {
    if (!part.startsWith('U+') && !part.startsWith('u+')) {
      throw new Error(
        `Invalid code point: "${part}" does not start with U+`
      )
    }

    const hexStr = part.slice(2)
    if (!/^[0-9A-Fa-f]{1,6}$/.test(hexStr)) {
      throw new Error(
        `Invalid code point: "${part}" has invalid hex digits`
      )
    }

    const cp = parseInt(hexStr, 16)
    if (cp > 0x10ffff) {
      throw new Error(
        `Invalid code point: U+${hexStr.toUpperCase()} exceeds maximum Unicode code point U+10FFFF`
      )
    }

    codePoints.push(cp)
  }

  return String.fromCodePoint(...codePoints)
}

// ── Variant Dispatch ──────────────────────────────────────────────────

/**
 * Encode input using the specified variant.
 */
export function encodeUnicode(input: string, variant: UnicodeVariant): string {
  if (input.length === 0) return ''
  if (variant === 'code-point') return encodeCodePoint(input)
  return encodeJsUnicode(input)
}

/**
 * Decode input using the specified variant.
 *
 * Throws on invalid input — use tryDecodeUnicode() for safe decode.
 */
export function decodeUnicode(input: string, variant: UnicodeVariant): string {
  if (input.length === 0) return ''
  if (variant === 'code-point') return decodeCodePoint(input)
  return decodeJsUnicode(input)
}

// ── Transform ──────────────────────────────────────────────────────────

/**
 * Main transform — dispatches encode or decode based on config.
 */
export function transformUnicode(input: string, config: UnicodeConfig): UnicodeResult {
  const output =
    config.mode === 'encode'
      ? encodeUnicode(input, config.variant)
      : decodeUnicode(input, config.variant)

  return {
    output,
    stats: getStats(output),
  }
}

// ── Safe Decode ────────────────────────────────────────────────────────

/**
 * Safely decode a Unicode-encoded string — never throws.
 *
 * Returns a discriminated union instead of throwing on invalid input.
 * Use this for UI error display.
 */
export function tryDecodeUnicode(
  input: string,
  variant: UnicodeVariant
): TryDecodeUnicodeResult {
  if (input.length === 0) {
    return { success: true, value: '' }
  }

  try {
    const value = decodeUnicode(input, variant)
    return { success: true, value }
  } catch (e) {
    return {
      success: false,
      error: (e as Error).message || 'Decode failed',
    }
  }
}

// ── Validation ─────────────────────────────────────────────────────────

/**
 * Validate user input before encoding/decoding.
 *
 * Checks:
 * - Empty input (non-empty for processing)
 * - Maximum size (50MB, consistent with Base64)
 */
export function validate(input: string): { valid: true } | { valid: false; errors: Array<{ field: string; message: string }> } {
  if (!input || !input.trim()) {
    return { valid: false, errors: [{ field: 'input', message: 'Input is empty' }] }
  }

  const bytes = new TextEncoder().encode(input).length
  const MAX_SIZE = 50 * 1024 * 1024
  if (bytes > MAX_SIZE) {
    return { valid: false, errors: [{ field: 'input', message: 'Input exceeds maximum size of 50MB' }] }
  }

  return { valid: true }
}

// ── Statistics ─────────────────────────────────────────────────────────

/**
 * Get statistics about a string.
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
