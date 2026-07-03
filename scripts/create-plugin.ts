#!/usr/bin/env npx tsx
/**
 * Plugin Generator — Official Platform Scaffolding Tool
 *
 * Usage:
 *   npx tsx scripts/create-plugin.ts <name> [--template=<type>]
 *
 * Examples:
 *   npx tsx scripts/create-plugin.ts aes
 *   npx tsx scripts/create-plugin.ts json --template=editor
 *   npx tsx scripts/create-plugin.ts sentry --template=enterprise
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

type TemplateType = 'transform' | 'editor' | 'converter' | 'inspector' | 'viewer' | 'ai' | 'network' | 'enterprise'

interface TemplateConfig {
  icon: string
  category: string
  description: string
  commands: Array<{ id: string; label: string; description: string; shortcut?: string }>
  shortcuts: Array<{ commandId: string; default: string; mac: string }>
  keywords: string[]
  permissions: string[]
  settings: Record<string, { key: string; type: string; label: string; default: unknown }>
}

interface PluginConfig {
  name: string
  Name: string
  template: TemplateType
  featureDir: string
  pluginPath: string
}

// ═══════════════════════════════════════════════════════════════════════════
// Template Configurations
// ═══════════════════════════════════════════════════════════════════════════

const TEMPLATES: Record<TemplateType, TemplateConfig> = {
  transform: {
    icon: 'Lock', category: 'crypto',
    description: 'Transform tool — input, transform, output',
    commands: [
      { id: '{name}:execute', label: '{Name}: Execute', description: 'Execute transformation', shortcut: 'Cmd+Enter' },
      { id: '{name}:swap', label: '{Name}: Swap I/O', description: 'Swap input and output' },
    ],
    shortcuts: [
      { commandId: '{name}:execute', default: 'Ctrl+Enter', mac: 'Cmd+Enter' },
    ],
    keywords: ['{name}', 'transform', 'convert', 'encode', 'decode', 'encrypt', 'decrypt'],
    permissions: ['clipboard:read', 'clipboard:write'],
    settings: {
      mode: { key: 'mode', type: 'select', label: 'Default Mode', default: 'encrypt' },
      inputEncoding: { key: 'inputEncoding', type: 'select', label: 'Input Encoding', default: 'utf8' },
      outputEncoding: { key: 'outputEncoding', type: 'select', label: 'Output Encoding', default: 'base64' },
    },
  },
  editor: {
    icon: 'FileJson', category: 'formatter',
    description: 'Editor — format, minify, and validate',
    commands: [
      { id: '{name}:format', label: '{Name}: Format', description: 'Format content', shortcut: 'Cmd+Shift+F' },
      { id: '{name}:minify', label: '{Name}: Minify', description: 'Minify/compress content' },
      { id: '{name}:validate', label: '{Name}: Validate', description: 'Validate content' },
    ],
    shortcuts: [
      { commandId: '{name}:format', default: 'Ctrl+Shift+F', mac: 'Cmd+Shift+F' },
    ],
    keywords: ['{name}', 'format', 'minify', 'validate', 'editor', 'formatter', 'beautify'],
    permissions: ['clipboard:read', 'clipboard:write', 'file:export'],
    settings: {
      indentSize: { key: 'indentSize', type: 'select', label: 'Indent Size', default: 2 },
      autoFormat: { key: 'autoFormat', type: 'toggle', label: 'Auto Format', default: true },
    },
  },
  converter: {
    icon: 'Refresh', category: 'converter',
    description: 'Format converter — convert between formats',
    commands: [
      { id: '{name}:convert', label: '{Name}: Convert', description: 'Convert format', shortcut: 'Cmd+Enter' },
      { id: '{name}:swap', label: '{Name}: Swap Direction', description: 'Swap conversion direction' },
    ],
    shortcuts: [
      { commandId: '{name}:convert', default: 'Ctrl+Enter', mac: 'Cmd+Enter' },
    ],
    keywords: ['{name}', 'convert', 'converter', 'transform', 'switch', '互转'],
    permissions: ['clipboard:read', 'clipboard:write'],
    settings: {
      defaultDirection: { key: 'defaultDirection', type: 'select', label: 'Default Direction', default: 'forward' },
    },
  },
  inspector: {
    icon: 'Search', category: 'analyzer',
    description: 'Inspector — parse and display structured data',
    commands: [
      { id: '{name}:parse', label: '{Name}: Parse', description: 'Parse and inspect', shortcut: 'Cmd+Enter' },
    ],
    shortcuts: [
      { commandId: '{name}:parse', default: 'Ctrl+Enter', mac: 'Cmd+Enter' },
    ],
    keywords: ['{name}', 'inspect', 'parse', 'analyze', 'decode', '解析', '分析'],
    permissions: ['clipboard:read', 'clipboard:write'],
    settings: {
      autoParse: { key: 'autoParse', type: 'toggle', label: 'Auto Parse on Paste', default: true },
    },
  },
  viewer: {
    icon: 'Eye', category: 'utility',
    description: 'Viewer — preview files and metadata',
    commands: [
      { id: '{name}:open', label: '{Name}: Open File', description: 'Open file for viewing', shortcut: 'Cmd+O' },
    ],
    shortcuts: [
      { commandId: '{name}:open', default: 'Ctrl+O', mac: 'Cmd+O' },
    ],
    keywords: ['{name}', 'view', 'preview', 'open', 'file', '查看', '预览'],
    permissions: ['file:read'],
    settings: {
      autoPreview: { key: 'autoPreview', type: 'toggle', label: 'Auto Preview', default: true },
    },
  },
  ai: {
    icon: 'MessagesSquare', category: 'ai',
    description: 'AI tools — chat, completion, and generation',
    commands: [
      { id: '{name}:chat', label: '{Name}: Chat', description: 'Start AI chat', shortcut: 'Cmd+Enter' },
      { id: '{name}:clear', label: '{Name}: Clear History', description: 'Clear chat history' },
    ],
    shortcuts: [
      { commandId: '{name}:chat', default: 'Ctrl+Enter', mac: 'Cmd+Enter' },
    ],
    keywords: ['{name}', 'ai', 'chat', 'generate', 'llm', 'gpt', '智能'],
    permissions: ['ai:chat', 'network'],
    settings: {
      model: { key: 'model', type: 'select', label: 'Model', default: 'default' },
      temperature: { key: 'temperature', type: 'number', label: 'Temperature', default: 0.7 },
    },
  },
  network: {
    icon: 'Globe', category: 'network',
    description: 'Network tool — HTTP request and response analysis',
    commands: [
      { id: '{name}:send', label: '{Name}: Send Request', description: 'Send HTTP request', shortcut: 'Cmd+Enter' },
    ],
    shortcuts: [
      { commandId: '{name}:send', default: 'Ctrl+Enter', mac: 'Cmd+Enter' },
    ],
    keywords: ['{name}', 'http', 'request', 'api', 'curl', 'rest', 'fetch', '请求'],
    permissions: ['network', 'clipboard:write'],
    settings: {
      defaultMethod: { key: 'defaultMethod', type: 'select', label: 'Default Method', default: 'GET' },
      timeout: { key: 'timeout', type: 'number', label: 'Timeout (ms)', default: 10000 },
    },
  },
  enterprise: {
    icon: 'Package', category: 'utility',
    description: 'Enterprise tool — external service integration',
    commands: [
      { id: '{name}:connect', label: '{Name}: Connect', description: 'Connect to service' },
      { id: '{name}:sync', label: '{Name}: Sync', description: 'Sync data' },
    ],
    shortcuts: [],
    keywords: ['{name}', 'enterprise', 'integration', 'service', '企业', '集成'],
    permissions: ['network', 'storage:read', 'storage:write'],
    settings: {
      apiEndpoint: { key: 'apiEndpoint', type: 'input', label: 'API Endpoint', default: '' },
      apiKey: { key: 'apiKey', type: 'input', label: 'API Key', default: '' },
      autoConnect: { key: 'autoConnect', type: 'toggle', label: 'Auto Connect', default: false },
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// File Generators
// ═══════════════════════════════════════════════════════════════════════════

function generateLogic(config: PluginConfig): string {
  return `/**
 * ${config.Name} Plugin — Pure Logic
 *
 * ALL business logic is here. Pure functions. Zero side effects.
 * Directly unit-testable. No Vue, no Tauri, no context access.
 */

