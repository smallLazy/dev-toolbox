/**
 * Hash Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'
import type { HashConfig } from './types'

export interface HashHistoryEntry {
  input: string
  output: string | null
  config: HashConfig
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<HashHistoryEntry> {
  return createMemoryHistory<HashHistoryEntry>(capacity)
}
