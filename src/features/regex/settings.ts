// @ts-nocheck
/**
 * Regex Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { RegexConfig } from './types'

export const settingsSchema: SettingField[] = [
    {
      key: 'autoParse',
      type: 'toggle' as const,
      label: 'Auto-parse on Paste',
      default: true,
    },
]

export const defaults: RegexConfig = {
  autoParse: true,
}
