/**
 * Diff Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { DiffConfig } from './types'

export const settingsSchema: SettingField[] = [
  {
    key: 'contextLines',
    type: 'select' as const,
    label: 'Context Lines',
    default: 3,
  },
  {
    key: 'ignoreWhitespace',
    type: 'toggle' as const,
    label: 'Ignore Whitespace',
    default: false,
  },
  {
    key: 'ignoreCase',
    type: 'toggle' as const,
    label: 'Ignore Case',
    default: false,
  },
  {
    key: 'ignoreLineOrder',
    type: 'toggle' as const,
    label: 'Ignore Line Order',
    default: false,
  },
]

export const defaults: DiffConfig = {
  contextLines: 3,
  ignoreWhitespace: false,
  ignoreCase: false,
  ignoreLineOrder: false,
  rightText: '',
}