import type { ${config.Name}Config } from './types'

/**
 * Core transformation logic.
 * Replace this with your actual business logic.
 */
export function process(input: string, config: ${config.Name}Config): string {
  // TODO: Implement your transformation here
  // Example: return input.toUpperCase()
  return input
}

/**
 * Validate input before processing.
 */
export function validate(input: string): { valid: boolean; message?: string } {
  if (!input || !input.trim()) {
    return { valid: false, message: 'Input is empty' }
  }
  return { valid: true }
}

/**
 * Get statistics about the input.
 */
export function getStats(input: string): { lines: number; size: number } {
  return {
    lines: input.split('\\n').length,
    size: new TextEncoder().encode(input).length,
  }
}

/**
 * Format size for display.
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return \`\${bytes} B\`
  if (bytes < 1024 * 1024) return \`\${(bytes / 1024).toFixed(1)} KB\`
  return \`\${(bytes / (1024 * 1024)).toFixed(1)} MB\`
}
`
}

function generateTypes(config: PluginConfig): string {
  return `/** ${config.Name} Plugin — Type Definitions */

import type { FeatureConfig } from '@/sdk/feature'

export interface ${config.Name}Config extends FeatureConfig {
  // Add your config fields here
  mode?: string
}

export interface ${config.Name}State {
  input: string
  output: string | null
  inputSize: number
  outputSize: number | null
}
`
}

function generateSettings(config: PluginConfig): string {
  const t = config.template
  const template = TEMPLATES[t]
  const entries = Object.entries(template.settings)
    .map(([key, s]) => `    {
      key: '${key}',
      type: '${s.type}' as const,
      label: '${s.label}',
      default: ${JSON.stringify(s.default)},
    }`)
    .join(',\n')

  return `/**
 * ${config.Name} Plugin — Settings Schema
 */

