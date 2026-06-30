/**
 * Websocket Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface WebsocketHistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<WebsocketHistoryEntry> {
  return createMemoryHistory<WebsocketHistoryEntry>(capacity)
}
