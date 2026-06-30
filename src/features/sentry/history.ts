/**
 * Sentry Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface SentryHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<SentryHistoryEntry> {
  return createMemoryHistory<SentryHistoryEntry>(capacity)
}
