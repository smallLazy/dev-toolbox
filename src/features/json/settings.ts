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
    label: 'Indent Size',
    description: 'Number of spaces for JSON indentation',
    options: ['2', '4'],
    default: 2,
  },
  {
    key: 'sortKeys',
    type: 'toggle',
    label: 'Sort Keys',
    description: 'Sort JSON keys alphabetically when formatting',
    default: false,
  },
  {
    key: 'autoFormatOnPaste',
    type: 'toggle',
    label: 'Auto-format on Paste',
    description: 'Automatically format JSON when pasted',
    default: true,
  },
  {
    key: 'themeFollowWorkspace',
    type: 'toggle',
    label: 'Follow Workspace Theme',
    description: 'Match editor theme to workspace light/dark setting',
    default: true,
  },
]

export const jsonDefaults: JsonConfig = {
  indentSize: 2,
  sortKeys: false,
  autoFormatOnPaste: true,
  themeFollowWorkspace: true,
}
