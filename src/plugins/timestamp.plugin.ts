/**
 * Timestamp Plugin — Plugin Manifest
 */

import { definePlugin } from '@/sdk/plugin'

export default definePlugin({
  id: 'timestamp',
  name: 'Timestamp',
  icon: 'Clock',
  version: '1.0.0',
  description: 'Convert Unix timestamps and date strings',
  category: 'converter',
  status: 'active',

  route: '/timestamp',
  component: () => import('@/features/timestamp/TimestampView.vue'),

  commands: [
    {
      id: 'timestamp:execute',
      label: 'Timestamp: Convert',
      description: 'Convert timestamp or date string',
      shortcut: 'Cmd+Enter',
    },
  ],

  shortcuts: [
    { commandId: 'timestamp:execute', default: 'Ctrl+Enter', mac: 'Cmd+Enter' },
  ],

  keywords: [
    'timestamp', 'unix', 'date', 'time', 'converter', 'epoch', 'iso8601',
    '时间戳', '日期', '转换', 'unix时间戳', '时间转换',
  ],

  permissions: ['clipboard:read', 'clipboard:write'],

  settings: {
    defaultMode: {
      key: 'defaultMode',
      type: 'select' as const,
      label: 'Default Mode',
      default: 'timestamp-to-date',
    },
  },

  history: { enabled: true, maxItems: 20 },
})
