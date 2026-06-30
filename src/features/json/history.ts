/**
 * JSON Plugin — History Configuration
 *
 * Uses FeatureHistory from SDK — no custom history code.
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface JsonHistoryEntry {
  input: string
  output: string | null
  mode: string
  timestamp: number
  inputSize: number
  outputSize: number | null
}

export function createJsonHistory(capacity = 20): FeatureHistory<JsonHistoryEntry> {
  return createMemoryHistory<JsonHistoryEntry>(capacity)
}
