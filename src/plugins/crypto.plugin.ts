/**
 * Crypto (AES) Plugin — Plugin Manifest
 */

import { definePlugin } from '@/sdk/plugin'

export default definePlugin({
  id: 'crypto',
  name: 'AES',
  icon: 'Lock',
  version: '1.0.0',
  description: 'AES-256 symmetric encryption using CBC or ECB mode',
  category: 'crypto',
  status: 'active',

  route: '/crypto',
  component: () => import('@/features/crypto/CryptoView.vue'),

  commands: [
    {
      id: 'crypto:execute',
      label: 'AES: Execute',
      description: 'Encrypt or decrypt with AES-256',
      shortcut: 'Cmd+Enter',
    },
  ],

  shortcuts: [
    { commandId: 'crypto:execute', default: 'Ctrl+Enter', mac: 'Cmd+Enter' },
  ],

  keywords: [
    'aes', 'aes-256', 'encrypt', 'decrypt',
    'cbc', 'ecb', 'cipher', 'symmetric',
    'crypto', 'base64', 'hex',
  ],

  permissions: ['clipboard:read', 'clipboard:write'],

  settings: {
    algorithm: {
      key: 'algorithm',
      type: 'select' as const,
      label: 'Algorithm',
      default: 'aes-256-cbc',
    },
    keyEncoding: {
      key: 'keyEncoding',
      type: 'select' as const,
      label: 'Key Encoding',
      default: 'utf8',
    },
    ivEncoding: {
      key: 'ivEncoding',
      type: 'select' as const,
      label: 'IV Encoding',
      default: 'utf8',
    },
    inputEncoding: {
      key: 'inputEncoding',
      type: 'select' as const,
      label: 'Input Encoding',
      default: 'utf8',
    },
    outputEncoding: {
      key: 'outputEncoding',
      type: 'select' as const,
      label: 'Output Encoding',
      default: 'base64',
    },
  },

  history: { enabled: true, maxItems: 20 },
})
