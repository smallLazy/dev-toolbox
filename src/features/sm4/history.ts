/**
 * Sm4 Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface Sm4HistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<Sm4HistoryEntry> {
  return createMemoryHistory<Sm4HistoryEntry>(capacity)
}
