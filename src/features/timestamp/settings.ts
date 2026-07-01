/**
 * Timestamp Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { TimestampConfig } from './types'

export const settingsSchema: SettingField[] = [
  {
    key: 'defaultMode',
    type: 'select' as const,
    label: 'Default Mode',
    default: 'timestamp-to-date',
  },
]

export const defaults: TimestampConfig = {
  mode: 'timestamp-to-date',
}
