// @ts-nocheck
/**
 * Color Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { ColorConfig } from './types'

export const settingsSchema: SettingField[] = [
    {
      key: 'defaultDirection',
      type: 'select' as const,
      label: 'Default Direction',
      default: "forward",
    },
]

export const defaults: ColorConfig = {
  defaultDirection: "forward",
}
