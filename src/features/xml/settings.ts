/**
 * XML Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { XmlConfig } from './types'

export const xmlSettingsSchema: SettingField[] = [
  {
    key: 'indentSize',
    type: 'select' as const,
    label: 'Indent Size',
    description: 'Indentation for formatted XML output',
    options: ['2', '4', 'tab'],
    default: 2,
  },
]

export const defaults: XmlConfig = {
  indentSize: 2,
}