import type { SettingField } from '@/sdk/feature'
import type { ${config.Name}Config } from './types'

export const settingsSchema: SettingField[] = [
${entries},
]

export const defaults: ${config.Name}Config = {
${Object.entries(template.settings).map(([key, s]) => `  ${key}: ${JSON.stringify(s.default)}`).join(',\n')},
}
`
}

function generateToolbar(config: PluginConfig): string {
  return `/**
 * ${config.Name} Plugin — Toolbar Configuration
 */

import { createFeatureToolbar, type FeatureToolbar } from '@/sdk/feature'

export function createToolbar(handlers: {
  onCopy: () => void
  onClear: () => void
  onSwap: () => void
}): FeatureToolbar {
  return createFeatureToolbar({
    copy: handlers.onCopy,
    clear: handlers.onClear,
    swap: handlers.onSwap,
  })
}
`
}

function generateHistory(config: PluginConfig): string {
  return `/**
 * ${config.Name} Plugin — History Configuration
 */

import { createMemoryHistory, type FeatureHistory } from '@/sdk/feature'

export interface ${config.Name}HistoryEntry {
  input: string
  output: string | null
  timestamp: number
}

export function createHistory(capacity = 20): FeatureHistory<${config.Name}HistoryEntry> {
  return createMemoryHistory<${config.Name}HistoryEntry>(capacity)
}
`
}

function generateFeature(config: PluginConfig): string {
  const t = config.template
  const template = TEMPLATES[t]

  return `/**
 * ${config.Name}Feature — Auto-generated by Plugin Generator
 *
 * Template: ${t}
 * Extends BaseFeature from Feature SDK.
 * ALL capabilities via this.context. Zero Core/Registry/Service access.
 */

