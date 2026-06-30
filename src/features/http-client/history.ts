/**
 * HttpClient Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface HttpClientHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<HttpClientHistoryEntry> {
  return createMemoryHistory<HttpClientHistoryEntry>(capacity)
}
