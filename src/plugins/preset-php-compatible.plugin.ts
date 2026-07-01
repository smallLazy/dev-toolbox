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
  icon: 'Package',
  version: '1.0.0',
  description: 'Compatible with PHP base_encryption() / filter(): URL Encode(PHP) → Base64(no padding)',
  category: 'encoder',

  route: '/preset/php-compatible',
  component: () => import('@/presets/PresetView.vue'),

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
