/**
 * useUpdater — Composable Tests
 *
 * Tests for the updater state machine composable.
 * Mocks @tauri-apps/plugin-updater and @tauri-apps/plugin-process.
 *
 * Covered:
 *   - Initial state is idle
 *   - checkForUpdates: no update → up-to-date
 *   - checkForUpdates: update available → update-available with metadata
 *   - checkForUpdates: error → error state
 *   - downloadUpdate: transitions through downloading → ready-to-install
 *   - downloadUpdate: error → error state
 *   - installAndRestart: transitions to installing
 *   - dismissUpdate: resets to idle
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useUpdater } from '../useUpdater'

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockCheck = vi.fn()
const mockRelaunch = vi.fn()
let mockDownloadHandler: ((event: any) => void) | null = null

vi.mock('@tauri-apps/plugin-updater', () => ({
  check: () => mockCheck(),
}))

vi.mock('@tauri-apps/plugin-process', () => ({
  relaunch: () => mockRelaunch(),
}))

// Seed the __APP_VERSION__ global used by resolveCurrentVersion
;(globalThis as any).__APP_VERSION__ = '0.1.0-beta.2'

// ── Helpers ────────────────────────────────────────────────────────────────

function createMockUpdate(overrides: Record<string, unknown> = {}) {
  const update: any = {
    version: '0.1.0-beta.3',
    body: 'Fixed several bugs.\nImproved performance.',
    date: '2026-07-06T12:00:00Z',
    download: vi.fn((handler) => {
      mockDownloadHandler = handler
      return new Promise<void>((resolve) => {
        // Store resolve on the update object so tests can trigger completion
        update._downloadResolve = resolve
      })
    }),
    install: vi.fn(() => Promise.resolve()),
    ...overrides,
  }
  return update
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('useUpdater', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDownloadHandler = null
  })

  // ── Initial State ──────────────────────────────────────────────────────

  it('initializes with idle status and current version', () => {
    const { state } = useUpdater()

    expect(state.value.status).toBe('idle')
    expect(state.value.currentVersion).toBe('0.1.0-beta.2')
    expect(state.value.latestVersion).toBeNull()
    expect(state.value.error).toBeNull()
    expect(state.value.downloadProgress).toBeNull()
  })

  // ── checkForUpdates: No Update ─────────────────────────────────────────

  it('transitions to up-to-date when no update is available', async () => {
    mockCheck.mockResolvedValue(null)

    const { state, checkForUpdates } = useUpdater()
    await checkForUpdates()

    expect(state.value.status).toBe('up-to-date')
    expect(state.value.latestVersion).toBeNull()
  })

  // ── checkForUpdates: Update Available ──────────────────────────────────

  it('transitions to update-available when an update is found', async () => {
    const mockUpdate = createMockUpdate()
    mockCheck.mockResolvedValue(mockUpdate)

    const { state, checkForUpdates } = useUpdater()
    await checkForUpdates()

    expect(state.value.status).toBe('update-available')
    expect(state.value.latestVersion).toBe('0.1.0-beta.3')
    expect(state.value.releaseNotes).toBe('Fixed several bugs.\nImproved performance.')
    expect(state.value.releaseDate).toBe('2026-07-06T12:00:00Z')
  })

  // ── checkForUpdates: Error ─────────────────────────────────────────────

  it('transitions to error when check fails', async () => {
    mockCheck.mockRejectedValue(new Error('Network error'))

    const { state, checkForUpdates } = useUpdater()
    await checkForUpdates()

    expect(state.value.status).toBe('error')
    expect(state.value.error).toBe('Network error')
  })

  it('handles non-Error exceptions during check', async () => {
    mockCheck.mockRejectedValue('unknown failure')

    const { state, checkForUpdates } = useUpdater()
    await checkForUpdates()

    expect(state.value.status).toBe('error')
    expect(state.value.error).toBe('Failed to check for updates')
  })

  // ── checkForUpdates: Timeout ─────────────────────────────────────────────

  it('transitions to error when check hangs and timeout fires', async () => {
    vi.useFakeTimers()

    // Simulate a network hang — check() never settles
    mockCheck.mockReturnValue(new Promise(() => {}))

    const { state, checkForUpdates } = useUpdater()

    // Don't await — we need to inspect state while it's pending
    const promise = checkForUpdates()

    // Verify we entered the checking state
    expect(state.value.status).toBe('checking')

    // Advance past the 15s timeout
    await vi.advanceTimersByTimeAsync(16_000)
    await promise

    expect(state.value.status).toBe('error')
    expect(state.value.error).toBe(
      'Unable to check for updates. Please check your network connection.',
    )

    vi.useRealTimers()
  })

  it('releases checking state in finally block after timeout', async () => {
    vi.useFakeTimers()

    mockCheck.mockReturnValue(new Promise(() => {}))

    const { state, checkForUpdates } = useUpdater()

    const promise = checkForUpdates()
    expect(state.value.status).toBe('checking')

    await vi.advanceTimersByTimeAsync(16_000)
    await promise

    // The finally block guarantees we are no longer in checking state
    expect(state.value.status).not.toBe('checking')
    expect(state.value.status).toBe('error')

    vi.useRealTimers()
  })

  // ── downloadUpdate: Success ────────────────────────────────────────────

  it('transitions through downloading to ready-to-install', async () => {
    const mockUpdate = createMockUpdate()
    mockCheck.mockResolvedValue(mockUpdate)

    const { state, checkForUpdates, downloadUpdate } = useUpdater()
    await checkForUpdates()
    expect(state.value.status).toBe('update-available')

    // Start download
    const downloadPromise = downloadUpdate()
    expect(state.value.status).toBe('downloading')

    // Simulate 'Started' event
    mockDownloadHandler!({ event: 'Started', data: { contentLength: 10485760 } })
    expect(state.value.downloadProgress?.totalBytes).toBe(10485760)
    expect(state.value.downloadProgress?.totalFormatted).toBe('10.0 MB')

    // Simulate 'Progress' event at 50%
    mockDownloadHandler!({ event: 'Progress', data: { chunkLength: 5242880 } })
    expect(state.value.downloadProgress?.percentage).toBe(50)
    expect(state.value.downloadProgress?.downloadedFormatted).toBe('5.0 MB')

    // Resolve the download
    mockUpdate._downloadResolve()
    await downloadPromise

    expect(state.value.status).toBe('ready-to-install')
  })

  it('handles download progress events after Started event', async () => {
    const mockUpdate = createMockUpdate()
    mockCheck.mockResolvedValue(mockUpdate)

    const { state, checkForUpdates, downloadUpdate } = useUpdater()
    await checkForUpdates()

    const downloadPromise = downloadUpdate()

    // Started event provides total size
    mockDownloadHandler!({
      event: 'Started',
      data: { contentLength: 10485760 },
    })
    expect(state.value.downloadProgress?.totalBytes).toBe(10485760)

    // Progress event provides cumulative downloaded bytes
    mockDownloadHandler!({
      event: 'Progress',
      data: { chunkLength: 3145728 },
    })
    expect(state.value.downloadProgress?.percentage).toBe(30)
    expect(state.value.downloadProgress?.downloadedFormatted).toBe('3.0 MB')

    mockUpdate._downloadResolve()
    await downloadPromise
  })

  // ── downloadUpdate: Error ──────────────────────────────────────────────

  it('transitions to error when download is called without pending update', async () => {
    const { state, downloadUpdate } = useUpdater()
    await downloadUpdate()

    expect(state.value.status).toBe('error')
    expect(state.value.error).toBe('No update available to download')
  })

  it('transitions to error when download fails', async () => {
    const mockUpdate = createMockUpdate({
      download: vi.fn(() => Promise.reject(new Error('Download failed'))),
    })
    mockCheck.mockResolvedValue(mockUpdate)

    const { state, checkForUpdates, downloadUpdate } = useUpdater()
    await checkForUpdates()
    await downloadUpdate()

    expect(state.value.status).toBe('error')
    expect(state.value.error).toBe('Download failed')
  })

  // ── installAndRestart ──────────────────────────────────────────────────

  it('transitions to installing and calls install + relaunch', async () => {
    const mockUpdate = createMockUpdate()
    mockCheck.mockResolvedValue(mockUpdate)

    const { state, checkForUpdates, installAndRestart } = useUpdater()
    await checkForUpdates()

    await installAndRestart()

    expect(state.value.status).toBe('installing')
    expect(mockUpdate.install).toHaveBeenCalledOnce()
    expect(mockRelaunch).toHaveBeenCalledOnce()
  })

  it('transitions to error when install is called without pending update', async () => {
    const { state, installAndRestart } = useUpdater()
    await installAndRestart()

    expect(state.value.status).toBe('error')
    expect(state.value.error).toBe('No update available to install')
  })

  it('transitions to error when install fails', async () => {
    const mockUpdate = createMockUpdate({
      install: vi.fn(() => Promise.reject(new Error('Install failed'))),
    })
    mockCheck.mockResolvedValue(mockUpdate)

    const { state, checkForUpdates, installAndRestart } = useUpdater()
    await checkForUpdates()
    await installAndRestart()

    expect(state.value.status).toBe('error')
    expect(state.value.error).toBe('Install failed')
    expect(mockRelaunch).not.toHaveBeenCalled()
  })

  // ── dismissUpdate ──────────────────────────────────────────────────────

  it('resets to idle when dismissed', () => {
    const { state, dismissUpdate } = useUpdater()

    // Set some non-idle state first
    state.value = {
      ...state.value,
      status: 'update-available',
      latestVersion: '0.1.0-beta.3',
      releaseNotes: 'notes',
      releaseDate: '2026-07-06',
      error: null,
    }

    dismissUpdate()

    expect(state.value.status).toBe('idle')
    expect(state.value.latestVersion).toBeNull()
    expect(state.value.releaseNotes).toBeNull()
    expect(state.value.releaseDate).toBeNull()
    expect(state.value.downloadProgress).toBeNull()
    expect(state.value.error).toBeNull()
  })
})
