/**
 * PluginAPI — Public API surface for plugin instances.
 *
 * This is what definePlugin() returns.
 */

import type { PluginDefinition, PluginInstance } from './PluginManifest'
import type { PluginContext } from './PluginContext'
import type { PluginLifecycle } from './PluginLifecycle'

export function createPluginAPI<
  TFeature = unknown,
  TConfig = Record<string, unknown>,
  TInput = string,
  TOutput = string,
>(
  definition: PluginDefinition<TFeature, TConfig, TInput, TOutput>,
  context: PluginContext<TConfig, TFeature, TInput, TOutput>,
  lifecycle: PluginLifecycle
): PluginInstance<TFeature, TConfig, TInput, TOutput> {
  return {
    id: definition.id,
    definition,
    context,
    get isActive() { return lifecycle.isActive },
    get isInstalled() { return lifecycle.phase !== 'uninstalled' && lifecycle.phase !== 'disposed' },

    async install() {
      lifecycle.transition('installed')
      await definition.onInstall?.(context)
      context.logger.info('Plugin installed')
    },

    async register() {
      lifecycle.transition('registered')
      await definition.onRegister?.(context)
      // Auto-registrations handled by PluginInstaller
      context.logger.info('Plugin registered')
    },

    async activate() {
      lifecycle.transition('active')
      await definition.onActivate?.(context)
      context.recent.touch()
      context.logger.info('Plugin activated')
    },

    async deactivate() {
      lifecycle.transition('inactive')
      await definition.onDeactivate?.(context)
      context.logger.info('Plugin deactivated')
    },

    async dispose() {
      lifecycle.transition('disposed')
      await definition.onDispose?.(context)
      context.logger.info('Plugin disposed')
    },
  }
}
