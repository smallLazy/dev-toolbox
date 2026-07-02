/**
 * Base64 Plugin — Pure Logic
 *
 * ALL business logic is here. Pure functions. Zero side effects.
 * Directly unit-testable. No Vue, no Tauri, no context access.
 *
 * Scope: RFC 4648 Standard Base64, plus optional no-padding / auto-pad variants.
 */

import type { Base64Padding, Base64ValidationResult, TextStats } from './types'

/**
 * Encode plain text to Base64.
 *
 * @param input   - Plain text to encode
 * @param options - Optional encoding options
 * @param options.padding - 'standard' (default, RFC 4648 with =) or 'none' (strip trailing =)
 */
export function encode(input: string, options?: { padding?: Base64Padding }): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  const b64 = btoa(binary)
  if (options?.padding === 'none') {
    return b64.replace(/=+$/, '')
  }
  return b64
}

/**
 * Decode Base64 to plain text.
 *
 * @param input   - Base64-encoded string
 * @param options - Optional decoding options
 * @param options.autoPad   - If true, auto-pad with '=' to reach a multiple-of-4 length before decoding
 * @param options.fixSpaces - If true, replace spaces with '+' before decoding (for URL-transported Base64)
 */
export function decode(input: string, options?: { autoPad?: boolean; fixSpaces?: boolean }): string {
  let fixed = input

  if (options?.fixSpaces) {
    fixed = fixed.replace(/ /g, '+')
  }

  if (options?.autoPad) {
    while (fixed.length % 4 !== 0) {
      fixed += '='
    }
  }

  const binary = atob(fixed)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

/**
 * Generic input validation.
 * Checks: empty input, maximum size.
 * Does NOT check Base64 validity — use validateBase64() for that.
 */
export function validate(input: string): { valid: true } | { valid: false; errors: Array<{ field: string; message: string }> } {
  if (!input || input.length === 0) {
    return { valid: false, errors: [{ field: 'input', message: 'Input is empty' }] }
  }

  const bytes = new TextEncoder().encode(input).length
  const MAX_SIZE = 50 * 1024 * 1024
  if (bytes > MAX_SIZE) {
    return { valid: false, errors: [{ field: 'input', message: 'Input exceeds maximum size of 50MB' }] }
  }

  return { valid: true }
}

/**
 * Base64-specific validation.
 *
 * Checks: alphabet, length (multiple of 4), padding, invalid character position.
 * Does NOT check empty input or max size — those are handled by validate().
 *
 * @param input   - Base64 string to validate
 * @param options - Optional validation options
 * @param options.lenientPadding - If true, skip length/padding checks (for no-padding / auto-pad scenarios)
 */
export function validateBase64(input: string, options?: { lenientPadding?: boolean }): Base64ValidationResult {
  // Check for invalid characters
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (!/[A-Za-z0-9+/=]/.test(ch)) {
      return {
        valid: false,
        error: {
          type: 'invalid_character',
          message: `Invalid Base64: unexpected character at position ${i}`,
          position: i,
        },
      }
    }
  }

  if (options?.lenientPadding) {
    // In lenient mode, only check for valid alphabet — skip length and padding checks.
    // Padding still cannot exceed 2 chars.
    const paddingMatch = input.match(/=+$/)
    if (paddingMatch && paddingMatch[0].length > 2) {
      return {
        valid: false,
        error: {
          type: 'invalid_padding',
          message: 'Invalid Base64: incorrect padding (max 2 = chars)',
        },
      }
    }
    return { valid: true }
  }

  // Check length (must be multiple of 4)
  if (input.length % 4 !== 0) {
    return {
      valid: false,
      error: {
        type: 'invalid_length',
        message: `Invalid Base64: input length must be a multiple of 4 (got ${input.length})`,
      },
    }
  }

  // Check padding
  const paddingMatch = input.match(/=+$/)
  if (paddingMatch) {
    const paddingLen = paddingMatch[0].length
    if (paddingLen > 2) {
      return {
        valid: false,
        error: {
          type: 'invalid_padding',
          message: 'Invalid Base64: incorrect padding',
        },
      }
    }
  }

  return { valid: true }
}

/**
 * Get statistics about the input.
 */
export function getStats(input: string): TextStats {
  return {
    chars: input.length,
    lines: input.split('\n').length,
    bytes: new TextEncoder().encode(input).length,
  }
}

/**
 * Result type for safe decode operations that must never throw.
 */
export type TryDecodeResult =
  | { success: true; value: string }
  | { success: false; error: string }

/**
 * Safely decode Base64 to plain text — never throws.
 *
 * Combines validateBase64() + decode() into a single call that returns
 * a discriminated union instead of throwing on invalid input.
 *
 * Use this when you need a friendly error message rather than a thrown
 * exception (e.g. for UI error display).
 *
 * @param input - Base64-encoded string (valid or invalid)
 */
export function tryDecode(input: string): TryDecodeResult {
  // Empty input is valid and decodes to empty string
  if (input.length === 0) {
    return { success: true, value: '' }
  }

  // Validate Base64 alphabet, length, and padding
  const validation = validateBase64(input)
  if (!validation.valid) {
    return { success: false, error: validation.error!.message }
  }

  // Decode — atob() may still throw on edge cases despite valid alphabet
  try {
    const value = decode(input)
    return { success: true, value }
  } catch (e) {
    return { success: false, error: (e as Error).message || 'Decode failed' }
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
