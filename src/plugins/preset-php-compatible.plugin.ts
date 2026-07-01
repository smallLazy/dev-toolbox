/**
 * PHP Compatible Preset — Plugin Manifest
 *
 * Replaces the legacy "Cloud Encrypt" feature.
 * Pipeline: URL Encode (PHP urlencode) → Base64 (no padding)
 */
import { definePlugin } from '@/sdk/plugin'

export default definePlugin({
  id: 'preset-php-compatible',
  name: 'PHP Compatible',
  icon: 'Package',
  version: '1.0.0',
  description: 'PHP base_encryption / filter 兼容管道 — URL Encode(PHP) → Base64(无填充)',
  category: 'encoder',

  route: '/preset/php-compatible',
  component: () => import('@/presets/PresetView.vue'),

  keywords: [
    'php',
    'base_encryption',
    'filter',
    'urlencode',
    'base64',
    'cloud encrypt',
    'cloud-encrypt',
    'PHP编码',
    'PHP解码',
    '参数编码',
    '请求编码',
    '兼容编码',
    'base加密',
  ],

  permissions: ['clipboard:read', 'clipboard:write'],

  history: { enabled: true, maxItems: 20 },
})
