// @ts-nocheck
/**
 * Diff Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { DiffConfig } from './types'

export const settingsSchema: SettingField[] = [
    {
      key: 'indentSize',
      type: 'select' as const,
      label: 'Indent Size',
      default: 2,
    },
    {
      key: 'autoFormat',
      type: 'toggle' as const,
      label: 'Auto Format',
      default: true,
    },
]

export const defaults: DiffConfig = {
  indentSize: 2,
  autoFormat: true,
}
