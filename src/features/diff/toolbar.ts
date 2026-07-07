/**
 * Diff Plugin — Toolbar Configuration
 */

import { createFeatureToolbar, type FeatureToolbar } from '@/sdk/feature'

export function createToolbar(handlers: {
  onCopy: () => void
  onClear: () => void
}): FeatureToolbar {
  return createFeatureToolbar({
    copy: handlers.onCopy,
    clear: handlers.onClear,
    // swap is intentionally omitted: diff output cannot be used as input
  })
}
