/**
 * QR Code Plugin — QR Code Generator
 *
 * Generate QR codes from text, URLs, and other content.
 * Supports size, error correction, and margin configuration.
 * 100% SDK-based: definePlugin + FeatureContext + Design System.
 */

import { definePlugin, createCommand } from '@/sdk/plugin'

export default definePlugin({
  id: 'qrcode',
  name: 'QR Code',
  icon: 'QrCode',
  version: '1.0.0',
  description: 'Generate QR codes from text, URLs, and other content.',
  category: 'utility',
  status: 'active',

  route: '/qrcode',
  component: () => import('@/features/qrcode/QrcodeView.vue'),

  commands: [
    createCommand({
      id: 'qrcode:generate',
      label: 'QR Code: Generate',
      description: 'Generate a QR code from input content',
      shortcut: 'Cmd+Enter',
    }),
  ],

  shortcuts: [
    { commandId: 'qrcode:generate', default: 'Ctrl+Enter', mac: 'Cmd+Enter' },
  ],

  keywords: [
    'qr', 'qrcode', 'qr code', 'generate', 'barcode',
    '二维码', '生成', 'QR码',
  ],

  permissions: ['clipboard:read', 'clipboard:write'],

  settings: {
    size: {
      key: 'size',
      type: 'select',
      label: 'Size',
      options: ['128', '256', '512', '1024'],
      default: 256,
    },
    errorCorrectionLevel: {
      key: 'errorCorrectionLevel',
      type: 'select',
      label: 'Error Correction',
      options: ['L', 'M', 'Q', 'H'],
      default: 'M',
    },
    margin: {
      key: 'margin',
      type: 'number',
      label: 'Margin',
      default: 4,
    },
  },

  history: { enabled: true, maxItems: 20 },

  onActivate(ctx) {
    ctx.logger.info('QR Code Plugin activated')
  },
})
