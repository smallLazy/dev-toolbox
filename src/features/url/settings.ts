/**
 * URL Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { UrlConfig } from './types'

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
    default: 'component',
    options: ['component', 'uri', 'php'],
  },
]

export const defaults: UrlConfig = {
  mode: 'encode',
  variant: 'component',
}
