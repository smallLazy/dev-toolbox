/**
 * QR Code Plugin — Pure Logic
 *
 * ALL business logic is here. Pure functions. Zero side effects.
 * Directly unit-testable. No Vue, no Tauri, no context access.
 *
 * Uses the 'qrcode' package for PNG generation.
 */

import QRCode from 'qrcode'
import type {
  QrCodeOptions,
  QrCodeResult,
  QrCodeStats,
  QrValidationResult,
  QrErrorCorrectionLevel,
} from './types'

/** Sample URL for the "Load Sample" button. */
export const SAMPLE_INPUT = 'https://github.com/'

// ── Constants ─────────────────────────────────────────────────────────────

const VALID_SIZES = new Set([128, 256, 512, 1024])
const VALID_LEVELS: QrErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H']

// ── Validate ──────────────────────────────────────────────────────────────

/**
 * Validate QR code input.
 * Rejects empty/whitespace-only input. Accepts any non-empty content
 * (text, URL, Chinese, multiline, etc.).
 */
export function validateQrInput(input: string): QrValidationResult {
  if (!input || !input.trim()) {
    return { valid: false, message: 'Enter content to generate a QR code.' }
  }
  return { valid: true, message: 'Valid input' }
}

// ── Normalize Options ─────────────────────────────────────────────────────

/**
 * Normalize and clamp QR code options to safe values.
 */
export function normalizeQrOptions(partial: Partial<QrCodeOptions>): QrCodeOptions {
  const size = partial.size && VALID_SIZES.has(partial.size) ? partial.size : 256
  const margin = Math.max(0, Math.min(8, partial.margin ?? 4))
  const errorCorrectionLevel: QrErrorCorrectionLevel = partial.errorCorrectionLevel &&
    VALID_LEVELS.includes(partial.errorCorrectionLevel)
    ? partial.errorCorrectionLevel
    : 'M'

  return { size, margin, errorCorrectionLevel }
}

// ── Generate ──────────────────────────────────────────────────────────────

/**
 * Generate a QR code as a PNG data URL.
 * Never throws — always returns QrCodeResult.
 */
export async function generateQrCode(
  input: string,
  options: QrCodeOptions,
): Promise<QrCodeResult> {
  const trimmed = input.trim()
  if (!trimmed) {
    return { success: false, error: 'Enter content to generate a QR code.' }
  }

  const opts = normalizeQrOptions(options)

  try {
    const dataUrl = await QRCode.toDataURL(trimmed, {
      width: opts.size,
      margin: opts.margin,
      errorCorrectionLevel: opts.errorCorrectionLevel,
    })
    return { success: true, dataUrl }
  } catch (e) {
    return {
      success: false,
      error: (e as Error).message || 'Failed to generate QR code.',
    }
  }
}

// ── Stats ─────────────────────────────────────────────────────────────────

/**
 * Get statistics for a QR code generation.
 */
export function getQrStats(input: string, options: QrCodeOptions): QrCodeStats {
  const bytes = new TextEncoder().encode(input).length
  return {
    characters: input.length,
    bytes,
    size: options.size,
    margin: options.margin,
    errorCorrectionLevel: options.errorCorrectionLevel,
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Legacy compat — used by QrcodeFeature.ts
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Simple stats: lines and byte size.
 */
export function getStats(input: string): { lines: number; size: number } {
  return {
    lines: input.split('\n').length,
    size: new TextEncoder().encode(input).length,
  }
}

/**
 * Process — used by QrcodeFeature for legacy compat.
 * This is a stub; actual QR code generation goes through generateQrCode().
 */
export function process(input: string, _config?: unknown): string {
  return input
}

/**
 * Format byte count to human-readable string.
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
