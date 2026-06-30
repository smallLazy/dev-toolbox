/**
 * Uuid Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { UuidConfig } from './types'

export const settingsSchema: SettingField[] = [
    {
      key: 'defaultDirection',
      type: 'select' as const,
      label: '默认方向',
      default: "forward",
    },
]

export const defaults: UuidConfig = {
  defaultDirection: "forward",
}
