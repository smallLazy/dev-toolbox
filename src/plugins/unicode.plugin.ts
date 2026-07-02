/**
 * Unicode Plugin — Plugin Manifest
 */

import { definePlugin } from '@/sdk/plugin'

export default definePlugin({
  id: 'unicode',
  name: 'Unicode',
  icon: 'CaseSensitive',
  version: '1.0.0',
  description: 'Encode and decode Unicode escape sequences',
  category: 'encoding',
  status: 'active',

  route: '/unicode',
  component: () => import('@/features/unicode/UnicodeView.vue'),

  commands: [
    {
      id: 'unicode:execute',
      label: 'Unicode: Execute',
      description: 'Execute encode or decode',
      shortcut: 'Cmd+Enter',
    },
    {
      id: 'unicode:swap',
      label: 'Unicode: Swap I/O',
      description: 'Swap input and output',
    },
  ],

  shortcuts: [
    { commandId: 'unicode:execute', default: 'Ctrl+Enter', mac: 'Cmd+Enter' },
  ],

  keywords: [
    'unicode', 'encode', 'decode', 'escape', 'unescape',
    'uXXXX', 'code-point', 'surrogate', 'pair',
    'javascript', 'js', 'json',
    'Unicode编码', 'Unicode解码', '转义', '码点', '编码', '解码',
  ],

  permissions: ['clipboard:read', 'clipboard:write'],

  settings: {
    defaultMode: {
      key: 'defaultMode',
      type: 'select' as const,
      label: 'Default Mode',
      default: 'encode',
    },
    defaultVariant: {
      key: 'defaultVariant',
      type: 'select' as const,
      label: 'Default Variant',
      default: 'javascript',
    },
  },

  history: { enabled: true, maxItems: 20 },
})
