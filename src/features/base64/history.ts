/**
 * Base64 Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'
import type { Base64Config } from './types'

export interface Base64HistoryEntry {
  input: string
  output: string | null
  config: Base64Config
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<Base64HistoryEntry> {
  return createMemoryHistory<Base64HistoryEntry>(capacity)
}
