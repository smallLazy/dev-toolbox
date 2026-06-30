/**
 * Color Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface ColorHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<ColorHistoryEntry> {
  return createMemoryHistory<ColorHistoryEntry>(capacity)
}
