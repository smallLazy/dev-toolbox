/**
 * RequestDecoder Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface RequestDecoderHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<RequestDecoderHistoryEntry> {
  return createMemoryHistory<RequestDecoderHistoryEntry>(capacity)
}
