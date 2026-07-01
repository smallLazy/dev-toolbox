/**
 * PHP Compatible Preset
 *
 * Replaces the legacy "Cloud Encrypt" feature.
 * Pipeline: URL Encode (PHP urlencode) → Base64 Encode (no padding)
 *
 * This is NOT encryption — it's an encoding/compatibility pipeline.
 */

import type { PipelinePreset } from '@/shared/pipeline/types'
import { encodeUrl, decodeUrl } from '@/features/url/logic'
import { encode as base64Encode, decode as base64Decode } from '@/features/base64/logic'

export const phpCompatiblePreset: PipelinePreset = {
  id: 'php-compatible',
  name: 'PHP Compatible',
  description: 'PHP base_encryption / filter 兼容管道 — URL Encode (PHP) → Base64 (无填充)',
  icon: 'Package',
  category: 'encoding',
  version: '1.0.0',
  route: '/preset/php-compatible',
  mode: 'encode',

  encodeSteps: [
    {
      id: 'url-encode-php',
      label: 'URL Encode (PHP)',
      execute: (input: string) => encodeUrl(input, 'php'),
    },
    {
      id: 'base64-encode-no-pad',
      label: 'Base64 Encode (No Padding)',
      execute: (input: string) => base64Encode(input, { padding: 'none' }),
    },
  ],

  decodeSteps: [
    {
      id: 'base64-decode-auto-pad',
      label: 'Base64 Decode (Auto Padding)',
      execute: (input: string) => base64Decode(input, { autoPad: true, fixSpaces: true }),
    },
    {
      id: 'url-decode-php',
      label: 'URL Decode (PHP)',
      execute: (input: string) => decodeUrl(input, 'php'),
    },
  ],

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

  deprecated: {
    oldRoute: '/cloud-encrypt',
    oldName: 'Cloud Encrypt',
    migrationNote:
      'Cloud Encrypt 已迁移为 Pipeline Preset「PHP Compatible」。' +
      '该功能不是加密，而是 URL Encode (PHP) → Base64 (无填充) 的兼容编码流程。',
  },
}
