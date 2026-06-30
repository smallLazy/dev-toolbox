/**
 * Regex Plugin — Pure Logic
 *
 * ALL business logic is here. Pure functions. Zero side effects.
 * Directly unit-testable. No Vue, no Tauri, no context access.
 */

import type { RegexConfig } from './types'

/**
 * Core transformation logic.
 * Replace this with your actual business logic.
 */
export function process(input: string, config: RegexConfig): string {
  // TODO: Implement your transformation here
  // Example: return input.toUpperCase()
  return input
}

/**
 * Validate input before processing.
 */
export function validate(input: string): { valid: boolean; message?: string } {
  if (!input || !input.trim()) {
    return { valid: false, message: 'Input is empty' }
  }
  return { valid: true }
}

/**
 * Get statistics about the input.
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
