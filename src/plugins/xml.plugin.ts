/**
 * XML Plugin — XML Formatter
 *
 * Format, minify, and validate XML.
 * 100% SDK-based: definePlugin + FeatureContext + Design System.
 * Zero Core/Registry/Service/Router access.
 */

import { definePlugin, createCommand } from '@/sdk/plugin'

export default definePlugin({
  id: 'xml',
  name: 'XML Formatter',
  icon: 'FileCode',
  version: '1.0.0',
  description: 'Format, minify, and validate XML',
  category: 'formatter',
  status: 'active',

  route: '/xml',
  component: () => import('@/features/xml/XmlView.vue'),

  // ── Commands (Command Palette ⌘K) ──────────────────────────────────
  commands: [
    createCommand({
      id: 'xml:format',
      label: 'XML: Format',
      description: 'Pretty-print XML with indentation',
      shortcut: 'Cmd+Shift+F',
    }),
    createCommand({
      id: 'xml:minify',
      label: 'XML: Minify',
      description: 'Compress XML to a single line',
    }),
    createCommand({
      id: 'xml:validate',
      label: 'XML: Validate',
      description: 'Check if XML is syntactically valid',
    }),
  ],

  // ── Shortcuts ──────────────────────────────────────────────────────
  shortcuts: [
    { commandId: 'xml:format', default: 'Ctrl+Shift+F', mac: 'Cmd+Shift+F' },
  ],

  // ── Search Keywords ────────────────────────────────────────────────
  keywords: [
    'xml', 'format', 'minify', 'validate', 'prettify',
    'pretty', 'compress', 'beautify', 'formatter', 'validator',
    'xml format', 'xml minify', 'xml validate', 'xml beautify',
    '格式化', '压缩', '验证', '美化',
  ],

  // ── Permissions ────────────────────────────────────────────────────
  permissions: ['clipboard:read', 'clipboard:write', 'file:export'],

  // ── Settings ───────────────────────────────────────────────────────
  settings: {
    indentSize: {
      key: 'indentSize',
      type: 'select',
      label: 'Indent Size',
      options: ['2', '4', 'tab'],
      default: 2,
    },
  },

  // ── History ────────────────────────────────────────────────────────
  history: { enabled: true, maxItems: 20 },

  // ── Lifecycle ──────────────────────────────────────────────────────
  onActivate(ctx) {
    ctx.logger.info('XML Plugin activated')
  },
})
