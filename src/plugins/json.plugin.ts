/**
 * JSON Plugin — Reference Built-in Plugin
 *
 * Proves the entire Platform is production-ready.
 * 100% SDK-based: definePlugin + FeatureContext + Design System.
 * Zero Core/Registry/Service/Router access.
 */

import { definePlugin, createCommand } from '@/sdk/plugin'

export default definePlugin({
  id: 'json',
  name: 'JSON Formatter',
  icon: 'FileJson',
  version: '1.0.0',
  description: 'Format, validate, and minify JSON',
  category: 'formatter',
  status: 'active',

  route: '/json',
  component: () => import('@/features/json/JsonView.vue'),

  // ── Commands (Command Palette ⌘K) ──────────────────────────────────
  commands: [
    createCommand({
      id: 'json:format',
      label: 'JSON: Format',
      description: 'Pretty-print JSON with indentation',
      shortcut: 'Cmd+Shift+F',
    }),
    createCommand({
      id: 'json:minify',
      label: 'JSON: Minify',
      description: 'Compress JSON to single line',
      shortcut: 'Cmd+Shift+M',
    }),
    createCommand({
      id: 'json:validate',
      label: 'JSON: Validate',
      description: 'Check if JSON is syntactically valid',
    }),
  ],

  // ── Shortcuts ──────────────────────────────────────────────────────
  shortcuts: [
    { commandId: 'json:format', default: 'Ctrl+Shift+F', mac: 'Cmd+Shift+F' },
    { commandId: 'json:minify', default: 'Ctrl+Shift+M', mac: 'Cmd+Shift+M' },
  ],

  // ── Search Keywords ────────────────────────────────────────────────
  keywords: [
    'json', 'format', 'minify', 'validate', 'prettify',
    'pretty', 'compress', 'beautify', 'formatter', 'validator',
    'json format', 'json minify', 'json validate',
    '格式化', '压缩', '验证', '美化', 'beautify', 'pretty', 'formatter',
  ],

  // ── Permissions ────────────────────────────────────────────────────
  permissions: ['clipboard:read', 'clipboard:write', 'file:export'],

  // ── Settings ───────────────────────────────────────────────────────
  settings: {
    indentSize: {
      key: 'indentSize',
      type: 'select',
      label: 'Indent Size',
      options: ['2', '4'],
      default: 2,
    },
    sortKeys: {
      key: 'sortKeys',
      type: 'toggle',
      label: 'Sort Keys',
      default: false,
    },
    autoFormatOnPaste: {
      key: 'autoFormatOnPaste',
      type: 'toggle',
      label: 'Auto-format on Paste',
      default: true,
    },
    themeFollowWorkspace: {
      key: 'themeFollowWorkspace',
      type: 'toggle',
      label: 'Follow Workspace Theme',
      default: true,
    },
  },

  // ── History ────────────────────────────────────────────────────────
  history: { enabled: true, maxItems: 30 },

  // ── Lifecycle ──────────────────────────────────────────────────────
  onActivate(ctx) {
    ctx.logger.info('JSON Plugin activated')
  },
})
