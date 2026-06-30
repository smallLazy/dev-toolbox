/**
 * Review Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface ReviewHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<ReviewHistoryEntry> {
  return createMemoryHistory<ReviewHistoryEntry>(capacity)
}
