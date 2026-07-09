/**
 * UUID Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { UuidConfig } from './types'

export const uuidSettingsSchema: SettingField[] = [
  {
    key: 'count',
    type: 'number' as const,
    label: 'Generate Count',
    description: 'Number of UUIDs to generate (1-100)',
    default: 1,
  },
]

export const defaults: UuidConfig = {
  count: 1,
}
