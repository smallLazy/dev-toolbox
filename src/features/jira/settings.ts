// @ts-nocheck
/**
 * Jira Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { JiraConfig } from './types'

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
      label: '自动连接',
      default: false,
    },
]

export const defaults: JiraConfig = {
  apiEndpoint: "",
  apiKey: "",
  autoConnect: false,
}
