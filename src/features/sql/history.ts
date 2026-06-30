/**
 * Sql Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface SqlHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<SqlHistoryEntry> {
  return createMemoryHistory<SqlHistoryEntry>(capacity)
}
