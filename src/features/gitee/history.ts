/**
 * Gitee Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface GiteeHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<GiteeHistoryEntry> {
  return createMemoryHistory<GiteeHistoryEntry>(capacity)
}
