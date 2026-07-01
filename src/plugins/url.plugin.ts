/**
 * URL Plugin — Plugin Manifest
 */

import { definePlugin } from '@/sdk/plugin'

export default definePlugin({
  id: 'url',
  name: 'URL',
  icon: 'Link',
  version: '1.0.0',
  description: 'Encode and decode URLs using URI or component modes',
  category: 'encoding',
  status: 'active',

  route: '/url',
  component: () => import('@/features/url/UrlView.vue'),

  commands: [
    {
      id: 'url:execute',
      label: 'URL: Execute',
      description: 'Execute encode or decode',
      shortcut: 'Cmd+Enter',
    },
    {
      id: 'url:swap',
      label: 'URL: Swap I/O',
      description: 'Swap input and output',
    },
  ],

  shortcuts: [
    { commandId: 'url:execute', default: 'Ctrl+Enter', mac: 'Cmd+Enter' },
  ],

  keywords: [
    'url', 'encode', 'decode', 'uri', 'encodeURIComponent', 'decodeURIComponent',
    'encodeURI', 'decodeURI', 'percent', 'encoding', 'escape',
    'URL编码', 'URL解码', '编码', '解码', '百分号编码',
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
      default: 'component',
    },
  },

  history: { enabled: true, maxItems: 20 },
})