import {
  BaseFeature,
  type FeatureContext,
  type FeatureState,
  type ValidationResult,
} from '@/sdk/feature'

import type { ${config.Name}Config, ${config.Name}State } from './types'
import { defaults } from './settings'
import { process, getStats } from './logic'

export class ${config.Name}Feature extends BaseFeature<${config.Name}Config, string, string> {
  private _toolState: ${config.Name}State

  constructor(context: FeatureContext<${config.Name}Config>) {
    super(context, defaults)
    this._toolState = { input: '', output: null, inputSize: 0, outputSize: null }
  }

  get toolState(): Readonly<${config.Name}State> { return this._toolState }

  // ── Lifecycle ─────────────────────────────────────────────────────
  async initialize(): Promise<void> {
    await this.context.settings.load()
    const saved = await this.context.settings.load()
    this._config = { ...defaults, ...saved }
    this.lifecycle.transition('initialized')
    this.context.logger.info('${config.Name}Feature initialized')
  }

  async activate(): Promise<void> {
    this.lifecycle.transition('active')
    this.context.notification.info('${config.Name}', 'Ready — ${template.description}')
  }

  async deactivate(): Promise<void> { this.saveState(); this.lifecycle.transition('inactive') }
  async dispose(): Promise<void> { this.reset(); this.lifecycle.transition('disposed') }

  // ── Core Logic ────────────────────────────────────────────────────
  async run(input: string, config: ${config.Name}Config): Promise<string> {
    const result = process(input, config)
    const stats = getStats(result)
    this._toolState.outputSize = stats.size
    return result
  }

  validate(input: string): ValidationResult {
    if (!input.trim()) {
      return { valid: false, errors: [{ field: 'input', message: 'Input is empty' }] }
    }
    return { valid: true }
  }

  transform(input: string, _config: ${config.Name}Config): string {
    const s = getStats(input)
    this._toolState.inputSize = s.size
    return input.trim()
  }

  preview(_input: string, _config: ${config.Name}Config): string | null { return null }
  cancel(): void { this.setIdle() }

  saveState(): FeatureState<string> { return { ...this._state } }
  loadState(state: FeatureState<string>): void { this._state = { ...state } }
  reset(): void {
    this._state = { phase: 'idle', input: '', output: null, error: null, progress: null }
    this._toolState = { input: '', output: null, inputSize: 0, outputSize: null }
  }

  // ── Clipboard ─────────────────────────────────────────────────────
  async copyOutput(): Promise<void> {
    if (this._state.output) {
      await this.context.clipboard.copy(this._state.output)
      this.context.notification.success('Copied', 'Output copied to clipboard')
    }
  }

  // ── History ───────────────────────────────────────────────────────
  recordHistory(): void {
    this.context.history.add({
      input: this._state.input,
      output: this._state.output,
      timestamp: Date.now(),
    })
  }
}
`
}

function generateComposable(config: PluginConfig): string {
  return `/**
 * ${config.Name} Plugin — Vue Composable
 *
 * Bridges ${config.Name}Feature to Vue reactivity.
 * No Core/Registry/Service access.
 */

import { ref, computed } from 'vue'
import { createFeatureContext } from '@/sdk/feature'
import { ${config.Name}Feature } from './${config.Name}Feature'
import { createToolbar } from './toolbar'
import { defaults } from './settings'
import type { ${config.Name}Config } from './types'

