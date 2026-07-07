/**
 * Text Diff Plugin — Compare two texts line by line
 */

import { definePlugin } from '@/sdk/plugin'

export default definePlugin({
  id: 'diff',
  name: 'Diff',
  icon: 'GitBranch',
  version: '1.0.0',
  description: 'Compare two text inputs and generate a unified diff.',
  category: 'formatter',
  status: 'active',

  route: '/diff',
  component: () => import('@/features/diff/DiffView.vue'),

  commands: [
    {
      id: 'diff:compare',
      label: 'Diff: Compare',
      description: 'Compare left and right text',
      shortcut: 'Cmd+Enter',
    },
    {
      id: 'diff:clear',
      label: 'Diff: Clear',
      description: 'Clear both inputs and output',
    },
  ],

  shortcuts: [
    { commandId: 'diff:compare', default: 'Ctrl+Enter', mac: 'Cmd+Enter' },
  ],

  keywords: [
    'diff',
    'compare',
    'text',
    'unified',
    'difference',
    'comparison',
    'line',
    'change',
    'patch',
    '对比',
    '差异',
    '比较',
    '文本对比',
    'diff工具',
  ],

  permissions: ['clipboard:read', 'clipboard:write'],

  settings: {
    contextLines: {
      key: 'contextLines',
      type: 'select' as const,
      label: 'Context Lines',
      default: 3,
    },
    ignoreWhitespace: {
      key: 'ignoreWhitespace',
      type: 'toggle' as const,
      label: 'Ignore Whitespace',
      default: false,
    },
    ignoreCase: {
      key: 'ignoreCase',
      type: 'toggle' as const,
      label: 'Ignore Case',
      default: false,
    },
  },

  history: { enabled: true, maxItems: 20 },
})
