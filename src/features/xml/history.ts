/**
 * Xml Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface XmlHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<XmlHistoryEntry> {
  return createMemoryHistory<XmlHistoryEntry>(capacity)
}
