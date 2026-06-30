/**
 * Markdown Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { MarkdownConfig } from './types'

export const settingsSchema: SettingField[] = [
    {
      key: 'indentSize',
      type: 'select' as const,
      label: '缩进',
      default: 2,
    },
    {
      key: 'autoFormat',
      type: 'toggle' as const,
      label: '自动格式化',
      default: true,
    },
]

export const defaults: MarkdownConfig = {
  indentSize: 2,
  autoFormat: true,
}
