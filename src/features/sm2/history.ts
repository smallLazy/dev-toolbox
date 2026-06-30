/**
 * Sm2 Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface Sm2HistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<Sm2HistoryEntry> {
  return createMemoryHistory<Sm2HistoryEntry>(capacity)
}