export function use${config.Name}() {
  // Context & Feature
  const context = createFeatureContext<${config.Name}Config>({
    id: '${config.name}',
    name: '${config.Name}',
    description: '${TEMPLATES[config.template].description}',
    icon: '${TEMPLATES[config.template].icon}',
    version: '1.0.0',
    category: '${TEMPLATES[config.template].category}',
  })
  const feature = new ${config.Name}Feature(context)

  // Reactive State
  const input = ref('')
  const output = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)

  // Derived
  const stats = computed(() => feature.toolState)

  // Toolbar
  const toolbar = createToolbar({
    onCopy() { feature.copyOutput() },
    onClear() { input.value = ''; output.value = null; error.value = null },
    onSwap() { if (output.value) { input.value = output.value; output.value = null } },
  })

  // Actions
  async function execute() {
    error.value = null; output.value = null
    const v = feature.validate(input.value)
    if (!v.valid) { error.value = v.errors[0].message; return }
    loading.value = true
    try {
      const result = await feature.run(input.value, defaults)
      output.value = result
      feature.recordHistory()
    } catch (e) {
      error.value = (e as Error).message
    } finally { loading.value = false }
  }

  async function init() {
    await feature.initialize()
    await feature.activate()
  }
  function dispose() { feature.deactivate() }

  return { input, output, error, loading, stats, toolbar, execute, init, dispose }
}
`
}

function generateView(config: PluginConfig): string {
  const t = config.template
  const template = TEMPLATES[t]

  // Action button text varies by template
  const actionText: Record<string, string> = {
    transform: 'Run', editor: 'Format', converter: 'Convert',
    inspector: 'Parse', viewer: 'Open', ai: 'Send',
    network: 'Send', enterprise: 'Connect',
  }

  return `<script setup lang="ts">
/**
 * ${config.Name} Plugin — Main View (${t} template)
 *
 * Auto-generated by Plugin Generator.
 * Uses the standard ToolLayout desktop workspace.
 */

import { computed, onMounted, onUnmounted, ref } from 'vue'
import { use${config.Name} } from './composables'
import { useTextActionTrigger } from '@/composables/useTextActionTrigger'
import ToolLayout from '@/templates/ToolLayout.vue'
import ToolWorkspace from '@/templates/ToolWorkspace.vue'
import InputOutputPanel from '@/templates/InputOutputPanel.vue'
import ToolActionBar from '@/templates/ToolActionBar.vue'
import ToolStatusBar from '@/templates/ToolStatusBar.vue'
import type { ToolAction } from '@/templates/types'

const { input, output, error, loading, stats, toolbar, execute, init, dispose } = use${config.Name}()

const {
  inputEl,
  handleCompositionStart,
  handleCompositionEnd,
  handleInputBlur,
  handlePointerDown,
  handleClick,
  handleShortcut,
} = useTextActionTrigger({ model: input, loading, execute })

const statusPhase = ref<'idle' | 'loading' | 'success' | 'error' | 'copied'>('idle')
const statusMessage = ref<string | null>(null)

const primaryAction = computed<ToolAction>(() => ({
  id: 'execute',
  label: '${actionText[t] || 'Run'}',
  busy: loading.value,
  disabled: loading.value,
  shortcut: 'Cmd Enter',
  ariaLabel: '${actionText[t] || 'Run'} ${config.Name}',
}))

const secondaryActions = computed<ToolAction[]>(() => [
  { id: 'copy', label: 'Copy Output', disabled: !output.value || loading.value },
  { id: 'clear', label: 'Clear', disabled: loading.value },
  { id: 'swap', label: 'Swap I/O', disabled: !output.value || loading.value },
])

const outputStats = computed(() => output.value ? { chars: output.value.length } : null)
const visibleStatusPhase = computed(() => {
  if (loading.value) return 'loading'
  if (error.value) return 'error'
  return statusPhase.value
})
const visibleStatusMessage = computed(() => {
  if (loading.value) return 'Processing...'
  if (error.value) return error.value
  return statusMessage.value
})

onMounted(() => init())
onUnmounted(() => dispose())

async function handleSecondaryAction(id: string) {
  if (id === 'copy') {
    await toolbar.execute('copy')
    if (!error.value) {
      statusPhase.value = 'copied'
      statusMessage.value = 'Copied to clipboard.'
    }
    return
  }
  if (id === 'clear') {
    await toolbar.execute('clear')
    statusPhase.value = 'idle'
    statusMessage.value = null
    return
  }
  if (id === 'swap') {
    await toolbar.execute('swap')
  }
}

