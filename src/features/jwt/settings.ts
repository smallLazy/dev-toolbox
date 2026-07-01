/**
 * JWT Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { JwtConfig } from './types'

export const settingsSchema: SettingField[] = [
  {
    key: 'pretty',
    type: 'toggle' as const,
    label: 'Pretty Print',
    default: true,
  },
]

export const defaults: JwtConfig = {
  pretty: true,
}
