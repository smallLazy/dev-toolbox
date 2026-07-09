/**
 * UUID Plugin — UUID Generator & Validator
 *
 * Generate v4 UUIDs in bulk, validate format/version, and normalize.
 * 100% SDK-based: definePlugin + FeatureContext + Design System.
 */

import { definePlugin, createCommand } from '@/sdk/plugin'

export default definePlugin({
  id: 'uuid',
  name: 'UUID',
  icon: 'Fingerprint',
  version: '1.0.0',
  description: 'Generate, validate, and normalize UUIDs',
  category: 'converter',
  status: 'active',

  route: '/uuid',
  component: () => import('@/features/uuid/UuidView.vue'),

  commands: [
    createCommand({
      id: 'uuid:generate',
      label: 'UUID: Generate',
      description: 'Generate UUID v4',
      shortcut: 'Cmd+Enter',
    }),
    createCommand({
      id: 'uuid:validate',
      label: 'UUID: Validate',
      description: 'Validate UUID format and version',
    }),
    createCommand({
      id: 'uuid:normalize',
      label: 'UUID: Normalize',
      description: 'Normalize UUID to lowercase',
    }),
  ],

  shortcuts: [
    { commandId: 'uuid:generate', default: 'Ctrl+Enter', mac: 'Cmd+Enter' },
  ],

  keywords: [
    'uuid', 'generate', 'validate', 'normalize', 'guid',
    'v4', 'version', 'generator', 'validator',
    'UUID生成', 'UUID验证', 'UUID校验',
  ],

  permissions: ['clipboard:read', 'clipboard:write'],

  settings: {
    count: {
      key: 'count',
      type: 'number',
      label: 'Generate Count',
      default: 1,
    },
  },

  history: { enabled: true, maxItems: 20 },

  onActivate(ctx) {
    ctx.logger.info('UUID Plugin activated')
  },
})