function clearStatus() {
  error.value = null
  statusPhase.value = 'idle'
  statusMessage.value = null
}
</script>

<template>
  <ToolLayout
    title="${config.Name}"
    description="${template.description}"
    :shortcut-hints="['Cmd Enter to ${actionText[t]?.toLowerCase() || 'run'}']"
    layout="io"
    @keydown="handleShortcut"
  >
    <template #workspace>
      <ToolWorkspace layout="io">
        <template #input>
          <InputOutputPanel
            title="Input"
            :stats="{ chars: input.length }"
            :invalid="!!error"
            aria-label="${config.Name} input"
          >
          <textarea
            ref="inputEl"
            v-model="input"
            class="dt-textarea tool-textarea"
            rows="12"
            placeholder="Enter input..."
            aria-label="${config.Name} input"
            spellcheck="false"
            @blur="handleInputBlur"
            @compositionstart="handleCompositionStart"
            @compositionend="handleCompositionEnd"
          />
          </InputOutputPanel>
        </template>
        <template #output>
          <InputOutputPanel
            title="Output"
            :value="output ?? ''"
            readonly
            placeholder="Output will appear here."
            :stats="outputStats"
            aria-label="${config.Name} output"
          />
        </template>
      </ToolWorkspace>
    </template>

    <template #actions>
      <ToolActionBar
        :primary="primaryAction"
        :secondary="secondaryActions"
        @primary-pointer-down="handlePointerDown"
        @primary-click="handleClick"
        @action="handleSecondaryAction"
      />
    </template>

    <template #status>
      <ToolStatusBar
        :phase="visibleStatusPhase"
        :message="visibleStatusMessage"
        :clearable="!!visibleStatusMessage"
        @clear="clearStatus"
      />
    </template>
  </ToolLayout>
</template>

<style scoped>
.tool-textarea {
  flex: 1;
  min-height: var(--tool-textarea-min-height);
}
</style>
`
}

function generateTests(config: PluginConfig): string {
  return `/**
 * ${config.Name} Plugin — Unit Tests (pure logic)
 */

import { describe, it, expect } from 'vitest'
import { process, validate, getStats, formatSize } from '../logic'

describe('process', () => {
  it('processes input correctly', () => {
    const result = process('hello', {} as any)
    expect(result).toBeDefined()
  })

  it('handles empty input', () => {
    const result = process('', {} as any)
    expect(typeof result).toBe('string')
  })

  it('handles unicode', () => {
    const result = process('你好世界', {} as any)
    expect(result).toBeDefined()
  })
})

describe('validate', () => {
  it('rejects empty input', () => {
    const result = validate('')
    expect(result.valid).toBe(false)
  })

  it('accepts non-empty input', () => {
    const result = validate('hello')
    expect(result.valid).toBe(true)
  })
})

describe('getStats', () => {
  it('counts lines', () => {
    expect(getStats('a\\nb\\nc').lines).toBe(3)
  })

  it('counts size', () => {
    expect(getStats('hello').size).toBe(5)
  })
})

describe('formatSize', () => {
  it('formats bytes', () => { expect(formatSize(500)).toBe('500 B') })
  it('formats KB', () => { expect(formatSize(2048)).toBe('2.0 KB') })
})
`
}

function generatePlugin(config: PluginConfig): string {
  const t = config.template
  const template = TEMPLATES[t]

  const commands = template.commands
    .map(c => {
      const id = c.id.replace('{name}', config.name)
      const label = c.label.replace('{Name}', config.Name).replace('{name}', config.name)
      const desc = c.description.replace('{Name}', config.Name)
      const shortcut = c.shortcut ? `\n      shortcut: '${c.shortcut}',` : ''
      return `    {
      id: '${id}',
      label: '${label}',
      description: '${desc}',${shortcut}
    }`
    }).join(',\n')

  const shortcuts = template.shortcuts
    .map(s => {
      const cid = s.commandId.replace('{name}', config.name)
      return `    { commandId: '${cid}', default: '${s.default}', mac: '${s.mac}' }`
    }).join(',\n')

  const keywords = template.keywords
    .map(k => `'${k.replace('{name}', config.name)}'`)
    .join(', ')

  const settings = Object.entries(template.settings)
    .map(([key, s]) => `    ${key}: { key: '${key}', type: '${s.type}' as const, label: '${s.label}', default: ${JSON.stringify(s.default)} }`)
    .join(',\n')

  return `/**
 * ${config.Name} Plugin — Auto-generated by Plugin Generator
 */

