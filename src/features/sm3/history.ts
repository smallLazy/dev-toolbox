/**
 * Sm3 Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface Sm3HistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<Sm3HistoryEntry> {
  return createMemoryHistory<Sm3HistoryEntry>(capacity)
}
