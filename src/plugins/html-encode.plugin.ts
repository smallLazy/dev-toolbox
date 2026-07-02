/**
 * HTML Encode Plugin — Plugin Manifest
 */

import { definePlugin } from '@/sdk/plugin'

export default definePlugin({
  id: 'html-encode',
  name: 'HTML',
  icon: 'CodeXml',
  version: '1.0.0',
  description: 'Encode and decode HTML entities',
  category: 'encoding',
  status: 'active',

  route: '/html-encode',
  component: () => import('@/features/html-encode/HtmlEncodeView.vue'),

  commands: [
    {
      id: 'html-encode:execute',
      label: 'HTML Encode: Execute',
      description: 'Execute encode or decode',
      shortcut: 'Cmd+Enter',
    },
    {
      id: 'html-encode:swap',
      label: 'HTML Encode: Swap I/O',
      description: 'Swap input and output',
    },
  ],

  shortcuts: [
    { commandId: 'html-encode:execute', default: 'Ctrl+Enter', mac: 'Cmd+Enter' },
  ],

  keywords: [
    'html', 'encode', 'decode', 'entity', 'entities',
    'escape', 'unescape', 'html-encode', 'html-decode',
    'amp', 'lt', 'gt', 'quot', 'apos',
    'HTML编码', 'HTML解码', 'HTML实体', '编码', '解码',
  ],

  permissions: ['clipboard:read', 'clipboard:write'],

  settings: {
    defaultMode: { key: 'defaultMode', type: 'select' as const, label: 'Default Mode', default: 'encode' },
  },

  history: { enabled: true, maxItems: 20 },
})