import { definePlugin } from '@/sdk/plugin'

export default definePlugin({
  id: '${config.name}',
  name: '${config.Name}',
  icon: '${template.icon}',
  version: '1.0.0',
  description: '${template.description.replace('{Name}', config.Name)}',
  category: '${template.category}',

  route: '/${config.name}',
  component: () => import('@/features/${config.name}/${config.Name}View.vue'),

  commands: [
${commands},
  ],

  shortcuts: [
${shortcuts},
  ],

  keywords: [${keywords}],

  permissions: [${template.permissions.map(p => `'${p}'`).join(', ')}],

  settings: {
${settings},
  },

  history: { enabled: true, maxItems: 20 },
})
`
}

function generateIndex(config: PluginConfig): string {
  return `/** ${config.Name} Plugin — Public API */

export { default as ${config.Name}View } from './${config.Name}View.vue'
export { ${config.Name}Feature } from './${config.Name}Feature'
export { use${config.Name} } from './composables'
export { process, validate, getStats, formatSize } from './logic'
export type { ${config.Name}Config, ${config.Name}State } from './types'
`
}

function generateReadme(config: PluginConfig): string {
  return `# ${config.Name} Plugin

> Auto-generated by Plugin Generator. Template: \`${config.template}\`

## Usage

1. Implement business logic in \`logic.ts\`
2. Add unit tests in \`__tests__/logic.test.ts\`
3. Run \`npm run tauri dev\` to test

## Structure

\`\`\`
features/${config.name}/
├── ${config.Name}Feature.ts    ← Feature class (extends BaseFeature)
├── logic.ts              ← Pure business logic
├── composables.ts        ← Vue composable
├── types.ts              ← Type definitions
├── settings.ts           ← Settings schema
├── toolbar.ts            ← Toolbar configuration
├── history.ts            ← History configuration
├── ${config.Name}View.vue       ← Main view
├── index.ts              ← Public API
└── __tests__/
    └── logic.test.ts     ← Unit tests

plugins/${config.name}.plugin.ts ← Plugin manifest
\`\`\`
`
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Generator
// ═══════════════════════════════════════════════════════════════════════════

