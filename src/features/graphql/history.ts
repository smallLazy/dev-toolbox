/**
 * Graphql Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface GraphqlHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<GraphqlHistoryEntry> {
  return createMemoryHistory<GraphqlHistoryEntry>(capacity)
}
