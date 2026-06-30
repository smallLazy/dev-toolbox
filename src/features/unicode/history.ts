/**
 * Unicode Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface UnicodeHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<UnicodeHistoryEntry> {
  return createMemoryHistory<UnicodeHistoryEntry>(capacity)
}
