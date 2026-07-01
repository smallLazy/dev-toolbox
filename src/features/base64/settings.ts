/**
 * Base64 Plugin — Settings Schema
 *
 * v1.0: Only defaultMode is exposed.
 * Future: defaultVariant (select), lineWrap (toggle) — deferred to P2.
 */

import type { SettingField } from '@/sdk/feature'
import type { Base64Config } from './types'

export const settingsSchema: SettingField[] = [
  {
    key: 'defaultMode',
    type: 'select' as const,
    label: 'Default Mode',
    default: 'encode',
  },
  {
    key: 'defaultPadding',
    type: 'select' as const,
    label: 'Default Padding',
    default: 'standard',
    options: ['standard', 'none'],
  },
]

export const defaults: Base64Config = {
  mode: 'encode',
  padding: 'standard',
}
