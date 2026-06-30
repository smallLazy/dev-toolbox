/**
 * Rsa Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { RsaConfig } from './types'

export const settingsSchema: SettingField[] = [
    {
      key: 'mode',
      type: 'select' as const,
      label: '默认模式',
      default: "encrypt",
    },
    {
      key: 'inputEncoding',
      type: 'select' as const,
      label: '输入编码',
      default: "utf8",
    },
    {
      key: 'outputEncoding',
      type: 'select' as const,
      label: '输出编码',
      default: "base64",
    },
]

export const defaults: RsaConfig = {
  mode: "encrypt",
  inputEncoding: "utf8",
  outputEncoding: "base64",
}
