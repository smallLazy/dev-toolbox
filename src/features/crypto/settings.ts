/**
 * Crypto (AES) Plugin — Settings Schema & Defaults
 */

import type { SettingField } from '@/sdk/feature'
import type { CryptoConfig, CryptoInConfig } from './types'

export const settingsSchema: SettingField[] = [
  {
    key: 'algorithm',
    type: 'select' as const,
    label: 'Algorithm',
    default: 'aes-256-cbc',
  },
  {
    key: 'keyEncoding',
    type: 'select' as const,
    label: 'Key Encoding',
    default: 'utf8',
  },
  {
    key: 'ivEncoding',
    type: 'select' as const,
    label: 'IV Encoding',
    default: 'utf8',
  },
  {
    key: 'inputEncoding',
    type: 'select' as const,
    label: 'Input Encoding',
    default: 'utf8',
  },
  {
    key: 'outputEncoding',
    type: 'select' as const,
    label: 'Output Encoding',
    default: 'base64',
  },
]

export const defaultInConfig: CryptoInConfig = {
  algorithm: 'aes-256-cbc',
  keyEncoding: 'utf8',
  ivEncoding: 'utf8',
  inputEncoding: 'utf8',
  outputEncoding: 'base64',
}

export const defaultConfig: CryptoConfig = {
  mode: 'encrypt',
  inConfig: { ...defaultInConfig },
}
