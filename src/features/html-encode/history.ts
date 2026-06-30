/**
 * HtmlEncode Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface HtmlEncodeHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<HtmlEncodeHistoryEntry> {
  return createMemoryHistory<HtmlEncodeHistoryEntry>(capacity)
}
