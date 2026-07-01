/**
 * JWT Plugin — Plugin Manifest
 */

import { definePlugin } from '@/sdk/plugin'

export default definePlugin({
  id: 'jwt',
  name: 'JWT',
  icon: 'Shield',
  version: '1.0.0',
  description: 'Decode JSON Web Tokens locally',
  category: 'encoding',

  route: '/jwt',
  component: () => import('@/features/jwt/JwtView.vue'),

  commands: [
    {
      id: 'jwt:decode',
      label: 'JWT: Decode',
      description: 'Decode JWT header, payload, and signature',
      shortcut: 'Cmd+Enter',
    },
  ],

  shortcuts: [
    { commandId: 'jwt:decode', default: 'Ctrl+Enter', mac: 'Cmd+Enter' },
  ],

  keywords: [
    'jwt', 'json web token', 'token', 'decode', 'base64url',
    'header', 'payload', 'signature', 'exp', 'iat',
  ],

  permissions: ['clipboard:read', 'clipboard:write'],

  settings: {
    pretty: { key: 'pretty', type: 'toggle' as const, label: 'Pretty Print', default: true },
  },

  history: { enabled: true, maxItems: 20 },
})
