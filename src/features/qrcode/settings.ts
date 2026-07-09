/**
 * QR Code Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { QrcodeConfig } from './types'

export const qrcodeSettingsSchema: SettingField[] = [
  {
    key: 'size',
    type: 'select' as const,
    label: 'Size',
    description: 'QR code image size in pixels',
    options: ['128', '256', '512', '1024'],
    default: 256,
  },
  {
    key: 'errorCorrectionLevel',
    type: 'select' as const,
    label: 'Error Correction',
    description: 'Higher levels allow more damage to the code',
    options: ['L', 'M', 'Q', 'H'],
    default: 'M',
  },
  {
    key: 'margin',
    type: 'number' as const,
    label: 'Margin',
    description: 'White border around the QR code (0-8)',
    default: 4,
  },
]

export const defaults: QrcodeConfig = {
  size: 256,
  margin: 4,
  errorCorrectionLevel: 'M',
}
