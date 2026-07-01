// @ts-nocheck
/**
 * Websocket Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { WebsocketConfig } from './types'

export const settingsSchema: SettingField[] = [
    {
      key: 'defaultMethod',
      type: 'select' as const,
      label: 'Default Method',
      default: "GET",
    },
    {
      key: 'timeout',
      type: 'number' as const,
      label: 'Timeout (ms)',
      default: 10000,
    },
]

export const defaults: WebsocketConfig = {
  defaultMethod: "GET",
  timeout: 10000,
}
