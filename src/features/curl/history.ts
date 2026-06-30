/**
 * Curl Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface CurlHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<CurlHistoryEntry> {
  return createMemoryHistory<CurlHistoryEntry>(capacity)
}
