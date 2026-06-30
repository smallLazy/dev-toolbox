/**
 * Base64 Plugin — Pure Logic
 *
 * ALL business logic is here. Pure functions. Zero side effects.
 * Directly unit-testable. No Vue, no Tauri, no context access.
 *
 * Scope: RFC 4648 Standard Base64 only.
 */

import type { Base64ValidationResult, TextStats } from './types'

/**
 * Encode plain text to Base64 (RFC 4648 Standard).
 */
export function encode(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary)
}

/**
 * Decode Base64 to plain text (RFC 4648 Standard).
 */
export function decode(input: string): string {
  const binary = atob(input)
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
 * Checks: alphabet, length (multiple of 4), padding, invalid character position.
 * Does NOT check empty input or max size — those are handled by validate().
 */
export function validateBase64(input: string): Base64ValidationResult {
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
 * Format byte count for display (e.g. "1.2 KB").
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
