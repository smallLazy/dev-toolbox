/**
 * URL Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'
import type { UrlConfig } from './types'

export interface UrlHistoryEntry {
  input: string
  output: string | null
  config: UrlConfig
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<UrlHistoryEntry> {
  return createMemoryHistory<UrlHistoryEntry>(capacity)
}
