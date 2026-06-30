/**
 * Uuid Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface UuidHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<UuidHistoryEntry> {
  return createMemoryHistory<UuidHistoryEntry>(capacity)
}
