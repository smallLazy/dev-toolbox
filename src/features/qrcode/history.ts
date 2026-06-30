/**
 * Qrcode Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface QrcodeHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<QrcodeHistoryEntry> {
  return createMemoryHistory<QrcodeHistoryEntry>(capacity)
}
