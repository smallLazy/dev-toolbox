/**
 * JSON Plugin — Toolbar Configuration
 *
 * Uses FeatureToolbar from SDK — no custom toolbar code.
 */

import { createFeatureToolbar, type FeatureToolbar } from '@/sdk/feature'

export function createJsonToolbar(handlers: {
  onCopyOutput: () => void
  onCopyInput: () => void
  onPaste: () => void
  onClear: () => void
  onSwap: () => void
  onExport: () => void
  onImport: () => void
}): FeatureToolbar {
  return createFeatureToolbar({
    copy: handlers.onCopyOutput,
    paste: handlers.onPaste,
    clear: handlers.onClear,
    swap: handlers.onSwap,
    export: handlers.onExport,
    import: handlers.onImport,
  })
}
