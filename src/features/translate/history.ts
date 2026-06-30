/**
 * Translate Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface TranslateHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<TranslateHistoryEntry> {
  return createMemoryHistory<TranslateHistoryEntry>(capacity)
}
