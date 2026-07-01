/**
 * SQL Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { SqlConfig } from './types'

export const settingsSchema: SettingField[] = [
  {
    key: 'defaultMode',
    type: 'select' as const,
    label: 'Default Mode',
    default: 'in-builder',
  },
]

export const defaultInConfig = {
  valueType: 'string' as const,
  lineMode: 'single' as const,
  wrapWithParentheses: true,
  dedupe: false,
}

export const defaults: SqlConfig = {
  mode: 'in-builder',
  inConfig: { ...defaultInConfig },
}
