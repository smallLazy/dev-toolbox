/**
 * PHP Compatible Preset — Plugin Manifest
 *
 * Replaces the legacy "Cloud Encrypt" feature.
 * Pipeline: URL Encode (PHP urlencode) → Base64 (no padding)
 */
import { definePlugin } from '@/sdk/plugin'

export default definePlugin({
  id: 'preset-php-compatible',
  name: 'PHP Codec',
  icon: 'Braces',
  version: '1.0.0',
  description: 'Compatible with PHP base_encryption() / filter(): URL Encode(PHP) → Base64(no padding)',
  category: 'encoding',
  status: 'active',

  route: '/preset/php-compatible',
  component: () => import('@/presets/PresetView.vue'),

  commands: [
    {
      id: 'preset-php-compatible:execute',
      label: 'PHP Codec: Execute',
      description: 'Run the PHP-compatible encode or decode pipeline',
      shortcut: 'Cmd+Enter',
    },
    {
      id: 'preset-php-compatible:swap',
      label: 'PHP Codec: Swap I/O',
      description: 'Swap input and output',
    },
  ],

  shortcuts: [
    { commandId: 'preset-php-compatible:execute', default: 'Ctrl+Enter', mac: 'Cmd+Enter' },
  ],

  keywords: [
    'php',
    'php codec',
    'base_encryption',
    'filter',
    'urlencode',
    'base64',
    'cloud encrypt',
    'cloud-encrypt',
    'encode',
    'decode',
    'pipeline',
    'codec',
    'url encode',
    'no padding',
  ],

  permissions: ['clipboard:read', 'clipboard:write'],

  history: { enabled: true, maxItems: 20 },
})
