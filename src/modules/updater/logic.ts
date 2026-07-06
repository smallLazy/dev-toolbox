/**
 * Updater — Pure Logic Functions
 *
 * Zero-dependency utility functions for the updater module.
 * All functions are pure: same input → same output, no side effects, no DOM access.
 *
 * Part of: Manual Update v1
 * Scope: About page "Check for Updates" → check → download → install & restart
 */

/**
 * Format a byte count into a human-readable string.
 *
 * Examples:
 *   formatBytes(0)          → "0 B"
 *   formatBytes(512)        → "512 B"
 *   formatBytes(1536)       → "1.5 KB"
 *   formatBytes(10485760)   → "10.0 MB"
 *   formatBytes(1073741824) → "1.0 GB"
 */
export function formatBytes(bytes: number): string {
  if (bytes < 0) {
    return '0 B'
  }
  if (bytes === 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  const base = 1024
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(base)), units.length - 1)
  const value = bytes / Math.pow(base, exponent)

  // Show 1 decimal place for KB+, integer for bytes
  const formatted = exponent === 0 ? Math.round(value).toString() : value.toFixed(1)

  return `${formatted} ${units[exponent]}`
}

/**
 * Format a download progress fraction into a percentage integer (0–100).
 *
 * Examples:
 *   formatProgress(0, 100)     → 0
 *   formatProgress(50, 100)    → 50
 *   formatProgress(100, 100)   → 100
 *   formatProgress(10, 0)      → 0   (guard against division by zero)
 */
export function formatProgress(downloaded: number, total: number): number {
  if (total <= 0 || downloaded < 0) {
    return 0
  }
  const pct = Math.round((downloaded / total) * 100)
  return Math.min(100, Math.max(0, pct))
}

/**
 * Status label for the updater state machine.
 * Used by AboutView to display a human-readable status text.
 */
export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'up-to-date'
  | 'update-available'
  | 'downloading'
  | 'ready-to-install'
  | 'installing'
  | 'error'

/**
 * Human-readable status message for each state.
 */
export function statusMessage(status: UpdateStatus): string {
  const messages: Record<UpdateStatus, string> = {
    'idle': '',
    'checking': 'Checking for updates...',
    'up-to-date': 'Up to Date',
    'update-available': 'Update Available',
    'downloading': 'Downloading...',
    'ready-to-install': 'Ready to Install',
    'installing': 'Installing...',
    'error': 'Update Error',
  }
  return messages[status]
}
