/**
 * Yaml Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface YamlHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<YamlHistoryEntry> {
  return createMemoryHistory<YamlHistoryEntry>(capacity)
}
