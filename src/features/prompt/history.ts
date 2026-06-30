/**
 * Prompt Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface PromptHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<PromptHistoryEntry> {
  return createMemoryHistory<PromptHistoryEntry>(capacity)
}
