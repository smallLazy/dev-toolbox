// @ts-nocheck
/**
 * HtmlEncode Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { HtmlEncodeConfig } from './types'

export const settingsSchema: SettingField[] = [
    {
      key: 'mode',
      type: 'select' as const,
      label: 'Default Mode',
      default: "encrypt",
    },
    {
      key: 'inputEncoding',
      type: 'select' as const,
      label: 'Input Encoding',
      default: "utf8",
    },
    {
      key: 'outputEncoding',
      type: 'select' as const,
      label: 'Output Encoding',
      default: "base64",
    },
]

export const defaults: HtmlEncodeConfig = {
  mode: "encrypt",
  inputEncoding: "utf8",
  outputEncoding: "base64",
}
