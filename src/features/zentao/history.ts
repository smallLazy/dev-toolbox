/**
 * Zentao Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface ZentaoHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<ZentaoHistoryEntry> {
  return createMemoryHistory<ZentaoHistoryEntry>(capacity)
}
