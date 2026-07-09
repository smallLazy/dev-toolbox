/**
 * UUID Plugin — Pure Logic
 *
 * ALL business logic is here. Pure functions. Zero side effects.
 * Directly unit-testable. No Vue, no Tauri, no context access.
 *
 * Uses crypto.randomUUID() for v4 generation with fallback.
 */

import type { UuidVersion, UuidValidationResult } from './types'

/** Sample UUID v4 for the "Load Sample" button. */
export const SAMPLE_UUID = '550e8400-e29b-41d4-a716-446655440000'

// ── UUID Regex ────────────────────────────────────────────────────────────

/** Standard hyphenated UUID v1-5 pattern. Case-insensitive. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// ── Generate ──────────────────────────────────────────────────────────────

/**
 * Generate a single UUID v4.
 * Uses crypto.randomUUID() when available (browser / modern Node),
 * falls back to manual generation for older runtimes.
 */
export function generateUuidV4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback: manual v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Generate multiple UUID v4 strings.
 * Clamps count to 1-100 range.
 */
export function generateUuids(count: number): string[] {
  const clamped = Math.max(1, Math.min(100, Math.floor(count)))
  return Array.from({ length: clamped }, () => generateUuidV4())
}

// ── Validate ──────────────────────────────────────────────────────────────

/**
 * Validate a UUID string and determine its version.
 * Only accepts standard hyphenated format (8-4-4-4-12).
 */
export function validateUuid(input: string): UuidValidationResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { valid: false, version: 'unknown', normalized: null, message: 'Input is empty' }
  }

  if (!UUID_RE.test(trimmed)) {
    return {
      valid: false,
      version: 'unknown',
      normalized: null,
      message: 'Invalid UUID format. Expected: xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
    }
  }

  const version = getUuidVersion(trimmed)
  const normalized = trimmed.toLowerCase()

  return {
    valid: true,
    version,
    normalized,
    message: `Valid UUID ${version}`,
  }
}

// ── Version Detection ─────────────────────────────────────────────────────

/**
 * Detect UUID version from a validated UUID string.
 * The version is encoded in the 13th character (first char of the 3rd group).
 * Returns 'unknown' for non-standard versions.
 */
export function getUuidVersion(uuid: string): UuidVersion {
  const versionChar = uuid.charAt(14) // 0-indexed position of the version nibble
  switch (versionChar) {
    case '1': return 'v1'
    case '3': return 'v3'
    case '4': return 'v4'
    case '5': return 'v5'
    default: return 'unknown'
  }
}

// ── Normalize ─────────────────────────────────────────────────────────────

/**
 * Normalize a UUID: trim whitespace and convert to lowercase.
 * Returns null if the input is not a valid UUID.
 */
export function normalizeUuid(input: string): string | null {
  const trimmed = input.trim()
  if (!UUID_RE.test(trimmed)) return null
  return trimmed.toLowerCase()
}

// ═══════════════════════════════════════════════════════════════════════════
// Legacy compat — used by UuidFeature.ts
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Core transformation — used by UuidFeature.
 * Defaults to generate mode.
 */
export function process(input: string, _config?: unknown): string {
  return generateUuidV4()
}

/**
 * Validate input before processing.
 */
export function validate(input: string): { valid: boolean; message?: string } {
  if (!input || !input.trim()) {
    return { valid: false, message: 'Input is empty' }
  }
  const result = validateUuid(input)
  return { valid: result.valid, message: result.message }
}

/**
 * Get statistics about the output.
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
