/**
 * Build Information Module
 *
 * Exposes build-time metadata generated automatically during the build process.
 * All values come from Vite `define` globals — no hardcoded values.
 *
 * Usage:
 *   import { buildInfo, appVersion, gitHash } from '@/core/build-info'
 */

// ── Types ────────────────────────────────────────────────────────────────

export interface BuildInfo {
  /** Application version from package.json */
  version: string
  /** Short git commit hash */
  gitHash: string
  /** Git branch name */
  gitBranch: string
  /** ISO 8601 build timestamp */
  buildTime: string
  /** Build mode: 'development' | 'release' */
  buildMode: 'development' | 'release'
  /** CPU architecture: 'arm64' | 'x64' | etc. */
  arch: string
  /** Tauri version from Cargo.toml */
  tauriVersion: string
  /** Vue version from package.json */
  vueVersion: string
  /** Rust compiler version */
  rustVersion: string
}

// ── Build-Time Globals (injected by Vite define) ────────────────────────

/** Application version (from package.json) */
export const appVersion: string = __APP_VERSION__

/** Short git commit hash */
export const gitHash: string = __GIT_HASH__

/** Git branch name */
export const gitBranch: string = __GIT_BRANCH__

/** ISO 8601 build timestamp */
export const buildTime: string = __BUILD_TIME__

/** Build mode */
export const buildMode: 'development' | 'release' = __BUILD_MODE__ as 'development' | 'release'

/** CPU architecture at build time */
export const arch: string = __BUILD_ARCH__

/** Tauri version (from Cargo.toml) */
export const tauriVersion: string = __TAURI_VERSION__

/** Vue version (from package.json dependencies) */
export const vueVersion: string = __VUE_VERSION__

/** Rust compiler version */
export const rustVersion: string = __RUST_VERSION__

// ── Runtime Detection ────────────────────────────────────────────────────

/**
 * Detect the current platform from the user agent.
 * Returns 'macOS', 'Windows', 'Linux', or 'Unknown'.
 */
export function detectPlatform(): string {
  const ua = navigator.userAgent
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('Win')) return 'Windows'
  if (ua.includes('Linux')) return 'Linux'
  return navigator.platform ?? 'Unknown'
}

/**
 * Human-readable architecture label.
 */
export function archLabel(): string {
  if (arch === 'arm64') return 'ARM64 (Apple Silicon)'
  if (arch === 'x64') return 'x86_64 (Intel)'
  return arch
}

// ── Computed ─────────────────────────────────────────────────────────────

/** Formatted build time string (locale-aware) */
export function formattedBuildTime(): string {
  try {
    return new Date(buildTime).toLocaleString()
  } catch {
    return buildTime
  }
}

/** Build number in YYMMDD.HHmm format */
export function buildNumber(): string {
  try {
    const d = new Date(buildTime)
    const yy = d.getFullYear().toString().slice(2)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mi = String(d.getMinutes()).padStart(2, '0')
    return `${yy}${mm}${dd}.${hh}${mi}`
  } catch {
    return 'unknown'
  }
}

/** Aggregate all build info into a single object */
export const buildInfo: BuildInfo = {
  version: appVersion,
  gitHash,
  gitBranch,
  buildTime,
  buildMode,
  arch,
  tauriVersion,
  vueVersion,
  rustVersion,
}
