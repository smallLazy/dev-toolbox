/**
 * Agent Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { AgentConfig } from './types'

export const settingsSchema: SettingField[] = [
    {
      key: 'model',
      type: 'select' as const,
      label: '模型',
      default: "default",
    },
    {
      key: 'temperature',
      type: 'number' as const,
      label: 'Temperature',
      default: 0.7,
    },
]

export const defaults: AgentConfig = {
  model: "default",
  temperature: 0.7,
}
