/**
 * Base64 Plugin — Plugin Manifest
 */

import { definePlugin } from '@/sdk/plugin'

export default definePlugin({
  id: 'base64',
  name: 'Base64',
  icon: 'Binary',
  version: '1.0.0',
  description: 'Encode and decode text to/from Base64 with full Unicode support',
  category: 'encoding',
  status: 'active',

  route: '/base64',
  component: () => import('@/features/base64/Base64View.vue'),

  commands: [
    {
      id: 'base64:execute',
      label: 'Base64: Execute',
      description: 'Execute encode or decode',
      shortcut: 'Cmd+Enter',
    },
    {
      id: 'base64:swap',
      label: 'Base64: Swap I/O',
      description: 'Swap input and output',
    },
  ],

  shortcuts: [
    { commandId: 'base64:execute', default: 'Ctrl+Enter', mac: 'Cmd+Enter' },
  ],

  keywords: [
    'base64', 'encode', 'decode', 'binary', 'text', 'unicode', 'utf8', 'mime', 'base64url',
    '编码', '解码', 'base64编码', 'base64解码', '文本', '二进制',
  ],

  permissions: ['clipboard:read', 'clipboard:write'],

  settings: {
    defaultMode: { key: 'defaultMode', type: 'select' as const, label: 'Default Mode', default: 'encode' },
  },

  history: { enabled: true, maxItems: 20 },
})
