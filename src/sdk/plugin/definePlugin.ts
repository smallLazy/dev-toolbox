/**
 * definePlugin — The single entry point for plugin creation.
 *
 * Usage:
 *   export default definePlugin({
 *     id: 'my-tool',
 *     name: 'My Tool',
 *     icon: '🔧',
 *     route: '/my-tool',
 *     component: () => import('@/features/my-tool/MyToolView.vue'),
 *     commands: [{ id: 'run', label: 'Run', shortcut: 'Cmd+R' }],
 *     keywords: ['my', 'tool'],
 *   })
 *
 * That's it. No manual registration. No Core access. No Router setup.
 * The Plugin SDK handles everything automatically.
 */

import type { PluginDefinition, PluginInstance } from './PluginManifest'
import type { PluginContext } from './PluginContext'
import { installPlugin } from './PluginInstaller'

// ── Overloaded Signatures ───────────────────────────────────────────────

export function definePlugin(
  config: PluginDefinition
): PluginInstance

export function definePlugin<
  TFeature,
  TConfig extends Record<string, unknown> = Record<string, unknown>,
  TInput = string,
  TOutput = string,
>(
  config: PluginDefinition<TFeature, TConfig, TInput, TOutput>
): PluginInstance<TFeature, TConfig, TInput, TOutput>

// ── Implementation ─────────────────────────────────────────────────────

export function definePlugin<
  TFeature = unknown,
  TConfig extends Record<string, unknown> = Record<string, unknown>,
  TInput = string,
  TOutput = string,
>(
  config: PluginDefinition<TFeature, TConfig, TInput, TOutput>
): PluginInstance<TFeature, TConfig, TInput, TOutput> {
  // Fill defaults
  const definition: PluginDefinition<TFeature, TConfig, TInput, TOutput> = {
    version: '1.0.0',
    description: '',
    category: 'utility',
    commands: [],
    shortcuts: [],
    keywords: [],
    permissions: [],
    settings: {},
    history: { enabled: true, maxItems: 20 },
    ...config,
  }

  // Delegate to installer
  const { instance } = installPlugin(definition)

  // Auto-install
  instance.install().catch((err) => {
    console.error(`[definePlugin] Failed to install plugin "${definition.id}":`, err)
  })

  return instance
}

// ── Re-export type for convenience ─────────────────────────────────────

export type {
  PluginDefinition,
  PluginInstance,
  PluginContext,
}
