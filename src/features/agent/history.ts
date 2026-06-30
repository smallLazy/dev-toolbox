/**
 * Agent Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface AgentHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<AgentHistoryEntry> {
  return createMemoryHistory<AgentHistoryEntry>(capacity)
}
