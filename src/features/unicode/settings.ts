/**
 * Unicode Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { UnicodeConfig } from './types'

export const settingsSchema: SettingField[] = [
  {
    key: 'defaultMode',
    type: 'select' as const,
    label: 'Default Mode',
    default: 'encode',
  },
  {
    key: 'defaultVariant',
    type: 'select' as const,
    label: 'Default Variant',
    default: 'javascript',
  },
]

export const defaults: UnicodeConfig = {
  mode: 'encode',
  variant: 'javascript',
}
