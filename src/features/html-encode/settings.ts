/**
 * HtmlEncode Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { HtmlEncodeConfig } from './types'

export const settingsSchema: SettingField[] = [
  {
    key: 'mode',
    type: 'select' as const,
    label: 'Default Mode',
    default: 'encode',
  },
]

export const defaults: HtmlEncodeConfig = {
  mode: 'encode',
}