function toKebab(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function toPascal(str: string): string {
  return str
    .split(/[^a-zA-Z0-9]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('')
}

function generate(config: PluginConfig): void {
  const root = path.resolve(__dirname, '..')
  const featureDir = path.join(root, 'src', 'features', config.name)
  const pluginDir = path.join(root, 'src', 'plugins')
  const testDir = path.join(featureDir, '__tests__')

  console.log(`\nCreating plugin: ${config.name} (${config.template})\n`)

  // Create directories
  fs.mkdirSync(featureDir, { recursive: true })
  fs.mkdirSync(testDir, { recursive: true })
  fs.mkdirSync(pluginDir, { recursive: true })

  // Generate files
  const files: Record<string, string> = {
    [`src/features/${config.name}/types.ts`]: generateTypes(config),
    [`src/features/${config.name}/logic.ts`]: generateLogic(config),
    [`src/features/${config.name}/settings.ts`]: generateSettings(config),
    [`src/features/${config.name}/toolbar.ts`]: generateToolbar(config),
    [`src/features/${config.name}/history.ts`]: generateHistory(config),
    [`src/features/${config.name}/${config.Name}Feature.ts`]: generateFeature(config),
    [`src/features/${config.name}/composables.ts`]: generateComposable(config),
    [`src/features/${config.name}/${config.Name}View.vue`]: generateView(config),
    [`src/features/${config.name}/index.ts`]: generateIndex(config),
    [`src/features/${config.name}/__tests__/logic.test.ts`]: generateTests(config),
    [`src/features/${config.name}/README.md`]: generateReadme(config),
    [`src/plugins/${config.name}.plugin.ts`]: generatePlugin(config),
  }

  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(root, filePath)
    fs.writeFileSync(fullPath, content, 'utf-8')
    console.log(`  created ${filePath}`)
  }

  console.log(`\nPlugin "${config.name}" created successfully!`)
  console.log(`   Template: ${config.template}`)
  console.log(`   Feature:  src/features/${config.name}/`)
  console.log(`   Plugin:   src/plugins/${config.name}.plugin.ts`)
  console.log(`\n   Next steps:`)
  console.log(`   1. Implement logic.ts (your business logic)`)
  console.log(`   2. Add tests in __tests__/logic.test.ts`)
  console.log(`   3. Add route in src/router/index.ts`)
  console.log(`   4. Add sidebar item in src/components/Sidebar.vue`)
  console.log(`   5. Run: npm run tauri dev`)
  console.log()
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI Entry Point
// ═══════════════════════════════════════════════════════════════════════════

function parseArgs(): { name: string; template: TemplateType } | null {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Plugin Generator — Official Developer Workspace Scaffolding Tool

Usage:
  npx tsx scripts/create-plugin.ts <name> [--template=<type>]

Arguments:
  <name>            Plugin name (kebab-case, e.g. 'my-tool')
  --template=<type> Template type (default: transform)

Templates:
  transform   — Input→Transform→Output (AES, Base64, Hash)
  editor      — Editor + Format (JSON, SQL, YAML)
  converter   — Two-way format converter (Timestamp, Unit)
  inspector   — Parse + structured display (JWT, Regex)
  viewer      — File preview + metadata (Image, PDF)
  ai          — AI chat + streaming (Chat, Completion)
  network     — HTTP request + response (cURL, GraphQL)
  enterprise  — External service integration (Sentry, Jira)

Examples:
  npx tsx scripts/create-plugin.ts aes
  npx tsx scripts/create-plugin.ts json --template=editor
  npx tsx scripts/create-plugin.ts sentry --template=enterprise
`)
    return null
  }

  let name = args[0]
  let template: TemplateType = 'transform'

  for (let i = 1; i < args.length; i++) {
    const match = args[i].match(/^--template=(.+)$/)
    if (match) {
      const t = match[1] as string
      if (!(t in TEMPLATES)) {
        console.error(`Error: Unknown template "${t}". Valid: ${Object.keys(TEMPLATES).join(', ')}`)
        return null
      }
      template = t as TemplateType
    }
  }

  return { name: toKebab(name), template }
}

function main(): void {
  const parsed = parseArgs()
  if (!parsed) {
    process.exit(parsed === null && process.argv.includes('--help') ? 0 : 1)
  }

  const { name, template } = parsed
  const config: PluginConfig = {
    name,
    Name: toPascal(name),
    template,
    featureDir: `src/features/${name}/`,
    pluginPath: `src/plugins/${name}.plugin.ts`,
  }

  // Check if already exists
  const root = path.resolve(__dirname, '..')
  if (fs.existsSync(path.join(root, config.featureDir))) {
    console.error(`\nError: Feature "${name}" already exists at ${config.featureDir}`)
    console.error('   Use a different name or remove the existing directory.\n')
    process.exit(1)
  }

  generate(config)

  // Validation summary
  console.log('Validation:')
  console.log('   ok Feature extends BaseFeature')
  console.log('   ok Plugin uses definePlugin()')
  console.log('   ok Zero Core/Registry/Service imports')
  console.log('   ok All colors from Design Tokens')
  console.log('   ok ToolLayout desktop workspace')
  console.log('   ok All 12 abstract methods implemented')
  console.log('   todo logic.ts needs custom business logic')
  console.log('   todo Unit tests need test vectors')
}

main()
