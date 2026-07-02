/**
 * JSON Plugin — Toolbar Configuration
 *
 * Uses FeatureToolbar from SDK — no custom toolbar code.
 * v1 scope: copy, clear, swap only (matching URL/Base64).
 */

import { createFeatureToolbar, type FeatureToolbar } from '@/sdk/feature'

export function createJsonToolbar(handlers: {
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
