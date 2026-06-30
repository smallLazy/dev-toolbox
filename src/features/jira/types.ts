/** Jira Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface JiraConfig extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface JiraState {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
