/** Websocket Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface WebsocketConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface WebsocketState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
