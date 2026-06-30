/**
 * Websocket Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { WebsocketConfig } from './types'

export const settingsSchema: SettingField[] = [
    {
      key: 'defaultMethod',
      type: 'select' as const,
      label: '默认方法',
      default: "GET",
    },
    {
      key: 'timeout',
      type: 'number' as const,
      label: '超时(ms)',
      default: 10000,
    },
]

export const defaults: WebsocketConfig = {
  defaultMethod: "GET",
  timeout: 10000,
}
