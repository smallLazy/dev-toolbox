/**
 * Github Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface GithubHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<GithubHistoryEntry> {
  return createMemoryHistory<GithubHistoryEntry>(capacity)
}
