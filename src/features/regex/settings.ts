/**
 * Regex Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { RegexConfig } from './types'

export const settingsSchema: SettingField[] = [
    {
      key: 'autoParse',
      type: 'toggle' as const,
      label: '粘贴自动解析',
      default: true,
    },
]

export const defaults: RegexConfig = {
  autoParse: true,
}
