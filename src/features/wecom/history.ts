/**
 * Wecom Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface WecomHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<WecomHistoryEntry> {
  return createMemoryHistory<WecomHistoryEntry>(capacity)
}
