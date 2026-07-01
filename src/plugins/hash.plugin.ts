/**
 * Hash Plugin — Plugin Manifest
 */

import { definePlugin } from '@/sdk/plugin'

export default definePlugin({
  id: 'hash',
  name: 'Hash',
  icon: 'FingerprintPattern',
  version: '1.0.0',
  description: 'Generate MD5 and SHA-256 hashes',
  category: 'crypto',
  status: 'active',

  route: '/hash',
  component: () => import('@/features/hash/HashView.vue'),

  commands: [
    {
      id: 'hash:execute',
      label: 'Hash: Generate',
      description: 'Generate hash from input text',
      shortcut: 'Cmd+Enter',
    },
  ],

  shortcuts: [
    { commandId: 'hash:execute', default: 'Ctrl+Enter', mac: 'Cmd+Enter' },
  ],

  keywords: [
    'hash', 'md5', 'sha256', 'sha-256', 'digest', 'checksum', 'fingerprint',
    '哈希', '散列', 'MD5', 'SHA256', '校验', '摘要', '加密',
  ],

  permissions: ['clipboard:read', 'clipboard:write'],

  settings: {
    defaultAlgorithm: {
      key: 'defaultAlgorithm',
      type: 'select' as const,
      label: 'Default Algorithm',
      default: 'md5',
    },
  },

  history: { enabled: true, maxItems: 20 },
})
