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
  name: 'JSON 格式化',
  icon: '📋',
  version: '1.0.0',
  description: 'JSON 格式化、压缩与验证',
  category: 'formatter',

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
    '格式化', '压缩', '验证', '美化',
  ],

  // ── Permissions ────────────────────────────────────────────────────
  permissions: ['clipboard:read', 'clipboard:write', 'file:export'],

  // ── Settings ───────────────────────────────────────────────────────
  settings: {
    indentSize: {
      key: 'indentSize',
      type: 'select',
      label: '缩进空格数',
      options: ['2', '4'],
      default: 2,
    },
    sortKeys: {
      key: 'sortKeys',
      type: 'toggle',
      label: '按键排序',
      default: false,
    },
    autoFormatOnPaste: {
      key: 'autoFormatOnPaste',
      type: 'toggle',
      label: '粘贴自动格式化',
      default: true,
    },
    themeFollowWorkspace: {
      key: 'themeFollowWorkspace',
      type: 'toggle',
      label: '跟随 Workspace 主题',
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
