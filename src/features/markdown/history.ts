/**
 * Markdown Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface MarkdownHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<MarkdownHistoryEntry> {
  return createMemoryHistory<MarkdownHistoryEntry>(capacity)
}
