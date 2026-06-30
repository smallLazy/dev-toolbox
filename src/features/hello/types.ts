/** Hello Plugin — Framework Validation Types */

export interface HelloPluginState {
  registered: boolean
  activated: boolean
  version: string
  loadedAt: number | null
  activatedAt: number | null
  registryCount: number
  commandCount: number
  shortcutCount: number
  historyEntries: number
}

export interface HelloValidationResult {
  check: string
  passed: boolean
  detail: string
}
