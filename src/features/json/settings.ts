/**
 * JSON Plugin — Settings Schema
 *
 * Auto-generates settings UI via FeatureSettings.
 */

import type { SettingField } from '@/sdk/feature'
import type { JsonConfig } from './types'

export const jsonSettingsSchema: SettingField[] = [
  {
    key: 'indentSize',
    type: 'select',
    label: '缩进空格数',
    description: 'JSON 格式化时使用的缩进空格数',
    options: ['2', '4'],
    default: 2,
  },
  {
    key: 'sortKeys',
    type: 'toggle',
    label: '按键排序',
    description: '格式化时按字母顺序排列 JSON key',
    default: false,
  },
  {
    key: 'autoFormatOnPaste',
    type: 'toggle',
    label: '粘贴自动格式化',
    description: '粘贴 JSON 时自动格式化',
    default: true,
  },
  {
    key: 'themeFollowWorkspace',
    type: 'toggle',
    label: '跟随 Workspace 主题',
    description: '编辑器主题跟随 Workspace 明暗设置',
    default: true,
  },
]

export const jsonDefaults: JsonConfig = {
  indentSize: 2,
  sortKeys: false,
  autoFormatOnPaste: true,
  themeFollowWorkspace: true,
}
