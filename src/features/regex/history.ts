/**
 * Regex Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface RegexHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<RegexHistoryEntry> {
  return createMemoryHistory<RegexHistoryEntry>(capacity)
}
