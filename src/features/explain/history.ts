/**
 * Explain Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface ExplainHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<ExplainHistoryEntry> {
  return createMemoryHistory<ExplainHistoryEntry>(capacity)
}
