/**
 * useUpdater — Manual Update v1 Composable
 *
 * State machine for the manual update flow:
 *   IDLE → CHECKING → UP_TO_DATE
 *                    → UPDATE_AVAILABLE → DOWNLOADING → READY_TO_INSTALL → INSTALLING
 *                    → ERROR
 *
 * Usage:
 *   const updater = useUpdater()
 *   await updater.checkForUpdates()   // triggered by "Check for Updates" button
 *   await updater.downloadUpdate()    // triggered by "Download Update" in dialog
 *   await updater.installAndRestart() // triggered by "Install & Restart" in dialog
 */

import { ref, type Ref } from 'vue'
import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { formatBytes, formatProgress, type UpdateStatus } from './logic'

export interface DownloadProgress {
  percentage: number
  downloadedBytes: number
  totalBytes: number
  downloadedFormatted: string
  totalFormatted: string
}

export interface UpdateState {
  status: UpdateStatus
  currentVersion: string
  latestVersion: string | null
  releaseNotes: string | null
  releaseDate: string | null
  downloadProgress: DownloadProgress | null
  error: string | null
}

/**
 * Resolve the current app version from build-time globals.
 * Falls back to '0.0.0' when running outside Tauri (dev/browser).
 */
function resolveCurrentVersion(): string {
  try {
    return (globalThis as any).__APP_VERSION__ ?? '0.0.0'
  } catch {
    return '0.0.0'
  }
}

export function useUpdater() {
  const state: Ref<UpdateState> = ref<UpdateState>({
    status: 'idle',
    currentVersion: resolveCurrentVersion(),
    latestVersion: null,
    releaseNotes: null,
    releaseDate: null,
    downloadProgress: null,
    error: null,
  })

  /** Holds the Update object returned by check() so we can download/install it later. */
  let pendingUpdate: Awaited<ReturnType<typeof check>> = null

  /** ── Check for Updates ──────────────────────────────────────────────── */
  async function checkForUpdates(): Promise<void> {
    state.value = {
      ...state.value,
      status: 'checking',
      latestVersion: null,
      releaseNotes: null,
      releaseDate: null,
      downloadProgress: null,
      error: null,
    }

    try {
      const update = await check()
      pendingUpdate = update

      if (!update) {
        state.value = { ...state.value, status: 'up-to-date' }
        // Auto-dismiss "Up to Date" status after 5 seconds
        setTimeout(() => {
          if (state.value.status === 'up-to-date') {
            state.value = { ...state.value, status: 'idle' }
          }
        }, 5000)
        return
      }

      state.value = {
        ...state.value,
        status: 'update-available',
        latestVersion: update.version ?? null,
        releaseNotes: update.body ?? null,
        releaseDate: update.date ?? null,
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to check for updates'
      state.value = { ...state.value, status: 'error', error: message }
    }
  }

  /** ── Download Update ────────────────────────────────────────────────── */
  async function downloadUpdate(): Promise<void> {
    if (!pendingUpdate) {
      state.value = {
        ...state.value,
        status: 'error',
        error: 'No update available to download',
      }
      return
    }

    state.value = {
      ...state.value,
      status: 'downloading',
      downloadProgress: {
        percentage: 0,
        downloadedBytes: 0,
        totalBytes: 0,
        downloadedFormatted: '0 B',
        totalFormatted: '0 B',
      },
      error: null,
    }

    try {
      // Track the total for percentage calculation
      let totalBytes = 0

      await pendingUpdate.download((event) => {
        switch (event.event) {
          case 'Started':
            totalBytes = event.data.contentLength ?? 0
            state.value = {
              ...state.value,
              downloadProgress: {
                percentage: 0,
                downloadedBytes: 0,
                totalBytes,
                downloadedFormatted: '0 B',
                totalFormatted: formatBytes(totalBytes),
              },
            }
            break

          case 'Progress':
            // chunkLength is the cumulative total downloaded so far
            // (per Tauri v2 updater plugin spec)
            const downloaded = event.data.chunkLength
            state.value = {
              ...state.value,
              downloadProgress: {
                percentage: formatProgress(downloaded, totalBytes),
                downloadedBytes: downloaded,
                totalBytes,
                downloadedFormatted: formatBytes(downloaded),
                totalFormatted: formatBytes(totalBytes),
              },
            }
            break

          case 'Finished':
            // Download done → ready to install
            break
        }
      })

      state.value = { ...state.value, status: 'ready-to-install' }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to download update'
      state.value = { ...state.value, status: 'error', error: message }
    }
  }

  /** ── Install & Restart ──────────────────────────────────────────────── */
  async function installAndRestart(): Promise<void> {
    if (!pendingUpdate) {
      state.value = {
        ...state.value,
        status: 'error',
        error: 'No update available to install',
      }
      return
    }

    state.value = { ...state.value, status: 'installing', error: null }

    try {
      await pendingUpdate.install()
      await relaunch()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to install update'
      state.value = { ...state.value, status: 'error', error: message }
    }
  }

  /** ── Dismiss Update Dialog ───────────────────────────────────────────── */
  function dismissUpdate(): void {
    pendingUpdate = null
    state.value = {
      status: 'idle',
      currentVersion: resolveCurrentVersion(),
      latestVersion: null,
      releaseNotes: null,
      releaseDate: null,
      downloadProgress: null,
      error: null,
    }
  }

  return {
    state,
    checkForUpdates,
    downloadUpdate,
    installAndRestart,
    dismissUpdate,
  }
}
