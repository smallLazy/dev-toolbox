// @ts-nocheck
/**
 * Zentao Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { ZentaoConfig } from './types'

export const settingsSchema: SettingField[] = [
    {
      key: 'apiEndpoint',
      type: 'input' as const,
      label: 'API Endpoint',
      default: "",
    },
    {
      key: 'apiKey',
      type: 'input' as const,
      label: 'API Key',
      default: "",
    },
    {
      key: 'autoConnect',
      type: 'toggle' as const,
      label: 'Auto Connect',
      default: false,
    },
]

export const defaults: ZentaoConfig = {
  apiEndpoint: "",
  apiKey: "",
  autoConnect: false,
}
