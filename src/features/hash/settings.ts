/**
 * Hash Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { HashConfig } from './types'

export const settingsSchema: SettingField[] = [
  {
    key: 'defaultAlgorithm',
    type: 'select' as const,
    label: 'Default Algorithm',
    default: 'md5',
  },
]

export const defaults: HashConfig = {
  algorithm: 'md5',
}
