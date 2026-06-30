/**
 * Qrcode Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { QrcodeConfig } from './types'

export const settingsSchema: SettingField[] = [
    {
      key: 'autoPreview',
      type: 'toggle' as const,
      label: '自动预览',
      default: true,
    },
]

export const defaults: QrcodeConfig = {
  autoPreview: true,
}
