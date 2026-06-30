/**
 * Xml Plugin — Toolbar Configuration
 */

import { createFeatureToolbar, type FeatureToolbar } from '@/sdk/feature'

export function createToolbar(handlers: {
  onCopy: () => void
  onClear: () => void
  onSwap: () => void
}): FeatureToolbar {
  return createFeatureToolbar({
    copy: handlers.onCopy,
    clear: handlers.onClear,
    swap: handlers.onSwap,
  })
}
